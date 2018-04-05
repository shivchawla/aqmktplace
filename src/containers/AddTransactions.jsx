import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router'
import {Row, Col, Checkbox, Tabs, Button, Modal, message, Select, Radio, Form, Input, Table} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AdviceTransactionTable, AqStockTableTransaction, AqHighChartMod} from '../components';
import {MyChartNew} from './MyChartNew';
import {AdviceItem} from '../components/AdviceItem';
import {AqStockTableCreatePortfolio} from '../components/AqStockTableCreatePortfolio';
import {AqStockTableCashTransaction} from '../components/AqStockTableCashTransactions';
import {newLayoutStyle, buttonStyle, metricsLabelStyle, metricsValueStyle} from '../constants';
import { MetricItem } from '../components/MetricItem';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const {investorId, aimsquantToken, requestUrl} = require('../localConfig.js');

const dateFormat = 'YYYY-MM-DD';

class AddTransactionsImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickers: [],
            advices: [],
            selectedAdvices: [],
            presentAdvices: [],
            presentStocks: [],
            subscribedAdvices: [],
            isSubscibedAdviceModalVisible: false,
            isPreviewModalVisible: false,
            stockTransactions: [],
            cashTransactions: [],
            toggleValue: 'advice',
            selectedBenchmark: 'TCS'
        };
        this.columns = [
            {
                title: 'NAME',
                dataIndex: 'name',
                key: 'name'
            },
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
                dataIndex: 'price',
                key: 'price'
            },
            {
                title: 'SECTOR',
                dataIndex: 'sector',
                key: 'sector'
            }
        ];
        this.adviceKey = 0;
    }

    renderAdviceTransactions = () => {
        const {advices, subscribedAdvices} = this.state;
        const advicesToBeDeleted = this.state.advices.filter(item => item.checked === true);

        return (
            <Row>
                <Col span={4} style={{left: '20px'}}>
                    <Button 
                            onClick={this.deleteSelected}
                            // disabled={advicesToBeDeleted.length > 0 ? false : tr}
                    >
                        Delete Selected
                    </Button>
                </Col>
                <Col span={4} offset={16} style={{position: 'absolute', right: '20px'}}>
                    <Button 
                            onClick={this.toggleSubscribedAdviceModal} 
                            style={{right: 0, position: 'absolute'}}
                    >
                        Browse Advice
                    </Button>
                </Col>
                <Col span={24} style={{marginTop: 20, padding: '0 20px'}}>
                    {
                        advices.length > 0 
                        ?   <AdviceTransactionTable 
                                    advices={advices} 
                                    subscribedAdvices={subscribedAdvices}
                                    updateAdvices={this.updateAdvices}
                                    processAdvice={this.processAdvice}
                                    disabledDate={this.disabledDate}
                                    previewPortfolio={this.previewPortfolio}
                            />
                        :   <h5 
                                style={{textAlign: 'center', fontSize: '16px'}}
                            >
                                Please add advices to your portfolio
                            </h5>
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
                    onOk={this.onOk}
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
                        subscribedAdvices={this.state.subscribedAdvices}
                        updateSubscribedAdvices={this.updateSubscribedAdvices}
                        disabledDate={this.disabledDate}
                />
            </Modal>
        );
    }

    renderPreviewModal = () => {
        return (
            <Modal
                    title="Preview"
                    visible={this.state.isPreviewModalVisible}
                    width="80%"
                    onCancel={this.togglePreviewModal}
                    footer={[
                        <Button key="back" onClick={this.togglePreviewModal}>Cancel</Button>,
                        <Button key="submit" type="primary" onClick={this.handleSubmit}>
                          Save
                        </Button>,
                    ]}
            >
                <Row>
                    <Col span={24}>
                        <MetricItem 
                            label="Name"
                            value={this.props.form.getFieldValue('name') ? this.props.form.getFieldValue('name') : 'undefined'}
                            valueStyle={{...metricsValueStyle, fontWeight: 700}}
                            labelStyle={metricsLabelStyle}
                        />
                        <MetricItem 
                            label="Benchmark"
                            value={this.state.selectedBenchmark}
                            valueStyle={{...metricsValueStyle, fontWeight: 700}}
                            labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    {this.renderPreview()}
                </Row>
            </Modal>
        );
    }

    togglePreviewModal = () => {
        this.setState({isPreviewModalVisible: !this.state.isPreviewModalVisible});
    }

    updateSubscribedAdvices = (subscribedAdvices) => {
        this.setState({subscribedAdvices});
    }   

    onOk = () => {
        this.updateAdvices();
        this.toggleSubscribedAdviceModal();
    }

    updateAdvices = () => {
        const selectedAdvices = this.state.subscribedAdvices.filter(advice => {
            return advice.isSelected === true;
        });
        const advices = selectedAdvices.map((advice, index) => {
            return this.processAdvice(advice);
        });
        this.setState({advices}, () => {
            this.previewPortfolio();
        });
    }

    addAdvice = (advice) => {
        const selectedAdvices = [...this.state.selectedAdvices];
        selectedAdvices.push(advice);
        this.setState({selectedAdvices});
    }
    
    deleteAdvice = (advice) => {
        const selectedAdvices = [...this.state.selectedAdvices];
        const adviceIndex = _.findIndex(selectedAdvices, item => item.key === advice.key);
        selectedAdvices.splice(adviceIndex, 1);
        this.setState({selectedAdvices});
    }

    onStockTransactionChange = (data) => {
        this.setState({stockTransactions: data});
    }

    onCashTransactionChange = (data) => {
        this.setState({cashTransactions: data});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const url = !this.props.portfolioId 
                ? `${requestUrl}/investor/${investorId}/portfolio`
                : `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}/transactions`;
        const transactions = [
            ...this.processAdviceTransaction(this.state.advices),
            ...this.processCashTransaction(this.state.cashTransactions),
            ...this.processStockTransaction(this.state.stockTransactions)
        ];
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const additionalData = !this.props.portfolioId 
                    ?   {
                            name: values.name,
                            benchmark: {
                                ticker: this.state.selectedBenchmark,
                                securityType: "EQ",
                                country: "IN",
                                exchange: "NSE"
                            }
                        }
                    :   {
                            action: "add"
                        };
                const data = {
                    preview: false,
                    transactions,
                    ...additionalData
                };
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
                message.error('Please provide a valid name');
            }
        });
    }

    previewPortfolio = () => {
        const tickers = [...this.state.tickers];
        const url = !this.props.portfolioId 
                ? `${requestUrl}/investor/${investorId}/portfolio`
                : `${requestUrl}/investor/${investorId}/portfolio/${this.props.portfolioId}/transactions`;
        const transactions = [
            ...this.processAdviceTransaction(this.state.advices),
            ...this.processCashTransaction(this.state.cashTransactions),
            ...this.processStockTransaction(this.state.stockTransactions)
        ];
        const additionalData = !this.props.portfolioId 
                ?   {
                        name: "Yo",
                        benchmark: {
                            ticker: this.state.selectedBenchmark,
                            securityType: "EQ",
                            country: "IN",
                            exchange: "NSE"
                        }
                    }
                :   {
                        action: "add"
                    };
        const data = {
            preview: true,
            transactions,
            ...additionalData
        };
        axios({
            url,
            method: 'POST',
            headers: {'aimsquant-token': aimsquantToken},
            data: data
        })
        .then(response => {
            console.log('Preview', response.data);
            const performanceData = {
                name: "",
                detail: {
                    startDate: moment().subtract(1, 'years').format(dateFormat),
                    endDate: moment().format(dateFormat),
                    positions: transactions,
                    cash: 0
                },
                benchmark: {
                    ticker: this.state.selectedBenchmark,
                    securityType: "EQ",
                    country: "IN",
                    exchange: "NSE"
                }
            };
            console.log(response.data);
            this.setState({
                presentAdvices: this.processPreviewAdviceTransaction(response.data.detail.subPositions),
                presentStocks: this.processPreviewStockTransction(response.data.detail.positions)
            });
            return axios({
                url: `${requestUrl}/performance`,
                method: 'POST',
                data: performanceData,
                headers: {'aimsquant-token': aimsquantToken}
            });
        })
        .then(response => {
            let performanceSeries = response.data.portfolioPerformance.portfolioValues.map((item, index) => {
                return [moment(item.date).valueOf(), item.netValue];
            });
            if (tickers.length < 2) {
                tickers.push({
                    name: 'Portfolio',
                    show: true,
                    data: performanceSeries
                });
            } else{
                tickers[1].data = performanceSeries;
            }
            this.setState({tickers});
        })
        .catch(error => {
            console.log(error);
        });
    }

    renderPreview = () => {
        return (
            <Col span={24}>
                <Tabs defaultActiveKey="2" animated={false}>
                    <TabPane tab="Portfolio" key="2" style={{padding: '0 20px 20px 20px'}}>
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
                    <TabPane tab="Performance" key="1" style={{padding: '0 20px 20px 20px'}}>
                        <Row>
                            <Col span={24}>
                                <MyChartNew series={this.state.tickers}/> 
                            </Col>
                        </Row>
                    </TabPane>
                </Tabs>
            </Col>
        );
    }

    renderPreviewAdvicePositions = () => {
        return (
            <Row>
                <Col span={24} style={{marginTop: 20}}>
                    {
                        // this.state.presentAdvices.length > 0 
                        this.state.advices.length > 0
                        ? <AdviceTransactionTable
                                preview 
                                // advices={this.state.presentAdvices} 
                                advices={this.state.advices} 
                        />
                        :   <h5 
                                style={{textAlign: 'center', fontSize: '16px'}}
                            >
                                Please add advices to your portfolio
                            </h5>
                    }
                </Col>
            </Row>
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

    processAdvice = (advice) => {
        const key = this.adviceKey++;

        return {
            checked: false,
            adviceId: advice.id,
            name: advice.name,
            netAssetValue: this.calculateNetAssetValue(advice),
            weight: '12.4%',
            profitLoss: '+12.4%',
            units: 1,
            key,
            date: advice.date,
            createdDate: advice.createdDate,
            composition: this.processAdviceComposition(advice, key)
        }
    }

    calculateNetAssetValue = (advice) => {
        let netAssetValue = 0;
        advice.portfolio.detail.positions.map(position => {
            netAssetValue += position.lastPrice * position.quantity;
        });

        return netAssetValue;
    }

    processAdviceComposition = (advice, key) => {
        let composition = [];
        if (advice.portfolio.detail) {
            advice.portfolio.detail.positions.map((item, index) => {
                composition.push({
                    key: index,
                    adviceKey: key,
                    symbol: item.security.ticker,
                    name: item.security.detail.Nse_Name,
                    sector: item.security.detail.Sector,
                    shares: item.quantity,
                    modifiedShares: item.quantity,
                    price: item.lastPrice,
                    costBasic: 12,
                    unrealizedPL: 1231,
                    weight: '12%',
                });
            });
        }

        return composition;
    }

    processAdviceTransaction = (adviceTransactions) => {
        const transactions = [];
        adviceTransactions.map(transaction => {
            if (transaction.composition.length > 0) {
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
            }
        });

        return transactions;
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
        const tickers = [...this.state.tickers];
        if (tickers.length < 1) {
            tickers.push({
                name: value
            });
        } else {
            tickers[0].name = value;
        }
        this.setState({selectedBenchmark: value, tickers});
    }

    renderSelect = () => {
        const benchmarkArray = ['TCS', 'NIFTY_50', 'WIPRO', 'LT'];

        return (
            <Row>
                <Col span={12}>
                    <h4 style={labelStyle}>Benchmark</h4>
                    <Select 
                            defaultValue={this.state.selectedBenchmark} 
                            style={{width: 120}} 
                            onChange={this.handleBenchmarkChange}
                    >
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

    deleteSelected = () => {
        let advices = [...this.state.advices];
        let subscribedAdvices = [...this.state.subscribedAdvices];
        const advicesToBeDeleted = this.state.advices.filter(item => item.checked === true);
        subscribedAdvices = subscribedAdvices.map(subscribedAdvice => {
            advicesToBeDeleted.map(advice => {
                if (advice.adviceId === subscribedAdvice.id) {
                    subscribedAdvice.isSelected = false;
                }
            });
            return subscribedAdvice;
        });
        advices = _.pullAll(advices, advicesToBeDeleted);
        this.setState({advices, subscribedAdvices});
    }

    disabledDate = (current, advice) => {
        const createdDate = moment(advice.createdDate).subtract(2, 'days');
        return (current && current > moment().endOf('day')) || (current && current < createdDate);
    }

    processPreviewAdviceTransaction = (adviceTransactions) => {
        console.log('Advice Transactions', adviceTransactions);
        const advices = [];
        adviceTransactions.map((item, index) => {
            console.log(item);
            const adviceIndex = _.findIndex(advices, advice => {
                if (item.advice) {
                    return advice.id === item.advice._id;
                } else {
                    return advice.id === 100
                }      
            });
            if (adviceIndex === -1) {
                advices.push({
                    id: item.advice ? item.advice._id : 100,
                    name: item.advice !== null ? item.advice.name : 'My Portfolio',
                    key: index,
                    netAssetValue: item.lastPrice * item.quantity,
                    weight: '12.4%',
                    profitLoss: '+12.4%',
                    units: 1,
                    composition: [
                        {
                            key: 1,
                            adviceKey: index,
                            symbol: item.security.ticker,
                            shares: item.quantity,
                            modifiedShares: item.quantity,
                            price: item.lastPrice,
                            costBasic: item.avgPrice,
                            unrealizedPL: 1231,
                            weight: '12%',
                        }
                    ]
                })
            } else {
                advices[adviceIndex].netAssetValue += item.quantity * item.lastPrice;
                advices[adviceIndex].composition.push({
                    key: index + 1,
                    adviceKey: advices[adviceIndex].key,
                    symbol: item.security.ticker,
                    shares: item.quantity,
                    modifiedShares: item.quantity,
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
        const stockPositions = [];
        stockTransactions.map((item, index) => {
            stockPositions.push({
                key: index,
                symbol: item.security.ticker,
                shares: item.quantity,
                price: item.lastPrice,
                avgPrice: item.avgPrice,
                country: item.security.country,
                name: item.security.detail.Nse_Name,
                sector: item.security.detail.Sector,
            });
        });

        return stockPositions;
    }

    componentWillMount() {
        const tickers = [...this.state.tickers];
        tickers.push({
            name: this.state.selectedBenchmark
        });
        this.setState({tickers});
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const {portfolioId} = this.props;

        return (
            <Row>
                {this.renderSubscribedAdviceModal()}
                {this.renderPreviewModal()}
                <Form>
                    <Col xl={18} md={24} style={{...newLayoutStyle}}>
                        {
                            !portfolioId && 
                            <Row type="flex" align="middle" style={{marginTop: '20px'}}>
                                <Col span={5} style={{marginLeft: '20px'}}>
                                    <h4 style={{...labelStyle, marginTop: '-4px'}}>Portfolio Name</h4>
                                    <FormItem>
                                        {getFieldDecorator('name', {
                                            rules: [{required: true, message: 'Please enter Portfolio Name'}]
                                        })(
                                            <Input placeholder="Portfolio Name"/>
                                        )}
                                    </FormItem>
                                </Col>
                                <Col span={10} offset={1}>
                                    {this.renderSelect()}
                                </Col>
                                <Col xl={0} md={7}>
                                    <Row style={{position: 'absolute', right: 40}}>
                                        <Col span={12}>
                                            <Button 
                                                    type="primary" 
                                                    onClick={this.togglePreviewModal} 
                                                    htmlType="submit"
                                                    style={{position: 'absolute', right: '10px'}}
                                            >
                                                Preview
                                            </Button>
                                        </Col>
                                        <Col span={12}>
                                            <Button
                                                    onClick={() => this.props.history.goBack()}
                                            >
                                                Cancel
                                            </Button>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        }
                        <Row style={{marginLeft: '20px', marginTop: '10px'}}>
                            <Col span={24}>
                                <Checkbox>Make Default Portfolio</Checkbox>
                            </Col>
                        </Row>
                        <Row style={{marginTop: '5px'}}>
                            <Col span={24}>
                                <Tabs defaultActiveKey="1" animated={false} style={{paddingBottom: '20px'}}>
                                    <TabPane tab="Stock Transaction" key="1" style={{minHeight: '250px'}}>
                                        {this.renderStockTransactions()}
                                    </TabPane> 
                                    <TabPane tab="Advice Transaction" key="2" style={{minHeight: '250px'}}>
                                        {this.renderAdviceTransactions()}
                                    </TabPane> 
                                    <TabPane tab="Cash Transaction" key="3" style={{minHeight: '250px'}}>
                                        {this.renderCashTransactions()}
                                    </TabPane> 
                                </Tabs>
                            </Col>
                        </Row>
                    </Col>
                    <Col xl={5} md={0} offset={1}>
                        <Row type="flex">
                            <Col span={24}>
                                <FormItem>
                                    <Button 
                                            type="primary" 
                                            onClick={this.togglePreviewModal} 
                                            htmlType="submit"
                                            style={buttonStyle}
                                    >
                                        Preview
                                    </Button>
                                </FormItem>
                            </Col>
                            <Col span={24} style={{marginTop: 10}}>
                                <Button
                                        onClick={() => this.props.history.goBack()}
                                        style={buttonStyle}
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

export const AddTransactions = withRouter(Form.create()(AddTransactionsImpl));

const labelStyle = {
    color: '#898989',
    marginBottom: '5px'
};