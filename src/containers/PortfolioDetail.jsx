import * as React from 'react';
import * as Radium from 'radium';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import {Row, Col, Divider, Tabs, Radio, Card, Table, Button} from 'antd';
import {layoutStyle} from '../constants';
import {AdviceTransactionTable, AqHighChartMod, MetricItem} from '../components';
import {CreatePortfolioDialog} from '../containers';
import '../css/portfolioDetail.css';

const ReactHighcharts = require('react-highcharts');

const TabPane = Tabs.TabPane;
const {requestUrl, investorId, aimsquantToken} = require('../localConfig.js');

class PortfolioDetailImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            presentAdvices: [],
            toggleValue: 'advice',
            togglePerformance: 'dollar',
            stockPositions: [],
            portfolioMetrics: [],
            tickers: [],
            portfolioConfig: {
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45
                    },
                    width: 300,
                    height: 300
                },
                plotOptions: {
                    pie: {
                        innerSize: 100,
                        depth: 45
                    }
                },
                title: {
                    style:{display: 'none'}
                },
                series: [],
                colors: ["#e91e63", "#444", "#90ed7d", "#f7a35c", "#8085e9"],
            },
            performanceDollarSeries: [],
            performancepercentageSeries: [],
            performanceConfig: {
                colors: ["#e91e63", "#444", "#90ed7d", "#f7a35c", "#8085e9"],
                chart: {
                    type: 'bar',
                    width: 300,
                    height: 300
                },
                // xAxis: {
                //     categories: ['Performance']
                // },
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                },
                title: {
                    style:{display: 'none'}
                },
                series: []
            }
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
        return this.state.portfolioMetrics.map((metric, index) => (
            <Col span={3} style={{marginRight: 30}} key={index}>
                <MetricItem style={metricItemStyle} value={metric.value} label={metric.label} />
            </Col>
        ));
    }

    renderAdviceTransactions = () => {
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
            <Table 
                    pagination={false} 
                    size="middle"
                    style={{marginTop: 20, border: '1px solid #EAEAEA'}} 
                    columns={this.columns} 
                    dataSource={this.state.stockPositions} 
            />
        );
    }

    processPresentAdviceTransaction = (adviceTransactions) => {
        let advices = [];
        adviceTransactions.map((item, index) => {
            advices = item.advice === null 
                            ? this.addToMyPortfolio(advices, item, index) 
                            : this.addToAdvice(advices, item, index);
        });

        return advices;
    }

    addToMyPortfolio = (advices, item, key) => {
        const adviceIndex = _.findIndex(advices, advice => advice.id === null);
        return adviceIndex === -1 
                        ? this.addAdvicePosition(advices, item, key) 
                        : this.addAdvicePosition(advices, item, key, adviceIndex);
    }

    addToAdvice = (advices, item, key) => {
        const adviceIndex = _.findIndex(advices, advice => {
            if (item.advice !== null) {
                return advice.id === item.advice._id
            }
            return false;
        });
    
        return adviceIndex === -1 
                        ? this.addAdvicePosition(advices, item, key) 
                        : this.addAdvicePosition(advices, item, key, adviceIndex);
    }

    addAdvicePosition = (advices, item, key, adviceIndex = null) => {
        if (adviceIndex === null) {
            advices.push({
                id: item.advice ? item.advice._id : null,
                name: item.advice ? item.advice.name : 'My Portfolio',
                key,
                weight: '12.4%',
                profitLoss: '+12.4%',
                units: 1,
                netAssetValue: item.lastPrice * item.quantity,
                composition: [
                    {
                        key: 1,
                        adviceKey: key,
                        symbol: item.security.ticker,
                        shares: item.quantity,
                        modifiedShares: item.quantity,
                        price: item.lastPrice,
                        costBasic: item.avgPrice,
                        unrealizedPL: 1231,
                        weight: '12%',
                    }
                ]
            });
        } else {
            advices[adviceIndex].netAssetValue += item.lastPrice * item.quantity;
            advices[adviceIndex].composition.push({
                key: key + 1,
                adviceKey: advices[adviceIndex].key,
                symbol: item.security.ticker,
                shares: item.quantity,
                modifiedShares: item.quantity,
                price: item.lastPrice,
                costBasic: item.avgPrice,
                unrealizedPL: 1231,
                weight: '12%',
            });
        }

        return advices;
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

    componentWillMount() {
        const series = [];
        let performanceSeries = [...this.state.performanceConfig.series];
        const url = `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}`;
        const tickers = [...this.state.tickers];
        const performanceUrl = `${requestUrl}/performance/investor/${investorId}/${this.props.match.params.id}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => { // Getting details of portfolio
            if (response.data.benchmark) {
                tickers.push({ // Pushing data to get the benchmark performance to performance graph
                    name: response.data.benchmark.ticker,
                    show: true
                });
            }   
            this.setState({
                name: response.data.name,
                presentAdvices: this.processPresentAdviceTransaction(response.data.detail.subPositions),
                stockPositions: this.processPresentStockTransction(response.data.detail.positions),
                tickers
            });
            return axios.get(performanceUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => { // Getting Portfolio Performance
            let performanceSeries = response.data.simulated.portfolioValues.map((item, index) => {
                return [moment(item.date).valueOf(), item.netValue];
            });
            tickers.push({ // Pushing advice performance to performance graph
                name: 'Advice',
                show: true,
                data: performanceSeries
            });
            const portfolioMetrics = response.data.current.metrics.portfolioPerformance;
            const constituentDollarPerformance = response.data.current.metrics.constituentPerformance.map((item, index) => {
                return {name: item.ticker, data: [item.pnl]}
            });
            const constituentPercentagePerformance = response.data.current.metrics.constituentPerformance.map((item, index) => {
                return {name: item.ticker, data: [item.pnl_pct]}
            });
            const portfolioComposition = response.data.current.metrics.portfolioComposition.map((item, index) =>{
                return [item.ticker, Math.round(item.weight * 10000) / 100]
            });
            series.push({name: 'Composition', data: portfolioComposition});
            const metrics = [
                {value: portfolioMetrics.portfoliostats.netvalue, label: 'Net Value'},
                {value: portfolioMetrics.returns.annualreturn, label: 'Annual Return'},
                {value: portfolioMetrics.returns.averagedailyreturn, label: 'Average Daily Return'},
                {value: portfolioMetrics.returns.peaktotalreturn, label: 'Peak Total Return'},
                {value: portfolioMetrics.returns.totalreturn, label: 'Total Return'},
                {value: portfolioMetrics.drawdown.maxdrawdown, label: 'Max Draw Down'},
            ];
            this.setState({
                portfolioMetrics: metrics, 
                tickers,
                portfolioConfig: {
                    ...this.state.portfolioConfig, 
                    series
                },
                performanceDollarSeries: constituentDollarPerformance,
                performancepercentageSeries: constituentPercentagePerformance,
                performanceConfig: {
                    ...this.state.performanceConfig,
                    series: 
                            this.state.togglePerformance === 'dollar'
                            ? constituentDollarPerformance
                            : constituentPercentagePerformance
                }
            });
        })
        .catch(error => {
            console.log(error.message);
        })
    }

    render () {
        return (
            <Row style={{marginBottom: '20px'}}>
                <Col span={18} xs={24} md={24} lg={18} style={{...layoutStyle, padding: '0'}}>
                    <Row style={{padding: '20px 30px'}}>
                        <Col span={24}>
                            <h3 style={pageHeader}>{this.state.name}</h3>
                        </Col>
                        <Col span={24} style={{marginTop: '10px'}}>
                            <h4 style={metricsHeaderStyle}>Metrics</h4>
                            <Row style={{marginTop: '10px'}}>
                                {this.renderMetrics()}
                            </Row>
                        </Col>
                    </Row>
                    <Divider />
                    <Row style={{padding: '0 30px 20px 30px'}}>
                        <Col span={24}>
                            <h3 style={metricsHeaderStyle}>Summary</h3>
                            <Row style={{marginTop: '10px'}}>
                                <Col span={11}>
                                    <Col span={24} style={{...portfolioOverviewStyle}}>
                                        <h3 style={overviewHeaderStyle}>Portfolio Overview</h3>
                                        <ReactHighcharts config = {this.state.portfolioConfig} />
                                    </Col>
                                </Col>
                                <Col span={11} offset={2}>
                                    {/* <Radio.Group 
                                        defaultValue={this.state.togglePerformance} 
                                        onChange={this.handlePerformanceToggle} 
                                        size="small"
                                    >
                                        <Radio.Button value="dollar">Dollar</Radio.Button>
                                        <Radio.Button value="percentage">Percentage</Radio.Button>
                                    </Radio.Group> */}
                                    <Col span={24} style={{...performanceOverviewStyle}}>
                                        <h3 style={overviewHeaderStyle}>Performance Overview</h3>
                                        <ReactHighcharts config = {this.state.performanceConfig} />
                                    </Col>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tabs defaultActiveKey="2">
                                <TabPane tab="Portfolio" key="2" style={{padding: '20px 30px'}}>
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
                                        ? this.renderAdviceTransactions()
                                        : this.renderStockTransactions()
                                    }
                                </TabPane>
                                <TabPane tab="Performance" key="1" style={{padding: '20px 30px'}}>
                                    <Row>
                                        <Col span={24}>
                                            <AqHighChartMod tickers={this.state.tickers}/> 
                                        </Col>
                                    </Row>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </Col>
                <Col span={5} offset={1}>
                    <Row>
                        <Col span={24}>
                            <Button 
                                    type="primary" 
                                    style={{marginBottom: 20}} 
                                    onClick={() => this.props.history.push(
                                        '/dashboard/createportfolio', {pageTitle: 'Create Portfolio'}
                                    )}
                                    className="primary-btn"
                            >
                                Create Portfolio
                            </Button>
                        </Col>
                        <Col span={24}>
                            <Button
                                    onClick={() => this.props.history.push(
                                        `/dashboard/portfolio/transactions/${this.props.match.params.id}`, 
                                        {
                                            pageTitle: 'Add Transactions',
                                            advices: this.state.presentAdvices,
                                            stocksPositions: this.state.stockPositions
                                        }
                                    )}
                                    className="secondary-btn"
                            >Add Transactions</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const PortfolioDetail =  Radium(PortfolioDetailImpl);

const pageHeader = {
    fontFamily: 'Lato, sans-serif',
    fontSize: '20px'
}

const metricsHeaderStyle = {
    fontFamily: 'Lato, sans-serif',
    fontSize: '14px',
    fontWeight: '700'
}

const metricItemStyle = {
    padding: '10px'
}

const newLayoutStyle = {
    border: '2px solid red'
};

const portfolioOverviewStyle = {
    padding: '5px',
    borderRadius: '4px',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)'
};

const performanceOverviewStyle = {
    padding: '5px',
    borderRadius: '4px',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)'
};

const overviewHeaderStyle = {
    fontSize: '14px',
    margin: '10px 0 0 10px'
};