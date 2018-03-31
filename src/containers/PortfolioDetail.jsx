import * as React from 'react';
import * as Radium from 'radium';
import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import {Row, Col, Divider, Tabs, Radio, Card, Table, Button, Collapse} from 'antd';
import {CreatePortfolioDialog} from '../containers';
import {MyChartNew} from './MyChartNew';
import '../css/portfolioDetail.css';
import {convertToPercentage} from '../utils';
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
            barSeries: []
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
            console.log(advice);
            // const profitLoss = `${((advice.price - advice.costBasic) / adviceNetValue).toFixed(2)} %`
            return {
                ...advice,
                weight: `${((advice.netAssetValue / totalWeight) * 100).toFixed(2)} %`,
                // profitLoss
            }
        })
    }

    getNetValue = advices => {
        let netValue = 0;
        advices.map(item => {
            console.log(item.name, this.getNetValueForAdvice(item))
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
            const advices = this.updateAdvices(this.processPresentAdviceTransaction(response.data.detail.subPositions));
            this.setState({
                name: response.data.name,
                presentAdvices: advices,
                stockPositions: response.data.detail.positions,
                tickers
            });
            return axios.get(performanceUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => { // Getting Portfolio Performance
            let performanceSeries = response.data.simulated.portfolioValues.map((item, index) => {
                return [moment(item.date).valueOf(), item.netValue];
            });
            tickers.push({ // Pushing advice performance to performance graph
                name: 'Portfolio',
                data: performanceSeries
            });
            const portfolioMetrics = response.data.summary.current;
            const constituentDollarPerformance = response.data.current.metrics.constituentPerformance.map((item, index) => {
                return {name: item.ticker, data: [item.pnl]}
            });
            const constituentPercentagePerformance = response.data.current.metrics.constituentPerformance.map((item, index) => {
                return {name: item.ticker, data: [item.pnl_pct]}
            });
            const portfolioComposition = response.data.current.metrics.portfolioMetrics.composition.map((item, index) =>{
                return {name: item.ticker, y: Math.round(item.weight * 10000) / 100};
            });
            series.push({name: 'Composition', data: portfolioComposition});
            const metrics = [
                {value: portfolioMetrics.netValue, label: 'Net Value'},
                {value: portfolioMetrics.dailyChange, label: 'Daily Change', percentage: true},
                {value: portfolioMetrics.annualReturn, label: 'Annual Return', percentage: true},
                {value: portfolioMetrics.totalReturn, label: 'Total Return', percentage: true},
                {value: portfolioMetrics.volatility, label: 'Volatility', percentage: true},
                {value: portfolioMetrics.currentLoss, label: 'Current Loss', percentage: true},
            ];
            this.setState({
                portfolioMetrics: metrics, 
                tickers,
                performanceDollarSeries: constituentDollarPerformance,
                performancepercentageSeries: constituentPercentagePerformance,
                pieSeries: series,
                barSeries: constituentDollarPerformance
            });
        })
        .catch(error => {
            console.log(error.message);
        });
    }

    render () {
        return (
            <Row style={{margin: '20px 0'}}>
                <Col span={18} xs={24} md={24} lg={18} style={{...newLayoutStyle, padding: '0'}}>
                    <Row style={{padding: '20px 30px'}}>
                        <Col span={24}>
                            <h3 style={pageHeaderStyle}>{this.state.name}</h3>
                        </Col>
                        <Col span={24} style={{marginTop: '10px'}}>
                            <h4 style={metricsHeaderStyle}>Metrics</h4>
                            <Row style={{marginTop: '10px'}}>
                                {this.renderMetrics()}
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={dividerStyle}></Col>
                    </Row>
                    <Collapse bordered={false} defaultActiveKey={['1', '2']}>
                        <Panel 
                                key='1'
                                style={customPanelStyle} 
                                header={<h3 style={metricsHeaderStyle}>Summary</h3>}
                        >   
                            <Row style={{padding: '0 30px 20px 30px'}}>
                                <Col span={24}>
                                    <Row style={{marginTop: '10px'}}>
                                        <AqCard title="Portfolio Summary">
                                            <HighChartNew series={this.state.pieSeries} />
                                        </AqCard>        
                                        {/* <Radio.Group 
                                            defaultValue={this.state.togglePerformance} 
                                            onChange={this.handlePerformanceToggle} 
                                            size="small"
                                        >
                                            <Radio.Button value="dollar">Dollar</Radio.Button>
                                            <Radio.Button value="percentage">Percentage</Radio.Button>
                                        </Radio.Group> */}
                                        <AqCard title="Performance Summary" offset={2}>
                                            <HighChartBar series={this.state.barSeries} />
                                        </AqCard>
                                    </Row>
                                </Col>
                            </Row>
                        </Panel>
                        <Panel
                                key='2'
                                style={customPanelStyle} 
                                header={<h3 style={metricsHeaderStyle}>Detail</h3>}
                        >
                            <Row>
                                <Col span={24}>
                                    <Tabs animated={false}>
                                        <TabPane tab="Portfolio" key="1" style={{padding: '20px 30px'}}>
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