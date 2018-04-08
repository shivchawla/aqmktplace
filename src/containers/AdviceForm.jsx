import * as React from 'react';
import {withRouter} from 'react-router';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {connect} from 'react-redux';
import {inputHeaderStyle, newLayoutStyle, buttonStyle} from '../constants';
import {EditableCell, AqDropDown, AqHighChartMod, HighChartNew, DashboardCard} from '../components';
import {getUnixStockData, getStockPerformance} from '../utils';
import {store} from '../store';
import {AqStockTableMod} from '../components/AqStockTableMod';
import {MyChartNew} from '../containers/MyChartNew';
import {
    Layout, 
    Input, 
    Row, 
    Col, 
    DatePicker, 
    Form, 
    Button, 
    Table, 
    message, 
    Dropdown, 
    Menu, 
    Icon, 
    Spin, 
    Checkbox, 
    Modal,
    Tabs,
    Select
} from 'antd';

const localConfig = require('../localConfig.js');

const {TextArea} = Input;
const FormItem = Form.Item;
const TabPane = Tabs.TabPane;
const Option = Select.Option;

const dateFormat = 'YYYY-MM-DD';
const dateOffset = 5;
const maxNotional = [10000, 20000, 50000, 75000, 100000, 200000, 300000, 500000, 750000, 1000000];
const rebalancingFrequency = ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quartely'];

export class AdviceFormImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            startDate : '',
            endDate: '',
            endDateEditable: false,
            data: [],
            remainingCash: 100000,
            initialCash: 100000,
            benchmarks: [
                'TCS',
                'NIFTY_50',
                'HDFC'
            ],
            selectedBenchmark: 'TCS',
            tickers: [],
            weightSeries: [],
            rebalancingFrequency: rebalancingFrequency[0],
            maxNotional: maxNotional[0],
            adviceName: '',
            adviceDescription: '',
            adviceHeading: '',
            positions: [],
            public: false,
            isPublic: false,
            addTickerModalVisible: false,
            compositionSeries: []
        };
        this.columns = [
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'SHARES',
                dataIndex: 'shares',
                key: 'shares'
            },
            {
                title: 'PRICE',
                dataIndex: 'lastPrice',
                key: 'price'
            },
            {
                title: 'Total Value',
                dataIndex: 'totalValue',
                key: 'totalValue'
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight'
            }
        ];
    }

    onStartDateChange = (date) => {
        const startDate = moment(date).format(dateFormat);
        if(startDate === 'Invalid date') {
            this.setState({
                endDate: '',
                startDate,
                endDateEditable: false
            });
        } else {
            this.setState({
                startDate,
                endDateEditable: true
            });
        }
    }

    onEndDateChange = (date) => {
        const endDate = moment(date).format(dateFormat);
        this.setState({endDate});
    }

    disabledStartDate = (current) => {
        return current && current < moment().startOf('day');
    }

    disabledEndDate = (current) => {
        const modifiedStartDate = moment(this.state.startDate, dateFormat).add(dateOffset, 'days');
        return current && moment(current, dateFormat).isBefore(modifiedStartDate);
    }

    renderData = () => {
        return this.state.data.map((item, index) => (
            <li key={index}>{item.symbol} - {item.lastPrice} - {item.tickerValidationStatus}</li>
        ));
    }

    handleSubmit = (e) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        let requestData = {};
        const {requestUrl, aimsquantToken} = localConfig;
        const {isUpdate, adviceId} = this.props;
        const url = isUpdate ? `${requestUrl}/advice/${adviceId}` : `${requestUrl}/advice`;
        const method = isUpdate ? 'PUT' : 'POST';
        this.props.form.validateFields((err, values) => {
            let {name, description, headline, startDate} = values;
            startDate = moment(startDate).format('YYYY-MM-DD');
            const endDate = moment(startDate).add(5, 'days').format(dateFormat);
            if(!err && this.validateTransactions()) {
                requestData = {
                    name,
                    description,
                    heading: headline,
                    portfolio: {
                        name,
                        detail: {
                            startDate,
                            endDate,
                            positions: this.processTransactions(),
                            cash: 0
                        },
                        benchmark: {
                            ticker: 'NIFTY_50',
                            securityType: 'EQ',
                            country: 'IN',
                            exchange: 'NSE'
                        },
                    },
                    rebalance: this.state.rebalancingFrequency,
                    maxNotional: this.state.maxNotional,
                    // public: this.state.public
                };
                axios({
                    method,
                    url,
                    headers: {
                        'aimsquant-token': aimsquantToken
                    },
                    data: requestData
                })
                .then((response) => {
                    const successMessage = isUpdate ? 'Advice Updated successfully' : 'Advice Created successfully';
                    message.success(successMessage);
                    this.props.history.goBack();
                })
                .catch((error) => {
                    message.error(error.message);
                });
            }
        });
    }

    getPortfolioPerformance = () => {
        const tickers = [...this.state.tickers];
        const {requestUrl, aimsquantToken} = localConfig;
        const startDate = moment().subtract(1, 'y').format(dateFormat);
        const endDate = moment().format(dateFormat);
        const url = `${requestUrl}/performance`;
        const requestData = {
            name: '',
            detail: {
              startDate,
              endDate,
              positions: this.processTransactions(),
              cash: 0
            },
            benchmark: {
              ticker: this.state.selectedBenchmark,
              securityType: "EQ",
              country: "IN",
              exchange: "NSE"
            }
        };
        axios({
            headers: {'aimsquant-token': aimsquantToken},
            data: requestData,
            method: 'POST',
            url
        })
        .then(response => {
            let performance = response.data.portfolioPerformance.portfolioValues.map(
                item => {
                    return [moment(item.date, dateFormat).valueOf(), Number(item.netValue.toFixed(2))]
                }
            );
            let series = [];
            series.push(
                {
                    name: 'First Series',
                    data: this.getVerifiedTransactions().map(item => {
                        return {
                            name: item.symbol,
                            y: item.weight
                        }
                    })
                }
            );
            if (tickers.length < 2) {
                tickers.push({
                    name: 'Portofolio',
                    data: performance
                });
            } else {
                tickers[1].data = performance;
            }
            this.setState({tickers, compositionSeries: series});
        })
        .catch(error => {
            console.log(error.message);
        });
    }

    validateTransactions = () => {
        const {data} = this.state;
        let isValid = false;
        const validArray = [];
        if(this.getVerifiedTransactions(data).length < 1) {
            message.error('Atleast one valid transaction must be provided for a valid advice');
            return false;
        } else if (this.state.remainingCash < 0) {
            message.error('Remaining cash should be equal or greater than 0');
            return false;
        }
        data.map((item, index) => {
            const {tickerValidationStatus, sharesValidationStatus, symbol, shares} = item;
            if(tickerValidationStatus === 'error') {
                validArray.push(false);
            } else if(tickerValidationStatus === 'warning' && shares.length >= 1) {
                validArray.push(false);
            } else if(tickerValidationStatus === 'success' && (sharesValidationStatus === 'error' || sharesValidationStatus === 'warning')){
                validArray.push(false);
            } else if(tickerValidationStatus === 'success' && sharesValidationStatus === 'success') {
                validArray.push(true);
            } else if(tickerValidationStatus === 'warning' && (sharesValidationStatus === 'warning' || shares.length === 0)) {
                validArray.push(true);
            }
        });
        const falseItems = validArray.filter(item => item === false);
        if(falseItems.length) {
            message.error('Please provide a valid ticker and valid number of shares for each transaction');
        }

        return !falseItems.length;
    }

    getVerifiedTransactions = () => {
        const data = [...this.state.data];
        const verifiedTransactions = data.filter((item, index) => {
            return item.symbol.length > 1;
        });

        return verifiedTransactions;
    }

    processTransactions = () => {
        const positions = this.getVerifiedTransactions();
        const newPositions = [];
        positions.map((item, index) => {
            const position = {
                security: {
                    ticker: item.symbol.toUpperCase(),
                    securityType: 'EQ',
                    country: 'IN',
                    exchange: 'NSE'
                }, 
                quantity: parseInt(item.shares)
            };
            newPositions.push(position);
        });

        return newPositions;
    }
  
    onChange = (data) => {
        let totalCash = 0;
        const remainingCash = this.state.initialCash - totalCash;
        this.setState({
            data: _.cloneDeep(data), 
            remainingCash,
        }, () => {
            this.getPortfolioPerformance();
        });
    }

    onBenchmarkSelected = (ticker) => {
        const tickers = [...this.state.tickers];
        getStockPerformance(ticker)
        .then(performance => {
            tickers[0].name = ticker;
            tickers[0].data = performance;
            this.setState({tickers, selectedBenchmark: ticker});
        });
    }

    handleRebalanceMenuClick = (frequency) => {
        let {rebalancingFrequency} = {...this.state};
        rebalancingFrequency = frequency;
        this.setState({rebalancingFrequency});
    }

    handleMaxNotionalClick = (value) => {
        let {maxNotional} = {...this.state};
        maxNotional = value;
        this.setState({maxNotional});
    }

    renderRebalanceMenu = () => (
        <Menu>
            {
                rebalancingFrequency.map((frequency, index) => (
                    <Menu.Item key={index}>
                        <a onClick={() => {this.handleRebalanceMenuClick(frequency)}}>{frequency}</a>
                    </Menu.Item>
                ))
            }
        </Menu>
    )

    renderMenu = (options, handleClick, defaultValue = options[0]) => (
        <Select value={defaultValue} style={{width: 150}} onChange={handleClick} disabled={this.state.isPublic}>
            {
                options.map((item, index) => <Option key={index} value={item}>{item}</Option>)
            }
        </Select>
    )   

    setFieldsValue = ({name, description, headline}) => {
        this.props.form.setFieldsValue({name, description, headline});
    }

    publicCheckboxChange = () => {
        this.setState({public: !this.state.public});
    }

    toggleAddTickerModal = () => {
        this.setState({addTickerModalVisible: !this.state.addTickerModalVisible});
    }

    renderAddTickerModal = () => {
        return (
            <Modal
                    title="Add Positions"
                    visible={this.state.addTickerModalVisible}
                    onOk={this.toggleAddTickerModal}
                    onCancel={this.toggleAddTickerModal}
                    width={980}
                    footer={null}
            >
                <Row type="flex">
                    {
                        this.props.isUpdate
                        ?   <AqStockTableMod 
                                adviceId = {this.props.adviceId} 
                                isUpdate={true}
                                onChange = {this.onChange}
                                setFieldsValue = {this.setFieldsValue}
                                data={this.state.data}
                                toggleModal={this.toggleAddTickerModal}
                            />
                        :   <AqStockTableMod 
                                onChange = {this.onChange}
                                setFieldsValue = {this.setFieldsValue}
                                toggleModal={this.toggleAddTickerModal}
                            />
                    }
                </Row>
            </Modal>
        );
    }
    
    renderPortfolioDetailsTabs = () => {
        const buttonText = this.getVerifiedTransactions().length > 0 ? 'Edit Portfolio' : 'Add Positions';
        // const editOperations = <Button onClick={this.toggleAddTickerModal} style={{marginRight: '10px'}}>{buttonText}</Button>;
        const series = [...this.state.compositionSeries];
        return (
            <Tabs animated={false} defaultActiveKey="1">
                <TabPane key="1" tab="Overview" style={{padding: '0 10px'}}>
                    {
                        this.getVerifiedTransactions().length > 0
                        ?   <Row type="flex" justfy="center" align="middle">
                                <Col span={16}>
                                    <MyChartNew series={this.state.tickers} hideLegend={true}/>
                                </Col>
                                <Col span={8}>
                                    <Row>
                                        <Col span={24}>
                                            <h4 style={{textAlign: 'center', fontSize: '16px'}}>Composition</h4>
                                        </Col>
                                    </Row>
                                    <Row justfy="center" type="flex" style={{marginLeft: '10px'}}>
                                        {
                                            series.length > 0 &&series[0].data.length > 0 && series[0].data[0].y > 0 &&
                                            <HighChartNew series={series}/>
                                        }
                                    </Row>
                                </Col>
                            </Row>
                        : this.renderEmptyAdviceBox()
                    }
                </TabPane>
                <TabPane key="2" tab="Portfolio" style={{padding: '0 15px 20px 15px'}}>
                    <Col span={24}>
                        {
                            this.getVerifiedTransactions().length > 0 
                            ? this.renderPortfolioTable()
                            : this.renderEmptyAdviceBox()
                        }
                    </Col>
                </TabPane>
            </Tabs>
        );
    }

    renderPortfolioTable = () => {
        const data = this.getVerifiedTransactions().map(transaction => {
            return {
                ...transaction,
                weight: `${transaction.weight} %`
            }
        });

        return (
            <Table 
                    size="small" 
                    columns={this.columns} 
                    dataSource={data}
                    pagination={false}
                    style={{marginBottom: '20px'}}
            />
        );
    }

    renderEmptyAdviceBox = () => {
        return (
            <Row type="flex" align="middle" justify="center" style={{marginBottom: '20px'}}>
                <Col style={{textAlign: 'center'}} span={24}>
                    <h4>Please add positions in your advice</h4>
                </Col>
                <Col style={{textAlign: 'center', marginTop: '20px'}} span={24}>
                    <Button type="primary" onClick={this.toggleAddTickerModal}>Add Positions</Button>
                </Col>
            </Row>
        );
    }

    getAdvice = (id) => {
        const {requestUrl, aimsquantToken} = localConfig;
        const adviceUrl =`${requestUrl}/advice/${id}`;
        const adviceDetailUrl = `${adviceUrl}/detail`;
        const tickers = [...this.state.tickers];
        axios.get(adviceUrl, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const {name, description, heading} = response.data;
            this.setState({
                adviceName: name, 
                adviceDescription: description, 
                adviceHeading: heading, 
                selectedBenchmark: response.data.portfolio.benchmark.ticker,
                rebalancingFrequency: response.data.rebalance,
                isPublic: response.data['public'],
                maxNotional: response.data.maxNotional
            }, () => {
                console.log('Selected Benchmark', response.data.portfolio.benchmark.ticker);
                getStockPerformance(response.data.portfolio.benchmark.ticker)
                .then(performance => {
                    tickers.push({
                        name: `BENCHMARK`,
                        data: performance
                    });
                    this.setState({tickers});
                });
            });
            this.props.form.setFieldsValue({name, description, headline: heading});
            
            return axios.get(adviceDetailUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => {
            const positions = [...this.state.positions];
            const portfolio = response.data.portfolio.detail.positions;
            portfolio.map((item, index) => {
                positions.push({
                    key: index,
                    lastPrice: item.lastPrice,
                    shares: item.quantity,
                    symbol: item.security.ticker,
                    ticker: item.security.ticker,
                    totalValue: Number((item.quantity * item.lastPrice).toFixed(2))
                });
            });
            this.updateAllWeights(positions);
            this.setState({data: positions, startDate: response.data.portfolio.detail.startDate}, () => {
                this.getPortfolioPerformance();
                this.props.form.setFieldsValue({startDate: moment(this.state.startDate)});
            });
        })
        .catch(err => {
            console.log(err);
        });
    }

    updateAllWeights = (data) => {
        const totalSummation = Number(this.getTotalValueSummation(data).toFixed(2));
        return data.map((item, index) => {
            item['weight'] = Number((item['totalValue'] / totalSummation).toFixed(2));
            return item;
        });
    }

    getTotalValueSummation = data => {
        let totalValue = 0;
        data.map(item => {
            totalValue += item.totalValue;
        });
        console.log(totalValue);

        return totalValue;
    }

    getDisabeldDate = current => {
        if (current) {
            console.log(current.weekday());
        }
        return current && (current < moment().endOf('day') || [0, 6].indexOf(current.weekday()) !== -1);
    }

    componentDidMount() {
        if (this.props.isUpdate) {
            this.getAdvice(this.props.adviceId);
        } else {
            const tickers = [...this.state.tickers];
            getStockPerformance(this.state.selectedBenchmark)
            .then(performance => {
                tickers.push({
                    name: `BENCHMARK`,
                    data: performance
                });
                this.setState({tickers});
            });
        }
        
    }

    render() {
        const {startDate, endDate} = this.state;
        const {getFieldDecorator} = this.props.form;
        const buttonText = this.getVerifiedTransactions().length > 0 ? 'Edit Portfolio' : 'Add Positions';
        
        return (
            <Row>
                {this.renderAddTickerModal()}
                <Col xl={0} lg={0} xs={24} md={24} style={{textAlign: 'right'}}>
                    <Button 
                            style={buttonStyle} 
                            type="primary" 
                            onClick={this.handleSubmit} 
                    >
                        Save
                    </Button>
                    <Button style={buttonStyle} onClick={() => {this.props.history.goBack()}}>Cancel</Button>
                </Col>
                <Col xl={18} lg={18} md={24}>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={24} style={{...newLayoutStyle, padding: '20px', margin: '20px 0', border: '1px solid #eaeaea'}}>
                                <Row>
                                    <Col span={12}>
                                        <Row>
                                            <Col span={24}>
                                                <h3 style={inputHeaderStyle}>
                                                    Advice Name
                                                </h3>
                                            </Col>
                                            <Col span={24}>
                                                <FormItem>
                                                    {getFieldDecorator('name', {
                                                        rules: [{required: true, message: 'Please enter Advice Name'}]
                                                    })(
                                                        <Input style={inputStyle} disabled={this.state.isPublic}/>
                                                    )}
                                                    
                                                </FormItem>
                                            </Col>
                                        </Row>
                                        <Row style={{marginTop: '10px'}}>
                                            <Col span={24}>
                                                <h3 style={inputHeaderStyle}>
                                                    Description
                                                </h3>
                                            </Col>
                                            <Col span={24}>
                                                <FormItem>
                                                    {getFieldDecorator('description', {
                                                        rules: [{required: true, message: 'Please enter Description'}]
                                                    })(
                                                        <TextArea 
                                                                style={inputStyle} 
                                                                autosize={{minRows: 3, maxRows: 6}}
                                                                disabled={this.state.isPublic}
                                                        />
                                                    )}
                                                </FormItem>
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col span={11} offset={1}>
                                        <Row>
                                            <Col span={24}>
                                                <h3 style={inputHeaderStyle}>Settings</h3>
                                            </Col>
                                        </Row>
                                        <Row type="flex" justify="space-between">
                                            <Col span={11} style={{marginTop: '10px'}}>
                                                <h4 style={labelStyle}>Max Notional</h4>
                                                {
                                                    this.renderMenu(
                                                        maxNotional, 
                                                        this.handleMaxNotionalClick,
                                                        this.state.maxNotional
                                                    )
                                                }
                                            </Col>
                                            <Col span={11} offset={2} style={{marginTop: '10px'}}>
                                                <h4 style={labelStyle}>Rebalancing Freq.</h4>
                                                {
                                                    this.renderMenu(
                                                        rebalancingFrequency, 
                                                        this.handleRebalanceMenuClick,
                                                        this.state.rebalancingFrequency
                                                    )
                                                }
                                            </Col>
                                            <Col span={11} style={{marginTop: '20px'}}>
                                                <h4 style={labelStyle}>Start Date</h4>
                                                <FormItem>
                                                    {getFieldDecorator('startDate', {
                                                        rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                                                    })(
                                                        <DatePicker 
                                                            // onChange={this.onStartDateChange} 
                                                            format={dateFormat}
                                                            style={{...inputStyle, width: 150}}
                                                            disabled={this.state.isPublic}
                                                            disabledDate={this.getDisabeldDate}
                                                        /> 
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={11} offset={2} style={{marginTop: '20px'}}>
                                                <h4 style={labelStyle}>Benchmark</h4>
                                                {
                                                    this.renderMenu(
                                                        this.state.benchmarks, 
                                                        this.onBenchmarkSelected, 
                                                        this.state.selectedBenchmark
                                                    )
                                                }
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                                <Row style={{marginBottom: '10px', marginTop: '20px'}}>
                                    <Col span={24} style={{textAlign: 'right'}}>
                                        <Button onClick={this.toggleAddTickerModal} type="primary">
                                            {buttonText}
                                        </Button>
                                    </Col>
                                </Row>
                                <Row>
                                    <DashboardCard 
                                            title="Preview" xl={24} 
                                            contentStyle={{boxShadow: '0 0 0 rgba(0,0,0,1)', height: '100%'}}

                                    >
                                        {
                                            this.renderPortfolioDetailsTabs()
                                        }
                                    </DashboardCard>
                                </Row>
                            </Col>
                        </Row>
                    </Form>
                </Col>
                <Col xl={6} lg={6} md={0} sm={0} xs={0} style={{marginTop: '20px'}}>
                    <Row>
                        <Col span={24}>
                            <Button 
                                    style={buttonStyle} 
                                    type="primary" 
                                    onClick={this.handleSubmit} 
                            >
                                Save
                            </Button>
                        </Col>
                        <Col span={24}>
                            <Button style={buttonStyle} onClick={() => {this.props.history.goBack()}}>Cancel</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const AdviceForm = Form.create()(withRouter(AdviceFormImpl));

const labelStyle = {
    color: '#898989',
    marginBottom: '5px'
};

const inputStyle = {
    // marginTop: '20px'
};
