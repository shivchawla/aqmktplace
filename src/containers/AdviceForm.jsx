import * as React from 'react';
import {Layout, Input, Row, Col, DatePicker, Form, Button, Table, message, Dropdown, Menu, Icon, Spin, Checkbox} from 'antd';
import {withRouter} from 'react-router';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {connect} from 'react-redux';
import {inputHeaderStyle, layoutStyle} from '../constants';
import {EditableCell, AqStockTable, AqDropDown, AqHighChartMod} from '../components';
import {getUnixStockData, getStockData} from '../utils';
import {store} from '../store';
import {AqStockTableMod} from '../components/AqStockTableMod';
import {AqHighChart} from '../components/AqHighChart';

const localConfig = require('../localConfig.js');

const {TextArea} = Input;
const FormItem = Form.Item;

const dateFormat = 'YYYY-MM-DD';
const dateOffset = 5;
const maxNotional = ['100000', '200000', '300000', '500000', '750000', '1000000'];
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
                'NIFTY_50',
                'TCS',
                'HDFC'
            ],
            selectedBenchmark: 'TCS',
            tickers: [],
            rebalancingFrequency: rebalancingFrequency[1],
            maxNotional: maxNotional[0],
            adviceName: '',
            adviceDescription: '',
            adviceHeading: '',
            positions: [],
            public: false,
            isPublic: false,
            data: []
        };
        this.columns = [
            {
                title: 'Symbol',
                dataIndex: 'symbol',
                key: 'symbol',
                render: (text, record) => this.renderColumns(text, record, 'symbol', 'text', record.tickerValidationStatus)
            },
            {
                title: 'Shares',
                dataIndex: 'shares',
                key: 'shares',
                render: (text, record) => this.renderColumns(
                        text, 
                        record, 
                        'shares', 
                        'number', 
                        record.sharesValidationStatus,
                        record.sharesDisabledStatus
                    )
            },
            {
                title: 'Last Price',
                dataIndex: 'lastPrice',
                key: 'lastPrice'
            },
            {
                title: 'Total Value',
                dataIndex: 'totalValue',
                key: 'totalValue'
            }
        ];
    }

    renderColumns = (text, record, column, type, validationStatus, disabled = false) => {
        return (
            <EditableCell 
                    validationStatus={validationStatus}
                    type={type}
                    value={text}
                    onChange={value => this.handleRowChange(value, record.key, column)}
                    disabled={disabled}
            />
        );
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
        e.preventDefault();
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

                console.log(requestData);
                
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
                })
                .catch((error) => {
                    message.error(error.message);
                });
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
        const {data} = this.state;
        const verifiedTransactions = data.filter((item, index) => {
            return item.tickerValidationStatus === 'success' && item.sharesValidationStatus === 'success';
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
        const tickers = [...this.state.tickers];
        data.map((item) => {
            const tickerIndex = _.findIndex(tickers, item.symbol);
            if (tickerIndex === -1) {
                if (item.tickerValidationStatus === 'success') {
                    tickers.push({name: item.symbol});
                }
            }
            if(item.tickerValidationStatus === 'success') {
                totalCash += item.totalValue;
            }
        });
        const remainingCash = this.state.initialCash - totalCash;
        this.setState({
            data: _.cloneDeep(data), 
            remainingCash,
            tickers: [...tickers]
        });
    }

    renderBenchmarkMenu = () => {
        return (
            <Menu>
                {
                    this.state.benchmarks.map((item, index) => {
                        return (
                            <Menu.Item key={index}>
                                <a onClick={() => this.onBenchmarkSelected(item)}>{item}</a>
                            </Menu.Item>
                        );
                    })
                }
            </Menu>
        );
    }

    onBenchmarkSelected = (ticker) => {
        const tickers = [...this.state.tickers];
        tickers[0].name = ticker;
        this.setState({tickers, selectedBenchmark: ticker});
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

    renderMaxNotionalMenu = () => (
        <Menu>
            {
                maxNotional.map((value, index) => (
                    <Menu.Item key={index}>
                        <a onClick={() => this.handleMaxNotionalClick(value)}>{value}</a>
                    </Menu.Item>
                ))
            }
        </Menu>
    )   

    setFieldsValue = ({name, description, headline}) => {
        this.props.form.setFieldsValue({name, description, headline});
    }

    publicCheckboxChange = () => {
        this.setState({public: !this.state.public});
    }

    getAdvice = (id) => {
        const {requestUrl, aimsquantToken} = localConfig;
        const adviceUrl =`${requestUrl}/advice/${id}`;
        const adviceDetailUrl = `${adviceUrl}/detail`;
        axios.get(adviceUrl, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({isPublic: response.data.public})
            const {name, description, heading} = response.data;
            this.setFieldsValue({name, description, headline: heading});
            
            return axios.get(adviceDetailUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => {
            const positions = [];
            const portfolio = response.data.portfolio.detail.positions;
            portfolio.map((item, index) => {
                positions.push({
                    quantity: item.quantity,
                    ticker: item.security.ticker
                });
            });
            this.processData(positions);
        });
    }

    processData = (positions) => {
        const data = [];
        const promises = [];
        positions.map(item => {
            promises.push(this.getTickerData(item));
        });

        Promise.all(promises)
        .then(response => {
            response.map((item, index) => {
                data.push({
                    symbol: item.ticker,
                    key: index,
                    shares: item.quantity,
                    lastPrice: item.lastPrice,
                    totalValue: item.totalPrice,
                    tickerValidationStatus: "success",
                    sharesValidationStatus: "success",
                    sharesDisabledStatus: false,
                });
            });
            this.setState({data});
        })
        .catch(error => {
            console.log(error.message);
        })

        return data;
    }

    getTickerData = ({ticker, quantity}) => {
        return new Promise((resolve, reject) => {
            getStockData(ticker, 'latestDetail')
            .then(response => {
                const lastPrice = response.data.latestDetail.values.Close;
                resolve({
                    ticker,
                    quantity,
                    lastPrice,
                    totalPrice: lastPrice * quantity
                });
            })
            .catch(error => {
                console.log(error.message);
            });
        });
    }

    componentWillMount() {
        const {selectedBenchmark} = this.state;
        const tickers = [...this.state.tickers];
        if (this.props.isUpdate) {
            this.getAdvice(this.props.adviceId);
        }
        tickers.push({name: selectedBenchmark, disbled: true, show: true, type: 'Benchmark'});
        this.setState({tickers});
    } 

    render() {
        const {startDate, endDate} = this.state;
        const {getFieldDecorator} = this.props.form;
        
        return (
            <Row>
                <Col span={18}>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={24} style={layoutStyle}>
                                {   !this.state.isPublic &&
                                    <Row>
                                        <Col span={24}>
                                            <h3 style={inputHeaderStyle}>
                                                Advice Name
                                            </h3>
                                        </Col>
                                        <Col span={8}>
                                            <FormItem>
                                                {getFieldDecorator('name', {
                                                    rules: [{required: true, message: 'Please enter Advice Name'}]
                                                })(
                                                    <Input style={inputStyle}/>
                                                )}
                                                
                                            </FormItem>
                                        </Col>
                                        {
                                            this.props.isUpdate
                                            ?   <Col span={6} offset={10}>
                                                    <Checkbox 
                                                            onChange={this.publicCheckboxChange}
                                                    >
                                                        Make advice public
                                                    </Checkbox>
                                                </Col>
                                            : null
                                        }
                                    </Row>
                                }
                                {   !this.state.isPublic &&
                                    <Row>
                                        <Col span={24}>
                                            <h3 style={inputHeaderStyle}>
                                                Headline
                                            </h3>
                                        </Col>
                                        <Col span={24}>
                                            <FormItem>
                                                {getFieldDecorator('headline', {
                                                    rules: [{required: true, message: 'Please enter Headline'}]
                                                })(
                                                    <Input style={inputStyle}/>
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                }
                                {   !this.state.isPublic &&
                                    <Row>
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
                                                    <TextArea style={inputStyle} autosize={{minRows: 3, maxRows: 6}}/>
                                                )}
                                            </FormItem>
                                        </Col>
                                    </Row>
                                }
                                <Row>
                                    <Col span={24}>
                                        <h3 style={inputHeaderStyle}>Advice Portfolio</h3>
                                    </Col>
                                </Row>
                                {
                                    !this.props.isUpdate
                                    ? <Row type="flex" justify="space-between">
                                            <Col span={6}>
                                                <h4 style={labelStyle}>Max Notional</h4>
                                                <AqDropDown 
                                                        renderMenu={this.renderMaxNotionalMenu} 
                                                        value={this.state.maxNotional} 
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <h4>Rebalancing Frequency</h4>
                                                <AqDropDown 
                                                        renderMenu={this.renderRebalanceMenu} 
                                                        value={this.state.rebalancingFrequency} 
                                                />
                                            </Col>
                                            <Col span={6}>
                                                <h4 style={labelStyle}>Start Date</h4>
                                                <FormItem>
                                                    {getFieldDecorator('startDate', {
                                                        rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                                                    })(
                                                        <DatePicker 
                                                            onChange={this.onStartDateChange} 
                                                            format={dateFormat}
                                                            style={inputStyle} 
                                                        /> 
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={6}>
                                                Benchmark: 
                                                <AqDropDown 
                                                        renderMenu={this.renderBenchmarkMenu} 
                                                        value={this.state.selectedBenchmark} 
                                                />
                                            </Col>
                                        </Row>
                                    : null
                                }
                                <Row type="flex" justify="end">
                                    <Col span={24}>
                                        {
                                            this.props.isUpdate
                                            ?   <AqStockTableMod 
                                                    adviceId = {this.props.adviceId} 
                                                    isUpdate={true}
                                                    onChange = {this.onChange}
                                                    setFieldsValue = {this.setFieldsValue}
                                                    data={this.state.data}
                                                />
                                            :   <AqStockTableMod 
                                                    onChange = {this.onChange}
                                                    setFieldsValue = {this.setFieldsValue}
                                                />
                                        }
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={6}>
                                <FormItem>
                                    <Button style={{borderRadius: '0'}} type="primary" htmlType="submit">Save</Button>
                                </FormItem>    
                            </Col>
                            <Col span={6}>
                                <Button onClick={() => {this.props.history.goBack()}}>Cancel</Button>
                            </Col>
                        </Row>
                    </Form>
                    {/* <Row>
                        <Col span={24}>
                            <AqHighChartMod tickers={this.state.tickers}/>
                        </Col>
                    </Row> */}
                </Col>
            </Row>
        );
    }
}

export const AdviceForm = Form.create()(withRouter(AdviceFormImpl));

const labelStyle = {
    color: '#898989'
};

const inputStyle = {
    borderRadius: '0px'
};