import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Tabs, Select, Table, Button} from 'antd';
import {AqHighChartMod, MetricItem, PortfolioListItem, AdviceListItem} from '../components';
import {layoutStyle} from '../constants';

const {requestUrl, aimsquantToken, investorId} = require('../localConfig');
const TabPane = Tabs.TabPane;
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
        };
        this.stockPositionColumns = [
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
    componentWillMount() {
        this.getDefaultPortfolioData();
        this.getInvestorPortfolios();
        this.getInvestorSubscribedAdvices();
    }

    getDefaultPortfolioData = () => {
        const url = `${requestUrl}/investor/${investorId}`;
        const tickers = [...this.state.tickers];
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const performance = response.data.defaultPerformance.current.metrics.portfolioPerformance;
            const performanceUrl = `${requestUrl}/performance/investor/${investorId}/${response.data.defaultPortfolio._id}`;
            const performanceData = response.data.defaultPerformance.simulated.portfolioValues.map(item => [moment(item.date).valueOf(), item.netValue]);
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
                stockPositions: this.processPresentStockTransction(response.data.defaultPortfolio.detail.positions),
                metrics: {
                    beta: performance.ratios.beta,
                    sharperatio: performance.ratios.sharperatio,
                    annualreturn: performance.returns.annualreturn,
                    averagedailyreturn: performance.returns.averagedailyreturn,
                    dailyreturn: performance.returns.dailyreturn,
                    totalreturn: performance.returns.totalreturn
                },
                tickers
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
            this.setState({investorPortfolios: response.data});
        })
        .catch(error => {
            console.log(error);
        });
    }

    getInvestorSubscribedAdvices = () => {
        const subscribedAdvicesUrl = `${requestUrl}/advice?subscribed=true`;
        axios.get(subscribedAdvicesUrl, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({subscribedAdvices: response.data});
        })
        .catch(error => {
            console.log(error);
        });
    }

    renderMetrics = () => {
        const {beta, sharperatio, annualreturn, averagedailyreturn, dailyreturn, totalreturn} = this.state.metrics;

        return (
            <Row type="flex" justify="space-between" style={metricStyle}>
                <Col span={4}>
                    <MetricItem label="Beta" value={beta} />
                </Col>
                <Col span={4}>
                    <MetricItem label="Sharpe Ratio" value={sharperatio} />
                </Col>
                <Col span={4}>
                    <MetricItem label="Annual Return" value={annualreturn} />
                </Col>
                <Col span={4}>
                    <MetricItem label="Average Daily Return" value={averagedailyreturn} />
                </Col>
                <Col span={4}>
                    <MetricItem label="Daily Return" value={dailyreturn} />
                </Col>
                <Col span={4}>
                    <MetricItem label="Total Return" value={totalreturn} />
                </Col>
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
            <Tabs defaultKey="1">
                <TabPane tab="Portfolios" key="1">
                    <Row>
                        <Col span={6} offset={18} style={{marginBottom: 20}}>
                            {this.renderPortfolioSortMenu()}
                        </Col>
                        <Col span={24}>
                            {this.renderPortfolios()}
                        </Col>
                    </Row>
                </TabPane>
                <TabPane tab="Subscribed Advices" key="2">
                    <Row>
                        <Col span={6} offset={18} style={{marginBottom: 20}}>
                            {this.renderAdvicesSortMenu()}
                        </Col>
                        <Col span={24}>
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
            return <PortfolioListItem key={index} portfolio={portfolio}/>
        });
    }

    renderSubscribedAdvices = () => {
        const advices = this.state.subscribedAdvices;

        return advices.map((advice, index) => {
            const adviceItem = {
                id: advice._id,
                name: advice.name,
                advisor: advice.advisor,
                createdDate: advice.createdDate,
                heading: advice.heading,
                subscribers: advice.numSubscribers,
                rating: advice.latestAnalytics.rating,
                latestPerformance: advice.latestPerformance
            }
            return (
                <AdviceListItem key={index} advice={adviceItem}/>
            );
        })
    }

    processPresentStockTransction = (stockTransactions) => {
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

    renderStockTransactions = () => {
        return (
            <Table 
                    pagination={false} 
                    style={{marginTop: 20}} 
                    columns={this.stockPositionColumns} 
                    dataSource={this.state.stockPositions} 
            />
        );
    }

    toggleCompositionView = (e) => {
        this.setState({compositionToggle: e.target.value});
    }

    render() {
        return(
            <Row>
                <Col style={layoutStyle} span={18}>
                    <Row>
                        <Col span={24}>
                            <h3>Portfolio Overview</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <h4>Metrics</h4>
                            {this.renderMetrics()}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tabs defaultKey="1">
                                <TabPane tab="Performance" key="1">
                                    <AqHighChartMod tickers={this.state.tickers} />
                                </TabPane>
                                <TabPane tab="Composition" key="2">
                                    {this.renderStockTransactions()}
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                    <Row>
                        {this.renderTabs()}
                    </Row>
                </Col>
                <Col span={6}>
                    <Button 
                            type="primary" 
                            onClick={() => this.props.history.push('/dashboard/createportfolio')}
                    >
                        Create Portfolio
                    </Button>
                </Col>
            </Row>
        );
    }
}

const metricStyle = {
    backgroundColor: '#E1ECFB',
    padding: '10px',
    borderRadius: '4px'
}