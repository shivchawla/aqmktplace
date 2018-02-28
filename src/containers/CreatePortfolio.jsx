import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {withRouter} from 'react-router'
import {Row, Col, Checkbox, Tabs, Button, Modal, message, Select, Radio, Form, Input} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AdviceTransactionTable, AqStockTableTransaction} from '../components';
import {AdviceItem} from '../components/AdviceItem';
import {AqStockTableCreatePortfolio} from '../components/AqStockTableCreatePortfolio';
import {AqStockTableCashTransaction} from '../components/AqStockTableCashTransactions';
import {layoutStyle} from '../constants';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const {investorId, aimsquantToken, requestUrl} = require('../localConfig.js');

export class CreatePortfolioImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: [],
            presentAdvices: [],
            isSubscibedAdviceModalVisible: false,
            stockTransactions: [],
            cashTransactions: [],
            toggleValue: 'advice',
            selectedBenchmark: 'TCS'
        }
    }

    renderAdviceTransactions = () => {
        const {advices} = this.state;
        return (
            <Row>
                <Col span={4}>
                    <Button>Delete Selected</Button>
                </Col>
                <Col span={4} offset={16}>
                    <Button 
                            onClick={this.toggleSubscribedAdviceModal} 
                            style={{right: 0, position: 'absolute'}}
                    >
                        Browse Advice
                    </Button>
                </Col>
                <Col span={24} style={{marginTop: 20}}>
                    {
                        advices.length > 0 
                        ? <AdviceTransactionTable advices={advices} />
                        : <h5>Please add advices to your portfolio</h5>
                    }
                </Col>
            </Row>
        );
    }

    renderPresentAdviceTransactions = () => {
        return (
            <Row>
                <Col span={24} style={{marginTop: 20}}>
                    {
                        adviceTransactions.length > 0 
                        ? <AdviceTransactionTable preview advices={this.state.presentAdvices} />
                        : <h5>Please add advices to your portfolio</h5>
                    }
                </Col>
            </Row>
        );
    }

    renderStockTransactions = () => {
        return (
            <AqStockTableCreatePortfolio onChange={this.onStockTransactionChange}/>
        );
    }

    renderCashTransactions = () => {
        return (
            <AqStockTableCashTransaction onChange={this.onCashTransactionChange}/>
        );
    }

    toggleSubscribedAdviceModal = () => {
        this.setState({isSubscibedAdviceModalVisible: !this.state.isSubscibedAdviceModalVisible});
    }

    renderSubscribedAdviceModal = () => {
        return (
            <Modal 
                    title="Add Advices"
                    visible={this.state.isSubscibedAdviceModalVisible}
                    onCancel={this.toggleSubscribedAdviceModal}
                    onOk={this.toggleSubscribedAdviceModal}
                    width="80%"
                    bodyStyle={{
                        height: '600px',
                        overflow: 'hidden',
                        overflowY: 'scroll'
                    }}
            >
                <AdviceItem 
                        investorId={investorId}
                        addAdvice={this.addAdvice}
                        deleteAdvice = {this.deleteAdvice}
                />
            </Modal>
        );
    }

    addAdvice = (advice) => {
        const advices = [...this.state.advices];
        advices.push(advice);
        this.setState({advices});
    }
    
    deleteAdvice = (advice) => {
        const advices = [...this.state.advices];
        const adviceIndex = _.findIndex(advices, item => item.key === advice.key);
        advices.splice(adviceIndex, 1);
        this.setState({advices}, () => {
            console.log(this.state.advices);
        });
    }

    onStockTransactionChange = (data) => {
        this.setState({stockTransactions: data});
    }

    onCashTransactionChange = (data) => {
        this.setState({cashTransactions: data});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const url = `${requestUrl}/investor/${investorId}/portfolio`;
        const transactions = [
            ...this.processAdviceTransaction(this.state.advices),
            ...this.processCashTransaction(this.state.cashTransactions),
            ...this.processStockTransaction(this.state.stockTransactions)
        ];
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const data = {
                    preview: false,
                    name: values.name,
                    benchmark: {
                        ticker: this.state.selectedBenchmark,
                        securityType: "EQ",
                        country: "IN",
                        exchange: "NSE"
                    },
                    transactions
                };
                console.log(data);
                axios({
                    url,
                    method: 'POST',
                    headers: {'aimsquant-token': aimsquantToken},
                    data: data
                })
                .then(response => {
                    message.success('Transactions Added');
                })
                .catch(error => {
                    message.error(error.message);
                });
            } else {
                console.log(err);
            }
        });
    }

    processAdviceTransaction = (adviceTransactions) => {
        const transactions = [];
        adviceTransactions.map(transaction => {
            transaction.composition.map(item => {
                transactions.push({
                    security: {
                        ticker: item.symbol,
                        securityType: "EQ",
                        country: "IN",
                        exchange: "NSE"
                    },
                    quantity: item.shares,
                    price: Number(item.price),
                    fee: 0,
                    date: transaction.date,
                    commission: 0,
                    cashLinked: false,
                    advice: transaction.adviceId,
                    _id: ""
                })
            });
        });

        return transactions;
    }

    processPresentAdviceTransaction = (adviceTransactions) => {
        const advices = [];
        adviceTransactions.map((item, index) => {
            const adviceIndex = _.findIndex(advices, advice => advice.id === item.advice);
            if (adviceIndex === -1) {
                advices.push({
                    id: item.advice,
                    name: item.advice !== null ? `Sample Advice ${index}` : 'My Portfolio',
                    key: index,
                    netAssetValue: 1234,
                    weight: '12.4%',
                    profitLoss: '+12.4%',
                    units: 1,
                    composition: [
                        {
                            key: 1,
                            adviceKey: index,
                            symbol: item.security.ticker,
                            shares: 1234,
                            modifiedShares: 1234,
                            price: item.lastPrice,
                            costBasic: item.avgPrice,
                            unrealizedPL: 1231,
                            weight: '12%',
                        }
                    ]
                })
            } else {
                advices[adviceIndex].composition.push({
                    key: index + 1,
                    adviceKey: advices[adviceIndex].key,
                    symbol: item.security.ticker,
                    shares: 1234,
                    modifiedShares: 1234,
                    price: item.lastPrice,
                    costBasic: item.avgPrice,
                    unrealizedPL: 1231,
                    weight: '12%',
                })
            }
        });

        return advices;
    }

    processStockTransaction = (stockTransactions) => {
        const transactions = [];
        stockTransactions.map((transaction, index) => {
            const {symbol = "", date = undefined, shares = 0, price = 0, commission = 0} = transaction;
            if (symbol.length > 0 && date != undefined && shares != 0) {
                transactions.push({
                    security: {
                        ticker: symbol,
                        securityType: "EQ",
                        country: "IN",
                        exchange: "NSE"
                    },
                    quantity: Number(shares),
                    price: Number(price),
                    fee: 0,
                    date,
                    commission: Number(commission),
                    cashLinked: false,
                    advice: "",
                    _id: ""
                });
            }
        });

        return transactions;
    }

    processCashTransaction = (cashTransactions) => {
        const transactions = [];
        cashTransactions.map(transaction => {
            const quantity = transaction.type === 'deposit' ? Number(transaction.cash) : Number(-transaction.cash);
            if (transaction.cash > 0) {
                transactions.push({
                    security: {
                        ticker: "CASH_INR",
                        securityType: "EQ",
                        country: "IN",
                        exchange: "NSE"
                    },
                    quantity,
                    price: 1.0,
                    fee: 0,
                    date: transaction.date,
                    commission: 0,
                    cashLinked: false,
                    advice: "",
                    _id: ""
                });
            }
        });

        return transactions;
    }

    toggleView = (e) => {
        this.setState({toggleValue: e.target.value});
    }

    handleBenchmarkChange = (value) => {
        this.setState({selectedBenchmark: value});
    }

    renderSelect = () => {
        const benchmarkArray = ['TCS', 'NIFTY_50', 'WIPRO', 'LT'];

        return (
            <Row>
                <Col span={6}>
                    <h4>Benchmark</h4>
                </Col>
                <Col span={6}>
                    <Select defaultValue={this.state.selectedBenchmark} style={{width: 120}} onChange={this.handleBenchmarkChange}>
                        {
                            benchmarkArray.map((item, index) => {
                                return (
                                    <Option key={index} value={item}>{item}</Option>
                                );
                            })
                        }
                    </Select>
                </Col>
            </Row>
        );
    }
    // componentWillMount() {
    //     const url = `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}`;
    //     axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
    //     .then(response => {
    //         console.log(this.processPresentAdviceTransaction(response.data.detail.subPositions));
    //         this.setState({presentAdvices: this.processPresentAdviceTransaction(response.data.detail.subPositions)});
    //     })
    //     .catch(error => {
    //         console.log(error.message);
    //     })
    // }

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <Row>
                {this.renderSubscribedAdviceModal()}
                <Form>
                    <Col span={18} style={layoutStyle}>
                        <Row type="flex">
                            <Col span={5}>
                                <FormItem>
                                    {getFieldDecorator('name', {
                                        rules: [{required: true, message: 'Please enter Portfolio Name'}]
                                    })(
                                        <Input style={inputStyle} placeholder="Portfolio Name"/>
                                    )}
                                </FormItem>
                            </Col>
                            <Col span={10} offset={1}>
                                {this.renderSelect()}
                            </Col>
                            {/* <Col span={5}>
                                <h5>Remaining Cash 10000</h5>
                            </Col>
                            <Col span={4}>
                                <Checkbox>Link Cash</Checkbox>
                            </Col> */}
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Tabs defaultActiveKey="1">
                                    <TabPane tab="Stock Transaction" key="1">
                                        {this.renderStockTransactions()}
                                    </TabPane> 
                                    <TabPane tab="Advice Transaction" key="2">
                                        {this.renderAdviceTransactions()}
                                    </TabPane> 
                                    <TabPane tab="Cash Transaction" key="3">
                                        {this.renderCashTransactions()}
                                    </TabPane> 
                                </Tabs>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={5} offset={1}>
                        <Row type="flex">
                            <Col span={24}>
                                <FormItem>
                                    <Button type="primary" onClick={this.handleSubmit} htmlType="submit">Save</Button>
                                </FormItem>
                            </Col>
                            <Col span={24} style={{marginTop: 10}}>
                                <Button
                                        onClick={() => this.props.history.goBack()}
                                >
                                    Cancel
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Form>
            </Row>
        );
    }
}

export const CreatePortfolio = Form.create()(withRouter(CreatePortfolioImpl));

const inputStyle = {
    borderRadius: '0px'
};