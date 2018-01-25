import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Checkbox, Switch, message, Tag, Row, Col} from 'antd';
import {getUnixStockData} from '../utils';

const ReactHighstock = require('react-highcharts/ReactHighstock.src');

const defaultYAxis = {
    labels:{
        formatter: function () {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
        }
    }
};

export class AqHighChartMod extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            config: {
                rangeSelector: {
                    selected: 0,
                    labelStyle: {
                        color: '#F86C6C'
                    },
                    inputStyle: {
                        display: 'none'
                    },
                    inputBoxWidth: 0,
                    inputBoxHeight: 0,
                    labelStyle: {
                        display: 'none'
                    }
                },
                title: {
                    text: 'Stock Graph'
                },
                legend: {
                    enabled: false,
                },
                navigator: {
                    outlineColor: '#F86C6C'
                },
                series: [],
                plotOptions: this.getPlotOptions(),
                yAxis: defaultYAxis,
                toolTip: {
                    formatter: function() {
                        console.log(this.x);
                        return 'The Value is {point.x} {point.y}';
                    }
                }
            },
            xAxisValue: 0,
            yAxisValue:0,
            tickerName: '',
            tickerItems: [],
            maxTickerCount: 10
        };
    }

    getPlotOptions = () => {
        return {
            series: {
                compare: 'percent',
                point: {
                    events: {
                        mouseOver: (e) =>  {
                            // const index = _.findIndex(tickerItems, ticker => ticker.name === e.target.series.name);
                            // tickerItems[index].x = moment(e.target.x).format('YYYY-MM-DD');
                            // tickerItems[index].y = e.target.y;
                            const xAxisValue = moment(e.target.x).format('YYYY-MM-DD');
                            const yAxisValue = e.target.y;
                            this.setState({xAxisValue, yAxisValue});
                        }
                    }
                }
                
            }
        }
    }

    componentWillMount() {
        const {tickers} = this.props;
        const {config, tickerItems} = this.state;
        if(tickers.length < this.state.maxTickerCount) {
            tickers.map((ticker, index) => {
                getUnixStockData(ticker)
                .then(response => {
                    if(response.length > 0){ // ticker search successful
                        config.series.push({
                            name: ticker.toUpperCase(),
                            data: response,
                            selected: false,
                        });
                        tickerItems.push({
                            name: ticker.toUpperCase(),
                            x: 0,
                            y: 0
                        });
                    }
                    this.setState({config: _.cloneDeep(config), tickerItems});
                });
            });
        } else {
            message.error('Max of 10 tickers can be added at once');
        }

    }

    componentWillReceiveProps(nextProps) {
        const {tickers} = nextProps;
        const {config, tickerItems} = this.state;
        tickers.map((ticker, index) => {
            const findIndex = _.findIndex(config.series, item => item.name === ticker.toUpperCase());
            if(findIndex === -1) { // Check if ticker already added
                getUnixStockData(ticker)
                .then(response => {
                    if(response.length > 0){ // ticker search successful
                        config.series.push({
                            name: ticker.toUpperCase(),
                            data: response 
                        });
                    }
                    tickerItems.push({
                        name: ticker.toUpperCase(),
                        x: 0,
                        y: 0
                    });
                    this.setState({config: _.cloneDeep(config), tickerItems});
                });
            }
            
        });
    }

    renderLegend = () => {
        return this.state.tickerItems.map((item, index) => {
            return (
                <Tag key={index}>{item.name} {item.x} - {item.y}</Tag>
            );
        })
    }

    componentWillUpdate() {
        console.log('Component Updated');
    }

    render() {
        console.log(this.state.tickerItems);

        return (
            <div>
                <Row>
                    <Col span={12}>
                        {this.renderLegend()}
                    </Col>
                </Row>
                <h5>{this.state.tickerName} -{this.state.xAxisValue} -- {this.state.yAxisValue}</h5>
                <ReactHighstock ref='chart' isPureConfig={true} config={this.state.config} />
            </div>
        );
    }
}