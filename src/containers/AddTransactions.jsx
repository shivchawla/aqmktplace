import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import Loading from 'react-loading-bar';
import moment from 'moment';
import {withRouter} from 'react-router'
import {Row, Col, Checkbox, Tabs, Button, Modal, message, Select, Radio, Form, Input, Table, notification, Spin} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AqPortfolioCompositionAdvice, AqPortfolioTransactionAdvice, AqStockPortfolioTable, AqStockTableTransaction, AqHighChartMod, ForbiddenAccess, AqPageHeader, StockResearchModal} from '../components';
import {MyChartNew} from './MyChartNew';
import {SubscribedAdvices} from '../components/SubscribedAdvices';
import {AqStockTableCreatePortfolio} from '../components/AqStockTableCreatePortfolio';
import {AqStockTableCashTransaction} from '../components/AqStockTableCashTransactions';
import {pageTitleStyle, newLayoutStyle, buttonStyle, metricsLabelStyle, metricsValueStyle, loadingColor, shadowBoxStyle, benchmarkColor, metricColor, performanceColor} from '../constants';
import { MetricItem } from '../components/MetricItem';
import {UpdatePortfolioCrumb} from '../constants/breadcrumbs';
import {Utils, getBreadCrumbArray, addToMyPortfolio, addToAdvice, fetchAjax} from'../utils';
import {benchmarks} from '../constants/benchmarks';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const FormItem = Form.Item;
const {aimsquantToken, requestUrl} = require('../localConfig.js');

const dateFormat = 'YYYY-MM-DD';

class AddTransactionsImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            benchmarks,
            tickers: [],
            advices: [],
            transactionalAdvices: [],
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
            selectedBenchmark: benchmarks[0],
            notAuthorized: false,
            show: false,
            portfolioName: '',
            portfolioId: '',
            stockResearchModalVisible: false,
            stockResearchModalTicker: {name: 'TCS', symbol: 'TCS'},
            submitButtonLoading: false,
            previewCash: 0,
            loadingPreviewData: false,
            defaultChecked: false
        };
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
                            disabled={advices.filter(advice => advice.checked === true).length < 1}
                    >
                        Delete Selected
                    </Button>
                </Col>
                <Col span={4} offset={16} style={{position: 'absolute', right: '20px'}}>
                    <Button 
                            onClick={this.toggleSubscribedAdviceModal} 
                            style={{right: 0, position: 'absolute'}}
                            type="primary"
                    >
                        Browse Advice
                    </Button>
                </Col>
                <Col span={24} style={{marginTop: 20, padding: '0 20px'}}>
                    {
                        advices.length > 0 
                        ?   <AqPortfolioTransactionAdvice 
                                    advices={advices} 
                                    subscribedAdvices={subscribedAdvices}
                                    processAdvice={this.processAdvice}
                                    processAdviceComposition={this.processAdviceComposition}
                                    disabledDate={this.disabledDate}
                                    previewPortfolio={this.previewPortfolio}
                                    updateAdvices={this.updateAdvices}
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
                style={{top: 20, height:'640px'}}
                bodyStyle={{
                    height: '540px',
                    overflow: 'hidden',
                    overflowY: 'scroll'}}>
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
                    bodyStyle={{
                        height: '540px',
                        overflow: 'hidden',
                        overflowY: 'scroll'}}
                    style={{top: 20, height: '650px', overflow: 'hidden'}}
                    onCancel={this.togglePreviewModal}
                    footer={[
                        <Button key="back" onClick={this.togglePreviewModal}>Cancel</Button>,
                        <Button key="back" type="primary" onClick={this.handleSubmit}>Save</Button>,
                    ]}
            >
                <Spin spinning={this.state.loadingPreviewData}>
                    <Row >
                        <Col span={12}>
                            <MetricItem 
                                label="Name"
                                noNumeric
                                value={this.props.form.getFieldValue('name') ? this.props.form.getFieldValue('name') : '-'}
                                noNumeric
                                valueStyle={{...metricsValueStyle, fontWeight: 700}}
                                labelStyle={metricsLabelStyle}
                            />
                        </Col>
                        <Col span={12} style={{textAlign:'right', paddingRight:'40px'}}>
                            <MetricItem 
                                label="Benchmark"
                                noNumeric
                                value={this.state.selectedBenchmark}
                                noNumeric
                                valueStyle={{...metricsValueStyle, fontWeight: 700}}
                                labelStyle={metricsLabelStyle}
                            />
                        </Col>
                        {this.renderPreview()}
                    </Row>
                </Spin>
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
        this.addSelectedSubscribedAdvices();
        this.toggleSubscribedAdviceModal();
    }

    addSelectedSubscribedAdvices = () => {
        const presentAdvices = [...this.state.advices];
        const subscribedAdvices = [...this.state.subscribedAdvices];
        const selectedAdvices = subscribedAdvices.filter(advice => {
            return advice.isSelected === true;
        });
        const selectedSubscribedAdvices = selectedAdvices.map((advice, index) => {
            return this.processAdvice(advice);
        });
        selectedSubscribedAdvices.map(selectedSubscribedAdvice => {
            const targetPresentAdvice = presentAdvices.filter(presentAdvice => presentAdvice.id === selectedSubscribedAdvice.id)[0];
            if (!targetPresentAdvice) {
                notification.open({
                    style: {backgroundColor: '#f9f9f9'},
                    message: selectedSubscribedAdvice.name,
                    description: `${selectedSubscribedAdvice.name} is added to your portfolio.`
                });
            }
        });
        const unionAdvices = _.uniqBy([...presentAdvices, ...selectedSubscribedAdvices], 'id');
        this.setState({advices: unionAdvices});
    }

    updateAdvices = advices => {
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
                    ...additionalData,
                    setdefault: this.state.defaultChecked
                };
                this.setState({submitButtonLoading: true});
                axios({
                    url,
                    method: 'POST',
                    headers: Utils.getAuthTokenHeader(),
                    data: data
                })
                .then(response => {
                    const {portfolioId = null} = this.props;
                    const successMessage = portfolioId ? 'Portfolio Updated Successfully' : 'Portfolio Created Successfully';
                    message.success(successMessage);
                    if (portfolioId) {
                        this.props.history.push(`/investordashboard/portfolio/${portfolioId}`);
                    } else {
                        const portfolioId = _.get(response.data, '_id', null);
                        if (portfolioId) {
                            this.props.history.push(`/investordashboard/portfolio/${portfolioId}`);
                        } else {
                            this.props.history.push(`/investordashboard`);
                        }
                    }
                })
                .catch(error => {
                    // console.log(error);
                    Utils.checkForInternet(error, this.props.history);
                    if(error.response) {
                        const errorMessage = _.get(error.response, 'data.message', 'Error occurred while creating portfolio');
                        const code = _.get(error.response, 'data.errorCode', 'N/A');
                        message.error(`Code - ${code}: ${errorMessage}`);
                        if (error.response.status === 400 || error.response.status === 403) {
                            this.props.history.push('/forbiddenAccess');
                        }
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                })
                .finally(() => {
                    this.setState({submitButtonLoading: false});
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
        this.setState({loadingPreviewData: true});
        axios({
            url,
            method: 'POST',
            headers: Utils.getAuthTokenHeader(),
            data: data
        })
        .then(response => {
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
            let presentAdvices = this.processPreviewAdviceTransaction(_.get(response.data, 'detail.subPositions', []));
            const advicePerformance = _.get(response.data, 'advicePerformance', []);
            presentAdvices = presentAdvices.map(presentAdvice => {
                const advice = _.filter(advicePerformance, item => item.advice === presentAdvice.id)[0];
                if (advice) {
                    presentAdvice.weight = _.get(advice, 'personal.weightInPortfolio');
                    presentAdvice.profitLoss = Number(_.get(advice, 'personal.totalPnlPct').toFixed(2));
                }
                return presentAdvice;
            })
            this.setState({
                presentAdvices,
                presentStocks: this.processPreviewStockTransction(_.get(response.data, 'detail.positions', [])),
                previewCash: _.get(response.data, 'detail.cash', 0)
            });
            return axios({
                url: `${requestUrl}/performance`,
                method: 'POST',
                data: performanceData,
                headers: Utils.getAuthTokenHeader()
            });
        })
        .then(response => { 
            let performanceSeries = _.get(response.data, 'portfolioPerformance.portfolioValues', {}).map((item, index) => {
                return [moment(item.date, dateFormat).valueOf(), Number(item.netValue.toFixed(2))];
            });
            if (tickers.length < 2) {
                tickers.push({
                    name: 'Portfolio',
                    data: performanceSeries,
                    color: performanceColor
                });
            } else{
                tickers[1].data = performanceSeries;
            }
            this.setState({tickers});
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if(error.response) {
                if (error.response.status === 400 || error.response.status === 403) {
                    this.props.history.push('/forbiddenAccess');
                }
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loadingPreviewData: false});
        });
    }

    renderPreview = () => {
        return (
            <Col span={24}>
                <Tabs defaultActiveKey="2" animated={false}>
                    <TabPane tab="Portfolio" key="2" style={{padding: '0 20px 20px 20px'}}>
                        <Row type="flex" justify="space-between" align="bottom" style={{marginBottom: '10px'}}>
                            <Col span={8}>
                                <h4>Cash: {Utils.formatMoneyValueMaxTwoDecimals(this.state.previewCash)}</h4>
                            </Col>
                            <Col span={8} style={{textAlign: 'right'}}>
                                <Radio.Group 
                                        value={this.state.toggleValue} 
                                        onChange={this.toggleView} 
                                        //style={{position: 'absolute', right: 0}}
                                        size="small"
                                >
                                    <Radio.Button value="advice">Advice</Radio.Button>
                                    <Radio.Button value="stock">Stock</Radio.Button>
                                </Radio.Group>
                            </Col>
                        </Row>
                        {
                            this.state.toggleValue === 'advice'
                            ? this.renderPreviewAdvicePortfolio()
                            : this.renderPreviewStockPortfolio()
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

    renderPreviewAdvicePortfolio = () => {
        return (
            <Row>
                <Col span={24} style={{overflowY:'auto'}}>
                    {
                        // this.state.presentAdvices.length > 0 
                        this.state.presentAdvices.length > 0
                        ? <AqPortfolioCompositionAdvice
                                preview 
                                advices={this.state.presentAdvices} 
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

    renderPreviewStockPortfolio = () => {
        return (
            <AqStockPortfolioTable 
                //style={{marginTo}} 
                portfolio={{positions: this.state.presentStocks, cash: this.state.previewCash}} 
                processedPositions={true}/>
        );
    }

    processAdvice = (advice) => {
        const key = this.adviceKey++;

        return {
            checked: false,
            id: advice.id,
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
                        advice: transaction.id || '',
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
                name: value,
                color: benchmarkColor
            });
        } else {
            tickers[0].name = value;
        }
        this.setState({selectedBenchmark: value, tickers});
    }

    renderSelectBenchmark = (portfolioId) => {
        const benchmarkArray = this.state.benchmarks;

        return (
            <Row>
                <Col span={12}>
                    <h3 style={labelStyle}>Benchmark</h3>
                    <Select disabled = {portfolioId}
                            defaultValue={this.state.selectedBenchmark} 
                            style={{width: 180}} 
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
        // subscribedAdvices = subscribedAdvices.map(subscribedAdvice => {
        //     advicesToBeDeleted.map(advice => {
        //         if (advice.adviceId === subscribedAdvice.id) {
        //             subscribedAdvice.isSelected = false;
        //         }
        //     });
        //     return subscribedAdvice;
        // });
        advices = _.pullAll(advices, advicesToBeDeleted);
        this.setState({advices, subscribedAdvices});
    }

    disabledDate = (current, advice) => {
        const createdDate = moment(advice.createdDate).subtract(2, 'days');
        // return (current && current > moment().endOf('day')) || (current && current < createdDate);
        return current && (
            current > moment().endOf('day') 
            || [0, 6].indexOf(current.weekday()) !== -1
            || (current && current < createdDate
        ));
        // return (current && current > moment().endOf('day'));
    }

    processPreviewAdviceTransaction = (adviceTransactions) => {
        const advices = [];
        adviceTransactions.map((item, index) => {
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
                    weight: 0.0,
                    profitLoss: 0.0,
                    units: 1,
                    composition: [
                        {
                            key: 1,
                            adviceKey: index,
                            symbol: item.security.ticker,
                            name: item.security.detail.Nse_Name,
                            sector: item.security.detail.Sector,
                            shares: item.quantity,
                            modifiedShares: item.quantity,
                            avgPrice: item.avgPrice,
                            price: item.lastPrice,
                            costBasic: item.avgPrice,
                            unrealizedPL: 0,
                            weight: 0,
                        }
                    ]
                })
            } else {
                advices[adviceIndex].netAssetValue += item.quantity * item.lastPrice;
                advices[adviceIndex].composition.push({
                    key: index + 1,
                    adviceKey: advices[adviceIndex].key,
                    symbol: item.security.ticker,
                    name: item.security.detail.Nse_Name,
                    sector: item.security.detail.Sector,
                    shares: item.quantity,
                    modifiedShares: item.quantity,
                    price: item.lastPrice,
                    avgPrice: item.avgPrice,
                    costBasic: item.avgPrice,
                    unrealizedPL: 0,
                    weight:0,
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
                fetchAjax(url, this.props.history, this.props.match.url)
                .then(response => {
                    this.props.form.setFieldsValue({name: _.get(response.data, 'name', '-')})
                    const advicePerformance = _.get(response.data, 'advicePerformance', []);
                    const subPositions = _.get(response.data, 'detail.subPositions', []);
                    // Getiing all the advices
                    const advices = this.processSubscribedAdviceTransactions(subPositions, advicePerformance);
                    // Getting all the advices that has changed
                    const changedAdvices = advices.filter(advice => advice.hasChanged === true);
                    const name = _.get(response.data, 'name', '');
                    const id = _.get(response.data, '_id', '');
                    const tickers = [...this.state.tickers];
                    tickers.push({
                        name: this.state.selectedBenchmark,
                        color: '#e91e63'
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
                .catch(error => error)
                .finally(() => {
                    this.setState({show: false});
                });
            } else {
                const tickers = [...this.state.tickers];
                tickers.push({
                    name: this.state.selectedBenchmark,
                    color: benchmarkColor
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
            advice => fetchAjax(`${requestUrl}/advice/${advice.id}/portfolio`, this.props.history, this.props.match.url)
            
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

    checkPreviewButtonDisabled = () => {
        const transactions = [
            ...this.processAdviceTransaction(this.state.advices),
            ...this.processCashTransaction(this.state.cashTransactions),
            ...this.processStockTransaction(this.state.stockTransactions)
        ];
        return transactions.length;
    }

    handleDefaultChange = (e) => {
        this.setState({defaultChecked: e.target.checked});
    }

    componentWillUpdate(nextProps, nextState) {
        // console.log('Advices', nextState.advices);
        // console.log('Subscribed Advices', nextState.subscribedAdvices);
    }

    renderPageContent = () => {
        const {getFieldDecorator} = this.props.form;
        const {portfolioId} = this.props;
        const breadCrumbs = this.props.portfolioId 
                ? getBreadCrumbArray(UpdatePortfolioCrumb, [
                    {name: this.state.portfolioName, url: `/investordashboard/portfolio/${this.state.portfolioId}`},
                    {name: 'Update Portfolio'}
                ])
                : getBreadCrumbArray(UpdatePortfolioCrumb, [
                    {name: 'Create Portfolio'}
                ]);

        const {portfolioName} = this.state;    
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
                            <AqPageHeader 
                                    title={this.props.portfolioId ? "Update Portfolio" : "Create Portfolio"} 
                                    breadCrumbs={breadCrumbs}
                                    showTitle={true}
                            >
                                <Col xl={0} lg={0} xs={24} md={24} style={{textAlign: 'right', marginBottom:'10px'}}>
                                    <Button 
                                            type="primary" 
                                            onClick={this.handleSubmit} 
                                            style={{marginRight: '20px', width: '200px'}}
                                            disabled={!this.checkPreviewButtonDisabled()}
                                    >
                                        SAVE
                                    </Button>
                                    
                                    <Button 
                                            onClick={this.togglePreviewModal} 
                                            style={{width: '200px'}}
                                            disabled={!this.checkPreviewButtonDisabled()}
                                    >
                                        Preview
                                    </Button>
                                </Col>
                            </AqPageHeader>
                            <Form>
                                <Col xl={18} lg={18} md={24} style={{...shadowBoxStyle, overflowY:'scroll', minHeight:'580px', marginBottom:'20px'}}>
                                    {
                                        <Row type="flex" align="top" justify="space-between" style={{padding: '20px 20px 0px 20px'}}>
                                            <Col span={10} style={{margin:'auto 0'}}>
                                                <h3 style={metricsLabelStyle}>Portfolio Name</h3>
                                                <FormItem>
                                                    {getFieldDecorator('name', {
                                                        rules: [{required: true, message: 'Please enter Portfolio Name'}]
                                                    })(
                                                        <Input 
                                                                disabled={this.props.portfolioId ? true : false} 
                                                                style={{padding:'10px'}} 
                                                                placeholder="Portfolio Name" 
                                                        />
                                                    )}
                                                </FormItem>
                                            </Col>
                                            <Col span={6} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                                {this.renderSelectBenchmark(this.props.portfolioId ? true : false)}
                                            </Col>
                                        </Row>
                                    }
                                    {
                                        !this.props.portfolioId &&
                                        <Row style={{marginLeft: '20px', marginBottom: '20px'}}>
                                            <Col span={24}>
                                                <Checkbox onChange={this.handleDefaultChange}>Make Default Portfolio</Checkbox>
                                            </Col>
                                        </Row>
                                    }
                                    <Row style={{marginTop: '5px'}}>
                                        <Col span={24}>
                                            <Tabs defaultActiveKey="2" animated={false} style={{paddingBottom: '20px'}}>
                                                <TabPane tab="Stock Transaction" key="1" style={{minHeight: '300px'}}>
                                                    {this.renderStockTransactions()}
                                                </TabPane> 
                                                <TabPane tab="Advice Transaction" key="2" style={{minHeight: '300px'}}>
                                                    {this.renderAdviceTransactions()}
                                                </TabPane> 
                                                <TabPane tab="Cash Transaction" key="3" style={{minHeight: '300px'}}>
                                                    {this.renderCashTransactions()}
                                                </TabPane> 
                                            </Tabs>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xl={6} lg={6} md={0} sm={0} xs={0} >
                                    <Row type="flex">
                                        <Col span={24}>
                                            <Button 
                                                    type="primary" 
                                                    onClick={this.handleSubmit} 
                                                    style={buttonStyle}
                                                    loading={this.state.submitButtonLoading}
                                                    disabled={!this.checkPreviewButtonDisabled()}
                                                    className='action-button'
                                            >
                                                SAVE
                                            </Button>
                                        </Col>
                                        <Col span={24} style={{marginTop: 10}}>
                                            <Button 
                                                    onClick={this.togglePreviewModal} 
                                                    style={buttonStyle}
                                                    disabled={!this.checkPreviewButtonDisabled()}
                                                    className='action-button'
                                            >
                                                Preview
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