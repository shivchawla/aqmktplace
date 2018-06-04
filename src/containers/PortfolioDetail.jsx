import * as React from 'react';
import * as Radium from 'radium';
import _ from 'lodash';
import Loading from 'react-loading-bar';
import moment from 'moment';
import axios from 'axios';
import {withRouter} from 'react-router';
import {Row, Col, Divider, Tabs, Radio, Card, Table, Button, Collapse, Icon, Tooltip, Tag, message} from 'antd';
import {ForbiddenAccess, StockResearchModal, WatchList, Footer} from '../components';
import {PortfolioDetailMeta} from '../metas';
import {CreatePortfolioDialog} from '../containers';
import {MyChartNew} from './MyChartNew';
import {loadingColor, pageTitleStyle, metricColor, cashStyle, benchmarkColor, buttonStyle, primaryColor} from '../constants';
import {benchmarks as benchmarkArray} from '../constants/benchmarks';
import {PortfolioDetailCrumb} from '../constants/breadcrumbs';
import '../css/portfolioDetail.css';
import {convertToPercentage, generateColorData, Utils, getBreadCrumbArray, addToAdvice, addToMyPortfolio, fetchAjax, getStockPerformance} from '../utils';
import {
    AqPortfolioCompositionAdvice,
    AqHighChartMod,
    MetricItem,
    AqCard,
    HighChartNew,
    HighChartBar,
    AqStockPortfolioTable,
    AdviceMetricsItems
} from '../components';
import {
    newLayoutStyle,
    shadowBoxStyle,
    metricsHeaderStyle,
    pageHeaderStyle,
    metricsLabelStyle,
    metricsValueStyle,
    dividerStyle
} from '../constants';
import { AqPageHeader } from '../components/AqPageHeader';

const dateFormat = 'YYYY-MM-DD';
const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;
const {requestUrl} = require('../localConfig.js');
const annualReturnLabel = 'Annual Return';
const volatilityLabel = 'Volatility';
const totalReturnLabel = 'Total Return';
const dailyChangeLabel = 'Daily PnL';
const dailyNAVChangePctLabel = 'Dly NAV Chg (%)';
const netValueLabel = 'Net Value';
const unrealizedPnlLabel = 'Unrealized PnL';

class PortfolioDetailImpl extends React.Component {
    socketOpenConnectionTimeout = 1000;
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            presentAdvices: [],
            toggleValue: 'advice',
            togglePerformance: 'dollar',
            stockPositions: [],
            realtimeSecurities: [],
            portfolioMetrics: [],
            tickers: [],
            performanceDollarSeries: [],
            performancepercentageSeries: [],
            pieSeries: [],
            activeKey:['.$2'],
            show: false,
            notAuthorized: false,
            cash: -10,
            stockResearchModalVisible: false,
            stockResearchModalTicker: 'TCS',
            hasChangedCount: 0,
            isDefault: false,
            makeDefaultLoading: false
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

    renderMetrics = () => {
        return <AdviceMetricsItems metrics={this.state.portfolioMetrics} />
    }

    renderAdvicePortfolio = () => {
        return (
            <Row>
                <PortfolioDetailMeta />
                <Col span={24} style={{marginTop: '5px'}}>
                    {
                        this.state.presentAdvices.length > 0
                        ? <AqPortfolioCompositionAdvice
                                preview
                                advices={this.state.presentAdvices}
                                toggleStockResearchModal={this.updateTicker}
                                hideTransactionalDetails={true}
                          />
                        : <h5>Please add advices to your portfolio</h5>
                    }
                </Col>
            </Row>
        );
    }

    renderStockPortfolio = () => {
        return (
            <AqStockPortfolioTable
                style={{marginTop: '5px'}}
                portfolio={{positions: this.state.stockPositions, cash:this.state.cash}}
                updateTicker={this.updateTicker}
            />
        );
    }

    // subpositions, advicePerformance
    processPresentAdvicePortfolio = (subPositions, advicePerformance) => {
        let advices = [];
        let hasChangedCount = 0;
        subPositions.map((position, positionIndex) => {
            advices = position.advice === null // check whether the sub position belongs to any advice
                            ? addToMyPortfolio(advices, advicePerformance, position, positionIndex)
                            : addToAdvice(advices, advicePerformance, position, positionIndex);
        });
        advices.map(advice => {
            if (advice.hasChanged) {
                hasChangedCount += 1;
            }
        })
        this.setState({hasChangedCount});

        return advices;
    }

    calculateNetAssetValue = (advice) => {
        let netAssetValue = 0;
        advice.portfolio.detail.positions.map(position => {
            netAssetValue += position.lastPrice * position.quantity;
        });

        return netAssetValue;
    }

    toggleView = (e) => {
        this.setState({toggleValue: e.target.value});
    }

    handlePerformanceToggle = (e) => {
        const performanceSeries = e.target.value === 'dollar'
                ? this.state.performanceDollarSeries
                : this.state.performancepercentageSeries;
        this.setState({
            togglePerformance: e.target.value,
            performanceConfig: {
                ...this.state.performanceConfig,
                series: performanceSeries
            }
        });
    }

    updateAdvices = advices => {
        const totalWeight = this.getTotalAdviceWeight(advices);
        const adviceNetValue = this.getNetValue(advices);
        return advices.map(advice => {
            return {
                ...advice,
                weight: `${((advice.netAssetValue / totalWeight) * 100).toFixed(2)} %`,
            }
        })
    }

    getNetValue = advices => {
        let netValue = 0;
        advices.map(item => {
            netValue += this.getNetValueForAdvice(item);
        });

        return netValue;
    }

    getNetValueForAdvice = advice => {
        let netValue = 0;
        advice.composition.map(item => {
            netValue += item.costBasic * item.shares
        });

        return netValue;
    }

    getTotalAdviceWeight = advices => {
        let totalWeight = 0;
        advices.map(item => {
            totalWeight += item.netAssetValue;
        });

        return totalWeight;
    }

    updateTicker = record => {
        this.setState({stockResearchModalTicker: record}, () => {
            this.toggleModal();
        });
    }

    toggleModal = ticker => {
        this.setState({stockResearchModalVisible: !this.state.stockResearchModalVisible});
    }

    getPortfolioDetail = () => new Promise((resolve, reject) => {
        const url = `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio/${this.props.match.params.id}`;
        const series = [];
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => { // Getting details of portfolio
            const benchmark = _.get(response.data, 'benchmark.ticker', 'NIFTY_50');
            const benchmarkRequestType = _.indexOf(benchmarkArray, benchmark) === -1 ? 'detail' : 'detail_benchmark';
            const pnlStats = _.get(response.data, 'pnlStats', {});
            const advicePerformance = _.get(response.data, 'advicePerformance', []);
            const subPositions = _.get(response.data, 'detail.subPositions', []);
            const advices = this.processPresentAdvicePortfolio(subPositions, advicePerformance);
            const positions = _.get(response.data, 'detail.positions', []).map(item => item.security.ticker);
            const colorData = generateColorData(positions);
            const portfolioComposition = _.get(response.data, 'detail.positions')
                        .map((item, index) => {
                    return {
                        name: _.get(item, 'security.ticker', 'Invalid'), 
                        y: Math.round(item.weightInPortfolio * 10000) / 100, 
                        color: colorData[item.security.ticker],
                    };
                });
            series.push({name: 'Composition', data: portfolioComposition});

            this.setState({
                name: response.data.name,
                isDefault: _.get(response.data, 'isDefaultPortfolio', false),
                presentAdvices: advices,
                stockPositions: _.get(response.data, 'detail.positions', []),
                realtimeSecurities: this.processPositionToWatchlistData(_.get(response.data, 'detail.positions', [])),
                cash: _.get(response.data, 'detail.cash', 0),
                pieSeries: series,
            });
            resolve({pnlStats, benchmark, positions, benchmarkRequestType});
        })
        .catch(error => reject(error))
    })

    componentWillMount() {
        this.mounted = true;
        let benchmark = '';
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            const series = [];
            let positions = [];
            const tickers = [...this.state.tickers];
            const performanceUrl = `${requestUrl}/performance/investor/${Utils.getUserInfo().investor}/${this.props.match.params.id}`;
            this.setState({show: true});
            let pnlStats;
            this.getPortfolioDetail()
            .then(portfolioData => {
                this.setUpSocketConnection();
                benchmark = portfolioData.benchmark;
                positions = portfolioData.positions;
                pnlStats = portfolioData.pnlStats;

                return Promise.all([
                    fetchAjax(performanceUrl, this.props.history, this.props.match.url),
                    getStockPerformance(benchmark, portfolioData.benchmarkRequestType)
                ]);
            })
            .then(([response, benchmarkResponse]) => { // Getting Portfolio Performance
                const colorData = generateColorData(positions);
                let simulatedPerformanceSeries = [];
                let truePerformanceSeries = [];
                if (response.data.simulated) {
                    simulatedPerformanceSeries = _.get(response.data, 'simulated.portfolioValues', []).map((item, index) => {
                        return [moment(item.date, dateFormat).valueOf(), item.netValue];
                    });
                }
                if (response.data.current){
                    truePerformanceSeries = _.get(response.data, 'current.portfolioValues', []).map((item, index) => {
                        return [moment(item.date, dateFormat).valueOf(), item.netValue];
                    });
                }
                tickers.push({ // Pushing advice performance to performance graph
                    name: 'PORTFOLIO (True)',
                    data: truePerformanceSeries,
                    noLoadData: true,
                    color: '#0082c8', //'#e6194b','#3cb44b''
                });
                tickers.push({ // Pushing advice performance to performance graph
                    name: 'PORTFOLIO (Simulated)',
                    data: simulatedPerformanceSeries,
                    noLoadData: true,
                    color: '#3cb44b',
                });
                tickers.push({ // // Pushing benchmark performance to performance graph
                    name: benchmark,
                    data: benchmarkResponse,
                    noLoadData: true,
                    color: benchmarkColor
                });
                const portfolioMetrics = Object.assign(_.get(response.data, 'summary.current', {}), pnlStats);
                const constituentDollarPerformance = _.get(
                            response.data, 'current.metrics.constituentPerformance', []).map((item, index) => {
                    return {name: item.ticker, data: [Number(item.pnl.toFixed(2))], color: colorData[item.ticker]}
                });
                const constituentPercentagePerformance = _.get(response.data, 'current.metrics.constituentPerformance')
                        .map((item, index) => {
                    return {name: item.ticker, data: [Number(item.pnl_pct.toFixed(2))], color: colorData[item.ticker]}
                });
                // const portfolioComposition = _.get(response.data, 'current.metrics.portfolioMetrics.composition')
                //         .map((item, index) => {
                //     return {
                //         name: item.ticker, 
                //         y: Math.round(item.weight * 10000) / 100, 
                //         color: colorData[item.ticker],
                //     };
                // });

                // series.push({name: 'Composition', data: portfolioComposition});

                var annualReturn = _.get(portfolioMetrics, 'annualReturn', null);
                var totalReturn = _.get(portfolioMetrics, 'totalReturn', null);

                //const realtimeNAV = _.get(portfolioMetrics, 'netValue', 0.0);
                //const eodNAV = _.get(portfolioMetrics, 'netValueEOD', 0.0);
                //const rtNAVChangePct = eodNAV > 0.0 ? (realtimeNAV - eodNAV)/eodNAV : 0.0;

                //Update return for recent NAV change
                //annualReturn = Math.pow((1 + (annualReturn ? annualReturn : 0.0)), (251/252))*(1+rtNAVChangePct) - 1.0;
                //totalReturn = (1 + (totalReturn ? totalReturn : 0.0))*(1+rtNAVChangePct) - 1.0;
                
                const volatility = _.get(portfolioMetrics, 'volatility', null);
                const dailyNAVChangePct = 0.0;//Number(((rtNAVChangePct || _.get(portfolioMetrics, 'dailyNAVChangeEODPct', 0.0))*100).toFixed(2));
                const totalPnl = _.get(portfolioMetrics, 'totalPnl', null);
                const netValue = _.get(portfolioMetrics, 'netValue', null);

                const metrics = [
                    {value: annualReturn, label: annualReturnLabel, fixed: 2, percentage: true, tooltipText: 'Compounded annual growth rate since inception'},
                    {value: volatility, label: volatilityLabel, fixed: 2, percentage: true, tooltipText: 'Annualized standard deviation of daily returns since inception'},
                    {value: totalReturn, label: 'Total Return', fixed: 2, percentage: true, color: true, tooltipText: 'Total return since inception'},
                    //{value: dailyNAVChangePct, label: dailyNAVChangePctLabel, fixed: 2, percentage: true, color: true, direction:true},
                    {value: totalPnl, label: unrealizedPnlLabel, fixed: 2, money:true, color: true, direction:true, tooltipText: 'Unrealized Profit/Loss'},
                    {value: netValue, label: netValueLabel, isNetValue: true, money:true, dailyChangePct: dailyNAVChangePct, fixed: Math.round(netValue) == netValue ? 0 : 2, tooltipText: 'Net Value of the Portfolio'}
                ];
                this.setState({
                    portfolioMetrics: metrics,
                    tickers,
                    performanceDollarSeries: constituentDollarPerformance,
                    performancepercentageSeries: constituentPercentagePerformance,
                    // pieSeries: series,
                });
            })
            .catch(error => {
                return error;
            })
            .finally(() => {
                this.setState({show: false});
            });
        }
    }

    handleWatchListClick = name => {
        this.updateTicker({symbol: name, name});
    }

    componentWillUnmount() {
        this.mounted = false;
        this.unSubscribeToPortfolio(this.props.match.params.id);
        this.state.realtimeSecurities.map(item => {
            this.unSubscribeToStock(item.name);
        });
    }


   setUpSocketConnection = () => {
        if (Utils.webSocket && Utils.webSocket.readyState == WebSocket.OPEN) {
            Utils.webSocket.onopen = () => {
                Utils.webSocket.onmessage = this.processRealtimeMessage;
                this.takePortfolioAction();
            }

            Utils.webSocket.onclose = () => {
                this.setUpSocketConnection();
            }
       
            Utils.webSocket.onmessage = this.processRealtimeMessage;
            this.takePortfolioAction();
        } else {
            setTimeout(function() {
                this.setUpSocketConnection()
            }.bind(this), 5000);
        }
    }
    takePortfolioAction = () => {
        if (this.mounted) {
            this.subscribeToPortfolio(this.props.match.params.id);
            this.state.realtimeSecurities.map(item => {
                this.subscribeToStock(item.name);
            });
        } else {
            this.unSubscribeToPortfolio(this.props.match.params.id);
            this.state.realtimeSecurities.map(item => {
                this.unSubscribeToStock(item.name);
            });
        }
    }

    subscribeToPortfolio = portfolioId => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'portfolio',
            'portfolioId': portfolioId,
            'detail': true
        };
        Utils.sendWSMessage(msg);
         
    }

    unSubscribeToPortfolio = portfolioId => {
        // console.log('UnSubscription');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'portfolio',
            'portfolioId': portfolioId,
        };
        Utils.sendWSMessage(msg);
    }

    subscribeToStock = ticker => {
        // console.log('Subscription Started for stock ' + ticker);
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    unSubscribeToStock = ticker => {
        // console.log('Unsubscription Started');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    processRealtimeMessage = msg => {
        if (this.mounted) {
            try {
                const realtimeData = JSON.parse(msg.data);
                if (realtimeData.type === 'portfolio') {
                    const subPositions = _.get(realtimeData, 'output.detail.subPositions', []);
                    let positions = _.get(realtimeData, 'output.detail.positions', []); // realtime positions
                    const staticPositions = this.state.stockPositions; // old positions from state
                    const netValue = _.get(realtimeData, 'output.summary.netValue', 0);
                    const dailyNAVChangePct = (_.get(realtimeData, 'output.summary.dailyNavChangePct', 0) * 100).toFixed(2);
                    const totalPnl = _.get(realtimeData, 'output.summary.totalPnl', 0);
                    var portfolioMetrics = this.state.portfolioMetrics;
                    const metrics = [
                        {value: netValue, label: netValueLabel, isNetValue: true, money:true, dailyChangePct: dailyNAVChangePct, fixed: Math.round(netValue) == netValue ? 0 : 2},
                        {value: totalPnl, label: unrealizedPnlLabel, money:true, fixed: 2, color:true, direction:true},
                    ];

                    metrics.map(item => {
                        var idx = portfolioMetrics.map(item => item.label).indexOf(item.label);
                        if (idx != -1) {
                            portfolioMetrics[idx] = item;
                        }
                    });
                    positions = positions.map(item => {
                        const targetPosition = staticPositions.filter(
                                positionItem => positionItem.security.ticker === item.security.ticker)[0];
                        item.avgPrice === 0 ? (targetPosition ? targetPosition.avgPrice : 0) : item.avgPrice;
                        item.lastPrice === 0 ? (targetPosition ? targetPosition.lastPrice : 0) : item.lastPrice;
                        return item;
                    });
                    this.setState({
                        portfolioMetrics,
                        stockPositions: positions
                    });
                } else if(realtimeData.type === 'stock') {
                    const realtimeSecurities = [...this.state.realtimeSecurities];
                    const targetSecurity = realtimeSecurities.filter(item => item.name === realtimeData.ticker)[0];
                    if (targetSecurity) {
                        targetSecurity.change = (realtimeData.output.changePct * 100).toFixed(2);
                        targetSecurity.y = realtimeData.output.current < 1 ? realtimeData.output.close : realtimeData.output.current;
                        this.setState({realtimeSecurities});
                    }
                }
            } catch(error) {return error;}
        }
    }

    processPositionToWatchlistData = (positions) => {
        return positions.map(item => {
            return {
                name: item.security.ticker,
                y: item.lastPrice,
                change: '-',
                hideCheckbox: true,
                disabled: true
            };
        });
    }

    makeDefaultPortfolio = () => {
        const {investor} = Utils.getUserInfo();
        const portfolioId = this.props.match.params.id;
        const url = `${requestUrl}/investor/${investor}/portfolio/${portfolioId}/defaultPortfolio`;
        this.setState({makeDefaultLoading: true});
        axios({
            url,
            method: 'POST',
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            this.getPortfolioDetail();
        })
        .catch(error => {
            message.error('Error Occured');
        })
        .finally(() => {
            this.setState({makeDefaultLoading: false});
        })
    }

    renderPageContent = () => {
        const breadCrumbs = getBreadCrumbArray(PortfolioDetailCrumb, [{
            name: this.state.name,
        }]);
        const tooltipText = this.state.hasChangedCount 
                ? "Advice in your portfolio are not up to date. You need to update your portfolio."
                : "Advice in portfolio are up to date. You can still add new transactions"
        return (
            this.state.notAuthorized
            ?   <ForbiddenAccess />
            :   <React.Fragment>
                    <Row className='aq-page-container' style={{marginBottom: '20px'}}>
                        <StockResearchModal
                                ticker={this.state.stockResearchModalTicker}
                                visible={this.state.stockResearchModalVisible}
                                toggleModal={this.toggleModal}
                        />
                        <AqPageHeader 
                                title={this.state.name} 
                                breadCrumbs={breadCrumbs} 
                        >
                            <Col xl={0} lg={0} md={24} style={{textAlign: 'right'}}>
                                <Button
                                        type="primary"
                                        onClick={() => {this.props.history.push('/investordashboard/createportfolio')}}
                                >
                                    Create Portfolio
                                </Button>
                            </Col>
                        </AqPageHeader>

                        <Col xl={18} lg={18} md={24} style={{...shadowBoxStyle, padding: '0'}}>
                            <Row style={{padding: '20px 30px'}}>
                                <Col span={24}>
                                    <Row type="flex" justify="space-between" gutter={8}>
                                        <Col span={18} 
                                            style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                            <h2 style={{...pageHeaderStyle, marginBottom: 0}}>{this.state.name}</h2>
                                            {
                                                this.state.isDefault &&
                                                <Tag 
                                                        style={{
                                                            marginLeft: '10px', 
                                                            marginTop: '2px',
                                                            color: primaryColor,
                                                            border: `1px solid ${primaryColor}`,
                                                            fontSize: '10px',
                                                            cursor: 'auto'
                                                        }}
                                                >
                                                    Default Portfolio
                                                </Tag>
                                            }
                                        </Col>
                                        <Col span={6} style={{textAlign: 'right'}}>
                                            <Tooltip title={tooltipText}>
                                                <Button
                                                        onClick={() => this.props.history.push(
                                                            `/investordashboard/portfolio/transactions/${this.props.match.params.id}`,
                                                            {
                                                                pageTitle: 'Add Transactions',
                                                                advices: this.state.presentAdvices,
                                                                stocksPositions: this.state.stockPositions
                                                            }
                                                        )}
                                                        style = {{marginLeft: '20px'}}
                                                >
                                                    Update Portfolio
                                                    {
                                                        this.state.hasChangedCount > 0 &&
                                                        <Icon
                                                                type="exclamation-circle"
                                                                style={{fontSize: '18px', color: metricColor.neutral}}
                                                        />
                                                    }
                                                </Button>
                                            </Tooltip>
                                        </Col>
                                    </Row>
                                </Col>
                                {
                                    !this.state.isDefault &&
                                    <Col span={24}>
                                        <Button
                                                style={{
                                                    fontSize: '12px', 
                                                    height: '25px', 
                                                }}
                                                onClick={this.makeDefaultPortfolio}
                                                loading={this.state.makeDefaultLoading}
                                        >
                                            Make Default Portfolio
                                        </Button>
                                    </Col>
                                }
                                <Col span={24} style={{marginTop: '10px'}}>
                                    <Row>
                                        {this.renderMetrics()}
                                    </Row>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24} style={dividerStyle}></Col>
                            </Row>
                            <Collapse bordered={false} defaultActiveKey={["1", "2"]}>
                                <Panel
                                        key='1'
                                        style={customPanelStyle}
                                        header={<h3 style={metricsHeaderStyle}>Summary</h3>}
                                        forceRender={true}
                                >
                                    <Row gutter={20} style={{padding: '0 30px 20px 30px'}} className="row-container">
                                        <Col span={12}>
                                            <AqCard title="Portfolio Summary">
                                                <HighChartNew series={this.state.pieSeries} />
                                            </AqCard>
                                        </Col>
                                        <Col span={12}>
                                            <AqCard title="Performance Summary">
                                                <HighChartBar
                                                        dollarSeries={this.state.performanceDollarSeries}
                                                        percentageSeries={this.state.performancepercentageSeries}
                                                        legendEnabled={false}
                                                />
                                            </AqCard>
                                        </Col>
                                    </Row>
                                </Panel>
                                <Panel
                                        key='2'
                                        style={customPanelStyle}
                                        header={<h3 style={metricsHeaderStyle}>Performance</h3>}
                                >
                                    <Row style={{padding: '0 30px'}}>
                                        <Col span={24}>
                                            <MyChartNew series={this.state.tickers}/>
                                        </Col>
                                    </Row>

                                </Panel>
                                <Panel
                                        key='3'
                                        style={customPanelStyle}
                                        header={<h3 style={metricsHeaderStyle}>Portfolio</h3>}
                                >
                                    <Row style={{padding: '0 30px'}}>
                                        <Col span={24}>
                                            <Row type="flex" justify="space-between">
                                            <Col span={6}><span style={cashStyle}>Cash: {Utils.formatMoneyValueMaxTwoDecimals(this.state.cash)}</span></Col>
                                                <Col span={6} style={{textAlign: 'right'}}>
                                                    <Radio.Group
                                                            value={this.state.toggleValue}
                                                            onChange={this.toggleView}
                                                            style={{margin: '0 auto 0 auto'}}
                                                            //position: 'absolute', right: 0}}
                                                            size="small"
                                                    >
                                                        <Radio.Button value="advice">Advice</Radio.Button>
                                                        <Radio.Button value="stock">Stock</Radio.Button>
                                                    </Radio.Group>
                                                </Col>
                                            </Row>
                                            {
                                                //this should be called portfolio and not transactions
                                                this.state.toggleValue === 'advice'
                                                ? this.renderAdvicePortfolio()
                                                : this.renderStockPortfolio()
                                            }
                                        </Col>
                                    </Row>
                                </Panel>
                            </Collapse>
                        </Col>
                        <Col xl={6} lg={6} md={0} sm={0} xs={0} style={{minHeight:'200px', maxHeight: '500px'}}>
                            <Row>
                                <Button 
                                        className="action-button" 
                                        type="primary"
                                        style={{...buttonStyle, width: '95%', marginLeft: '16px'}}
                                        onClick={() => {this.props.history.push('/investordashboard/createportfolio')}}
                                >
                                    Create Portfolio
                                </Button>
                                <div 
                                        style={{
                                            ...shadowBoxStyle, 
                                            padding: '0px 10px', 
                                            width: '95%', 
                                            marginLeft:'auto', 
                                            minHeight:'200px', 
                                            maxHeight: '500px'
                                        }}
                                >
                                    <Col 
                                            span={24} 
                                            style={{
                                                display: 'flex', 
                                                flexDirection: 'row', 
                                                justifyContent: 'space-between', 
                                                padding: '10px 0px',
                                                borderBottom: '1px solid #E6E6E6'
                                            }}
                                    >
                                        <h3 style={{fontSize: '16px'}}>Present Stocks</h3>
                                    </Col>
                                    <Col span={24}>
                                        <WatchList 
                                            tickers={this.state.realtimeSecurities}
                                            preview={true}
                                            onClick={this.handleWatchListClick}
                                        />
                                    </Col>
                                </div>
                            </Row>
                        </Col>
                    </Row>
                    <Footer />
                </React.Fragment>
        );
    }

    render () {
        return (
            <React.Fragment>
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
            </React.Fragment>
        );
    }
}

export default withRouter(PortfolioDetailImpl);

const metricItemStyle = {
    padding: '10px'
}

const customPanelStyle = {
    background: 'transparent',
    borderRadius: 0,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
};
