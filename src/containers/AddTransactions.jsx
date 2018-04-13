import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import Loading from 'react-loading-bar';
import moment from 'moment';
import {withRouter} from 'react-router'
import {Row, Col, Checkbox, Tabs, Button, Modal, message, Select, Radio, Form, Input, Table} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AdviceTransactionTable, AqStockTableTransaction, AqHighChartMod, ForbiddenAccess, AqPageHeader, StockResearchModal} from '../components';
import {MyChartNew} from './MyChartNew';
import {SubscribedAdvices} from '../components/SubscribedAdvices';
import {AqStockTableCreatePortfolio} from '../components/AqStockTableCreatePortfolio';
import {AqStockTableCashTransaction} from '../components/AqStockTableCashTransactions';
import {pageTitleStyle, newLayoutStyle, buttonStyle, metricsLabelStyle, metricsValueStyle, loadingColor, shadowBoxStyle, benchmarkColor, metricColor} from '../constants';
import { MetricItem } from '../components/MetricItem';
import {UpdatePortfolioCrumb} from '../constants/breadcrumbs';
import {Utils, getBreadCrumbArray, addToMyPortfolio, addToAdvice} from'../utils';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const {aimsquantToken, requestUrl} = require('../localConfig.js');

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
            latestAdvices: [],
            subscribedAdvices: [],
            isPreviewModalVisible: false,
            isSubscibedAdviceModalVisible: false,
            stockTransactions: [],
            cashTransactions: [],
            toggleValue: 'stock',
            selectedBenchmark: 'TCS',
            notAuthorized: false,
            show: false,
            portfolioName: '',
            portfolioId: '',
            stockResearchModalVisible: false,
            stockResearchModalTicker: {name: 'TCS', symbol: 'TCS'}
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
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                render: text => <span>{text} %</span>
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
        const {advices, subscribedAdvices, latestAdvices} = this.state;
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
                                    toggleStockResearchModal={this.toggleStockResearchModal}
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
                <SubscribedAdvices 
                        investorId={Utils.getUserInfo().investor}
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
                    <Col span={24} style={{display: 'flex', flexDirection: 'row'}}>
                        <MetricItem 
                            label="Name"
                            value={this.props.form.getFieldValue('name') ? this.props.form.getFieldValue('name') : 'undefined'}
                            valueStyle={{...metricsValueStyle, fontWeight: 700}}
                            labelStyle={metricsLabelStyle}
                        />
                        <MetricItem 
                            style={{display: 'inline-flex', flexDirection: 'column'}}
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
        if (!this.state.isPreviewModalVisible) {
            this.previewPortfolio();
        }
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
        this.setState({advices});
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
                ? `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio`
                : `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio/${this.props.match.params.id}/transactions`;
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
                    headers: Utils.getAuthTokenHeader(),
                    data: data
                })
                .then(response => {
                    message.success('Portfolio Created Successfully');
                })
                .catch(error => {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                });
            } else {
                message.error('Please provide a valid name');
            }
        });
    }

    previewPortfolio = () => {
        const tickers = [...this.state.tickers];
        const url = !this.props.portfolioId 
                ? `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio`
                : `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio/${this.props.portfolioId}/transactions`;
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
            headers: Utils.getAuthTokenHeader(),
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
            this.setState({
                presentAdvices: this.processPreviewAdviceTransaction(_.get(response.data, 'detail.subPositions', [])),
                presentStocks: this.processPreviewStockTransction(_.get(response.data, 'detail.positions', []))
            });
            return axios({
                url: `${requestUrl}/performance`,
                method: 'POST',
                data: performanceData,
                headers: Utils.getAuthTokenHeader()
            });
        })
        .then(response => {
            let performanceSeries = _.get(response.data, 'portfolioPerformance.portfolioValues', []).map((item, index) => {
                return [moment(item.date, dateFormat).valueOf(), item.netValue];
            });
            console.log('Performance Series', performanceSeries);
            if (tickers.length < 2) {
                tickers.push({
                    name: 'Portfolio',
                    show: true,
                    data: performanceSeries
                });
            } else{
                tickers[1].data = performanceSeries;
            }
            console.log('Tickers', tickers);
            this.setState({tickers});
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
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
                                toggleStockResearchModal={this.toggleStockResearchModal}
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
        console.log('Advice Detail', advice);

        return {
            checked: false,
            adviceId: advice.id,
            name: advice.name,
            netAssetValue: this.calculateNetAssetValue(advice),
            weight: '12.4%',
            profitLoss: '+12.4%',
            oldUnits: 0,
            newUnits: 1,
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
            _.get(advice, 'portfolio.detail.positions', []).map((item, index) => {
                composition.push({
                    key: index,
                    adviceKey: key,
                    symbol: _.get(item, 'security.ticker', ''),
                    name: _.get(item, 'security.detail.Nse_Name', ''),
                    sector: _.get(item, 'security.detail.Sector', ''),
                    shares: 0,
                    modifiedShares: 0,
                    newShares: item.quantity || 0,
                    price: item.lastPrice || 0,
                    costBasic: 12,
                    unrealizedPL: 1231,
                    weight: '12%',
                    transactionalQuantity: item.quantity - 0
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
                        quantity: item.transactionalQuantity,
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
                weight: (item.weightInPortfolio * 100).toFixed(2)
            });
        });

        return stockPositions;
    }

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            if (this.props.portfolioId) {
                // Check if the user is authorized to access this page
                this.setState({show: true});
                const url = `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio/${this.props.match.params.id}`;
                const unionAdvices = [];
                axios.get(url, {headers: Utils.getAuthTokenHeader()})
                .then(response => {
                    const advicePerformance = _.get(response.data, 'advicePerformance', []);
                    const subPositions = _.get(response.data, 'detail.subPositions', []);
                    const advices = this.processSubscribedAdviceTransactions(subPositions, advicePerformance);
                    const changedAdvices = advices.filter(advice => advice.hasChanged === true);
                    const name = _.get(response.data, 'name', '');
                    const id = _.get(response.data, '_id', '');
                    const tickers = [...this.state.tickers];
                    tickers.push({
                        name: this.state.selectedBenchmark
                    });
                    this.setState({
                        tickers, notAuthorized: false, 
                        portfolioName: name, portfolioId: id,
                        advices: changedAdvices,
                    });
                    return this.getSubscribedAdvicesRequest(changedAdvices);
                })
                .then(adviceResponse => {
                    let advices = [...this.state.advices]; // Portfolio Advices
                    const modifiedAdvices = this.generateLatestAdvices(advices, adviceResponse); // Latest advices
                    advices.map(advice => {
                        const modifiedAdvice = modifiedAdvices.filter(item => item.id === advice.id)[0];
                        const consolidatedList = _.uniq(_.concat(
                                advice.composition.map(item => item.symbol), 
                                modifiedAdvice.composition.map(item => item.symbol)
                        ));
                        const composition = [];
                        consolidatedList.map(consolidatedListItem => { // Running through the list of all positions
                            const adviceCompositionIndex = _.findIndex(advice.composition, item => item.symbol === consolidatedListItem);
                            const modifiedCompositionIndex = _.findIndex(modifiedAdvice.composition, item => item.symbol === consolidatedListItem);
                            const oldShares = adviceCompositionIndex === -1 ? 0 : advice.composition[adviceCompositionIndex].modifiedShares;
                            const newShares = modifiedCompositionIndex === -1 ? 0 : modifiedAdvice.composition[modifiedCompositionIndex].modifiedShares;
                            const positionDetail = adviceCompositionIndex > -1 ? advice.composition[adviceCompositionIndex] : modifiedAdvice.composition[modifiedCompositionIndex];
                            composition.push({
                                ...positionDetail,
                                name: consolidatedListItem,
                                shares: oldShares,
                                modifiedShares: oldShares,
                                newShares,
                                transactionalQuantity: newShares - (oldShares * Number(advice.oldUnits))
                            });
                        });
                        unionAdvices.push({
                            ...advice,
                            composition
                        });
                    });
                    this.setState({advices: unionAdvices});
                })
                .catch(error => {
                    console.log(error);
                    if (error.response) {
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                        if (error.response.status === 400) {
                            this.setState({notAuthorized: true});
                        }
                    }
                })
                .finally(() => {
                    this.setState({show: false});
                });
            } else {
                const tickers = [...this.state.tickers];
                tickers.push({
                    name: this.state.selectedBenchmark
                });
                this.setState({tickers});
            }
        }
    }

    generateLatestAdvices = (portfolioAdvices, adviceResponse) => {
        const modifiedAdvices = [];
        adviceResponse.map((response, index) => {
            const adviceId = response.data.adviceId;
            const advice = portfolioAdvices.filter(advice => advice.id === adviceId)[0];
            modifiedAdvices.push({
                id: advice.id,
                name: advice.name,
                key: index,
                weight: advice.weight,
                profitLoss: advice.profitLoss,
                oldUnits: advice.units,
                newUnits: 1,
                netAssetValue: advice.netAssetValue,
                hasChanged: advice.hasChanged,
                composition: this.getAdviceComposition(_.get(response.data, 'detail.positions', []), index)
            })
        });

        return modifiedAdvices;
    }
 
    generateDiffAdvices = (portfolioAdvices, latestAdvices) => {
        return _.union(portfolioAdvices, latestAdvices);
    }

    getSubscribedAdvicesRequest = advices => {
        const adviceRequests = advices.map(
            advice => 
                axios.get(`${requestUrl}/advice/${advice.id}/portfolio`, {headers: Utils.getAuthTokenHeader()}
            )
        );
        return Promise.all(adviceRequests)        
    }

    getAdviceComposition = (composition, adviceIndex) => {
        return composition.map((position, index) => {
            return {
                key: index,
                adviceKey: adviceIndex,
                symbol: position.security.ticker,
                shares: position.quantity,
                modifiedShares: position.quantity,
                newShares: 0,
                price: position.lastPrice,
                costBasic: position.avgPrice,
                unrealizedPL: 1231,
                weight: '12%',
                name: _.get(position, 'security.detail.Nse_Name', 'undefined'),
                sector: _.get(position, 'security.detail.Sector', 'undefined'),
                transactionalQuantity: 0 
            }
        })
    }

    processSubscribedAdviceTransactions = (subPositions, advicePerformance) => {
        let advices = [];
        subPositions.map((position, positionIndex) => {
            advices = position.advice === null // check whether the sub position belongs to any advice 
                            ? addToMyPortfolio(advices, advicePerformance, position, positionIndex) 
                            : addToAdvice(advices, advicePerformance, position, positionIndex);
        });

        return advices;
    }

    toggleModal = () => {
        this.setState({stockResearchModalVisible: !this.state.stockResearchModalVisible});        
    }

    toggleStockResearchModal = ticker => {
        this.setState({stockResearchModalTicker: ticker}, () => {
            this.toggleModal();
        });
    }

    renderPageContent = () => {
        const {getFieldDecorator} = this.props.form;
        const {portfolioId} = this.props;
        const breadCrumbs = this.props.portfolioId 
                ? getBreadCrumbArray(UpdatePortfolioCrumb, [
                    {name: this.state.portfolioName, url: `/dashboard/portfolio/${this.state.portfolioId}`},
                    {name: 'Update Portfolio'}
                ])
                : getBreadCrumbArray(UpdatePortfolioCrumb, [
                    {name: 'Create Portfolio'}
                ]);

        return (
            <Row>
                {
                    this.state.notAuthorized 
                    ?   <ForbiddenAccess />
                    :   <Col span={24}>
                        <StockResearchModal 
                                ticker={this.state.stockResearchModalTicker} 
                                visible={this.state.stockResearchModalVisible}
                                toggleModal={this.toggleModal}
                        />
                            <AqPageHeader title={this.props.portfolioId ? "Update Portfolio" : "Create Portfolio"} breadCrumbs={breadCrumbs}/>
                            <Form>
                                <Col xl={0} lg={0} xs={24} md={24} style={{textAlign: 'right'}}>
                                    <Button 
                                        type="primary" 
                                        onClick={this.togglePreviewModal} 
                                        style={{marginRight: '20px'}}>
                                        Preview
                                    </Button>
                                    <Button
                                            onClick={() => this.props.history.goBack()}
                                    >
                                        Cancel
                                    </Button>
                                </Col>
                                <Col xl={18} lg={18} md={24} style={{...shadowBoxStyle, marginTop: '20px'}}>
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
                                            <Col span={18} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                                {this.renderSelect()}
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
                                            <Tabs defaultActiveKey="2" animated={false} style={{paddingBottom: '20px'}}>
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
                                <Col xl={5} lg={5} md={0} sm={0} xs={0} offset={1} style={{marginTop: '20px'}}>
                                    <Row type="flex">
                                        <Col span={24}>
                                            <Button 
                                                    type="primary" 
                                                    onClick={this.togglePreviewModal} 
                                                    style={buttonStyle}
                                            >
                                                Preview
                                            </Button>
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
                        </Col>
                }
            </Row>
        );
    }

    render() {
        return (
            <Row>
                {this.renderSubscribedAdviceModal()}
                {this.renderPreviewModal()}
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

export const AddTransactions = withRouter(Form.create()(AddTransactionsImpl));

const labelStyle = {
    color: '#898989',
    marginBottom: '5px'
};