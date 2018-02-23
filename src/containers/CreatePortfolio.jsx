import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {Row, Col, Checkbox, Tabs, Button, Modal, message, Select, Radio} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AdviceTransactionTable, AqStockTableTransaction} from '../components';
import {AdviceItem} from '../components/AdviceItem';
import {AqStockTableCreatePortfolio} from '../components/AqStockTableCreatePortfolio';
import {AqStockTableCashTransaction} from '../components/AqStockTableCashTransactions';
import {layoutStyle} from '../constants';

const TabPane = Tabs.TabPane;
const {investorId, aimsquantToken, requestUrl} = require('../localConfig.json');

export class CreatePortfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: [],
            presentAdvices: [],
            isSubscibedAdviceModalVisible: false,
            stockTransactions: [],
            cashTransactions: [],
            toggleValue: 'advice'
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

    handleSubmit = () => {
        const transactions = [
            ...this.processAdviceTransaction(this.state.advices),
            ...this.processCashTransaction(this.state.cashTransactions),
            ...this.processStockTransaction(this.state.stockTransactions)
        ];
        console.log(transactions);
        const portfolioId = this.props.match.params.id;
        const url = `${requestUrl}/investor/${investorId}/portfolio/${portfolioId}/transactions`;
        axios({
            url,
            method: 'POST',
            headers: {'aimsquant-token': aimsquantToken},
            data: {
                action: "add",
                preview: false,
                transactions
            }
        })
        .then(response => {
            message.success('Transactions Added');
        })
        .catch(error => {
            message.error(error.message);
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
                    price: item.price,
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

    componentWillMount() {
        const url = `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(this.processPresentAdviceTransaction(response.data.detail.subPositions));
            this.setState({presentAdvices: this.processPresentAdviceTransaction(response.data.detail.subPositions)});
        })
        .catch(error => {
            console.log(error.message);
        })
    }

    render() {
        return (
            <Row>
                {this.renderSubscribedAdviceModal()}
                <Col span={18} style={layoutStyle}>
                    <Row type="flex" justify="end">
                        <Col span={5}>
                            <h5>Remaining Cash 10000</h5>
                        </Col>
                        <Col span={4}>
                            <Checkbox>Link Cash</Checkbox>
                        </Col>
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
                    {/* <Row>
                        <Col span={24} style={{marginTop: 20}}>
                            <Row>
                                <Col span={24}>
                                    <h3>Preview</h3>
                                </Col>
                            </Row>
                            <Row>
                                <Tabs defaultActiveKey="2">
                                    <TabPane tab="Performance" key="1"></TabPane>
                                    <TabPane tab="Portfolio" key="2">
                                        <Row>
                                            <Col span={4}>
                                                <h5>Cash 1000</h5>
                                            </Col>
                                            <Col span={8} offset={12}>
                                                <Radio.Group value={this.state.toggleValue} onChange={this.toggleView} style={{position: 'absolute', right: 0}}>
                                                    <Radio.Button value="advice">Advice</Radio.Button>
                                                    <Radio.Button value="stock">Stock</Radio.Button>
                                                </Radio.Group>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col span={24}>
                                                {this.renderPresentAdviceTransactions()}
                                            </Col>
                                        </Row>
                                    </TabPane>
                                </Tabs>
                            </Row>
                        </Col>
                    </Row> */}
                </Col>
                <Col span={5} offset={1}>
                    <Row type="flex">
                        <Col span={24}>
                            <Button type="primary" onClick={this.handleSubmit}>Save</Button>
                        </Col>
                        <Col span={24} style={{marginTop: 10}}>
                            <Button>Cancel</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
