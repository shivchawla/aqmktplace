import * as React from 'react';
import * as Radium from 'radium';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import {Row, Col, Divider, Tabs, Radio, Card, Table, Button, Collapse} from 'antd';
import {CreatePortfolioDialog} from '../containers';
import {MyChartNew} from './MyChartNew';
import '../css/portfolioDetail.css';
import {convertToPercentage, generateColorData} from '../utils';
import {
    AdviceTransactionTable, 
    AqHighChartMod, 
    MetricItem, 
    AqCard, 
    HighChartNew, 
    HighChartBar, 
    AqPortfolioTable,
    AdviceMetricsItems
} from '../components';
import {
    newLayoutStyle, 
    metricsHeaderStyle, 
    pageHeaderStyle, 
    metricsLabelStyle, 
    metricsValueStyle, 
    dividerStyle
} from '../constants';

const dateFormat = 'YYYY-MM-DD';
const Panel = Collapse.Panel;
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
            performanceDollarSeries: [],
            performancepercentageSeries: [],
            pieSeries: [],
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
            <AqPortfolioTable style={{marginTop: '20px'}} positions={this.state.stockPositions} />
        );
    }

    processPresentAdviceTransaction = (adviceTransactions, advicePerformance) => {
        let advices = [];
        console.log('Advice Performance', advicePerformance);
        adviceTransactions.map((item, index) => {
            advices = item.advice === null 
                            ? this.addToMyPortfolio(advices, advicePerformance, item, index) 
                            : this.addToAdvice(advices, advicePerformance, item, index);
        });

        return advices;
    }

    addToMyPortfolio = (advices, advicePerformance, item, key) => {
        const adviceIndex = _.findIndex(advices, advice => advice.id === null);
        return adviceIndex === -1 
                        ? this.addAdvicePosition(advices, advicePerformance, item, key) 
                        : this.addAdvicePosition(advices, advicePerformance, item, key, adviceIndex);
    }

    addToAdvice = (advices, advicePerformance, item, key) => {
        const adviceIndex = _.findIndex(advices, advice => {
            if (item.advice !== null) {
                return advice.id === item.advice._id
            }
            return false;
        });
    
        return adviceIndex === -1 
                        ? this.addAdvicePosition(advices, advicePerformance, item, key) 
                        : this.addAdvicePosition(advices, advicePerformance, item, key, adviceIndex);
    }

    addAdvicePosition = (advices, advicePerformance, item, key, adviceIndex = null) => {
        const advice = advicePerformance.filter(adviceItem => {
            if (item.advice !== null) {
                return item.advice._id === adviceItem.advice;
            } else {
                return adviceItem.advice === "";
            }
        })[0];

        if (adviceIndex === null) {
            advices.push({
                id: item.advice ? item.advice._id : null,
                name: item.advice ? item.advice.name : 'My Portfolio',
                key,
                weight: Number((advice.personal.weightInPortfolio * 100).toFixed(2)),
                profitLoss: (advice.personal.pnlPct).toFixed(2),
                units: 1,
                netAssetValue: Number((advice.personal.netValue).toFixed(2)),
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
                        name: item.security.detail ? item.security.detail.Nse_Name : 'undefined',
                        sector: item.security.detail ? item.security.detail.Sector : 'undefined'
                    }
                ]
            });
        } else {
            // advices[adviceIndex].netAssetValue += item.lastPrice * item.quantity;
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
                name: item.security.detail ? item.security.detail.Nse_Name : 'undefined',
                sector: item.security.detail ? item.security.detail.Sector : 'undefined'
            });
        }

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

    componentWillMount() {
        const series = [];
        let positions = [];
        const url = `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}`;
        const tickers = [...this.state.tickers];
        const performanceUrl = `${requestUrl}/performance/investor/${investorId}/${this.props.match.params.id}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => { // Getting details of portfolio
            if (response.data.benchmark) {
                tickers.push({ // Pushing data to get the benchmark performance to performance graph
                    name: response.data.benchmark.ticker,
                });
            }   
            const advicePerformance = response.data.advicePerformance;
            const subPositions = response.data.detail.subPositions;
            // const advices = this.updateAdvices(this.processPresentAdviceTransaction(subPositions, advicePerformance));
            const advices = this.processPresentAdviceTransaction(subPositions, advicePerformance);
            positions = response.data.detail.positions.map(item => item.security.ticker);
            this.setState({
                name: response.data.name,
                presentAdvices: advices,
                stockPositions: response.data.detail.positions,
                tickers
            });
            return axios.get(performanceUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => { // Getting Portfolio Performance
            const colorData = generateColorData(positions);
            let performanceSeries = [];
            if (response.data.simulated !== undefined) {
                performanceSeries = response.data.simulated.portfolioValues.map((item, index) => {
                    return [moment(item.date, dateFormat).valueOf(), item.netValue];
                });
            } else {
                performanceSeries = response.data.current.portfolioValues.map((item, index) => {
                    return [moment(item.date, dateFormat).valueOf(), item.netValue];
                });
            }
            
            tickers.push({ // Pushing advice performance to performance graph
                name: 'Portfolio',
                data: performanceSeries
            });
            const portfolioMetrics = response.data.summary.current;
            const constituentDollarPerformance = response.data.current.metrics.constituentPerformance.map((item, index) => {
                return {name: item.ticker, data: [Number(item.pnl.toFixed(2))], color: colorData[item.ticker]}
            });
            const constituentPercentagePerformance = response.data.current.metrics.constituentPerformance.map((item, index) => {
                return {name: item.ticker, data: [Number(item.pnl_pct.toFixed(2))], color: colorData[item.ticker]}
            });
            const portfolioComposition = response.data.current.metrics.portfolioMetrics.composition.map((item, index) =>{
                return {name: item.ticker, y: Math.round(item.weight * 10000) / 100, color: colorData[item.ticker]};
            });
            series.push({name: 'Composition', data: portfolioComposition});
            const metrics = [
                {value: portfolioMetrics.annualReturn.toFixed(2), label: 'Annual Return', percentage: true},
                {value: portfolioMetrics.totalReturn.toFixed(2), label: 'Total Return', percentage: true},
                {value: portfolioMetrics.volatility.toFixed(2), label: 'Volatility', percentage: true},
                {value: portfolioMetrics.dailyChange.toFixed(2), label: 'Daily Change (Rs)'},
                {value: portfolioMetrics.dailyChangePct.toFixed(2), label: 'Daily Change (%)', percentage: true},
                {
                    value: portfolioMetrics.netValue.toFixed(2), 
                    label: 'Net Value', 
                    isNetValue: true, 
                }
            ];
            this.setState({
                portfolioMetrics: metrics, 
                tickers,
                performanceDollarSeries: constituentDollarPerformance,
                performancepercentageSeries: constituentPercentagePerformance,
                pieSeries: series,
            });
        })
        .catch(error => {
            console.log(error.message);
        });
    }

    render () {
        return (
            <Row style={{margin: '20px 0'}}>
                <Col xl={18} md={24} style={{...newLayoutStyle, padding: '0'}}>
                    <Row style={{padding: '20px 30px'}}>
                        <Col span={24}>
                            <Row>
                                <Col span={10}>
                                    <h3 style={pageHeaderStyle}>{this.state.name}</h3>
                                </Col>
                                <Col xl={0} md={14} style={{textAlign: 'right'}}>
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
                                            style = {{marginLeft: '20px'}}
                                    >
                                        Add Transactions
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24} style={{marginTop: '10px'}}>
                            <Row>
                                {this.renderMetrics()}
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={dividerStyle}></Col>
                    </Row>
                    <Collapse bordered={false} defaultActiveKey={["2"]}>
                        <Panel 
                                key="1"
                                style={customPanelStyle} 
                                header={<h3 style={metricsHeaderStyle}>Summary</h3>}
                        >   
                            <Row style={{padding: '0 30px 20px 30px'}} className="row-container">
                                <Col span={24}>
                                    <Row style={{marginTop: '10px'}}>
                                        <AqCard title="Portfolio Summary">
                                            <HighChartNew series={this.state.pieSeries} />
                                        </AqCard>        
                                        <AqCard title="Performance Summary" offset={2}>
                                            <HighChartBar 
                                                    dollarSeries={this.state.performanceDollarSeries} 
                                                    percentageSeries={this.state.performancepercentageSeries}
                                                    legendEnabled={false}
                                            />
                                        </AqCard>
                                    </Row>
                                </Col>
                            </Row>
                        </Panel>
                        <Panel
                                key="2"
                                style={customPanelStyle} 
                                header={<h3 style={metricsHeaderStyle}>Detail</h3>}
                        >
                            <Row>
                                <Col span={24}>
                                    <Tabs animated={false}>
                                        <TabPane tab="Advices" key="1" style={{padding: '0 30px'}}>
                                            <Row className="row-container">
                                                <Col span={8} offset={16} style={{marginBottom: 10, marginTop: '-10px'}}>
                                                    <Radio.Group 
                                                            value={this.state.toggleValue} 
                                                            onChange={this.toggleView} 
                                                            style={{position: 'absolute', right: 0}}
                                                            size="small"
                                                    >
                                                        <Radio.Button value="advice">Advices</Radio.Button>
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
                                        <TabPane tab="Performance" key="2" style={{padding: '20px 30px'}}>
                                            <Row>
                                                <Col span={24}>
                                                    <MyChartNew series={this.state.tickers}/> 
                                                </Col>
                                            </Row>
                                        </TabPane>
                                    </Tabs>
                                </Col>
                            </Row>
                        </Panel>
                    </Collapse>
                </Col>
                <Col xl={5} md={0} offset={1}>
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
                            >
                                Add Transactions
                            </Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const PortfolioDetail =  Radium(PortfolioDetailImpl);

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