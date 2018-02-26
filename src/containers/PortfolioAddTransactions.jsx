import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {Row, Col, Checkbox, Tabs, Button, Modal, message, Select, Radio, Form, Input, Table} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AdviceTransactionTable, AqStockTableTransaction, AqHighChartMod} from '../components';
import {AdviceItem} from '../components/AdviceItem';
import {AqStockTableCreatePortfolio} from '../components/AqStockTableCreatePortfolio';
import {AqStockTableCashTransaction} from '../components/AqStockTableCashTransactions';
import {layoutStyle} from '../constants';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const {investorId, aimsquantToken, requestUrl} = require('../localConfig.json');

export class PortfolioAddTransactions extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickers: [],
            toggleValue: 'advice',
            advices: [],
            stockPositions: [],
            presentAdvices: [],
            presentStocks: [],
            isSubscibedAdviceModalVisible: false,
            stockTransactions: [],
            cashTransactions: [],
            toggleValue: 'advice',
            selectedBenchmark: 'TCS'
        };
        this.columns = [
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'Shares',
                dataIndex: 'shares',
                key: 'shares'
            },
            {
                title: 'Price',
                dataIndex: 'price',
                key: 'price'
            },
            {
                title: 'Average Price',
                dataIndex: 'avgPrice',
                key: 'avgPrice'
            }, 
            {
                title: 'Country',
                dataIndex: 'country',
                key: 'country'
            }
        ];
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

    renderPreviewAdvicePositions = () => {
        return (
            <Row>
                <Col span={24} style={{marginTop: 20}}>
                    {
                        this.state.presentAdvices.length > 0 
                        ? <AdviceTransactionTable preview advices={this.state.presentAdvices} />
                        : <h5>Please add advices to your portfolio</h5>
                    }
                </Col>
            </Row>
        );
    }

    renderStockTransactions = () => {
        return (
            <AqStockTableCreatePortfolio 
                    onChange={this.onStockTransactionChange} 
                    previewPortfolio={this.previewPortfolio} 
            />
        );
    }

    renderPreviewStockPositions = () => {
        return (
            <Table 
                    size="small"
                    pagination={false} 
                    style={{marginTop: 20}} 
                    columns={this.columns} 
                    dataSource={this.state.presentStocks} 
            />
        );
    }

    renderCashTransactions = () => {
        return (
            <AqStockTableCashTransaction 
                    onChange={this.onCashTransactionChange} 
                    previewPortfolio={this.previewPortfolio} 
            />
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
        this.setState({advices}, () => {
            this.previewPortfolio();
        });
    }
    
    deleteAdvice = (advice) => {
        const advices = [...this.state.advices];
        const adviceIndex = _.findIndex(advices, item => item.key === advice.key);
        advices.splice(adviceIndex, 1);
        this.setState({advices}, () => {
            this.previewPortfolio();
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
        const url = `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}/transactions`;
        console.log(url);
        const transactions = [
            ...this.processAdviceTransaction(this.state.advices),
            ...this.processCashTransaction(this.state.cashTransactions),
            ...this.processStockTransaction(this.state.stockTransactions)
        ];
        const data = {
            preview: false,
            action: "add",
            transactions
        };
        this.setState({
            advices: [],
            cashTransactions: [],
            stockTransactions: []
        })
        axios({
            url,
            method: 'POST',
            headers: {'aimsquant-token': aimsquantToken},
            data: data
        })
        .then(response => {
            console.log(response.data);
            this.setState({
                advices: [],
                cashTransactions: [],
                stockTransactions: []
            })
            message.success('Transactions Added');
        })
        .catch(error => {
            message.error(error.message);
        }); 
        console.log(data);
    }

    previewPortfolio = () => {
        const url = `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}/transactions`;
        const performanceUrl = `${requestUrl}/performance`;
        const tickers = [...this.state.tickers];
        const data = {
            preview: true,
            action: "add",
            transactions: [
                ...this.processAdviceTransaction(this.state.advices),
                ...this.processCashTransaction(this.state.cashTransactions),
                ...this.processStockTransaction(this.state.stockTransactions)
            ]
        };
        axios({
            url,
            method: 'POST',
            headers: {'aimsquant-token': aimsquantToken},
            data: data
        })
        .then(response => {
            console.log(response.data);
            this.setState({
                presentAdvices: this.processPreviewAdviceTransaction(response.data.detail.subPositions),
                presentStocks: this.processPreviewStockTransction(response.data.detail.positions)
            });
        })
        .catch(error => {
            if (data.transactions.length < 1) {
                this.setState({
                    presentAdvices: [],
                    presentStocks: []
                }, () => {
                    message.info("Empty Portfolio");
                });
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

    processPreviewAdviceTransaction = (adviceTransactions) => {
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

    processPreviewStockTransction = (stockTransactions) => {
        const stockPositions = [...this.state.stockPositions];
        stockTransactions.map((item, index) => {
            stockPositions.push({
                key: index,
                symbol: item.security.ticker,
                shares: item.quantity,
                price: item.lastPrice,
                avgPrice: item.avgPrice,
                country: item.security.country,
            });
        });

        return stockPositions;
    }

    processStockTransaction = (stockTransactions) => {
        const transactions = [];
        stockTransactions.map((transaction, index) => {
            const {symbol = "", date = undefined, shares = 0, price = 0, commission = 0} = transaction;
            if (symbol.length > 0 && date != undefined && price > 0) {
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

    toggleView = (e) => {
        this.setState({toggleValue: e.target.value});
    }

    renderPreview = () => {
        return (
            <Col span={24}>
                <Tabs defaultActiveKey="2">
                    <TabPane tab="Portfolio" key="2">
                        <Row>
                            <Col span={8} offset={16} style={{marginBottom: 20}}>
                                <Radio.Group 
                                        value={this.state.toggleValue} 
                                        onChange={this.toggleView} 
                                        style={{position: 'absolute', right: 0}}
                                        size="small"
                                >
                                    <Radio.Button value="advice">Advice</Radio.Button>
                                    <Radio.Button value="stock">Stock</Radio.Button>
                                </Radio.Group>
                            </Col>
                        </Row>
                        {
                            this.state.toggleValue === 'advice'
                            ? this.renderPreviewAdvicePositions()
                            : this.renderPreviewStockPositions()
                        }
                    </TabPane>
                    <TabPane tab="Performance" key="1">
                        <Row>
                            <Col span={24}>
                                <AqHighChartMod tickers={this.state.tickers}/> 
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </Col>
        );
    }

    componentWillMount() {
        console.log(this.props.location.state);
        const {advices, stocksPositions} = this.props.location.state;
        this.setState({
            presentAdvices: advices,
            presentStocks: stocksPositions
        });
    }

    render() {
        return (
            <Row>
                {this.renderSubscribedAdviceModal()}
                <Form>
                    <Col span={18} style={layoutStyle}>
                        <Row>
                            <Col span={24}>
                                <h3>Transactions</h3>
                            </Col>
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
                        <Row>
                            <Col span={24} style={{marginTop: 20}}>
                                <h3>Preview</h3>
                            </Col>
                            {this.renderPreview()}
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
                                        onClick={() => {
                                            this.props.history.push(`/dashboard/portfolio/${this.props.match.params.id}`)
                                        }}
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

const inputStyle = {
    borderRadius: '0px'
};
