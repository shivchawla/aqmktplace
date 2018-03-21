import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import {Icon, Button, Input, AutoComplete, Spin, Row, Col, Card, Tabs} from 'antd';
import {List} from 'immutable';
import {AqLink} from '../components';
import {layoutStyle} from '../constants';
import {getStockData} from '../utils';
import {AqHighChartMod} from '../components/AqHighChartMod';
import '../css/stockResearch.css';

const Option = AutoComplete.Option;
const TabPane = Tabs.TabPane;
const antIcon = <Icon type="loading" style={{ fontSize: 18 }} spin />;

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

            return (
                <div>
                    <p>Alpha - {dataObject.alpha}</p>
                    <p>Beta - {dataObject.beta}</p>
                    <p>Calmarratio - {dataObject.calmarratio}</p>
                    <p>Informationratio - {dataObject.informationratio}</p>
                    <p>Sharperatio - {dataObject.sharperatio}</p>
                    <p>Sortinoratio - {dataObject.sortinoratio}</p>
                    <p>Stability - {dataObject.stability}</p>
                    <p>Treynorratio - {dataObject.treynorratio}</p>
                </div>
            );
        }

        return <h3>No Data</h3>;
    }

    render() {
        const {dataSource, latestDetail} = this.state;
        
        return (
            <Row>
                <Col span={18} style={layoutStyle}>
                    <Row>
                        <Col span={24}>
                            <AutoComplete
                                className="global-search"
                                size="large"
                                style={{ width: '100%' }}
                                dataSource={dataSource.map(this.renderOption)}
                                onSelect={this.onSelect}
                                onSearch={this.handleSearch}
                                placeholder="input here"
                                optionLabelProp="name"
                            >
                            <Input
                                    suffix={(
                                        <div>
                                            <Spin style={{marginRight: '20px'}} indicator={antIcon} spinning={this.state.spinning}/>
                                            <Button size="large" type="primary">
                                                <Icon type="search" />
                                            </Button>
                                        </div>
                                    )}
                            />
                            </AutoComplete>
                        </Col>
                    </Row>
                    <Row style={metricStyle} type="flex" justify="space-between">
                        <Col span={6} >
                            <Card >
                                <p>{latestDetail.ticker} - {latestDetail.exchange}</p>
                                <p>{latestDetail.closePrice} - {latestDetail.change}</p>
                                <p>Least Close Price</p>
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card title="Price Metrics">
                                <p>High - {latestDetail.high}</p>
                                <p>Low - {latestDetail.low}</p>
                                <p>Close - {latestDetail.close}</p>
                                <p>52W Low - {latestDetail.low_52w}</p>
                                <p>52W High - {latestDetail.high_52w}</p>
                            </Card>
                        </Col>
                        <Col span={10}>
                            <Card title="Performance Metrics">
                            <Tabs defaultActiveKey="1" size="small">
                                <TabPane tab="10 Y" key="1">{this.renderRollingPerformanceData('10y')}</TabPane>
                                <TabPane tab="YTD" key="2">{this.renderRollingPerformanceData('ytd')}</TabPane>
                                <TabPane tab="1 Y" key="3">{this.renderRollingPerformanceData('1y')}</TabPane>
                                <TabPane tab="5 Y" key="4">{this.renderRollingPerformanceData('5y')}</TabPane>
                                <TabPane tab="2 Y" key="5">{this.renderRollingPerformanceData('2y')}</TabPane>
                                <TabPane tab="MTD" key="6">{this.renderRollingPerformanceData('mtd')}</TabPane>
                            </Tabs>
                            </Card>
                        </Col>
                    </Row>
                    <Row>  
                        <Col span={8}>
                            <p>Compare</p>
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
                            <Input
                                    suffix={(
                                        <div>
                                            <Spin style={{marginRight: '20px'}} indicator={antIcon} spinning={this.state.spinning}/>
                                            <Button className="search-btn" size="large" type="primary">
                                                <Icon type="search" />
                                            </Button>
                                        </div>
                                    )}
                            />
                            </AutoComplete>
                        </Col>
                        <Col span={24}>
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
    marginTop: '20px'
};