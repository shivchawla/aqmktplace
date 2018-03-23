import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import {Icon, Button, Input, AutoComplete, Spin, Row, Col, Card, Tabs} from 'antd';
import {List} from 'immutable';
import {AqLink} from '../components';
import {newLayoutStyle} from '../constants';
import {getStockData} from '../utils';
import {AqHighChartMod} from '../components/AqHighChartMod';
import '../css/stockResearch.css';

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
            loadingData: false,
            latestDetail: {
                ticker: '',
                exchange: '',
                closePrice: 0,
                change: '',
                high: 0,
                low: 0,
                close: 0,
                low_52w: 0,
                high_52w:0
            },
            rollingPerformance: {}
        };
    }

    addItem = () => {
        const {tickerName} = this.state;
        const tickers = [...this.state.tickers];
        tickers.push({name: tickerName, show: true, data: []});
        this.setState({tickers});
    }

    onChange = (e) => { 
        this.setState({tickerName: e.target.value});
    }

    handleSearch = (query) => {
        this.setState({spinning: true});
        axios.get(`http://localhost:3001/tickers?q=${query}`)
        .then(response => {
            this.setState({dataSource: response.data})
        })
        .finally(() => {
            this.setState({spinning: false});
        });
    }

    onSelect = (value) => {
        const {latestDetail, tickers} = this.state;
        let newTickers = [];
        newTickers.push({name: value, show: true, disabled: true});
        this.setState(prevState => {
            return Object.assign({}, {tickers: newTickers});
        });
        getStockData(value, 'latestDetail')
        .then(response => {
            const {data} = response;
            latestDetail.ticker = data.security.ticker;
            latestDetail.exchange = data.security.exchange;
            latestDetail.closePrice = data.latestDetail.values.Close;
            latestDetail.low = data.latestDetail.values.Low;
            latestDetail.high = data.latestDetail.values.High;
            latestDetail.low_52w = data.latestDetail.values.Low_52w;
            latestDetail.high_52w = data.latestDetail.values.High_52w;
            latestDetail.change = data.latestDetail.values.Change;
            this.setState({latestDetail});
            return getStockData(value, 'rollingPerformance');
        })
        .then(response => {
            this.setState({rollingPerformance: response.data.rollingPerformance.detail});
        })
        .finally(() => {
            this.setState({loadingData: false});
        });
    }

    onCompareSelect = (value) => {
        const tickers = [...this.state.tickers];
        tickers.push({name: value, show: false, data: []});
        this.setState({tickers});
    }

    renderOption = (item) => {
        return (
            <Option key={item.name}>
              {item.name}
            </Option>
        );
    }

    renderRollingPerformanceData = (key) => {
        const {rollingPerformance} = this.state;
        if(rollingPerformance[key]) {
            const dataObject = rollingPerformance[key].ratios;
            const metricsData = [
                {label: 'Alpha', value: dataObject.alpha},
                {label: 'Beta', value: dataObject.beta},
                {label: 'Calmarratio', value: dataObject.calmarratio},
                {label: 'Information Ratio', value: dataObject.informationratio},
                {label: 'Sharpe Ratio', value: dataObject.sharperatio},
                {label: 'Sortino Ratio', value: dataObject.sortinoratio},
                {label: 'Stability', value: dataObject.stability},
                {label: 'Treynor Ratio', value: dataObject.treynorratio},
            ]

            return this.renderPriceMetrics(metricsData);
        }

        return <h3>No Data</h3>;
    }

    componentWillMount() {
        this.onSelect("TCS");
    }

    renderPriceMetrics = metrics => {
        return metrics.map((item, index) => {
            return (
                <Row key={index} style={{marginBottom: '5px'}}>
                    <Col span={8}>{item.label}</Col>
                    <Col span={8} offset={8} style={{color: '#3B3737', fontWeight: 700}}>{item.value}</Col>
                </Row>
            );
        });
    }

    render() {
        const {dataSource, latestDetail} = this.state;
        const priceMetrics = [
            {label: 'High', value: latestDetail.high},
            {label: 'Low', value: latestDetail.low},
            {label: 'Close', value: latestDetail.close},
            {label: '52W High', value: latestDetail.high_52w},
            {label: '52W Low', value: latestDetail.low_52w},
        ];
        
        return (
            <Row>
                <Col span={18} style={{...newLayoutStyle, marginTop: '20px'}}>
                    <Row style={metricStyle}>
                        <Col span={24}>
                            <AutoComplete
                                size="large"
                                style={{ width: '100%' }}
                                dataSource={dataSource.map(this.renderOption)}
                                onSelect={this.onSelect}
                                onSearch={this.handleSearch}
                                placeholder="Search stocks"
                                optionLabelProp="name"
                            >
                                <Input suffix={<Icon style={searchIconStyle} type="search" />} />
                            </AutoComplete>
                        </Col>
                    </Row>
                    <Row style={metricStyle} type="flex" justify="space-between">
                        <Col span={7} style={cardStyle}>
                            <h1 style={tickerNameStyle}>{latestDetail.ticker} : {latestDetail.exchange}</h1>
                            <h3 style={lastPriceStyle}>{latestDetail.closePrice} <span style={changeStyle}>% {latestDetail.change}</span></h3>
                            <h5 style={{fontSize: '18px', fontWeight: 400, color: '#585858'}}>Least Close Price</h5>
                        </Col>
                        <Col span={7} style={cardStyle}>
                            <h3>Price Metrics</h3>
                            {this.renderPriceMetrics(priceMetrics)}
                        </Col>
                        <Col span={9} style={cardStyle}>
                            <Col span={24}>
                                <h3>Performance Metrics</h3>
                            </Col>
                            <Col span={24}>
                                <Tabs defaultActiveKey="1" size="small">
                                    <TabPane tab="10 Y" key="1">{this.renderRollingPerformanceData('10y')}</TabPane>
                                    <TabPane tab="YTD" key="2">{this.renderRollingPerformanceData('ytd')}</TabPane>
                                    <TabPane tab="1 Y" key="3">{this.renderRollingPerformanceData('1y')}</TabPane>
                                    <TabPane tab="5 Y" key="4">{this.renderRollingPerformanceData('5y')}</TabPane>
                                    <TabPane tab="2 Y" key="5">{this.renderRollingPerformanceData('2y')}</TabPane>
                                    <TabPane tab="MTD" key="6">{this.renderRollingPerformanceData('mtd')}</TabPane>
                                </Tabs>
                            </Col>
                        </Col>
                    </Row>
                    <Row style={{...metricStyle, marginTop: '20px'}}>  
                        <Col span={24} style={{fontSize: '16px', color: '#565656', fontWeight: '700', marginBottom: '10px'}}>Performance</Col>
                        <Col span={8}>
                            <AutoComplete
                                disabled={!this.state.tickers.length}
                                className="global-search"
                                size="large"
                                style={{ width: '100%' }}
                                dataSource={dataSource.map(this.renderOption)}
                                onSelect={this.onCompareSelect}
                                onSearch={this.handleSearch}
                                placeholder="Type stocks to compare"
                                optionLabelProp="name"
                            >
                                <Input suffix={<Icon style={searchIconStyle} type="search" />} />
                            </AutoComplete>
                        </Col>
                        <Col span={24} style={{marginTop: '10px'}}>
                            <AqHighChartMod tickers={this.state.tickers}/> 
                        </Col>
                    </Row>
                </Col>
                <Col>
                    <Spin size="large" spinning={this.state.loadingData}/>
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
    fontSize: '40px',
    color: '#3B3737',
    fontWeight: 700
};

const lastPriceStyle = {
    fontSize: '40px',
    color: '#585858',
    fontWeight: 400
};

const changeStyle = {
    fontSize: '20px'
};

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};

const cardStyle = {
    border: '1px solid #eaeaea',
    padding: '10px',
    borderRadius: '4px',
}