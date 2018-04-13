import * as React from 'react';
import axios from 'axios';
import Loading from 'react-loading-bar';
import _ from 'lodash';
import moment from 'moment';
import {Link} from 'react-router-dom';
import {Row, Col, Tabs, Select, Table, Button, Divider, Rate, Tag, Radio, Spin} from 'antd';
import {AqHighChartMod, MetricItem, PortfolioListItem, AdviceListItem, ListMetricItem, HighChartNew, HighChartBar, AqCard, DashboardCard, AqPageHeader, AqPortfolioSummary} from '../components';
import {pageTitleStyle, loadingColor, layoutStyle, pageHeaderStyle, metricsHeaderStyle, newLayoutStyle, listMetricItemLabelStyle, listMetricItemValueStyle, nameEllipsisStyle, tabBackgroundColor, benchmarkColor, metricColor} from '../constants';
import {MyChartNew} from './MyChartNew';
import {generateColorData, getMetricColor, Utils, getBreadCrumbArray} from '../utils';
import 'react-loading-bar/dist/index.css'

const {requestUrl, aimsquantToken} = require('../localConfig');
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';

export class InvestorDashboard extends React.Component {
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
            topLoader: false
        };
        this.stockPositionColumns = [
            {
                title: this.renderColumnHeader('NAME'),
                dataIndex: 'name',
                key: 'name',
                render: text => 
                        <h3 
                                style={
                                    {
                                        width: '180px', 
                                        overflow: 'hidden', 
                                        textOverflow: 'ellipsis', 
                                        whiteSpace: 'nowrap', 
                                        fontSize: '14px', 
                                        fontWeight: 400
                                    }
                                } 
                                href="#"
                            >
                                {text}
                            </h3>,
            },
            {
                title: this.renderColumnHeader('SYMBOL'),
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: this.renderColumnHeader('SHARES'),
                dataIndex: 'shares',
                key: 'shares'
            },
            {
                title: this.renderColumnHeader('PRICE'),
                dataIndex: 'price',
                key: 'price'
            },
            {
                title: this.renderColumnHeader('AVG PRICE'),
                dataIndex: 'avgPrice',
                key: 'avgPrice'
            }
        ];
        this.adviceColumns = [
            {
                title: this.renderColumnHeader('NAME'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => {
                    return <Link to={`advice/${record.id}`} style={{...nameEllipsisStyle, width: '80px'}}>{text}</Link>
                }
            },
            {
                title: this.renderColumnHeader('NET VALUE'),
                dataIndex: 'netValue',
                key: 'netValue',
                render: (text, record) => {
                    let color = record.return < 0 ? '#ED4D4D' : '#3DC66B';

                    return (
                        <h3 style={{fontSize: '16px'}}>
                            {text}
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
                render: text => <Rate style={{fontSize: '13px'}} disabled value={Number(text) / 2}/>
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
                    return <Tag color={tagContent.color} style={{textAlign: 'center', fontSize: '10px'}}>{tagContent.text}</Tag>
                }
            }
        ]
    }

    renderColumnHeader = name => <h3 style={{fontSize: '12px', color: '#353535', fontWeight: '700'}}>{name}</h3>

    getDefaultPortfolioData = () => {
        const url = `${requestUrl}/investor/${Utils.getUserInfo().investor}`;
        const tickers = [...this.state.tickers];
        this.setState({defaultPortfolioLoading: true});
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const positions = _.get(response.data, 'defaultPortfolio.detail.positions', []);
            const positionModdedForColors = positions.map(item => item.security.ticker);
            const colorData = generateColorData(positionModdedForColors);
            const portfolioMetrics = _.get(response.data, 'defaultPerformance.current.metrics.portfolioMetrics', {});
            const composition = this.processTransactionsForChart(portfolioMetrics.composition, colorData);
            const performance = _.get(response.data, 'defaultPerformance.current.metrics.portfolioPerformance.true', {});
            const performanceUrl = `${requestUrl}/performance/investor/${Utils.getUserInfo().investor}/${response.data.defaultPortfolio._id}`;
            const performanceData = _.get(response.data, 'defaultPerformance.simulated.portfolioValues', []).map(item => {
                        return [moment(item.date, dateFormat).valueOf(), item.netValue]
            });
            const pieChartTitle = composition[0].data.length > 1 && `${composition[0].data[0].name}<br>${composition[0].data[0].y}`;
            const summary = _.get(response.data, 'defaultPerformance.summary.current', {});
            tickers.push({
                name: _.get(response.data, 'defaultPortfolio.benchmark.ticker', ''),
                show: true,
                color: benchmarkColor
            });
            tickers.push({
                name: 'Portfolio',
                data: performanceData,
                show: true
            });
            const constituentPerformance = _.get(response.data, 'defaultPerformance.current.metrics.constituentPerformance', []);
            const dollarPerformance = constituentPerformance.map(item => {
                return {name: item.ticker, data: [Number(item.pnl.toFixed(2))], color: colorData[item.ticker]};
            });
            const percentagePerformance = constituentPerformance.map(item => {
                return {name: item.ticker, data: [Number(item.pnl_pct.toFixed(2))], color: colorData[item.ticker]};
            });
            this.setState({
                defaultPortfolioName: _.get(response.data, 'defaultPortfolio.name', ''),
                positions,
                showEmptyScreen: {...this.state.showEmptyScreen, status: positions.length > 0 ? false : true},
                composition,
                defaultComposition: composition,
                stockPositions: this.processPresentStockTransction(positions),
                metrics: {
                    beta: performance.ratios.beta,
                    sharperatio: performance.ratios.sharperatio,
                    annualreturn: performance.returns.annualreturn,
                    averagedailyreturn: performance.returns.averagedailyreturn,
                    dailyreturn: performance.returns.dailyreturn,
                    totalreturn: performance.returns.totalreturn,
                    volatility: summary.volatility,
                    netValue: summary.netValue
                },
                dollarPerformance,
                percentagePerformance,
                tickers,
            });
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            let messageText = '', errorCode = '';
            if (error.message === 'Network Error') {
                messageText = 'You are disconnected from the internet';
                errorCode = 'no_network';
            } else {
                messageText = 'You have not created any portfolio yet. Get started by creating One';
                errorCode = 'empty_portfolio';
            }
            this.setState({showEmptyScreen: {error: error.message, status: true, messageText, errorCode}});
        })
        .finally(() => {
            this.setState({defaultPortfolioLoading: false});
        });
    }

    getInvestorPortfolios = () => {
        const investorPortfolioUrl = `${requestUrl}/investor/${Utils.getUserInfo().investor}/portfolio`;
        this.setState({portfolioLoading: true});
        axios.get(investorPortfolioUrl, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const subscribedAdvicesUrl = `${requestUrl}/advice?subscribed=true`;
            this.setState({investorPortfolios: this.processPortfolios(response.data)});
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({portfolioLoading: false});
        });
    }

    getInvestorSubscribedAdvices = () => {
        const subscribedAdvicesUrl = `${requestUrl}/advice?subscribed=true`;
        const followingAdviceUrl = `${requestUrl}/advice?following=true`;
        this.setState({subscribedAdvicesLoading: true});
        axios.get(subscribedAdvicesUrl, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.setState({subscribedAdvices: this.processSubscribedAdvices(response.data)});
            return axios.get(followingAdviceUrl, {headers: Utils.getAuthTokenHeader()});
        })
        .then(response => {
            const advices = [...this.state.subscribedAdvices];
            const followingAdvices = response.data;
            followingAdvices.map((advice, index) => {
                console.log('Advice', advice);
                const {name, performanceSummary} = advice;
                if(_.findIndex(advices, presentAdvice => presentAdvice.id === advice._id) === -1) {
                    advices.push({
                        id: advice._id,
                        key: index,
                        name: advice.name,
                        return: Number(_.get(performanceSummary, 'current.totalReturn', 0) * 100).toFixed(2),
                        netValue: _.get(performanceSummary, 'current.netValue', 0),
                        rating: advice.rating.current,
                        isFollowing: advice.isFollowing,
                        isSubscribed: advice.isSubscribed
                    });
                }
            });
            console.log('Advices', advices);
            this.setState({subscribedAdvices: advices});
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({subscribedAdvicesLoading: false});
        });
    }

    onMenuSelected = (type, value) => {
        const portfolios = [...this.state.investorPortfolios];
        const advices = [...this.state.subscribedAdvices];
        console.log(portfolios);
        console.log(advices);
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

            return (
                <Row 
                        key={index} 
                        style={{marginBottom: '10px', padding: '0 20px', cursor: 'pointer', marginTop: '10px'}} 
                        onClick={(e) => this.props.history.push(`/dashboard/portfolio/${portfolio.id}`)}
                >
                    <Col span={7}>
                        <ListMetricItem label="Name" value={portfolio.name} />
                    </Col>
                    <Col span={5}>
                        <ListMetricItem value={portfolio.netValue} label="Net Value" />
                    </Col>
                    <Col span={6}>
                        <ListMetricItem 
                                value={`${portfolio.return} %`} 
                                label="Return" 
                                valueColor={returnColor}
                        />
                    </Col>
                    <Col span={6}>
                        <ListMetricItem 
                                value={`${portfolio.volatility} %`} 
                                label="Volatility" 
                        />
                    </Col>
                    <Col span={24} style={{backgroundColor: '#eaeaea', marginTop: '10px'}}>
                    </Col>
                </Row>
            );
        });
    }

    processPortfolios = (portfolios) => {
        return portfolios.map(portfolio => {
            return {
                id: portfolio._id,
                name: portfolio.name.length < 1 ? 'Undefined' : portfolio.name,
                netValue: _.get(portfolio, 'performance.netValue', 0) || 0,
                return: (_.get(portfolio, 'performance.totalReturn', 0) || 0).toFixed(2),
                volatility: (_.get(portfolio, 'performance.volatility', 0) || 0).toFixed(2)
            }
        });
    }

    processSubscribedAdvices = advices => {
        console.log('My Advices', advices);
        return advices.map((advice, index) => {
            const {name, performanceSummary, isSubscribed, isFollowing} = advice;
            if (performanceSummary) {
                return {
                    id: advice._id,
                    key: index,
                    name: advice.name,
                    return: Number(_.get(performanceSummary, 'current.totalReturn', 0) * 100).toFixed(2),
                    netValue: _.get(performanceSummary, 'current.netValue', 0),
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
                    size="small"
                    style={{margin: '10px 20px'}}
            />
        );
    }

    processPresentStockTransction = (stockTransactions) => {
        const stockPositions = [...this.state.stockPositions];
        stockTransactions.map((item, index) => {
            stockPositions.push({
                key: index,
                symbol: _.get(item, 'security.ticker', ''),
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
        console.log('PieChart positions', positions);
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
                if (index === -1 ) {
                    sectorData.push({
                        name: sectorName,
                        y: composition[compositonIndex].y,
                        color: colors[positionIndex]
                    });
                } else {
                    const weight = composition[compositonIndex].y;
                    sectorData[index].y = Number((sectorData[index].y + weight).toFixed(2));
    
                }
            });
            return [{name: 'Chart Data', data: sectorData}];
        } catch(err) {
            console.log(err);
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
            });
    
            return [{name: 'Chart Data', data: industryData}];
        } catch(err) {
            console.log(err);
        }
    }

    renderStockTransactions = () => {
        return (
            <Table 
                    bordered={false}
                    pagination={false} 
                    style={{margin: '0 10px'}} 
                    size="small"
                    columns={this.stockPositionColumns} 
                    dataSource={this.state.stockPositions} 
            />
        );
    }

    toggleCompositionView = (e) => {
        this.setState({compositionToggle: e.target.value});
    }

    handleOverviewSelectChange = e => {
        const {positions, defaultComposition} = this.state;
        const choice = e.target.value;
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
            console.log(err);
        }
    }

    formatNetValue = (netValue) => {
        var nv = Number(Number(netValue).toFixed(2));
        var nvRound = Math.round(nv);
        return nvRound == nv ? nvRound : nv;
    }
    renderSummaryMetrics = () => {
        const {totalreturn, dailyreturn, volatility, netValue} = this.state.metrics;
        const colStyle = {marginBottom: '0px'};
        
        return(
            <Row type="flex" justify="space-around"> 
                <Col span={5} style={colStyle}>
                    <MetricItem 
                        valueStyle={{...valueStyle, color: getMetricColor(totalreturn)}} 
                        labelStyle={labelStyle} 
                        label="Total Return" 
                        value={`${Number(totalreturn * 100).toFixed(2)} %`}
                    />
                </Col>
                <Col span={5} style={colStyle}>
                    <MetricItem 
                        valueStyle={{...valueStyle}} 
                        labelStyle={labelStyle} 
                        label="Volatility" 
                        value={`${Number(volatility * 100).toFixed(2)} %`}
                    />
                </Col>
                <Col span={5} style={colStyle}>
                    <MetricItem 
                        valueStyle={{...valueStyle, color: getMetricColor(dailyreturn)}} 
                        labelStyle={labelStyle} 
                        label="Daily Return" 
                        value={`${Number(dailyreturn * 100).toFixed(2)} %`}
                    />
                </Col>
                <Col span={6} style={colStyle}>
                    <MetricItem 
                        valueStyle={valueStyle} 
                        labelStyle={labelStyle} 
                        label="NetValue" 
                        value={this.formatNetValue(netValue)}
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
            if (defaultComposition.length){
                nStocks = defaultComposition[0].data.length;
                nSectors = this.processSectorsForChart(positions, defaultComposition[0].data)[0].data.length;
                nIndustries = this.processIndustriesForChart(positions, defaultComposition[0].data)[0].data.length;
                maxPosSize = _.maxBy(defaultComposition[0].data, item => item.y);
                minPosSize = _.minBy(defaultComposition[0].data, item => item.y);
            }
    
            return (
                <Row style={{height: '345px'}}>
                    <Col span={24}>
                        <Row> 
                            <Col span={24} style={colStyle}>
                                <MetricItem 
                                        valueStyle={valueStyle} 
                                        labelStyle={labelStyle} 
                                        label="No. of Stocks" 
                                        value={nStocks}
                                />
                            </Col>
                            <Col span={24} style={colStyle}>
                                <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                        label="Concentration" 
                                        value={Number(concentration).toFixed(2)}
                                />
                            </Col>
                            <Col span={24} style={colStyle}>
                                <MetricItem 
                                        valueStyle={valueStyle} 
                                        labelStyle={labelStyle} 
                                        label="Max. Position Size" 
                                        value={maxPosSize.y}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            );
        } catch(err) {
            console.log(err);
        }
    }

    renderOverviewPieChart = () => {
        return (
            <Col>
                <HighChartNew series = {this.state.composition} />
                
                <Row style={{textAlign: 'center', marginTop: '-60px'}}>
                    <RadioGroup onChange={this.handleOverviewSelectChange} defaultValue="stocks" size="small">
                        <RadioButton value="stocks">Stocks</RadioButton>
                        <RadioButton value="sectors">Sectors</RadioButton>
                        <RadioButton value="industries">Industries</RadioButton>
                    </RadioGroup>
                </Row>
            </Col>
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

    renderPortfolioMenu = () => {
        return (
            <Select 
                    value={this.state.defaultPortfolioName} 
                    style={{width: 150, marginTop: '5px'}} 
                    size="small"
                    
            >
                <Option value={this.state.defaultPortfolioName}>{this.state.defaultPortfolioName}</Option>
            </Select>
        );
    }

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            this.getDefaultPortfolioData();
            this.getInvestorPortfolios();
            this.getInvestorSubscribedAdvices();   
        }
    }

    renderPageContent = () => {
        const breadCrumbArray = getBreadCrumbArray([{name: 'Investor Dashboard'}]);
        const button = !this.state.showEmptyScreen.status ? {route: '/dashboard/createportfolio', title: 'Create Portfolio'} : null;
        return (
            <Row>
                <AqPageHeader title="Investor Dashboard" breadCrumbs = {breadCrumbArray} button={button}/>
            {this.state.showEmptyScreen.status ?
                <Col span={24} style={emptyPortfolioStyle}>
                    {
                        this.state.showEmptyScreen.errorCode === 'empty_portfolio'
                        ?   <div style={{textAlign: 'center'}}>
                                <h1>{this.state.showEmptyScreen.messageText}</h1>
                                <Button 
                                        type="primary" 
                                        onClick={() => this.props.history.push('/dashboard/createportfolio')}
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
                    <Row gutter={12}>
                        <Col xl={12} lg={24}>
                            <DashboardCard 
                                    title="SUMMARY" 
                                    loading={this.state.defaultPortfolioLoading}
                                    cardStyle={{height:'425px'}} 
                                    headerStyle={headerStyle}
                                    menu={this.renderPortfolioMenu()}
                            >
                                    <Row type="flex" justify="space-around" style={{marginTop: '10px', marginBottom: '10px'}}>
                                        <Col span={20}>{this.renderSummaryMetrics()}</Col>
                                    </Row>

                                    <Row type="flex">
                                        <Col span={12}>{this.renderOverviewPieChart()}</Col>
                                        <Col style={{left: '20%', marginTop: '5%'}} span={12}>{this.renderOverviewMetrics()}</Col>
                                    </Row>
                            </DashboardCard>
                        </Col>
                        
                        <Col xl={12} lg={24}>
                            <DashboardCard 
                                    title="PERFORMANCE CHART" 
                                    loading={this.state.defaultPortfolioLoading}
                                    cardStyle={{height: '425px'}} 
                                    headerStyle={headerStyle}
                                    menu={this.renderPortfolioMenu()}
                            >

                                <Row style={{padding: '10px'}}>
                                    <MyChartNew series={this.state.tickers}/>
                                </Row>
                            
                            </DashboardCard>
                        </Col>

                        
                    </Row>

                    <Row gutter={12}>
                        <Col xl={12} lg={24}>
                            <DashboardCard 
                                    title="MY PORTFOLIOS" 
                                    loading={this.state.portfolioLoading}
                                    headerStyle={headerStyle}
                                    cardStyle={{marginTop:'12px', height: '450px'}} 
                                    contentStyle={{...contentStyle, height: '90%'}}
                            >
                                {this.renderPortfolios()}
                            </DashboardCard>
                        </Col>

                        <Col xl={12} lg={24}>
                            <DashboardCard 
                                    title="MY ADVICES" 
                                    cardStyle={{marginTop:'12px', height: '450px'}}
                                    loading={this.state.subscribedAdvicesLoading}
                                    headerStyle={headerStyle}
                            >
                                {this.renderSubscribedAdvices()}
                            </DashboardCard>
                        </Col>
                    </Row>
                </Col>
            }
            </Row>
        );
    }

    render() {
        return(
            <Col span={24}>
                <Loading 
                    show={this.state.defaultPortfolioLoading}
                    color={this.state.loadingColor}
                    showSpinner={false}
                    className="main-loader"
                />
               {
                   !this.state.defaultPortfolioLoading &&
                   this.renderPageContent()
               }
            </Col>
        );
    }
}

const valueStyle = {
    color: '#585858',
    fontSize: '20px',
    fontWeight: '400'
};

const labelStyle = {
    color: '#707070',
    fontSize: '12px',
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
