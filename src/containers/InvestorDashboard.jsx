import * as React from 'react';
import axios from 'axios';
import Loading from 'react-loading-bar';
import _ from 'lodash';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Link} from 'react-router-dom';
import {Row, Col, Tabs, Select, Table, Button, Divider, Rate, Tag, Radio, Spin, message} from 'antd';
import {AqHighChartMod, MetricItem, PortfolioListItem, AdviceListItem, ListMetricItem, HighChartNew, HighChartBar, AqCard, DashboardCard, AqPageHeader, AqPortfolioSummary, ForbiddenAccess, AqRate, Footer, AqStockPortfolioTable, StockResearchModal} from '../components';
import {pageTitleStyle, layoutStyle, pageHeaderStyle, metricsHeaderStyle, newLayoutStyle, listMetricItemLabelStyle, listMetricItemValueStyle, nameEllipsisStyle, tabBackgroundColor, benchmarkColor, metricColor, loadingColor} from '../constants';
import {MyChartNew} from './MyChartNew';
import {InvestorDashboardMeta} from '../metas';
import {generateColorData, getMetricColor, Utils, getBreadCrumbArray, fetchAjax, getStockPerformance} from '../utils';
import {benchmarks as benchmarkArray} from '../constants/benchmarks';
import 'react-loading-bar/dist/index.css'

const {requestUrl, aimsquantToken} = require('../localConfig');
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';

class InvestorDashboard extends React.Component {
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;
    constructor(props) {
        super(props);
        this.state = {
            tickers: [],
            investorPortfolios: [],
            subscribedAdvices: [],
            portfolioSortIndex: 'beta',
            adviceSortIndex: 'rating',
            presentAdvices: [],
            stockPositions: [],
            compositionToggle: 'advice',
            metrics: {
                beta: -1,
                sharperatio: -1,
                annualreturn: -1,
                averagedailyreturn: -1,
                dailyreturn: -1,
                totalreturn: -1,
                netValue: -1,
                dailyNavChangePct: 0,
                totalPnl: 0,
            },
            sectorSeries: [],
            industySeries: [],
            positions: [],
            composition: [],
            defaultComposition: [],
            dollarPerformance: [],
            percentagePerformance: [],
            portfolioLoading: false,
            subscribedAdvicesLoading: false,
            defaultPortfolioLoading: false,
            showEmptyScreen: {
                status: false,
                error: 'no_error',
                messageText: '',
                errorCode: ''
            },
            showAdvisorDashboardToggle: false,
            defaultPortfolioName: 'Default Portfolio',
            defaultPortfolioId: '',
            notAuthorized: false,
            topLoader: false,
            rawDefaultPortfolioPositions: [],
            stockResearchModalTicker: 'TCS',
            stockResearchModalVisible: false,
            portfolioPerformanceLoading: false,
            portfolioDetailLoading: false,
            selectedCompositionRadio: 'stocks',
            performanceSelectedPortfolio: { // Used to get the value of Select when performance summary is selected
                name: '',
                id: ''
            },
            portfolioSelectedPortfolio: { // Used to get the value of Select when portfolio summary is selected
                name: '',
                id: ''
            }
        };
        this.adviceColumns = [
            {
                title: this.renderColumnHeader('NAME'),
                dataIndex: 'name',
                key: 'name',
                fixed: true,
                width: 320,
                render: (text, record) => {
                    return  <h3 
                                onClick={() => this.props.history.push(`/advice/${record.id}`)} 
                                style={{...nameEllipsisStyle, width: '280px'}}
                            >
                                {text}
                            </h3>
                }
            },
            {
                title: this.renderColumnHeader('NET VALUE'),
                dataIndex: 'netValue',
                key: 'netValue',
                fixed: true,
                width: 280,
                render: (text, record) => {
                    let color = record.return < 0 ? '#ED4D4D' : '#3DC66B';

                    return (
                        <h3 style={{fontSize: '16px', style: '160px'}}>
                            {Utils.formatMoneyValueMaxTwoDecimals(Number(text))}
                            <span style={{fontSize: '12px', color, fontWeight: 700, marginLeft: '5px'}}>
                                {`${record.return} %`}
                            </span>
                        </h3>
                    )
                }
            },
            {
                title: this.renderColumnHeader('RATING'),
                dataIndex: 'rating',
                key: 'rating',
                render: text => <AqRate style={{fontSize: '13px'}} value={Number(text) / 2}/>
            },
            {
                title: '',
                dataIndex: 'isSubscribed',
                key: 'isSubscribed',
                render: (isSubscribed, record) => {
                    const tagContent = 
                            isSubscribed 
                            ? {text: 'Subscribed', color: '#108ee9'} 
                            : record.isFollowing ? {text: 'WishListed', color: '#1DE9B6'} : {text: 'Not Wishlisted', color: 'transparent'};;
                    return <Tag color={tagContent.color} style={{textAlign: 'center', fontSize: '10px', cursor: 'auto'}}>{tagContent.text}</Tag>
                }
            }
        ]
    }

    renderColumnHeader = name => <h3 style={{fontSize: '12px', color: '#353535', fontWeight: '700'}}>{name}</h3>

    getPortfolioPerformance = portfolioId => new Promise((resolve, reject) => {
        const performanceUrl = `${requestUrl}/performance/investor/${Utils.getUserInfo().investor}/${portfolioId}`;
        const portfolioUrl = `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio/${portfolioId}`;
        const tickers = [...this.state.tickers];
        this.setState({portfolioPerformanceLoading: true});
        Promise.all([
            fetchAjax(performanceUrl, this.props.history, this.props.match.url),
            fetchAjax(portfolioUrl, this.props.history, this.props.match.url),
        ])
        .then(([performanceResponse, portfolioResponse]) => {
            const currentPortfolioValues = _.get(performanceResponse.data, 'current.portfolioValues', []);
            const simulatedPortfolioValues = _.get(performanceResponse.data, 'simulated.portfolioValues', []);

            const currentMetrics = _.get(performanceResponse.data, 'current.metrics.portfolioPerformance.true', {});
            const simulatedMetrics = _.get(performanceResponse.data, 'simulated.metrics.portfolioPerformance.true', {});

            const currentSummary = _.get(performanceResponse.data, 'summary.current', {});
            const simulatedSummary = _.get(performanceResponse.data, 'summary.simulated', {});

            const currentPerformance = currentPortfolioValues.map(item => 
                    [moment(item.date, dateFormat).valueOf(), item.netValue]);
            const simulatedPerformance = simulatedPortfolioValues.map(item => 
                    [moment(item.date, dateFormat).valueOf(), item.netValue]);
            
            const portfolioSimulatedTicker = tickers.filter(ticker => ticker.name === 'Portfolio - Simulated')[0];
            const portfolioCurrentTicker = tickers.filter(ticker => ticker.name === 'Portfolio - Current')[0];
            if (portfolioSimulatedTicker && portfolioCurrentTicker) {
                portfolioSimulatedTicker.data = simulatedPerformance;
                portfolioCurrentTicker.data = currentPerformance;
                this.setState({
                    tickers,
                    metrics: {
                        beta: _.get(currentPerformance, 'ratios.beta', 0),
                        sharperatio: _.get(currentPerformance, 'ratios.sharperatio', 0),
                        annualreturn: _.get(currentPerformance, 'returns.annualreturn', 0),
                        averagedailyreturn: _.get(currentPerformance, 'returns.averagedailyreturn', 0),
                        dailyreturn: _.get(currentPerformance, 'returns.dailyreturn', 0),
                        totalreturn: _.get(currentMetrics, 'returns.totalreturn', 0),
                        volatility: _.get(currentSummary, 'volatility', 0),
                        netValue: _.get(portfolioResponse.data, 'pnlStats.netValue', 0),
                        dailyNavChangePct: _.get(currentSummary, 'dailyNAVChangeEODPct', 0),
                        totalPnl: _.get(portfolioResponse.data, 'pnlStats.totalPnlPct'),
                        concentration: _.get(currentPerformance, 'portfoliostats.concentration', 0)
                    }
                });
            } else {
                message.error('Error occured while loading performance');
                reject('Error')
            }
        })
        .catch(error => reject(error))
        .finally(() => {
            this.setState({portfolioPerformanceLoading: false});
        });
    })

    getPortfolioDetail = portfolioId => new Promise((resolve, reject) => {
        this.setState({portfolioDetailLoading: true});
        const portfolioUrl = `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio/${portfolioId}`;
        const performanceUrl = `${requestUrl}/performance/investor/${Utils.getUserInfo().investor}/${portfolioId}`;
        Promise.all([
            fetchAjax(portfolioUrl, this.props.history, this.props.match.url),
            fetchAjax(performanceUrl, this.props.history, this.props.match.url)
        ])
        .then(([portfolioResponse, performanceResponse]) => {
            const positions = _.get(portfolioResponse.data, 'detail.positions', []);
            const portfolioMetrics = _.get(performanceResponse.data, 'current.metrics.portfolioMetrics', {});
            const positionModdedForColors = positions.map(item => item.security.ticker); 
            const colorData = generateColorData(positionModdedForColors);
            const composition = this.processTransactionsForChart(portfolioMetrics.composition, colorData);
            console.log(composition);
            this.setState({
                composition,
                defaultComposition: composition,
                rawDefaultPortfolioPositions: positions,
                positions
            }, () => {
                resolve(true);
            });
        })
        .catch(error => reject(error))
        .finally(() => {
            this.setState({portfolioDetailLoading: false});
        });
    })

    getDefaultPortfolioData = () => {
        const url = `${requestUrl}/investor/${Utils.getUserInfo().investor}`;
        const tickers = [...this.state.tickers];
        this.setState({defaultPortfolioLoading: true});
        
        return Promise.all([
            fetchAjax(url, this.props.history, this.props.match.url),
            this.getInvestorPortfolios(),
            this.getInvestorSubscribedAdvices(),
        ])
        .then(([response]) => {
            const defaultPortfolio = _.get(response.data, 'defaultPortfolio', null);
            const defaultPerformance = _.get(response.data, 'defaultPerformance', null);
            if (defaultPortfolio === null) {
                this.setState({showEmptyScreen: {
                    errorCode: "empty_portfolio",
                    messageText: "You haven't created any portfolio yet. Please create one.",
                    status: true
                }});
                return;
            }
            const positions = _.get(defaultPortfolio, 'detail.positions', []);
            const positionModdedForColors = positions.map(item => item.security.ticker);
            const colorData = generateColorData(positionModdedForColors);
            const portfolioMetrics = _.get(defaultPerformance, 'current.metrics.portfolioMetrics', {});
            const composition = this.processTransactionsForChart(portfolioMetrics.composition, colorData);
            const performance = _.get(defaultPerformance, 'current.metrics.portfolioPerformance.true', {});
            const benchmark = _.get(defaultPortfolio, 'benchmark.ticker', 'NIFTY_50');
            const benchmarkRequestType = _.indexOf(benchmarkArray, benchmark) === -1 ? 'detail' : 'detail_benchmark';
            const simulatedPerformanceData = _.get(defaultPerformance, 'simulated.portfolioValues', []).map(item => {
                return [moment(item.date, dateFormat).valueOf(), item.netValue];
            });
            const currentPerformanceData = _.get(defaultPerformance, 'current.portfolioValues', []).map(item => {
                return [moment(item.date, dateFormat).valueOf(), item.netValue];
            })
            const pieChartTitle = composition[0].data.length > 1 && `${composition[0].data[0].name}<br>${composition[0].data[0].y}`;
            const summary = Object.assign(
                _.get(defaultPerformance, 'summary.current', {}),
                _.get(defaultPortfolio, 'pnlStats', {})
            );

            const netValue = summary.netValue || summary.netValueEOD;
            const netValueEOD = summary.netValueEOD;
            const dailyNavChangePct = (((netValueEOD > 0.0 ? (netValue - netValueEOD)/netValueEOD : 0) || summary.dailyNAVChangeEODPct)*100).toFixed(2);
            const totalPnl = summary.totalPnl;
            getStockPerformance(benchmark, benchmarkRequestType)
            .then(benchmarkResponse => {
                tickers.push({
                    name: 'Portfolio - Simulated',
                    data: simulatedPerformanceData,
                    show: true,
                    color: metricColor.neutral
                });
                tickers.push({
                    name: 'Portfolio - Current',
                    data: currentPerformanceData,
                    show: true,
                    color: metricColor.positive
                });
                tickers.push({
                    name: benchmark,
                    show: true,
                    color: benchmarkColor,
                    data: benchmarkResponse
                });
                this.setState({tickers, rawDefaultPortfolioPositions: positions});
            })
            const constituentPerformance = _.get(defaultPerformance, 'current.metrics.constituentPerformance', []);
            const dollarPerformance = constituentPerformance.map(item => {
                return {name: item.ticker, data: [Number(item.pnl.toFixed(2))], color: colorData[item.ticker]};
            });
            const percentagePerformance = constituentPerformance.map(item => {
                return {name: item.ticker, data: [Number(item.pnl_pct.toFixed(2))], color: colorData[item.ticker]};
            });
            this.setState({
                defaultPortfolioName: _.get(defaultPortfolio, 'name', ''),
                defaultPortfolioId: _.get(defaultPortfolio, '_id', ''),
                performanceSelectedPortfolio: {
                    name: _.get(defaultPortfolio, 'name', ''),
                    id: _.get(defaultPortfolio, '_id', '')
                },
                portfolioSelectedPortfolio: {
                    name: _.get(defaultPortfolio, 'name', ''),
                    id: _.get(defaultPortfolio, '_id', '')
                },
                positions,
                showEmptyScreen: {...this.state.showEmptyScreen, status: positions.length > 0 ? false : true},
                composition,
                defaultComposition: composition,
                stockPositions: this.processPresentStockTransction(positions),
                metrics: {
                    beta: _.get(performance, 'ratios.beta', 0),
                    sharperatio: _.get(performance, 'ratios.sharperatio', 0),
                    annualreturn: _.get(performance, 'returns.annualreturn', 0),
                    averagedailyreturn: _.get(performance, 'returns.averagedailyreturn', 0),
                    dailyreturn: _.get(performance, 'returns.dailyreturn', 0),
                    totalreturn: _.get(performance, 'returns.totalreturn', 0),
                    volatility: summary.volatility || 0,
                    netValue: summary.netValue || 0,
                    dailyNavChangePct: dailyNavChangePct,
                    totalPnl: totalPnl,
                    concentration: _.get(performance, 'portfoliostats.concentration', 0)
                },
                dollarPerformance,
                percentagePerformance,
            });
            return this.getInvestorPortfolios();
        })
        .catch(error => error)
        .finally(() => {
            this.setState({defaultPortfolioLoading: false});
        });
    }

    getInvestorPortfolios = () => new Promise((resolve, reject) => {
        const investorPortfolioUrl = `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio`;
        this.setState({portfolioLoading: true});
        fetchAjax(investorPortfolioUrl, this.props.history, this.props.match.url)
        .then(response => {
            const subscribedAdvicesUrl = `${requestUrl}/advice?subscribed=true`;
            this.setState({investorPortfolios: this.processPortfolios(response.data)}, () => {
                resolve(true);
            });
        })
        .catch(error => {
            reject(error);
        })
        .finally(() => {
            this.setState({portfolioLoading: false});
        });
    })
        
    getInvestorSubscribedAdvices = () => new Promise((resolve, reject) => {
        const subscribedAdvicesUrl = `${requestUrl}/advice?subscribed=true`;
        const followingAdviceUrl = `${requestUrl}/advice?following=true`;
        this.setState({subscribedAdvicesLoading: true});
        fetchAjax(subscribedAdvicesUrl, this.props.history, this.props.match.url)
        .then(response => {
            const advices = _.get(response.data, 'advices', []);
            this.setState({subscribedAdvices: this.processSubscribedAdvices(advices)});
            return fetchAjax(followingAdviceUrl, this.props.history, this.props.match.url)
        })
        .then(response => {
            const advices = [...this.state.subscribedAdvices];
            const followingAdvices = _.get(response.data, 'advices', []);
            followingAdvices.map((advice, index) => {
                const {name, performanceSummary} = advice;
                if(_.findIndex(advices, presentAdvice => presentAdvice.id === advice._id) === -1) {
                    advices.push({
                        id: advice._id,
                        key: Math.random().toString(36),
                        name: advice.name,
                        return: Number(_.get(performanceSummary, 'current.totalReturn', 0) * 100).toFixed(2),
                        netValue: _.get(advice, 'netValue', 0).toFixed(2),
                        rating: advice.rating.current,
                        isFollowing: advice.isFollowing,
                        isSubscribed: advice.isSubscribed
                    });
                }
            });
            this.setState({subscribedAdvices: advices}, () => {
                resolve(true);
            });
        })
        .catch(error => {
            reject(error);
        })
        .finally(() => {
            this.setState({subscribedAdvicesLoading: false});
        });
    })

    onMenuSelected = (type, value) => {
        const portfolios = [...this.state.investorPortfolios];
        const advices = [...this.state.subscribedAdvices];
        switch (type) {
            case 'portfolio':
                const sortedPortfolios = _.sortBy(portfolios, [object => object.performance[value]]);
                this.setState({investorPortfolios: sortedPortfolios});
                break;
            
            case 'advice':
                const sortedAdvices = _.sortBy(advices, [object => object.name]);
                this.setState({subscribedAdvices: sortedAdvices});
                break;

            default:
                break;
        }
    }

    renderPortfolioSortMenu = () => {
        const sortValues = [
            {label: 'Beta', value: 'beta'}, 
            {label: 'Max Loss', value: 'maxloss'}, 
            {label: 'Return', value: 'return'}, 
            {label: 'Sharpe', value: 'sharpe'}
        ];
        return (
            <Select 
                    defaultValue={sortValues[0].value} 
                    style={{width: 120}} 
                    onChange={(value) => this.onMenuSelected('portfolio', value)}
            >
                {
                    sortValues.map((item, index) => {
                        return <Option key={index} value={item.value}>{item.label}</Option>
                    })
                }
            </Select>
        );
    }

    renderAdvicesSortMenu = () => {
        const sortValues = [
            {label: 'Rating', value: 'rating'},
            {label: 'Subscribers', value: 'subscribers'},
            {label: 'Return', value: 'return'},
            {label: 'Max Loss', value: 'maxloss'},
        ];

        return (
            <Select 
                    defaultValue={sortValues[0].value} 
                    style={{width: 120}}
                    onChange={(value) => this.onMenuSelected('advice', value)}
            >
                {
                    sortValues.map((item, index) => {
                        return <Option key={index} value={item.value}>{item.label}</Option>
                    })
                }
            </Select>
        );
    }

    renderTabs = () => {
        return (
            <Tabs animated={false} defaultActiveKey="2" style={{height: '350px'}}>
                <TabPane tab="Portfolios" key="1">
                    <Row>
                        <Col span={24}>
                            {this.renderPortfolios()}
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Subscribed Advices" key="2">
                    <Row>
                        <Col>
                            {this.renderSubscribedAdvices()}
                        </Col>
                    </Row>
                </TabPane>
            </Tabs>
        );
    }

    renderPortfolios = () => {
        const portfolios = this.state.investorPortfolios;
        return portfolios.map((portfolio, index) => {
            const returnColor = portfolio.return < 0 ? metricColor.negative : metricColor.positive;
            const dailyNavChangePctColor = portfolio.dailyNavChangePct < 0 ? metricColor.negative : metricColor.positive;

            return (
                <Row 
                    key={index} 
                    style={{marginBottom: '10px', padding: '0 20px', cursor: 'pointer', marginTop: '10px'}} 
                    onClick={(e) => this.props.history.push(`/dashboard/portfolio/${portfolio.id}`)}>
                    <Col span={7}>
                        <ListMetricItem label="Name" value={portfolio.name} />
                    </Col>
                    <Col span={6}>
                        <ListMetricItem 
                            value={`${portfolio.return} %`} 
                            label="Total Return" 
                            valueColor={returnColor}
                        />
                    </Col>
                    <Col span={6}>
                        <ListMetricItem 
                            value={`${portfolio.dailyNavChangePct} %`} 
                            label="Daily Change" 
                            valueColor={dailyNavChangePctColor}
                        />
                    </Col>

                    <Col span={5}>
                        <ListMetricItem value={Utils.formatMoneyValueMaxTwoDecimals(portfolio.netValue)} label="Net Value" />
                    </Col>

                    <Col span={24} style={{backgroundColor: '#eaeaea', marginTop: '10px'}}>
                    </Col>
                </Row>
            );
        });
    }

    // Also used to subscribe to realtime updates of individual portfolios
    processPortfolios = (portfolios = []) => {
        return portfolios.map(portfolio => {
            // this.subscribeToPortfolio(portfolio._id);
            var dailyNAVChangeEODPct = _.get(portfolio, 'performance.dailyNAVChangeEODPct', 0);
            var netValue = _.get(portfolio, 'pnlStats.netValue', 0);
            var netValueEOD = _.get(portfolio, 'performance.netValueEOD', 0);
            var dailyNavChangePct = ((netValueEOD > 0 ? (netValue - netValueEOD)/netValue : dailyNAVChangeEODPct)*100).toFixed(2);
            return {
                id: portfolio._id,
                name: portfolio.name.length < 1 ? 'Undefined' : portfolio.name,
                netValue: netValue || netValueEOD,
                return: ((_.get(portfolio, 'performance.totalReturn', 0) || 0) * 100).toFixed(2),
                volatility: ((_.get(portfolio, 'performance.volatility', 0) || 0) * 100).toFixed(2),
                dailyNavChangePct: dailyNavChangePct,
                dailyChangeDollar: (_.get(portfolio, 'performance.dailyChange', 0) || 0).toFixed(2)
            }
        });
    }

    processSubscribedAdvices = advices => {
        return advices.map((advice, index) => {
            const {name, performanceSummary, isSubscribed, isFollowing} = advice;
            if (performanceSummary) {
                return {
                    id: advice._id,
                    key: Math.random().toString(36),
                    name: advice.name,
                    //This is EOD change in NAV na not return...KEY needs a NAME change
                    return: Number(_.get(performanceSummary, 'current.dailyNAVChangeEODPct', 0) * 100).toFixed(2),
                    netValue: _.get(advice, 'netValue', 0),
                    rating: _.get(advice, 'rating.current', 0),
                    isSubscribed,
                    isFollowing
                };
            } else {
                return null;
            }
        });
    }

    renderSubscribedAdvices = () => {
        return (
            <Table 
                columns={this.adviceColumns} 
                dataSource={this.state.subscribedAdvices} 
                pagination={false}
                scroll={{ y: 500 }}
                style={{margin: '10px 20px'}}/>
        );
    }

    processPresentStockTransction = (stockTransactions) => {
        const stockPositions = [...this.state.stockPositions];
        stockTransactions.map((item, index) => {
            stockPositions.push({
                key: index,
                symbol: _.get(item, 'security.detail.NSE_ID', null) || _.get(item, 'security.ticker', ''),
                name: _.get(item, 'security.detail.Nse_Name', ''),
                shares: item.quantity || 0,
                price: item.lastPrice || 0,
                avgPrice: item.avgPrice || 0,
                country: _.get(item, 'security.country', ''),
            });
        });
        return stockPositions;
    }

    processTransactionsForChart = (composition, colorData) => {
        const chartData = [];
        const seriesData = [];
        const positions = composition.map(item => item.ticker);
        composition.map((item, index) => {
            const weight = Number((item.weight * 100).toFixed(2));
            if (weight > 0) {
                chartData.push({
                    name: item.ticker,
                    y: Number((item.weight * 100).toFixed(2)),
                    color: colorData[item.ticker],
                });
            }   
        });
        seriesData.push({name: 'Chart Data', data: chartData});
        
        return seriesData;
    }

    processSectorsForChart = (positions, composition) => {
        const sectorData = [];
        const colors = ['#0091EA', '#FFEB3B', '#FFC107', '#FF9800', '#795548', '#FF5722', '#607D8B', '#3D5AFE', '#7C4DFF'];
        try {
            positions.map((position, positionIndex) => {
                const sectorName = _.get(position, 'security.detail.Sector', 0);
                const index = _.findIndex(sectorData, sector => sector.name === sectorName);
                const compositonIndex = _.findIndex(composition, item => item.name === position.security.ticker);
                if (compositonIndex >= 0) {
                    if (index === -1) {
                        sectorData.push({
                            name: sectorName,
                            y: composition[compositonIndex].y,
                            color: colors[positionIndex]
                        });
                    } else {
                        const weight = composition[compositonIndex].y;
                        sectorData[index].y = Number((sectorData[index].y + weight).toFixed(2));
        
                    }
                }
            });
            return [{name: 'Chart Data', data: sectorData}];
        } catch(err) {
            // console.log(err);
        }
        
    }

    processIndustriesForChart = (positions, composition) => {
        const industryData = [];
        const colors = ['#F44336', '#9C27B0', '#3F51B5', '#3F51B5', '#009688', '#8BC34A', '#8BC34A', '#CDDC39', '#00BFA5'];
        try {
            positions.map((position, positionIndex) => {
                const industryName = _.get(position, 'security.detail.Industry', '');
                const index = _.findIndex(industryData, sector => sector.name === industryName);
                const compositonIndex = _.findIndex(composition, item => item.name === position.security.ticker);
                if (compositonIndex >= 0) {
                    if (index === -1 ) {
                        industryData.push({
                            name: industryName,
                            y: composition[compositonIndex].y,
                            color: colors[positionIndex]
                        });
                    } else {
                        const weight = composition[compositonIndex].y;
                        industryData[index].y = Number((industryData[index].y + weight).toFixed(2));
        
                    }
                }
            });
    
            return [{name: 'Chart Data', data: industryData}];
        } catch(err) {
            // console.log(err);
        }
    }

    toggleCompositionView = (e) => {
        this.setState({compositionToggle: e.target.value});
    }

    handleOverviewSelectChange = e => {
        const {positions, defaultComposition} = this.state;
        const choice = e.target.value;
        this.setState({selectedCompositionRadio: choice});
        let series = [];
        try {
            switch(choice) {
                case "stocks":
                    series = defaultComposition;
                    break;
                case "sectors":
                    series = this.processSectorsForChart(positions, defaultComposition[0].data);
                    break;
                case "industries":
                    series = this.processIndustriesForChart(positions, defaultComposition[0].data);
                    break;
                default:
                    break;
            }
            this.setState({
                composition: series,
            });
        } catch(err) {
            // console.log(err);
        }
    }

    formatNetValue = (netValue) => {
        var nv = Number(Number(netValue).toFixed(2));
        var nvRound = Math.round(nv);
        return nvRound == nv ? nvRound : nv;
    }

    renderSummaryMetrics = () => {
        const {totalreturn, dailyreturn, volatility, netValue, dailyNavChangePct, totalPnl} = this.state.metrics;
        const colStyle = {marginBottom: '0px'};
        
        return(
            <Row type="flex" justify="space-around" style={{margin:'0 auto', marginTop: '20px'}}> 
                <Col span={5} style={colStyle}>
                    <MetricItem 
                        valueStyle={{...valueStyle}} 
                        labelStyle={labelStyle} 
                        label="Total Return"
                        percentage
                        color
                        value={totalreturn}
                    />
                </Col>
                <Col span={4} style={colStyle}>
                    <MetricItem 
                        valueStyle={{...valueStyle}} 
                        labelStyle={labelStyle} 
                        label="Volatility"
                        percentage 
                        value={volatility}
                    />
                </Col>
                <Col span={6} style={colStyle}>
                    <MetricItem 
                        valueStyle={{...valueStyle}} 
                        labelStyle={labelStyle} 
                        label="Unrealized PnL" 
                        money
                        color
                        value={totalPnl}
                    />
                </Col>
                <Col span={7} style={colStyle}>
                    <MetricItem 
                        valueStyle={valueStyle} 
                        labelStyle={labelStyle} 
                        label="Net Value"
                        money
                        isNetValue
                        dailyChangePct={dailyNavChangePct} 
                        value={netValue}
                    />
                </Col>
            </Row>
        );
    }

    renderOverviewMetrics = () => {
        const {positions, defaultComposition} = this.state;
        const {concentration = 0} = this.state.metrics;
        const colStyle = {marginBottom: '20px'};
        let nStocks = 0, nSectors = 0, nIndustries = 0, maxPosSize = {y: 0}, minPosSize = {y: 0};
        try {
            if (defaultComposition.length) {
                nStocks = defaultComposition[0].data.filter(item => {return item.name !="CASH_INR"}).length;
                nSectors = this.processSectorsForChart(positions, defaultComposition[0].data)[0].data.length;
                nIndustries = this.processIndustriesForChart(positions, defaultComposition[0].data)[0].data.length;
                maxPosSize = _.maxBy(defaultComposition[0].data, item => item.y);
                minPosSize = _.minBy(defaultComposition[0].data, item => item.y);
            }
    
            return (
                <Row type="flex" align="middle" style={{marginLeft: '30px'}}>
                    <Col span={24}>
                        <Row> 
                            <Col span={4} style={colStyle}>
                                <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="No. of Stocks" 
                                    fixed={0}
                                    value={nStocks}
                                />
                            </Col>
                            <Col span={4} style={colStyle}>
                                <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Diversity Index" 
                                    value={concentration}
                                />
                            </Col>
                            <Col span={4} style={colStyle}>
                                <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Max. Position Size" 
                                    percentage
                                    value={maxPosSize.y/100}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            );
        } catch(err) {
            // console.log(err);
        }
    }

    renderOverviewPieChart = () => {
        return (
            <Row type="flex" align="middle">
                <Col span={24}>
                    <HighChartNew 
                            chartContainerStyle={640} 
                            height={340} 
                            innerSize={200} 
                            series = {this.state.composition} 
                    />
                    <Row style={{textAlign: 'center', marginTop: '10px'}}>
                        <RadioGroup 
                                onChange={this.handleOverviewSelectChange} 
                                value={this.state.selectedCompositionRadio} 
                                size="small"
                        >
                            <RadioButton value="stocks">Stocks</RadioButton>
                            <RadioButton value="sectors">Sectors</RadioButton>
                            <RadioButton value="industries">Industries</RadioButton>
                        </RadioGroup>
                    </Row>
                </Col>
            </Row>
        );
    }

    renderOverviewBarChart = () => {
        const dollarSeries = this.state.dollarPerformance;
        const percentageSeries = this.state.percentagePerformance;
        return <HighChartBar
                categories={dollarSeries.map(item => item.name)}
                alignLegend='right' 
                dollarSeries={dollarSeries} 
                percentageSeries={percentageSeries} 
                legendStyle={{top: '0px'}}
        />;
    }

    handlePortfolioPerformanceMenuChange = portfolioId => {
        this.setState({performanceSelectedPortfolio: {
            name: (this.state.investorPortfolios.filter(portfolio => portfolio.id === portfolioId)[0] || {name: 'N/A'}).name,
            id: portfolioId
        }}, () => {
            this.getPortfolioPerformance(portfolioId);
        });
    }

    handlePortfolioDetailChange = portfolioId => {
        this.setState({
            selectedCompositionRadio: 'stocks', 
            portfolioSelectedPortfolio: {
                name: (this.state.investorPortfolios.filter(portfolio => portfolio.id === portfolioId)[0] || {name: 'N/A'}).name,
                id: portfolioId
            }
        }, () => {
            this.getPortfolioDetail(portfolioId);
        });
    }

    renderPortfolioMenu = (onChange, selectedPortfolioId) => {
        return (
            <Select 
                    value={selectedPortfolioId}
                    style={{width: 250, marginTop: '5px', position: 'absolute', top: '-35px'}} 
                    onChange={onChange}
                    autoFocus={true}
            >
                {
                    this.state.investorPortfolios.map((portfolio, index) => {
                        return (
                            <Option 
                                    key={index}
                                    value={portfolio.id}
                            >
                                {portfolio.name}
                            </Option>
                        );
                    })
                }
            </Select>
        );
    }

    componentWillMount() {
        this.mounted = true;
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            this.setUpSocketConnection();
            this.getDefaultPortfolioData();
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.unSubscribeToAllPortfolios();
        this.unSubscribeToAllAdvices();
    }

    
    setUpSocketConnection = () => {
        if (Utils.webSocket && Utils.webSocket.readyState == WebSocket.OPEN) {
            Utils.webSocket.onopen = () => {
                Utils.webSocket.onmessage = this.processRealtimeMessage;
                this.takeAction();
            }

            Utils.webSocket.onclose = () => {
                this.setUpSocketConnection();
            }
        
            if (Utils.webSocket.readyState == WebSocket.OPEN) {
                Utils.webSocket.onmessage = this.processRealtimeMessage;
                this.takeAction();
            } else {
                setTimeout(function() {
                    this.setUpSocketConnection()
                }.bind(this), 5000);
            }
        }
    }


    subscribeToAllPortfolios = (portfolios = []) => {
        // console.log('Subscribing to all Portfolios');
        portfolios.map(portfolio => {
            this.subscribeToPortfolio(portfolio.id);
        });
    }

    unSubscribeToAllPortfolios = (portfolios = []) => {
        // console.log('Un Subscribing to all portfolios');
        portfolios.map(portfolio => {
            this.unSubscribeToPortfolio(portfolio.id);
        });
    }

    subscribeToAllAdvices = (advices = []) => {
        advices.map(advice => {
            this.subscribeToAdvice(advice.id);
        });
    }

    unSubscribeToAllAdvices = (advices = []) => {
        // console.log('Un Subscribing to all Advices');
        advices.map(advice => {
            this.unSubscribeToAdvice(advice.id);
        });
    }

    takeAction = () => {
        if (this.mounted) {
            this.subscribeToAllPortfolios(this.state.investorPortfolios);
            this.subscribeToAllAdvices(this.state.subscribedAdvices);
        } else {
            this.unSubscribeToAllPortfolios(this.state.investorPortfolios);
            this.unSubscribeToAllAdvices(this.state.subscribedAdvices);
        }
    }

    processRealtimeMessage = msg => {
        if (this.mounted) {
            try {
                const realtimeData = JSON.parse(msg.data);
                if (realtimeData.type === 'portfolio') {
                    const investorPortfolios = [...this.state.investorPortfolios];
                    const targetPortfolio = investorPortfolios.filter(portfolio => portfolio.id === realtimeData.portfolioId)[0];
                    if (targetPortfolio) {
                        let defaultPorfolio = false;
                        // Checking if it's a default portfolio
                        if (realtimeData.portfolioId === this.state.defaultPortfolioId) {
                            defaultPorfolio = true;
                        }
                        targetPortfolio.dailyNavChangePct = (_.get(realtimeData, 'output.summary.dailyNavChangePct', 0) * 100).toFixed(2);
                        targetPortfolio.netValue = _.get(realtimeData, 'output.summary.netValue', 0)
                        this.setState({
                            investorPortfolios,
                            metrics: defaultPorfolio 
                                    ?   {
                                            ...this.state.metrics,
                                            dailyNavChangePct: (_.get(realtimeData, 'output.summary.dailyNavChangePct', 0)*100).toFixed(2),
                                            netValue: _.get(realtimeData, 'output.summary.netValue', 0)
                                        }
                                    :   this.state.metrics
                        });
                    }
                } else if (realtimeData.type === 'advice') {
                    const subscribedAdvices = [...this.state.subscribedAdvices];
                    const targetAdvice = subscribedAdvices.filter(advice => advice.id === realtimeData.adviceId)[0];
                    if (targetAdvice) {
                        targetAdvice.netValue = _.get(realtimeData, 'output.summary.netValue', 0);
                        targetAdvice.return = (_.get(realtimeData, 'output.summary.dailyNavChangePct', 0) * 100).toFixed(2);
                        this.setState({subscribedAdvices});
                    }
                }
            } catch(error) {
                // console.log(error);
            }
        }
    }
    // updatePortfolRealTime = 

    subscribeToPortfolio = portfolioId => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'portfolio',
            'portfolioId': portfolioId
        };
        Utils.sendWSMessage(msg);
    }

    unSubscribeToPortfolio = portfolioId => {
        // console.log('UnSubscription to portfolio ' + portfolioId);
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'portfolio',
            'portfolioId': portfolioId,
        };
        Utils.sendWSMessage(msg);
    }

    subscribeToAdvice = adviceId => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'advice',
            'adviceId': adviceId,
            'detail': true
        };
        Utils.sendWSMessage(msg); 
    }

    unSubscribeToAdvice = adviceId => {
        // console.log('UnSubscription to advice ' + adviceId);
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'advice',
            'adviceId': adviceId,
            // 'detail': true
        };
        Utils.sendWSMessage(msg);
    }

    renderPageContent = () => {
        const breadCrumbArray = getBreadCrumbArray([{name: 'Investor Dashboard'}]);
        const button = !this.state.showEmptyScreen.status ? {route: '/investordashboard/createportfolio', title: 'Create Portfolio'} : null;
        if (this.state.notAuthorized) {
            return <ForbiddenAccess />
        } else {
            return (
                <Row className='aq-page-container'>
                    {this.state.showEmptyScreen.status ?
                    <Col span={24} style={emptyPortfolioStyle}>
                        {
                            this.state.showEmptyScreen.errorCode === 'empty_portfolio'
                            ?   <div style={{textAlign: 'center'}}>
                                    <h1>{this.state.showEmptyScreen.messageText}</h1>
                                    <Button 
                                            type="primary" 
                                            onClick={() => this.props.history.push('/investordashboard/createportfolio')}
                                            style={{marginTop: '20px'}}
                                    >
                                        Create Portfolio
                                    </Button>
                                </div>
                            : <h1>{this.state.showEmptyScreen.messageText}</h1>
                        }
                    </Col>
                :   
                    <Col style={{paddingBottom: '20px'}}>
                        <Row>
                            {
                                (this.props.match.params.section === undefined || this.props.match.params.section === 'performanceSummary') &&
                                <Col xl={24} lg={24}>
                                    <Row type="flex" justify="end">
                                        {
                                            this.renderPortfolioMenu(
                                                this.handlePortfolioPerformanceMenuChange,
                                                this.state.performanceSelectedPortfolio.id
                                            )
                                        }
                                    </Row>
                                    <DashboardCard 
                                            title={`Performance Summary - (${this.state.performanceSelectedPortfolio.name})`} 
                                            loading={this.state.defaultPortfolioLoading}
                                            cardStyle={{height:'625px', marginTop: '20px'}} 
                                            headerStyle={headerStyle}
                                            loading={this.state.portfolioPerformanceLoading}
                                    >

                                        <Row style={{padding: '10px'}}>
                                            <Col span={24}>
                                                {this.renderSummaryMetrics()}
                                            </Col>
                                            <Col style={{marginTop: '40px', padding: '0 10px'}} span={24}>
                                                <MyChartNew series={this.state.tickers}/>
                                            </Col>
                                        </Row>
                                    
                                    </DashboardCard>
                                </Col>
                            }
                            {
                                this.props.match.params.section === 'portfolioSummary' &&
                                <Col xl={24} lg={24}>
                                    <Row type="flex" justify="end">
                                        {
                                            this.renderPortfolioMenu(
                                                this.handlePortfolioDetailChange,
                                                this.state.portfolioSelectedPortfolio.id
                                            )
                                        }
                                    </Row>
                                    <DashboardCard 
                                            title={`Portfolio Summary - (${this.state.portfolioSelectedPortfolio.name})`} 
                                            loading={this.state.defaultPortfolioLoading}
                                            cardStyle={{height:'625px', marginTop: '20px'}} 
                                            headerStyle={headerStyle}
                                            loading={this.state.portfolioDetailLoading}
                                    >
                                            <Row type="flex" align="middle" style={{paddingLeft: '20px'}}>
                                                <Col 
                                                        span={24} 
                                                        style={{marginTop: '20px'}}
                                                >
                                                    {this.renderOverviewMetrics()}
                                                </Col>
                                                <Col span={17}>
                                                    <AqStockPortfolioTable 
                                                            updateTicker={this.updateTicker}
                                                            size="default"
                                                            portfolio={{
                                                                positions: this.state.rawDefaultPortfolioPositions
                                                            }}
                                                            scroll={{y: 400}}
                                                            columns={['name', 'shares', 'price', 'avgPrice', 'sector']}
                                                    />
                                                </Col>
                                                <Col span={7}>{this.renderOverviewPieChart()}</Col>
                                            </Row>
                                    </DashboardCard>
                                </Col>
                            }
                            {
                                this.props.match.params.section === 'createdPortfolios' &&
                                <Col xl={24} lg={24}>
                                    <DashboardCard 
                                            title="MY PORTFOLIOS" 
                                            loading={this.state.portfolioLoading}
                                            headerStyle={headerStyle}
                                            cardStyle={{height: '625px'}} 
                                            contentStyle={{...contentStyle, height: '90%'}}
                                    >
                                        {this.renderPortfolios()}
                                    </DashboardCard>
                                </Col>
                            }
                            {
                                this.props.match.params.section === 'subscribedAdvices' &&
                                <Col xl={24} lg={24}>
                                    <DashboardCard 
                                            title="MY ADVICES" 
                                            cardStyle={{height: '625px'}}
                                            loading={this.state.subscribedAdvicesLoading}
                                            headerStyle={headerStyle}
                                    >
                                        {this.renderSubscribedAdvices()}
                                    </DashboardCard>
                                </Col>
                            }
                        </Row>
                    </Col>
                }
                </Row>
            );
        }
    }

    toggleStockResearchModal = () => {
        this.setState({stockResearchModalVisible: !this.state.stockResearchModalVisible});
    }

    updateTicker = ticker => {
        this.setState({stockResearchModalTicker: ticker}, () => {
            this.toggleStockResearchModal()
        });
    }

    render() {
        return(
            <Col span={24}>
                <StockResearchModal
                        ticker={this.state.stockResearchModalTicker}
                        visible={this.state.stockResearchModalVisible}
                        toggleModal={this.toggleStockResearchModal}
                />
                <Loading 
                    show={this.state.defaultPortfolioLoading}
                    color={loadingColor}
                    showSpinner={false}
                    className="main-loader"
                />
                <InvestorDashboardMeta />
               {
                    !this.state.defaultPortfolioLoading &&
                    this.renderPageContent()
               }
            </Col>
        );
    }
}

export default withRouter(InvestorDashboard);

const valueStyle = {
    color: '#585858',
    fontSize: '24px',
    fontWeight: '400'
};

const labelStyle = {
    color: '#707070',
    fontSize: '14px',
    fontWeight: '400'
};

const emptyPortfolioStyle = {
    height: '600px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const headerStyle = {
    borderBottom: '1px solid #eaeaea'
};

const contentStyle = {
    // paddingTop: '20px', 
    overflow: 'hidden', 
    overflowY: 'scroll'
};
