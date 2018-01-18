import * as React from 'react';
import {Layout, Input, Row, Col, DatePicker, Form, Button, Table} from 'antd';
import moment from 'moment';
import axios from 'axios';
import {inputStyle, inputHeaderStyle} from '../constants';
import {EditableCell} from '../components';

const token = require('../localConfig.json');

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
            data: []
        }
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
                render: (text, record) => this.renderColumns(text, record, 'shares', 'number', record.sharesValidationStatus)
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

    renderColumns = (text, record, column, type, validationStatus, query) => {
        return (
            <EditableCell 
                    validationStatus={validationStatus}
                    type={type}
                    value={text}
                    onChange={value => this.handleRowChange(value, record.key, column)}
                    query={query}
            />
        );
    }

    handleRowChange = (value, key, column) => {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if(target) {
            target[column] = value;
            if(column === 'symbol') {
                const url = `http://localhost:3002/api/v2/stock?ticker=${value}&exchange=NSE&country=IN&securityType=EQ`;
                const {aimsquantToken} = token;
                target['tickerValidationStatus'] = 'validating';
                axios.get(url, {
                    headers: {
                        'aimsquant-token': aimsquantToken
                    }
                }).then((response) => {
                    const priceHistoryObj = response.data.priceHistory.values;
                    if(priceHistoryObj) {
                        const priceHistoryArray = Object.keys(priceHistoryObj);
                        const lastDate = priceHistoryArray[priceHistoryArray.length - 1];
                        const lastPrice = priceHistoryObj[lastDate];
                        target['lastPrice'] = lastPrice;
                        target['tickerValidationStatus'] = 'success';
                    } else {
                        target['lastPrice'] = 0;
                        target['tickerValidationStatus'] = 'error';
                    }
                    this.setState({data: newData});
                }).catch((error) => {
                    console.log(error);
                });
            } else if(column === 'shares') {
                target['totalValue'] = value * target['lastPrice'];
                if(value <= 0) {
                    target['sharesValidationStatus'] = 'error';
                } else {
                    target['sharesValidationStatus'] = 'success';
                }
            }
            this.setState({data: newData});
        }
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

    handleSubmit = (e) => {
        e.preventDefault();
        let requestData = {};
        this.props.form.validateFields((err, values) => {
            if(!err) {
                requestData = Object.assign(values, {transactions: this.state.data});
                console.log(requestData);
            }
        });
    }

    addTransaction = () => {
        this.setState((prevState) => {
            return prevState.data.push({
                symbol: '',
                key: prevState.data.length,
                shares: 0,
                lastPrice: 0,
                totalValue: 0,
                tickerValidationStatus: "warning",
                sharesValidationStatus: "warning",
            });
        });
    }

    render() {
        const {startDate, endDate} = this.state;
        const {getFieldDecorator} = this.props.form;

        return (
            <Form onSubmit={this.handleSubmit}>
                <Row>
                    <Col span={18} style={layoutStyle}>
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
                                        <Input />
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
                                        <Input />
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
                                        <TextArea autosize={{minRows: 3, maxRows: 6}}/>
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
                                <h3>100000</h3>
                            </Col>
                            <Col span={6}>
                                <h4 style={labelStyle}>Remaining Cash</h4>
                                <h3>50000</h3>
                            </Col>
                            <Col span={6}>
                                <h4 style={labelStyle}>Start Date</h4>
                                <FormItem>
                                    {getFieldDecorator('startDate', {
                                        rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                                    })(
                                        <DatePicker 
                                            disabledDate={this.disabledStartDate} 
                                            onChange={this.onStartDateChange} 
                                            format={dateFormat} 
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
                                        />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>
                        <Row type="flex" justify="end">
                            <Col span={24}>
                                <Table pagination={false} columns={this.columns} dataSource={this.state.data}></Table>
                            </Col>
                            <Col style={{marginTop: '20px'}} span={4} offset={18}>
                                <Button onClick={this.addTransaction}>Add Transaction</Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <FormItem>
                      <Button type="primary" htmlType="submit">Register</Button>
                </FormItem>
            </Form>
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
}

