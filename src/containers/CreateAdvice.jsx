import * as React from 'react';
import {Layout, Input, Row, Col, DatePicker, Form, Button, Table, message, Dropdown, Menu, Icon, Spin} from 'antd';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {connect} from 'react-redux';
import {inputHeaderStyle} from '../constants';
import {EditableCell, AqStockTable} from '../components';
import {getUnixStockData} from '../utils';
import {store} from '../store';
import {AqStockTableMod} from '../components/AqStockTableMod';
import {AqHighChart} from '../components/AqHighChart';

const localConfig = require('../localConfig.json');

const {TextArea} = Input;
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
                'HDFC'
            ],
            selectedBenchmark: 'TCS',
            loadingBenchmark: false,
            highstockSeries: [],
            validTickerData: []
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
                axios({
                    method: 'post',
                    url: `${requestUrl}/advice`,
                    headers: {
                        'aimsquant-token': aimsquantToken
                    },
                    data: requestData
                })
                .then((response) => {
                    message.success('Advice Created successfully');
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
        data.map((item) => {
            if(item.tickerValidationStatus === 'success') {
                totalCash += item.totalValue;
            }
        });
        const remainingCash = this.state.initialCash - totalCash;
        const validatedTransaction = this.getVerifiedTransactions().map((item, index) => {
            return {
                name: item.symbol,
                priceHistory: item.priceHistory,
                show: false,
                key: index + 1
            };
        });
        let {validTickerData} = this.state;
        validTickerData = validTickerData.filter((item, index) => {
            return item.show === true
        });
        validTickerData = [...validTickerData, ...validatedTransaction];
        this.setState({data: _.cloneDeep(data), remainingCash, validTickerData: _.cloneDeep(validTickerData)});
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
        this.setState({selectedBenchmark: ticker, loadingBenchmark: true});
        const {validTickerData} = this.state;
        getUnixStockData(ticker)
        .then(timeSeries => {
            validTickerData[0].priceHistory = timeSeries;
            validTickerData[0].name = ticker;
            this.setState({loadingBenchmark: false, validTickerData});
            console.log(this.state.validTickerData);
            message.success(`Succesfully loaded benchmark metrics for ${ticker}`);
        });
    }

    addTimeSeries = (name, data, renderDefault = false) => {
        const {validTickerData} = this.state;
        validTickerData.push({name, priceHistory: data, show: renderDefault, key: 0});
        this.setState({validTickerData});
    }

    componentWillMount() {
        const {selectedBenchmark} = this.state;
        message.info(`Loading Benchmark Metrics for ${selectedBenchmark}`);
        getUnixStockData('TCS')
        .then(timeSeries => {
            this.addTimeSeries(selectedBenchmark, timeSeries, true);
            message.success(`Successfully loaded Benchmark Metrics for ${selectedBenchmark}`);
        });
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
                                            this.state.remainingCash <= 0
                                                ? <h3 style={{color: 'red'}}>{this.state.remainingCash}</h3>
                                                : <h3>{this.state.remainingCash}</h3>
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
                                        <AqStockTableMod onChange={this.onChange}/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <FormItem>
                            <Button style={{borderRadius: '0'}} type="primary" htmlType="submit">Save</Button>
                        </FormItem>
                    </Form>
                    <Row>
                        <Col span={24}>
                            <AqHighChart series={this.state.validTickerData}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const CreateAdvice = Form.create()(CreateAdviceImpl);

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