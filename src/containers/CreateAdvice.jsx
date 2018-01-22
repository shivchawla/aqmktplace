import * as React from 'react';
import {Layout, Input, Row, Col, DatePicker, Form, Button, Table, message, Dropdown, Menu, Icon, Spin} from 'antd';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {connect} from 'react-redux';
import {inputHeaderStyle} from '../constants';
import {EditableCell, AqStockTable} from '../components';
import {getUnixTimeSeries, getStockData, addTimeSeries, calculateRemainingCash} from '../utils';
import {store} from '../store';
import '../css/highstock.css';

const ReactHighstock = require('react-highcharts/ReactHighstock.src');

const localConfig = require('../localConfig.json');

const {TextArea} = Input;
const {RangePicker} = DatePicker;
const FormItem = Form.Item;

const dateFormat = 'DD/MM/YYYY';
const dateOffset = 5;

export class CreateAdviceImpl extends React.Component {
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
                'WIPRO'
            ],
            selectedBenchmark: 'TCS',
            loadingBenchmark: false,
            currentBenchmarkObject: {},
            highStockConfig: {
                rangeSelector: {
                    selected: 5
                },
                title: {
                    text: 'AAPL Stock Price'
                },
                legend: {
                    enabled: true
                },
                series: []
            },
            // dummy count - this will be removed when the timeseries for stock performance is obtained from backend
            count: 2
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

    componentWillMount() {
        message.info('Loading Benchmark Metrics');
        getStockData(this.state.selectedBenchmark)
        .then((response) => {
            getUnixTimeSeries(response.data.priceHistory.values)
            .then((modifiedData) => {
                const benchmarkSeries = {
                    name: 'Benchmark',
                    data: modifiedData,
                    tooltip: {
                    valueDecimals: 2
                    }
                };
                const {highStockConfig} = this.state;
                highStockConfig.series.push(benchmarkSeries);
                this.setState({highStockConfig});
                message.success('Successfully loaded Benchmark Metrics');
            });
        })
        .catch((error) => {
            console.log(error);
            message.error('Error occured while loading Benchmark Metrics');
        });
    }
    
    addTimeSeries = (name, data) => {
        const {highStockConfig} = this.state;
        const benchmarkSeries = {
            name, 
            data,
            tooltip: {
                valueDecimals: 2
            }
        };
        // To get the index of the ticker from the series array of HighStock config
        const tickerIndex = _.findIndex(highStockConfig.series, (object) => {
            return object.name === name;
        });
        // To check if the series for the ticker is already added
        if(tickerIndex === -1) {
            highStockConfig.series.push(benchmarkSeries);
        } else {
            highStockConfig.series[0].data = data;
        }
        this.setState({highStockConfig});
        message.success('Successfully added timeseries to HighStock');
    }

    onStartDateChange = (date) => {
        console.log(this.props.transactions)
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

    handleSubmit = (e) => {
        e.preventDefault();
        let requestData = {};
        const {requestUrl, aimsquantToken} = localConfig;
        this.props.form.validateFields((err, values) => {
            let {name, description, headline, startDate, endDate} = values;
            startDate = moment(startDate).format('YYYY-MM-DD');
            endDate = moment(endDate).format('YYYY-MM-DD');
            if(!err && this.validateTransactions()) {
                requestData = {
                    name,
                    description,
                    heading: headline,
                    benchmark: {
                        ticker: 'NIFTY_50',
                        securityType: 'EQ',
                        country: 'IN',
                        exchange: 'NSE'
                    },
                    portfolio: {
                        startDate,
                        endDate,
                        positions: this.processTransactions(),
                        cash: 0
                    }
                };
                console.log(requestData);
                axios({
                    method: 'post',
                    url: `${requestUrl}/advice`,
                    headers: {
                        'aimsquant-token': aimsquantToken
                    },
                    data: requestData
                })
                .then((response) => {
                    console.log(response.data);
                    message.success('Advice Created successfully');
                })
                .catch((error) => {
                    console.log(error);
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
        const data = this.props.transactions;
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

    onBenchmarkSelected = (benchmarkTicker) => {
        this.setState({
            selectedBenchmark: benchmarkTicker,
            loadingBenchmark: true
        });
        getStockData(benchmarkTicker)
        .then((response) => {
            this.setState({
                currentBenchmarkObject: response.data
            });
            const {highStockConfig} = this.state;
            getUnixTimeSeries(response.data.priceHistory.values)
            .then((modifiedData) => {
                highStockConfig.series[0].data = modifiedData;
                this.setState({highStockConfig});
            });
        })
        .catch((error) => {
            console.log(error);
        })
        .finally(() => {
            this.setState({
                loadingBenchmark: false
            });
            message.success('Successfully loaded Benchmark Metrics for ' + this.state.selectedBenchmark);
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

    addRow = () => {
        store.dispatch({
            type: "ADD_TRANSACTION",
            payload: {
                symbol: '',
                key: 5,
                shares: 0,
                lastPrice: 0,
                totalValue: 0,
                tickerValidationStatus: "warning",
                sharesValidationStatus: "success",
                sharesDisabledStatus: true
            }
        });
    }

    render() {
        const {startDate, endDate} = this.state;
        const {getFieldDecorator} = this.props.form;
        let tableConfig = {
            dataSource: this.props.transactions,
            handleRowChange: this.handleRowChange
        };

        
        return (
            <Row>
                <Col span={18}>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={24} style={layoutStyle}>
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
                                </Row>
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
                                <Row>
                                    <Col span={24}>
                                        <h3 style={inputHeaderStyle}>Advice Portfolio</h3>
                                    </Col>
                                </Row>
                                <Row type="flex" justify="space-between">
                                    <Col span={6}>
                                        <h4 style={labelStyle}>Initial Cash</h4>
                                        <h3>{this.state.initialCash}</h3>
                                    </Col>
                                    <Col span={6}>
                                        <h4 style={labelStyle}>Remaining Cash</h4>
                                        {
                                            this.props.remainingCash <= 0
                                                ? <h3 style={{color: 'red'}}>{this.props.remainingCash}</h3>
                                                : <h3>{this.props.remainingCash}</h3>
                                        }
                                    </Col>
                                    <Col span={6}>
                                        <h4 style={labelStyle}>Start Date</h4>
                                        <FormItem>
                                            {getFieldDecorator('startDate', {
                                                rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                                            })(
                                                <DatePicker 
                                                    // disabledDate={this.disabledStartDate} 
                                                    onChange={this.onStartDateChange} 
                                                    format={dateFormat}
                                                    style={inputStyle} 
                                                /> 
                                            )}
                                        </FormItem>
                                    </Col>
                                    <Col span={6}>
                                        <h4 style={labelStyle}>End Date</h4>     
                                        <FormItem>
                                            {getFieldDecorator('endDate', {
                                                rules: [{type: 'object', required: true, message: 'Please select End Date'}]
                                            })(
                                                <DatePicker 
                                                    disabledDate={this.disabledEndDate} 
                                                    onChange={this.onEndDateChange} 
                                                    format={dateFormat} 
                                                    disabled={!this.state.endDateEditable}
                                                    style={inputStyle}
                                                />
                                            )}
                                        </FormItem>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col span={6}>
                                        Benchmark:
                                        <Dropdown overlay={this.renderBenchmarkMenu()} trigger={['click']}>
                                            <a className="ant-dropdown-link" href="#">
                                                {this.state.selectedBenchmark} <Icon type="down" />
                                            </a>
                                        </Dropdown>
                                    </Col>
                                    <Col span={6}>
                                        <Spin spinning={this.state.loadingBenchmark}></Spin>
                                    </Col>
                                </Row>
                                <Row type="flex" justify="end">
                                    <Col span={24}>
                                        <AqStockTable addTimeSeries={this.addTimeSeries}/>
                                        {/* <Table pagination={false} columns={this.columns} dataSource={this.props.transactions} /> */}
                                    </Col>
                                    <Col style={{marginTop: '20px'}} span={4} offset={18}>
                                        <Button onClick={this.addRow}>Add Transaction</Button>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <FormItem>
                            <Button style={{borderRadius: '0'}} type="primary" htmlType="submit">Save</Button>
                        </FormItem>
                    </Form>
                </Col>
                <Col span={18}>
                    <ReactHighstock config={this.state.highStockConfig}/>
                </Col>
            </Row>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        transactions: state.transactions.get('transactionData').toJS(),
        remainingCash: state.transactions.get('remainingCash')
    }
};

export const CreateAdvice = Form.create()(connect(mapStateToProps)(CreateAdviceImpl));

const layoutStyle = {
    backgroundColor: '#fff',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
    padding: '20px 30px',
    marginTop: '20px'
};

const labelStyle = {
    color: '#898989'
};

const inputStyle = {
    borderRadius: '0px'
};