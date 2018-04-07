import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import {Icon, Button, Input, AutoComplete, Spin, Row, Col, Card, Tabs, Radio} from 'antd';
import {List} from 'immutable';
import {AqLink, DashboardCard} from '../components';
import {newLayoutStyle} from '../constants';
import {getStockData} from '../utils';
import {MyChartNew} from '../containers/MyChartNew';
import '../css/stockResearch.css';

const RadioButton = Radio.Button;
const {aimsquantToken, requestUrl} = require('../localConfig');
const RadioGroup = Radio.Group;
const Option = AutoComplete.Option;
const TabPane = Tabs.TabPane;

export class StockResearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickers: [
                // {name: 'TCS', show: true},
            ],
            tickerName: '',
            dataSource: [],
            spinning: false,
            loadingData: true,
            latestDetail: {
                ticker: '',
                exchange: '',
                closePrice: 0,
                change: '',
                high: 0,
                low: 0,
                close: 0,
                low_52w: 0,
                high_52w:0,
                name: ''
            },
            rollingPerformance: {},
            selectedPerformanceScreen: '10y',
        };
    }

    addItem = (tickerName = this.state.tickerName) => {
        const tickers = [...this.state.tickers];
        tickers.push({name: tickerName, show: true, data: []});
        this.setState({tickers});
    }

    deleteItem = (name) => {
        const tickers = [...this.state.tickers];
        const index = _.findIndex(tickers, item => item.name === name);
        tickers.splice(index, 1);
        this.setState({tickers});
    }

    onChange = (e) => { 
        this.setState({tickerName: e.target.value});
    }

    handleSearch = (query) => {
        this.setState({spinning: true});
        const url = `${requestUrl}/stock?search=${query}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)})
        })
        .finally(() => {
            this.setState({spinning: false});
        });
    }

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                symbol: item.ticker,
                name: item.detail !== undefined ? item.detail.Nse_Name : item.ticker
            }
        })
    }

    onSelect = (value) => {
        const {latestDetail} = this.state;
        let tickers = [];
        tickers.push({name: value, destroy: true});
        this.setState({tickers});
        getStockData(value, 'latestDetail')
        .then(response => {
            const {data} = response;
            console.log(data);
            latestDetail.ticker = data.security.ticker;
            latestDetail.exchange = data.security.exchange;
            latestDetail.closePrice = data.latestDetail.values.Close;
            latestDetail.low = data.latestDetail.values.Low;
            latestDetail.high = data.latestDetail.values.High;
            latestDetail.low_52w = data.latestDetail.values.Low_52w;
            latestDetail.high_52w = data.latestDetail.values.High_52w;
            latestDetail.change = data.latestDetail.values.Change;
            latestDetail.name = data.security.detail !== undefined ? data.security.detail.Nse_Name : ' ';
            this.setState({latestDetail});
            return getStockData(value, 'rollingPerformance');
        })
        .then(response => {
            console.log('Rolling Performance', response.data);
            this.setState({rollingPerformance: response.data.rollingPerformance.detail});
        })
        .finally(() => {
            this.setState({loadingData: false});
        });
    }

    renderRollingPerformanceData = key => {
        const {rollingPerformance} = this.state;
        if(rollingPerformance[key]) {
            const ratios = rollingPerformance[key].ratios;
            const returns = rollingPerformance[key].returns;
            const deviation = rollingPerformance[key].deviation;
            const metricsData = [
                {label: 'Alpha', value: `${(ratios.alpha * 100).toFixed(2)} %`},
                {label: 'Beta', value: ratios.beta},
                {label: 'Ann. Return', value: `${(returns.annualreturn * 100).toFixed(2)} %`},
                {label: 'Stability', value: `${(ratios.stability * 100).toFixed(2)} %`},
                {label: 'Volatility', value: `${(deviation.annualstandarddeviation * 100).toFixed(2)} %`},
                {label: 'Sharpe Ratio', value: ratios.sharperatio},
            ];

            return this.renderPerformanceMetricsItems(metricsData);
        }

        return <h3>No Data</h3>;
    }

    handlePerformanceScreenChange = e => {
        this.setState({selectedPerformanceScreen: e.target.value});
    }

    componentWillMount() {
        this.onSelect("TCS");
    }

    renderPriceMetrics = metrics => {
        return metrics.map((item, index) => {
            return (
                <Row key={index} style={{marginBottom: '5px'}}>
                    <Col span={16}>{item.label}</Col>
                    <Col span={8} style={{color: '#3B3737', fontWeight: 700}}>{item.value}</Col>
                </Row>
            );
        });
    }

    renderPerformanceMetricsItems = metrics => {
        return (
            <Row style={{marginTop: '10px'}}>
                {
                    metrics.map((item, index) => {
                        return (
                            <Col span={12} key={index} style={{marginBottom: '10px'}}>
                                <Row>
                                    <Col span={14}>{item.label}</Col>
                                    <Col span={10} style={{color: '#3B3737', fontWeight: 700}}>{item.value}</Col>
                                </Row>
                            </Col>
                        );
                    })
                }
            </Row>
        );
    }

    renderPriceMetricsTimeline = timelineArray => (
        <RadioGroup 
                onChange={this.handlePerformanceScreenChange} 
                defaultValue={timelineArray[0]}
                size="small"
                style={{fontSize: '12px', height: '22px'}}
        >
            {
                timelineArray.map((item, index) => (
                    <RadioButton key={index} value={item}>{item}</RadioButton>
                ))
            }
        </RadioGroup>
    )

    renderPerformanceMetrics = () => {
        const selectedScreen = this.state.selectedPerformanceScreen;
        
        return this.renderRollingPerformanceData(selectedScreen.toLowerCase());
    }

    renderOption = item => {
        return (
            <Option key={item.id} value={item.symbol}>
                <Row style={{marginBottom: '10px'}}>
                    <Col span={8}>
                        <span style={{textAlign: 'left', fontSize: '14px'}}>{item.symbol}</span>
                    </Col>
                    <Col span={8} offset={6}>
                        <span style={{textAlign: 'left', fontSize: '14px'}}>{item.name}</span>
                    </Col>
                </Row>
            </Option>
        );
    }

    render() {
        const {dataSource, latestDetail} = this.state;
        // const spinIcon = <Icon type="loading" style={{ fontSize: 16, marginRight: '5px' }} spin />;
        const priceMetrics = [
            {label: 'High', value: latestDetail.high},
            {label: 'Low', value: latestDetail.low},
            {label: 'Close', value: latestDetail.close},
            {label: '52W High', value: latestDetail.high_52w},
            {label: '52W Low', value: latestDetail.low_52w},
        ];
        const performanceMetricsTimeline = ['MTD', 'YTD', '1Y', '2Y', '5Y', '10Y'];
        const percentageColor = latestDetail.change < 0 ? '#FA4747' : '#3EBB72';
        const spinIcon = <Icon type="loading" style={{ fontSize: 16, marginRight: '5px' }} spin />;

        return (
            <Row>
                <Col xl={18} md={24} style={{...newLayoutStyle, marginTop: '20px'}}>
                    <Row style={metricStyle}>
                        <Col span={24}>
                            <AutoComplete
                                size="large"
                                style={{ width: '100%' }}
                                dataSource={dataSource.map(this.renderOption)}
                                onSelect={this.onSelect}
                                onSearch={this.handleSearch}
                                placeholder="Search stocks"
                                optionLabelProp="value"
                            >
                                <Input 
                                        suffix={(
                                            <div>
                                                <Spin indicator={spinIcon} spinning={this.state.spinning}/>
                                                <Icon style={searchIconStyle} type="search" />
                                            </div>
                                        )} 
                                />
                            </AutoComplete>
                        </Col>
                    </Row>
                    <Row style={metricStyle} type="flex" justify="space-between">
                        <Col span={7} style={cardStyle}>
                            <h3 style={{fontSize: '14px'}}>{latestDetail.name}</h3>
                            <h1 style={{...tickerNameStyle, marginTop: '10px'}}>
                                    <span 
                                            style={{fontSize: '18px', fontWeight: '700'}}>
                                        {latestDetail.exchange}:
                                    </span>
                                    {latestDetail.ticker}
                            </h1>
                            <h3 style={lastPriceStyle}>
                                {latestDetail.closePrice} 
                                <span style={{...changeStyle, color: percentageColor, marginLeft: '5px'}}>{latestDetail.change} %</span>
                            </h3>
                            <h5 
                                    style={{fontSize: '12px', fontWeight: 400, color: '#000', position: 'absolute', bottom: '10px', paddingRight: '10px'}}
                            >
                                * Data is delayed by 15 min
                            </h5>
                        </Col>
                        <Col span={6} style={cardStyle}>
                            <h3 style={cardHeaderStyle}>Price Metrics</h3>
                            {this.renderPriceMetrics(priceMetrics)}
                        </Col>
                        <Col span={10} style={cardStyle}>
                            <Row>
                                <Col span={24}>
                                    <h3 style={cardHeaderStyle}>Performance Metrics</h3>
                                </Col>
                                <Col span={24} style={{textAlign: 'right'}}>
                                    {this.renderPriceMetricsTimeline(performanceMetricsTimeline)}
                                </Col>
                                <Col span={24}>
                                    {this.renderPerformanceMetrics()}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={metricStyle}>  
                        <DashboardCard 
                                xl={24} 
                                title="Performance" 
                                headerStyle={{borderBottom: '1px solid #eaeaea'}}
                                contentStyle={{height: '405px', marginTop: '10px'}}
                        >
                            <MyChartNew 
                                    series = {this.state.tickers} 
                                    deleteItem = {this.deleteItem}
                                    addItem = {this.addItem}
                                    verticalLegend = {true}
                            /> 
                        </DashboardCard>
                        {/* <Col span={24} style={{fontSize: '16px', color: '#565656', fontWeight: '700', marginBottom: '10px'}}>Performance</Col>
                        <Col span={24} style={{marginTop: '10px'}}>
                            <MyChartNew 
                                    series = {this.state.tickers} 
                                    deleteItem = {this.deleteItem}
                                    addItem = {this.addItem}
                                    verticalLegend = {true}
                            /> 
                        </Col> */}
                    </Row>
                </Col>
            </Row>
        );
    }
}

const metricStyle = {
    // marginTop: '20px',
    padding: '20px'
};

const tickerNameStyle = {
    fontSize: '18px',
    color: '#3B3737',
    fontWeight: 400
};

const lastPriceStyle = {
    fontSize: '40px',
    color: '#585858',
    fontWeight: 400
};

const changeStyle = {
    fontSize: '16px'
};

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};

const cardStyle = {
    border: '1px solid #eaeaea',
    padding: '10px',
    borderRadius: '4px',
};

const cardHeaderStyle = {
    marginBottom: '5px'
};