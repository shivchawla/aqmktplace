import * as React from 'react';
import {withRouter} from 'react-router';
import moment from 'moment';
import axios from 'axios';
import Loading from 'react-loading-bar';
import _ from 'lodash';
import {connect} from 'react-redux';
import {AdviceDetailContent} from './AdviceDetailContent';
import {inputHeaderStyle, newLayoutStyle, buttonStyle, loadingColor, pageTitleStyle, benchmarkColor, performanceColor, shadowBoxStyle, metricColor} from '../constants';
import {EditableCell, AqDropDown, AqHighChartMod, HighChartNew, DashboardCard, ForbiddenAccess, StockResearchModal, AqPageHeader} from '../components';
import {getUnixStockData, getStockPerformance, Utils, getBreadCrumbArray, constructErrorMessage, getFirstMonday, compareDates, getDate} from '../utils';
import {UpdateAdviceCrumb} from '../constants/breadcrumbs';
import {store} from '../store';
import {benchmarks} from '../constants/benchmarks';
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
    Tooltip,
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
const maxNotional = [500000, 50000, 100000, 200000, 300000, 500000];
const rebalancingFrequency = [ 'Monthly', 'Daily', 'Weekly', 'Bi-Weekly', 'Quartely'];

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
            benchmarks,
            selectedBenchmark: 'NIFTY_50',
            tickers: [
                {name:'Advice', color: performanceColor, data:[], noLoadData: true}, 
                {name:'', color: benchmarkColor, data:[], noLoadData: true}
            ],
            weightSeries: [],
            rebalancingFrequency: rebalancingFrequency[0],
            maxNotional: maxNotional[0],
            adviceName: '',
            adviceId: '',
            adviceDescription: '',
            adviceHeading: '',
            positions: [],
            public: false,
            isPublic: false,
            isOwner: false,
            performanceModalVisible: false,
            compositionSeries: [],
            show: false,
            stockResearchModalVisible: false,
            stockResearchModalTicker: {},
            preview: false,
            portfolioMetrics: {}
        };
        this.columns = [
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol',
                render: text => <a onClick={() => this.updateTicker({name: text, symbol: text})}>{text}</a>
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

    disabledStartDate = (current) => {
        return current && current < moment().startOf('day');
    }

    handleSubmit = (e, publish = false) => {
        if (e.preventDefault) {
            e.preventDefault();
        }
        let requestData = {};
        const {requestUrl, aimsquantToken} = localConfig;
        const {isUpdate, adviceId} = this.props;
        const url = isUpdate ? `${requestUrl}/advice/${adviceId}` : `${requestUrl}/advice`;
        const method = isUpdate ? 'PUT' : 'POST';
        this.props.form.validateFields((err, values) => {
            const defaultStartDate = moment().add(1, 'days').format(dateFormat);
            let {name, description, headline, startDate = defaultStartDate} = values;
            startDate = moment(startDate).format('YYYY-MM-DD');
            const endDate = moment(startDate).add(5, 'days').format(dateFormat);
            if(!err && this.validateTransactions()) {
                requestData = {
                    name,
                    description,
                    // heading: isUpdate ? null : 'headline',
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
                    headers: Utils.getAuthTokenHeader(),
                    data: requestData
                })
                .then((response) => {
                    const adviceId = _.get(response.data, '_id', null);
                    const successMessage = isUpdate ? 'Advice Updated successfully' : 'Advice Created successfully';
                    message.success(successMessage);
                    if (method === 'POST' && publish) {
                        return axios({
                            url: `${requestUrl}/advice/${adviceId}/publish`,
                            method: 'POST',
                            headers: Utils.getAuthTokenHeader()
                        })
                    } else {
                        this.props.history.push(`/advice/${adviceId}`);
                        return null;
                    }
                })
                .then(response => {
                    const adviceId = _.get(response.data, 'adviceId', null);
                    this.props.history.push(`/advice/${adviceId}`);
                    message.success('Succesfully Created Advice');
                })
                .catch((error) => {
                    Utils.checkForInternet(error, this.props.history);
                    if (error.response) {
                        message.error(constructErrorMessage(error));
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);                        
                    }
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
        

        const hasBenchmarkData = this.state.tickers && this.state.tickers[1].data && this.state.tickers[1].data.length > 0;
        Promise.all([
            axios({
                headers: Utils.getAuthTokenHeader(),
                data: requestData,
                method: 'POST',
                url
            }), !hasBenchmarkData ? getStockPerformance(this.state.selectedBenchmark) : null
        ])
        .then(([response, benchmarkPerformanceData]) => {
            let performance = _.get(response.data, 'portfolioPerformance.portfolioValues', []).map(
                item => {
                    return [moment(item.date, dateFormat).valueOf(), Number(item.netValue.toFixed(2))]
                }
            );
            const portfolioMetrics = _.get(response.data, 'portfolioPerformance.value.true', {});
            let series = [];
            series.push(
                {
                    name: 'First Series',
                    data: this.getVerifiedTransactions().map((item, index) => {
                        return {
                            name: item.symbol,
                            y: item.weight,
                        }
                    })
                }
            );

            // console.log(tickers);
            
            var idx = tickers.map(item => item.name).indexOf("Advice");
            if (idx != -1) {
                tickers[idx].data = performance;
            } 

            if(benchmarkPerformanceData) {
                tickers[1].name = this.state.selectedBenchmark;
                tickers[1].data = benchmarkPerformanceData;
            }

            this.setState({
                tickers, 
                compositionSeries: series,
                portfolioMetrics
            });
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
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
            tickers[1].name = ticker;
            tickers[1].data = performance;
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
        this.setState({performanceModalVisible: !this.state.performanceModalVisible});
    }
    
    renderPerformanceModal = () => {
        return (
            <Modal
                    title="Performance View"
                    visible={this.state.performanceModalVisible}
                    onOk={this.toggleAddTickerModal}
                    onCancel={this.toggleAddTickerModal}
                    width={980}
                    bodyStyle={{overflow: 'hidden', overflowY: 'scroll'}}
                    style={{top: 20}}
                    footer={null}
            >
                {this.renderPortfolioDetailsTabs()}
            </Modal>
        );
    }

    renderPortfolioDetailsTabs = () => {
        const buttonText = this.getVerifiedTransactions().length > 0 ? 'Edit Portfolio' : 'Add Positions';
        const series = [...this.state.compositionSeries];
        return (
            <Row type="flex" align="middle">
                <Col span={16}>
                    <MyChartNew series={this.state.tickers} chartId="advice-form-performance-chart"/>
                </Col>
                <Col span={8}>
                    {
                        series.length > 0 && series[0].data.length > 0 && series[0].data[0].y > 0 &&
                        <div type="flex" justify="center" align="middle">
                            <h3 style={{fontSize: '16px'}}>Portfolio Composition</h3>
                            <HighChartNew series={series}/>
                        </div>
                    }
                </Col>
            </Row>
        );
    }

    getNetValue = () => {
        const verifiedTransactions = this.getVerifiedTransactions();
        
        let netValue = 0.0;
        verifiedTransactions.forEach(transaction => {
            netValue+=transaction.totalValue;
        });

        return netValue;
    }

    getNumberofStocks = () => {
        const verifiedTransactions = this.getVerifiedTransactions();
        let nStocks = 0;
        verifiedTransactions.forEach(transaction => {
            nStocks += Number(transaction.shares);
        });

        return nStocks;
    }

    renderPortfolioTable = () => {
        const verifiedTransactions = this.getVerifiedTransactions();
        const netValue =this.getNetValue();

        /*var netValueValid = netValue <= this.state.maxNotional * 1.05;
        const netValueValidIconSrc = !netValueValid ? 'exclamation-circle' : 'check-circle';
        const netValueValidIconColor = !netValueValid ? metricColor.negative : metricColor.positive;    
        const tooltipText = netValueValid ? "Advice value within Max. National" : "Advice value exceeds Max. National by more than 5%"*/

        const netValueValidIconColor = metricColor.neutral;

        const data = verifiedTransactions.map(transaction => {
            return {
                ...transaction,
                totalValue: Utils.formatMoneyValueMaxTwoDecimals(transaction.totalValue),
                weight: `${transaction.weight} %`
            }
        });

        return (
            <Col>
                <Row>
                    <div style={{textAlign: 'left', marginBottom: '5px', fontSize: '16px'}}>
                        Total Advice Value: 
                        <span style={{color: netValueValidIconColor, marginLeft: '5px'}}>{Utils.formatMoneyValueMaxTwoDecimals(netValue)}</span> 
                        {/*<Tooltip title={tooltipText}>
                            <Icon 
                                type={netValueValidIconSrc} 
                                style={{fontSize: '20px', marginLeft: '10px', color: netValueValidIconColor}}
                            />
                        </Tooltip>*/}
                    </div>
                </Row>
                <Row>
                    <Table 
                        size="small" 
                        columns={this.columns} 
                        dataSource={data}
                        pagination={false}
                        style={{marginBottom: '20px'}}/>
                </Row>
            </Col>
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
        const {requestUrl, aimsquantToken, userId} = localConfig;
        const adviceUrl =`${requestUrl}/advice/${id}`;
        const advicePortfolioUrl = `${adviceUrl}/portfolio`;
        const tickers = [...this.state.tickers];
        this.setState({show: true});
        axios.get(adviceUrl, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const {name, description, heading} = response.data;
            const isOwner = _.get(response.data, 'isOwner', false);
            this.setState({
                adviceName: name || '', 
                adviceDescription: description || '', 
                adviceHeading: heading || '', 
                selectedBenchmark: _.get(response.data, 'portfolio.benchmark.ticker', ''),
                rebalancingFrequency: response.data.rebalance || 0,
                isPublic: response.data['public'],
                maxNotional: response.data.maxNotional || 0 ,
                isOwner
            }, () => {
                if (this.state.isOwner) {
                    const benchmarkTicker = _.get(response.data, 'portfolio.benchmark.ticker', 'NIFTY_50');
                    
                    getStockPerformance(benchmarkTicker)
                    .then(performance => {
                        tickers[1] = {
                            name: benchmarkTicker,
                            data: performance,
                            color: benchmarkColor
                        };

                        this.setState({tickers});
                    });
                }
            });
            if (isOwner) {
                this.setState({show: false}, () => {
                    this.props.form.setFieldsValue({name, description, headline: heading});
                });
                return axios.get(advicePortfolioUrl, {headers: Utils.getAuthTokenHeader()});
            } else {
                this.setState({show: false});
                return null;
            }
        })
        .then(advicePortfolioResponse => {
            const advicePortfolio = advicePortfolioResponse.data;
            console.log(advicePortfolio);
            const positions = [...this.state.positions];
            const portfolio = _.get(advicePortfolio, 'detail.positions', []);
            portfolio.map((item, index) => {
                positions.push({
                    key: index,
                    name: _.get(item, 'security.detail.Nse_Name', ''),
                    sector: _.get(item, 'security.detail.Sector'),
                    lastPrice: item.lastPrice,
                    shares: item.quantity,
                    symbol: item.security.ticker,
                    ticker: item.security.ticker,
                    totalValue: Number((item.quantity * item.lastPrice).toFixed(2))
                });
            });

            this.updateAllWeights(positions);
            this.setState({data: positions, startDate: advicePortfolio.detail.startDate, show: false}, () => {
                this.getPortfolioPerformance();
                this.props.form.setFieldsValue({startDate: moment(this.state.startDate)});
            });
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({show: false});
        });
    }

    updateAllWeights = (data) => {
        const totalSummation = Number(this.getTotalValueSummation(data).toFixed(2));
        return data.map((item, index) => {
            item['weight'] = totalSummation > 0 ? Number((item['totalValue'] * 100 / totalSummation).toFixed(2)) : 0;
            return item;
        });
    }

    getTotalValueSummation = data => {
        let totalValue = 0;
        data.map(item => {
            totalValue += item.totalValue;
        });

        return totalValue;
    }

    getFirstValidDate = () => {
       var offset = '1d';
        switch(this.state.rebalancingFrequency) {
            case "Daily": offset = '1d'; break;
            case "Weekly": offset = '1w'; break;
            case "Bi-Weekly": offset = '2w'; break;
            case "Monthly": offset = '1m'; break;
            case "Quartely": offset = '1q'; break;
        }

        return this.props.isUpdate && this.state.isPublic ? 
            moment(getFirstMonday(offset)) : moment().startOf('day');
    }

    getDisabledDate = current => {
        let offset;
        switch(this.state.rebalancingFrequency) {
            case "Daily": offset = '1d'; break;
            case "Weekly": offset = '1w'; break;
            case "Bi-Weekly": offset = '2w'; break;
            case "Monthly": offset = '1m'; break;
            case "Quartely": offset = '1q'; break;
        }

        return this.props.isUpdate && this.state.isPublic ? 
            current && (current < moment().endOf('day') || [0, 6].indexOf(current.weekday()) !== -1 || compareDates(getDate(current.toDate()), getFirstMonday(offset)) != 0)  : 
            current && (current < moment().startOf('day') || [0, 6].indexOf(current.weekday()) !== -1);
    }

    updateTicker = record => {
        this.setState({stockResearchModalTicker: record}, () => {
            this.toggleModal();
        });
    }

    toggleModal = ticker => {
        this.setState({stockResearchModalVisible: !this.state.stockResearchModalVisible});        
    }

    componentDidMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            if (this.props.isUpdate) {
                this.getAdvice(this.props.adviceId);
            } else {
                const tickers = [...this.state.tickers];
                this.props.form.setFieldsValue({startDate: this.getFirstValidDate()});
                getStockPerformance(this.state.selectedBenchmark)
                .then(performance => {
                    tickers[1].name = this.state.selectedBenchmark,
                    this.setState({tickers});
                });
            }
        }
    }

    togglePreview = () => {
        this.setState({preview: !this.state.preview});
    }

    renderForm = () => {
        const {getFieldDecorator} = this.props.form;
        const buttonText = this.getVerifiedTransactions().length > 0 ? 'Edit Portfolio' : 'Add Positions';

        return (
            <Col xl={18} lg={18} md={24} style={{display: this.state.preview ? 'none' : 'block'}}>
                <Row>
                    <Col span={24} style={{...shadowBoxStyle, padding: '20px', marginBottom:'20px', minHeight: '600px'}}>
                        <Row>
                            <Col span={24}>
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

                            <Col span={24}>
                                <Row style={{marginTop: '10px'}}>
                                    <Col span={8} >
                                        <h4 style={labelStyle}>Rebalancing Freq.</h4>
                                        {
                                            this.renderMenu(
                                                rebalancingFrequency, 
                                                this.handleRebalanceMenuClick,
                                                this.state.rebalancingFrequency
                                            )
                                        }
                                    </Col>

                                    <Col span={8} >
                                        <h4 style={labelStyle}>Start Date</h4>
                                        <FormItem>
                                            {getFieldDecorator('startDate', {
                                                rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                                            })(
                                                <DatePicker 
                                                    format={dateFormat}
                                                    style={{...inputStyle, width: 150}}
                                                    disabledDate={this.getDisabledDate}
                                                /> 
                                            )}
                                        </FormItem>
                                    </Col>

                                    <Col span={8} >
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
                        <Row>
                            <Col style={{border:' 1px solid #eaeaea', marginTop: '50px'}}>
                                <Row style={{padding: '10px'}}> 
                                    <Col span={8}>
                                        <h3>Preview</h3>
                                    </Col>
                                    <Col span={16} style={{textAlign: 'right'}}>
                                        <Button 
                                                onClick={this.toggleAddTickerModal} 
                                                style={{width: '150px'}}
                                                disabled={this.getVerifiedTransactions().length < 1}
                                        >
                                            View Performance
                                        </Button>
                                    </Col>
                                </Row>
                                <Row type="flex" style={{margin: '0 10px'}}>
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
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        );
    }

    checkFormValidation = () => {
        const name = this.props.form.getFieldValue('name') || '';
        const description = this.props.form.getFieldValue('description') || '';
        const startDate = this.props.form.getFieldValue('startDate') || undefined;
        if(name.length > 0 && description.length > 0 && startDate !== undefined && this.getVerifiedTransactions().length > 0){
            return false;
        }
        return true;
    }

    renderActionButtons = () => {
        return (
            <Row>
                <Col span={24}>
                    {
                        !this.state.preview 
                        ?   <React.Fragment>
                                <Button 
                                        style={{...buttonStyle, width: '200px'}}
                                        type="primary" 
                                        disabled={this.checkFormValidation()}
                                        onClick={this.togglePreview} 
                                >
                                    PREVIEW ADVICE
                                </Button>
                                <Button 
                                        style={{...buttonStyle, width: '200px'}}
                                        disabled={this.checkFormValidation()}
                                        onClick={(e) => this.handleSubmit(e, true)} 
                                >
                                    POST TO MARKET PLACE
                                </Button>
                            </React.Fragment>
                        :   <React.Fragment>
                                <Button 
                                        style={{...buttonStyle, width: '200px'}}
                                        type="primary" 
                                        onClick={(e) => this.handleSubmit(e, true)} 
                                >
                                    POST NOW
                                </Button>
                                {
                                    !this.props.isUpdate &&
                                    <Button 
                                            style={{...buttonStyle, width: '200px'}}
                                            onClick={this.handleSubmit} 
                                    >
                                        SAVE FOR LATER
                                    </Button>
                                }
                                <Button 
                                        style={{...buttonStyle, width: '200px'}}
                                        onClick={this.togglePreview} 
                                >
                                    EDIT
                                </Button>
                            </React.Fragment>
                    }
                </Col>
            </Row>
        );
    }

    renderPreview = () => {
        const {name, description} = this.props.form.getFieldsValue();
        const {portfolioMetrics} = this.state;
        const adviceDetail = {
            isOwner: true,
            name,
            description,
            advisor: {
                user: {
                    firstName: _.get(Utils.getUserInfo(), 'firstName', null),
                    lastName: _.get(Utils.getUserInfo(), 'lastName', null)
                },
                _id: _.get(Utils.getUserInfo(), 'advisor', null)
            }
        };
        const metrics = {
            annualReturn: _.get(portfolioMetrics, 'returns.annualreturn', 0),
            volatility: _.get(portfolioMetrics, 'ratios.stability', 0),
            totalReturn: _.get(portfolioMetrics, 'returns.totalreturn', 0),
            netValue: this.getNetValue(),
            nstocks: this.getNumberofStocks()
        };
        
        const positions = this.getVerifiedTransactions().map(item => {
            return {
                name: item.name,
                symbol: item.symbol,
                shares: Number(item.shares),
                price: item.lastPrice,
                sector: item.sector,
                weight: item.weight
            }
        });
        return (
            <AdviceDetailContent 
                    tickers={this.state.tickers}
                    adviceDetail={adviceDetail}
                    metrics={metrics}
                    positions={positions}
                    preview={true}
                    style={{display: this.state.preview ? 'block' : 'none'}}
            />
        );
    }

    renderPageContent = () => {
        const {startDate, endDate} = this.state;
        const breadCrumbs = this.props.isUpdate
                ? getBreadCrumbArray(UpdateAdviceCrumb, [
                    {name: this.state.adviceName, url: `/advice/${this.props.adviceId}`},
                    {name: 'Update Advice'}
                ])
                : getBreadCrumbArray(UpdateAdviceCrumb, [
                    {name: 'Create Advice'}
                ]);
        return (
            this.state.isOwner || !this.props.isUpdate
            ?   <React.Fragment>
                    <StockResearchModal 
                            ticker={this.state.stockResearchModalTicker} 
                            visible={this.state.stockResearchModalVisible}
                            toggleModal={this.toggleModal}
                    />
                    <AqPageHeader 
                            title={
                                this.state.preview 
                                ? 'Preview Advice' 
                                : this.props.isUpdate ? "Update Advice" : "Create Advice"} 
                            breadCrumbs={breadCrumbs}
                    />
                    <Col xl={0} lg={0} xs={24} md={24} style={{textAlign: 'right'}}>
                        {this.renderActionButtons()}
                    </Col>
                    <Form onSubmit={this.handleSubmit} style={{marginTop: '20px'}}>
                        {
                            this.renderForm(this.state.preview)
                        }
                        {
                            this.renderPreview(this.state.preview)
                            
                        }
                    </Form>
                    <Col xl={6} lg={6} md={0} sm={0} xs={0}>
                        {this.renderActionButtons()}
                    </Col>
                </React.Fragment>
            :   <ForbiddenAccess />
        );
    }

    render() {
              
        return (
            <Row>
                {this.renderPerformanceModal()}
                <Loading
                    show={this.state.show}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                {
                    !this.state.show && 
                    this.renderPageContent()
                }
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
