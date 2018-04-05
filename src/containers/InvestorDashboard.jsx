import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import {Link} from 'react-router-dom';
import {Row, Col, Tabs, Select, Table, Button, Divider, Rate, Tag, Radio} from 'antd';
import {AqHighChartMod, MetricItem, PortfolioListItem, AdviceListItem, ListMetricItem, HighChartNew, HighChartBar, AqCard, DashboardCard} from '../components';
import {layoutStyle, pageHeaderStyle, metricsHeaderStyle, newLayoutStyle, listMetricItemLabelStyle, listMetricItemValueStyle, nameEllipsisStyle, tabBackgroundColor} from '../constants';
import {MyChartNew} from './MyChartNew';
import {generateColorData} from '../utils';

const {requestUrl, aimsquantToken, investorId} = require('../localConfig');
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const TabPane = Tabs.TabPane;
const ReactHighcharts = require('react-highcharts');
const Option = Select.Option;

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
                totalreturn: -1
            },
            sectorSeries: [],
            industySeries: [],
            positions: [],
            composition: [],
            defaultComposition: [],
            dollarPerformance: [],
            percentagePerformance: []
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
        const url = `${requestUrl}/investor/${investorId}`;
        const tickers = [...this.state.tickers];
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const positions = response.data.defaultPortfolio.detail.positions;
            const positionModdedForColors = positions.map(item => item.security.ticker);
            const colorData = generateColorData(positionModdedForColors);
            const portfolioMetrics = response.data.defaultPerformance.current.metrics.portfolioMetrics;
            const composition = this.processTransactionsForChart(portfolioMetrics.composition, colorData);
            const concentration = portfolioMetrics.concentration;
            const performance = response.data.defaultPerformance.current.metrics.portfolioPerformance.true;
            const performanceUrl = `${requestUrl}/performance/investor/${investorId}/${response.data.defaultPortfolio._id}`;
            const performanceData = response.data.defaultPerformance.simulated.portfolioValues.map(item => [moment(item.date).valueOf(), item.netValue]);
            const pieChartTitle = `${composition[0].data[0].name}<br>${composition[0].data[0].y}`;
            const summary = response.data.defaultPerformance.summary.current;
            tickers.push({
                name: 'Portfolio',
                data: performanceData,
                show: true
            });
            tickers.push({
                name: response.data.defaultPortfolio.benchmark.ticker,
                show: true
            });
            const constituentPerformance = response.data.defaultPerformance.current.metrics.constituentPerformance || [];
            const dollarPerformance = constituentPerformance.map(item => {
                return {name: item.ticker, data: [Number(item.pnl.toFixed(2))], color: colorData[item.ticker]};
            });
            const percentagePerformance = constituentPerformance.map(item => {
                return {name: item.ticker, data: [Number(item.pnl_pct.toFixed(2))], color: colorData[item.ticker]};
            });
            this.setState({
                positions,
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
                    concentration,
                    volatility: summary.volatility
                },
                dollarPerformance,
                percentagePerformance,
                tickers,
            });
        })
        .catch(error => {
            console.log(error);
        });
    }

    getInvestorPortfolios = () => {
        const investorPortfolioUrl = `${requestUrl}/investor/${investorId}/portfolio`;
        axios.get(investorPortfolioUrl, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const subscribedAdvicesUrl = `${requestUrl}/advice?subscribed=true`;
            this.setState({investorPortfolios: this.processPortfolios(response.data)});
        })
        .catch(error => {
            console.log(error);
        });
    }

    getInvestorSubscribedAdvices = () => {
        const subscribedAdvicesUrl = `${requestUrl}/advice?subscribed=true`;
        const followingAdviceUrl = `${requestUrl}/advice?following=true`;
        axios.get(subscribedAdvicesUrl, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({subscribedAdvices: this.processSubscribedAdvices(response.data)});
            return axios.get(followingAdviceUrl, {headers: {'aimsquant-token': aimsquantToken}});
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
                        return: Number(performanceSummary.current.totalReturn * 100).toFixed(2),
                        netValue: performanceSummary.current.netValue,
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
            console.log(error);
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
            const returnColor = portfolio.return < 0 ? '#ED4D4D' : '#3DC66B';

            return (
                <Row 
                        key={index} 
                        style={{marginBottom: '10px', padding: '0 20px', cursor: 'pointer'}} 
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
                                value={portfolio.volatility} 
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
                netValue: portfolio.performance.netValue,
                return: Number(portfolio.performance.totalReturn).toFixed(2),
                volatility: portfolio.performance.volatility
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
                    return: Number(performanceSummary.current.totalReturn * 100).toFixed(2),
                    netValue: performanceSummary.current.netValue,
                    rating: advice.rating.current,
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
                    style={{margin: '0 20px'}}
            />
        );
    }

    processPresentStockTransction = (stockTransactions) => {
        const stockPositions = [...this.state.stockPositions];
        stockTransactions.map((item, index) => {
            stockPositions.push({
                key: index,
                symbol: item.security.ticker,
                name: item.security.detail.Nse_Name,
                shares: item.quantity,
                price: item.lastPrice,
                avgPrice: item.avgPrice,
                country: item.security.country,
            });
        });
        return stockPositions;
    }

    processTransactionsForChart = (composition, colorData) => {
        const chartData = [];
        const seriesData = [];
        const positions = composition.map(item => item.ticker);
        composition.map(item => {
            const weight = Number((item.weight * 100).toFixed(2));
            if (weight > 0) {
                chartData.push({
                    name: item.ticker,
                    y: Number((item.weight * 100).toFixed(2)),
                    color: colorData[item.ticker]
                });
            }   
        });
        seriesData.push({name: 'Chart Data', data: chartData});
        
        return seriesData;
    }

    processSectorsForChart = (positions, composition) => {
        const sectorData = [];
        positions.map(position => {
            const sectorName = position.security.detail.Sector;
            const index = _.findIndex(sectorData, sector => sector.name === sectorName);
            const compositonIndex = _.findIndex(composition, item => item.name === position.security.ticker);
            if (index === -1 ) {
                sectorData.push({
                    name: sectorName,
                    y: composition[compositonIndex].y
                });
            } else {
                const weight = composition[compositonIndex].y;
                sectorData[index].y = Number((sectorData[index].y + weight).toFixed(2));

            }
        });
        
        return [{name: 'Chart Data', data: sectorData}];
    }

    processIndustriesForChart = (positions, composition) => {
        const industryData = [];
        positions.map(position => {
            const industryName = position.security.detail.Industry;
            const index = _.findIndex(industryData, sector => sector.name === industryName);
            const compositonIndex = _.findIndex(composition, item => item.name === position.security.ticker);
            if (index === -1 ) {
                industryData.push({
                    name: industryName,
                    y: composition[compositonIndex].y
                });
            } else {
                const weight = composition[compositonIndex].y;
                industryData[index].y = Number((industryData[index].y + weight).toFixed(2));

            }
        });

        return [{name: 'Chart Data', data: industryData}];
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

    renderSummaryMetrics = () => {
        const {totalreturn, dailyreturn, volatility} = this.state.metrics;
        console.log('Metrics', this.state.metrics);
        const colStyle = {marginBottom: '0px'};

        return(
            <Row>
                <Col span={24} style={{display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Row style={{textAlign: 'center', paddingLeft: '15px'}}> 
                        <Col span={6} style={colStyle}>
                            <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Total Return" 
                                    value={`${Number(totalreturn * 100).toFixed(2)} %`}
                            />
                        </Col>
                        <Col span={6} style={colStyle}>
                            <MetricItem 
                                valueStyle={valueStyle} 
                                labelStyle={labelStyle} 
                                    label="Daily Return" 
                                    value={`${Number(dailyreturn * 100).toFixed(2)} %`}
                            />
                        </Col>
                        <Col span={6} style={colStyle}>
                            <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Volatility" 
                                    value={`${Number(volatility * 100).toFixed(2)} %`}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }

    renderOverviewMetrics = () => {
        const {positions, defaultComposition} = this.state;
        const {concentration = 0} = this.state.metrics;
        const colStyle = {marginBottom: '40px'};
        let nStocks = 0, nSectors = 0, nIndustries = 0, maxPosSize = {y: 0}, minPosSize = {y: 0};
        if (defaultComposition.length){
            nStocks = defaultComposition[0].data.length;
            nSectors = this.processSectorsForChart(positions, defaultComposition[0].data)[0].data.length;
            nIndustries = this.processIndustriesForChart(positions, defaultComposition[0].data)[0].data.length;
            maxPosSize = _.maxBy(defaultComposition[0].data, item => item.y);
            minPosSize = _.minBy(defaultComposition[0].data, item => item.y);
        }

        return (
            <Row style={{height: '345px'}}>
                <Col span={24} style={{height: '93%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                    <Row style={{textAlign: 'center', paddingLeft: '15px'}}> 
                        <Col span={12} style={colStyle}>
                            <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="No. of Stocks" 
                                    value={nStocks}
                            />
                        </Col>
                        <Col span={12} style={colStyle}>
                            <MetricItem 
                                valueStyle={valueStyle} 
                                labelStyle={labelStyle} 
                                    label="Concentration" 
                                    value={Number(concentration).toFixed(2)}
                            />
                        </Col>
                        <Col span={12} style={colStyle}>
                            <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="No. of Industries" 
                                    value={nIndustries}
                            />
                        </Col>
                    
                        <Col span={12} style={colStyle}>
                            <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Max. Position Size" 
                                    value={maxPosSize.y}
                            />
                        </Col>
                        <Col span={12} style={colStyle}>
                            <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="No. of Sectors" 
                                    value={nSectors}
                            />
                        </Col>
                        <Col span={12} style={colStyle}>
                            <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Min. Position Size" 
                                    value={minPosSize.y}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }

    renderOverviewPieChart = () => {
        return (
            <Row>
                <Col span={24} style={{textAlign: 'center', marginTop: '0px'}}>
                    <RadioGroup onChange={this.handleOverviewSelectChange} defaultValue="stocks" size="small">
                        <RadioButton value="stocks">Stocks</RadioButton>
                        <RadioButton value="sectors">Sectors</RadioButton>
                        <RadioButton value="industries">Industries</RadioButton>
                    </RadioGroup>
                </Col>
                <Col span={24}>
                    <HighChartNew series = {this.state.composition} />
                </Col>
            </Row>
        );
    }

    renderOverviewBarChart = () => {
        const dollarSeries = this.state.dollarPerformance;
        const percentageSeries = this.state.percentagePerformance;
        console.log(dollarSeries, percentageSeries);
        return <HighChartBar
                alignLegend='right' 
                dollarSeries={dollarSeries} 
                percentageSeries={percentageSeries} 
                legendStyle={{top: '0px'}}
        />;
    }

    componentWillMount() {
        this.getDefaultPortfolioData();
        this.getInvestorPortfolios();
        this.getInvestorSubscribedAdvices();
    }

    render() {
        return(
            // this.state.positions.length < 1
            // ?   <Row>
            //         <Col span={24} style={emptyPortfolioStyle}>
            //             <h1>You have not created any portfolio yet. Get started by creating One</h1>
            //             <Button 
            //                     type="primary" 
            //                     onClick={() => this.props.history.push('/dashboard/createportfolio')}
            //                     style={{marginTop: '20px'}}
            //             >
            //                 Create Portfolio
            //             </Button>
            //         </Col>
            //     </Row>
            // :   <Row>
                <Row>
                    <Col span={24} style={{textAlign: 'right'}}>
                        <Button 
                                type="primary" 
                                onClick={() => this.props.history.push('/dashboard/createportfolio')}
                                style={{marginRight: '20px'}}
                        >
                            Create Portfolio
                        </Button>
                        <Button 
                                type="secondary" 
                                onClick={() => this.props.history.push('/advisordashboard')}
                        >
                            Advisor Dashboard
                        </Button>
                    </Col>
                    <Col span={24}>
                        <Row style={{marginTop: '22px'}}>
                            <Col xl={12} lg={24} style={{paddingRight: '5px'}}>
                                <Tabs 
                                        defaultActiveKey={"2"} 
                                        animated={false} 
                                        style={{...newLayoutStyle, height: '395px'}}
                                        size="small"
                                        tabBarStyle={{backgroundColor: tabBackgroundColor}}
                                >
                                    <TabPane tab="Overview" key="1">
                                        <Row>
                                            <Col span={12}>{this.renderOverviewPieChart()}</Col>
                                            <Col span={12}>{this.renderOverviewMetrics()}</Col>
                                        </Row>
                                    </TabPane>
                                    <TabPane tab="Summary" key="2">
                                        <Row>
                                            <Col span={24} >{this.renderSummaryMetrics()}</Col>
                                            <Col span={24} style={{marginTop: '-10px'}}>{this.renderOverviewBarChart()}</Col>
                                        </Row>
                                    </TabPane>
                                </Tabs>
                            </Col>
                            <Col xl={12} lg={24} style={{paddingLeft: '5px'}}>
                                <Tabs 
                                        animated={false} 
                                        defaultActiveKey="1" 
                                        size="small"
                                        style={{...newLayoutStyle, height: '395'}}
                                        tabBarStyle={{backgroundColor: tabBackgroundColor}}
                                >
                                    <TabPane 
                                            tab="Performance" 
                                            key="1" 
                                            style={{paddingBottom: '20px', height: '350px', overflow: 'hidden', overflowY: 'scroll'}}
                                    >
                                        <Col span={24} style={{paddingBottom: '20px', paddingLeft: '10px'}}>
                                            <MyChartNew series={this.state.tickers} hideLegend={true}/>
                                        </Col>
                                    </TabPane>
                                    <TabPane 
                                            tab="Composition" 
                                            key="2" 
                                            style={{paddingBottom: '20px', height: '350px', overflow: 'hidden', overflowY: 'scroll'}}
                                    >
                                        <Col span={24}>
                                            {this.renderStockTransactions()}
                                        </Col>
                                    </TabPane>
                                </Tabs>
                            </Col>
                        </Row>
                        <Row style={{margin: '10px 0'}}>
                            <DashboardCard title="My Portfolios" cardStyle={{paddingRight: '5px'}}>
                                {this.renderPortfolios()}
                            </DashboardCard>
                            <DashboardCard title="Advices" cardStyle={{paddingLeft: '5px'}}>
                                {this.renderSubscribedAdvices()}
                            </DashboardCard>
                        </Row>
                    </Col>
                </Row>  
        );
    }
}

const valueStyle = {
    color: '#1F9CC4',
    fontSize: '16px',
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
    backgroundColor: tabBackgroundColor, 
    padding: '5px 10px',
};

const contentStyle = {
    paddingTop: '20px', 
    height: '340px', 
    overflow: 'hidden', 
    overflowY: 'scroll'
};