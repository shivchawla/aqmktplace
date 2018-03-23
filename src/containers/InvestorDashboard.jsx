import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import {Link} from 'react-router-dom';
import {Row, Col, Tabs, Select, Table, Button, Divider, Rate, Tag, Radio} from 'antd';
import {AqHighChartMod, MetricItem, PortfolioListItem, AdviceListItem, ListMetricItem} from '../components';
import {layoutStyle, pageHeaderStyle, metricsHeaderStyle, newLayoutStyle, listMetricItemLabelStyle, listMetricItemValueStyle} from '../constants';

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
            portoflioConfig: {
                chart: {
                    type: 'pie',
                    height: 280,
                },
                title: {
                    text: '',
                    align: 'center',
                    verticalAlign: 'middle',
                    y: -5,
                    x: -70,
                    style: {
                        fontSize: '16px',
                        color: '#3A4F84'
                    }
                },
                tooltip: {
                    enabled: true
                },
                plotOptions: {
                    pie: {
                        innerSize: 150,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '{point.name} {point.percentage:.1f}%',
                            distance: -15,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 0
                            }
                        },
                        showInLegend: true,
                        ...this.portfolioConfigEvents()
                    },
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    itemDistance: '30px',
                    itemStyle: {
                        color: '#444',
                        fontSize:'14px',
                        fontWeight: '400',
                        marginBottom: '20px',
                    },
                    itemWidth: 120,
                    verticalAlign: 'middle',
                    itemMarginBottom:10
                },
                series: [],
                colors: ["#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"],
            },
            sectorSeries: [],
            industySeries: [],
            positions: [],
            composition: []
        };
        this.stockPositionColumns = [
            {
                title: 'NAME',
                dataIndex: 'name',
                key: 'name',
                render: text => <h3 style={{width: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 400}} href="#">{text}</h3>,
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
                title: 'AVG. PRICE',
                dataIndex: 'avgPrice',
                key: 'avgPrice'
            }
        ];
        this.adviceColumns = [
            {
                title: 'NAME',
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => {
                    return <Link to={`advice/${record.id}`}>{text}</Link>
                }
            },
            {
                title: 'RETURN',
                dataIndex: 'return',
                key: 'return',
                render: returnValue => {
                    let color = returnValue < 0 ? '#ED4D4D' : '#3DC66B';
                    return <h3 style={{fontSize: '14px', color}}>{`${returnValue} %`}</h3>
                }
            },
            {
                title: 'NET VALUE',
                dataIndex: 'netValue',
                key: 'netValue',
            },
            {
                title: 'RATING',
                dataIndex: 'rating',
                key: 'rating',
                render: text => <Rate disabled value={Number(text) / 2}/>
            },
            {
                title: '',
                dataIndex: 'isSubscribed',
                key: 'isSubscribed',
                render: isSubscribed => {
                    const tagContent = isSubscribed ? {text: 'Subscribed', color: '#108ee9'} : {text: 'Not Subscribed', color: '#D2AA25'};
                    return <Tag color={tagContent.color} style={{textAlign: 'center'}}>{tagContent.text}</Tag>
                }
            },
            {
                title: '',
                dataIndex: 'isFollowing',
                key: 'isFollowing',
                render: isFollowing => {
                    const tagContent = isFollowing ? {text: 'WishListed', color: '#108ee9'} : {text: 'Not Wishlisted', color: '#D2AA25'};
                    return <Tag color={tagContent.color} style={{textAlign: 'center'}}>{tagContent.text}</Tag>
                }
            }
        ]
    }

    portfolioConfigEvents = () => ({
        events: {
            click: e => {
                this.setState({
                    portoflioConfig: {
                        ...this.state.portoflioConfig,
                        title: {
                            ...this.state.portoflioConfig.title,
                            text: `${e.point.name}<br>${e.point.y}`
                        }
                    },
                    subscriberStats: {...this.state.subscriberStats, selectedAdviceSubscribers: e.point.y}
                });
            }
        }
    })

    getDefaultPortfolioData = () => {
        const url = `${requestUrl}/investor/${investorId}`;
        const tickers = [...this.state.tickers];
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(response.data);
            const positions = response.data.defaultPortfolio.detail.positions;
            const composition = this.processTransactionsForChart(response.data.defaultPerformance.current.metrics.portfolioComposition);
            const performance = response.data.defaultPerformance.current.metrics.portfolioPerformance;
            const performanceUrl = `${requestUrl}/performance/investor/${investorId}/${response.data.defaultPortfolio._id}`;
            const performanceData = response.data.defaultPerformance.simulated.portfolioValues.map(item => [moment(item.date).valueOf(), item.netValue]);
            const pieChartTitle = `${composition[0].data[0].name}<br>${composition[0].data[0].y}`;
            tickers.push({
                name: 'Default Portfolio',
                data: performanceData,
                show: true
            });
            tickers.push({
                name: response.data.defaultPortfolio.benchmark.ticker,
                show: true
            });
            this.setState({
                positions,
                composition,
                stockPositions: this.processPresentStockTransction(positions),
                metrics: {
                    beta: performance.ratios.beta,
                    sharperatio: performance.ratios.sharperatio,
                    annualreturn: performance.returns.annualreturn,
                    averagedailyreturn: performance.returns.averagedailyreturn,
                    dailyreturn: performance.returns.dailyreturn,
                    totalreturn: performance.returns.totalreturn
                },
                portoflioConfig: {
                    ...this.state.portoflioConfig, 
                    series: composition,
                    title: {
                        ...this.state.portoflioConfig.title,
                        text: pieChartTitle
                    }
                },
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
            console.log(response.data);
            this.setState({subscribedAdvices: this.processSubscribedAdvices(response.data)});
            return axios.get(followingAdviceUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => {
            const {subscribedAdvices} = this.state;
            const followingAdvices = response.data;
            followingAdvices.map((advice, index) => {
                const {name, latestPerformance} = advice;
                if(_.findIndex(subscribedAdvices, presentAdvice => presentAdvice.id === advice._id) === -1) {
                    subscribedAdvices.push({
                        id: advice._id,
                        key: index,
                        name: advice.name,
                        return: Number(latestPerformance.return * 100).toFixed(2),
                        netValue: latestPerformance.netValue,
                        rating: latestPerformance.rating,
                        isFollowing: advice.isFollowing,
                        isSubscribed: advice.isSubscribed
                    });
                }
            });
            this.setState({subscribedAdvices});
        })
        .catch(error => {
            console.log(error);
        });
    }

    renderMetrics = () => {
        const {beta, sharperatio, annualreturn, averagedailyreturn, dailyreturn, totalreturn} = this.state.metrics;

        return (
            <Row type="flex" justify="space-between" style={{paddingTop: '0px'}}>
                <MetricItem label="Beta" value={beta} />
                <MetricItem label="Sharpe Ratio" value={sharperatio} />
                <MetricItem label="Annual Return" value={annualreturn} />
                <MetricItem label="Avg Daily Return" value={averagedailyreturn} />
                <MetricItem label="Daily Return" value={dailyreturn} />
                <MetricItem label="Total Return" value={totalreturn} />
            </Row>
        );
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
            <Tabs defaultActiveKey="2" style={{height: '350px'}}>
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
                return: Number(portfolio.performance.return).toFixed(2),
                volatility: portfolio.performance.volatility
            }
        });
    }

    processSubscribedAdvices = advices => {
        return advices.map((advice, index) => {
            const {name, latestPerformance, isSubscribed, isFollowing} = advice;
            return {
                id: advice._id,
                key: index,
                name: advice.name,
                return: Number(latestPerformance.return * 100).toFixed(2),
                netValue: latestPerformance.netValue,
                rating: latestPerformance.rating,
                isSubscribed,
                isFollowing
            };
        });
    }

    renderSubscribedAdvices = () => {
        return (
            <Table 
                    columns={this.adviceColumns} 
                    dataSource={this.state.subscribedAdvices} 
                    pagination={false}
                    size="middle"
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

    processTransactionsForChart = composition => {
        const chartData = [];
        const seriesData = [];
        composition.map(item => {
            const weight = Number((item.weight * 100).toFixed(2));
            if (weight > 0) {
                chartData.push({
                    name: item.ticker,
                    y: Number((item.weight * 100).toFixed(2)),
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
                    style={{paddingLeft: '10px'}} 
                    size="middle"
                    columns={this.stockPositionColumns} 
                    dataSource={this.state.stockPositions} 
            />
        );
    }

    toggleCompositionView = (e) => {
        this.setState({compositionToggle: e.target.value});
    }

    handleOverviewSelectChange = e => {
        const {positions, composition} = this.state;
        const choice = e.target.value;
        let series = [];
        switch(choice) {
            case "stocks":
                series = composition;
                break;
            case "sectors":
                series = this.processSectorsForChart(positions, composition[0].data);
                break;
            case "industries":
                series = this.processIndustriesForChart(positions, composition[0].data);
                break;
            default:
                break;
        }
        this.setState({
            portoflioConfig: {
                ...this.state.portoflioConfig, 
                title: {
                    ...this.state.portoflioConfig.title,
                    text: `${series[0].data[0].name}<br>${series[0].data[0].y}`
                },
                series,
            },

        });
    }

    componentWillMount() {
        this.getDefaultPortfolioData();
        this.getInvestorPortfolios();
        this.getInvestorSubscribedAdvices();
    }

    render() {
        const {beta, sharperatio, annualreturn, averagedailyreturn, dailyreturn, totalreturn} = this.state.metrics;

        return(
            <Row style={{paddingBottom: '20px'}}>
                <Col span={24}>
                    <Row style={newLayoutStyle}>
                        <Col span={24}>
                            <Tabs defaultActiveKey="2" size="small">
                                <TabPane tab="Performance" key="1" style={{paddingBottom: '20px', height: '350px'}}>
                                    <Col span={14}>
                                        <AqHighChartMod showLegend={false} tickers={this.state.tickers} />
                                    </Col>
                                    <Col span={1} style={{height: '100%', paddingBottom: '15px', marginLeft: '2%'}}>
                                        <Divider type="vertical" style={{height: '100%', color: '#e91e63'}}/>
                                    </Col>
                                    <Col span={8} style={{height: '100%', marginLeft: '-2%'}}>
                                        <Row style={{height: '100%'}}>
                                            <Col span={24}>
                                                <h3 style={{textAlign: 'center', position: 'absolute', left: 0, right: 0}}>Metrics</h3>
                                            </Col>
                                            <Col span={24} style={{height: '93%', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                                                <Row style={{textAlign: 'center', paddingLeft: '15px'}}> 
                                                    <Col span={8}>
                                                        <MetricItem 
                                                                valueStyle={valueStyle} 
                                                                labelStyle={labelStyle} 
                                                                label="Beta" 
                                                                value={beta}
                                                        />
                                                    </Col>
                                                    <Col span={8}>
                                                        <MetricItem 
                                                            valueStyle={valueStyle} 
                                                            labelStyle={labelStyle} 
                                                                label="Sharpe Ratio" 
                                                                value={sharperatio}
                                                        />
                                                    </Col>
                                                    <Col span={8}>
                                                        <MetricItem 
                                                                valueStyle={valueStyle} 
                                                                labelStyle={labelStyle} 
                                                                label="Annual Return" 
                                                                value={annualreturn}
                                                        />
                                                    </Col>
                                                </Row>
                                                <Row style={{textAlign: 'center', paddingLeft: '15px', marginTop: '50px'}}>
                                                    <Col span={8}>
                                                        <MetricItem 
                                                                valueStyle={valueStyle} 
                                                                labelStyle={labelStyle} 
                                                                label="Daily Return" 
                                                                value={dailyreturn}
                                                        />
                                                    </Col>
                                                    <Col span={8}>
                                                        <MetricItem 
                                                                valueStyle={valueStyle} 
                                                                labelStyle={labelStyle} 
                                                                label="Total Return" 
                                                                value={totalreturn}
                                                        />
                                                    </Col>
                                                    <Col span={8}>
                                                        <MetricItem 
                                                                valueStyle={valueStyle} 
                                                                labelStyle={labelStyle} 
                                                                label="Avg Daily Return" 
                                                                value={averagedailyreturn}
                                                        />
                                                    </Col>
                                                </Row>
                                            </Col>
                                        </Row>
                                    </Col>
                                </TabPane>
                                <TabPane tab="Composition" key="2" style={{paddingBottom: '20px', height: '350px'}}>
                                    <Col span={14}>
                                        {this.renderStockTransactions()}
                                    </Col>
                                    <Col span={1} style={{height: '100%', paddingBottom: '10px', marginLeft: '2%'}}>
                                        <Divider type="vertical" style={{height: '100%', color: '#e91e63'}}/>
                                    </Col>
                                    <Col span={8}>
                                        <Row>
                                            <Col span={24}>
                                                <h3 style={{textAlign: 'center'}}>Overview</h3>
                                            </Col>
                                            <Col span={24} style={{textAlign: 'center', marginTop: '10px'}}>
                                                <RadioGroup onChange={this.handleOverviewSelectChange} defaultValue="stocks" size="small">
                                                    <RadioButton value="stocks">Stocks</RadioButton>
                                                    <RadioButton value="sectors">Sectors</RadioButton>
                                                    <RadioButton value="industries">Industries</RadioButton>
                                                </RadioGroup>
                                            </Col>
                                            <Col span={24}>
                                                <ReactHighcharts config = {this.state.portoflioConfig} />
                                            </Col>
                                        </Row>
                                    </Col>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={15} style={{...newLayoutStyle, marginTop: '20px'}} >
                            {this.renderTabs()}
                        </Col>
                        <Col span={8} offset={1} style={{...newLayoutStyle, marginTop: '20px', height: '350px'}}></Col>
                    </Row>
                </Col>
                {/* <Col span={5} offset={1} style={{marginTop: '20px'}}>
                    <Button 
                            type="primary"
                            className="primary-btn" 
                            onClick={() => this.props.history.push('/dashboard/createportfolio')}
                    >
                        Create Portfolio
                    </Button>
                </Col> */}
            </Row>
        );
    }
}

const valueStyle = {
    color: '#1F9CC4',
    fontSize: '26px',
    fontWeight: '400'
};

const labelStyle = {
    color: '#707070',
    fontSize: '14px',
    fontWeight: '400'
};