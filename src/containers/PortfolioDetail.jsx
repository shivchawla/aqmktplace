import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import {Row, Col, Divider, Tabs, Radio, Card, Table} from 'antd';
import {layoutStyle} from '../constants';
import {AdviceTransactionTable, AqHighChartMod} from '../components';

const TabPane = Tabs.TabPane;
const {requestUrl, investorId, aimsquantToken} = require('../localConfig.json');
const metrics = [
    {value: 72000, label: 'Net Value'},
    {value: 2000, label: 'Cash'},
    {value: 12000, label: 'Daily P/L'},
    {value: '46.2%', label: 'Total'},
    {value: 72000, label: 'Metric'},
    {value: '42.6%', label: 'Total'},
]

export class PortfolioDetail extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            presentAdvices: [],
            toggleValue: 'advice',
            stockPositions: [],
            portfolioMetrics: [],
            tickers: []
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
        ]
    }

    renderMetrics = () => {
        console.log(this.state.portfolioMetrics);
        return this.state.portfolioMetrics.map((item, index) => (
            <Col span={3} style={{marginRight: 30}} key={index}>
                <MetricItem value={item.value} label={item.label} />
            </Col>
        ));
    }

    renderPresentAdviceTransactions = () => {
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

    renderPresentStockTransactions = () => {
        return (
            <Table 
                    pagination={false} 
                    style={{marginTop: 20}} 
                    columns={this.columns} 
                    dataSource={this.state.stockPositions} 
            />
        );
    }

    processPresentAdviceTransaction = (adviceTransactions) => {
        const advices = [];
        adviceTransactions.map((item, index) => {
            const adviceIndex = _.findIndex(advices, advice => advice.id === item.advice);
            if (adviceIndex === -1) {
                advices.push({
                    id: item.advice,
                    name: item.advice !== null ? `Sample Advice ${index}` : 'My Portfolio',
                    key: index,
                    netAssetValue: item.quantity * item.lastPrice,
                    weight: '12.4%',
                    profitLoss: '+12.4%',
                    units: 1,
                    composition: [
                        {
                            key: 1,
                            adviceKey: index,
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
                advices[adviceIndex].netAssetValue = advices[adviceIndex].netAssetValue + (item.quantity * item.lastPrice);
                advices[adviceIndex].composition.push({
                    key: index + 1,
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
        });

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
        this.setState({stockPositions});
    }

    toggleView = (e) => {
        this.setState({toggleValue: e.target.value});
    }

    componentWillMount() {
        const url = `${requestUrl}/investor/${investorId}/portfolio/${this.props.match.params.id}`;
        const tickers = [...this.state.tickers];
        const performanceUrl = `${requestUrl}/performance/investor/${investorId}/${this.props.match.params.id}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(response.data);
            tickers.push({
                name: response.data.benchmark.ticker,
                show: true
            });
            this.processPresentStockTransction(response.data.detail.positions);
            this.setState({
                presentAdvices: this.processPresentAdviceTransaction(response.data.detail.subPositions),
                tickers
            });
            return axios.get(performanceUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => {
            console.log(response.data);
            let performanceSeries = response.data[0].current.portfolioValues.map((item, index) => {
                return [item.date * 1000, item.netValue];
            });
            console.log(performanceSeries);
            tickers.push({
                name: 'Advice',
                show: true,
                data: performanceSeries
            });
            const portfolioMetrics = response.data[0].current.metrics[0].portfolioPerformance;
            const metrics = [
                {value: portfolioMetrics.portfoliostats.netvalue, label: 'Net Value'},
                {value: portfolioMetrics.returns.annualreturn, label: 'Annual Return'},
                {value: portfolioMetrics.returns.averagedailyreturn, label: 'Average Daily Return'},
                {value: portfolioMetrics.returns.peaktotalreturn, label: 'Peak Total Return'},
                {value: portfolioMetrics.returns.totalreturn, label: 'Total Return'},
                {value: portfolioMetrics.drawdown.maxdrawdown, label: 'Max Draw Down'},
            ];
            this.setState({portfolioMetrics: metrics, tickers}, () => {
                console.log(this.state);
            });
        })
        .catch(error => {
            console.log(error.message);
        })
    }

    render () {
        return (
            <Row>
                <Col span={18} style={layoutStyle}>
                    <Row>
                        <Col span={24}>
                            <h3>Portfolio Name</h3>
                        </Col>
                        <Col span={24}>
                            <h4>Metrics</h4>
                            <Row>
                                {this.renderMetrics()}
                            </Row>
                        </Col>
                    </Row>
                    <Divider />
                    <Row>
                        <Col span={24}>
                            <h4>Summary</h4>
                            <Row>
                                <Col span={11}>
                                    <Card 
                                            title="Portfolio Overview"
                                    >
                                        <h4>Yo</h4>
                                    </Card>
                                </Col>
                                <Col span={11} offset={2}>
                                    <Card 
                                            title="Performance Overview"
                                    >
                                        <h4>Dude</h4>
                                    </Card>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tabs defaultActiveKey="2">
                                <TabPane tab="Performance" key="1">
                                    <Row>
                                        <Col span={24}>
                                            <AqHighChartMod tickers={this.state.tickers}/> 
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tab="Portfolio" key="2">
                                    <Row>
                                        <Col span={8} offset={16} style={{marginBottom: 20}}>
                                            <Radio.Group value={this.state.toggleValue} onChange={this.toggleView} style={{position: 'absolute', right: 0}}>
                                                <Radio.Button value="advice">Advice</Radio.Button>
                                                <Radio.Button value="stock">Stock</Radio.Button>
                                            </Radio.Group>
                                        </Col>
                                    </Row>
                                    {
                                        this.state.toggleValue === 'advice'
                                        ? this.renderPresentAdviceTransactions()
                                        : this.renderPresentStockTransactions()
                                    }
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

const MetricItem = ({value, label}) => {
    return (
        <Row style={metricItemStyle}>
            <Col span={24}><h5>{value}</h5></Col>
            <Col><h5>{label}</h5></Col>
        </Row>
    );
};

const metricItemStyle = {
    padding: 10,
    boxShadow: '0px 3px 8px rgba(0,0,0,0.2)'
};