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
                tooltip: {
                    enabled: false
                }
            },
            legendItems: [],
            maxTickerCount: 10,
            color: ["#7cb5ec", "#434348", "#90ed7d", "#f7a35c", "#8085e9", "#f15c80", "#e4d354", "#2b908f", "#f45b5b", "#91e8e1"]
        };
    }

    getPlotOptions = () => {
        return {
            series: {
                compare: 'percent',
                point: {
                    events: {
                        mouseOver: (e) =>  {
                            const {legendItems} = this.state;
                            const legendIndex = _.findIndex(legendItems, legend => legend.name === e.target.series.name);
                            legendItems[legendIndex].x = moment(e.target.x).format('YYYY-MM-DD');
                            legendItems[legendIndex].y = e.target.y;
                            this.setState({legendItems});
                        }
                    }
                }
                
            }
        }
    }

    componentWillMount() {
        const {tickers} = this.props;
        const {config, legendItems} = this.state;
        if(tickers.length < this.state.maxTickerCount) {
            tickers.map((ticker, index) => {
                getUnixStockData(ticker.name)
                .then(performance => {
                    if(performance.length > 0){ // ticker search successful
                        this.addTickerToSeries(ticker, performance, true);
                    }
                });
            });
        } else {
            message.error(`Max of ${this.state.maxTickerCount} tickers can be added at once`);
        }

    }

    componentWillReceiveProps(nextProps) {
        const {tickers} = nextProps;
        const {config, legendItems} = this.state;
        if(legendItems.length < this.state.maxTickerCount) {
            tickers.map((ticker, index) => {
                const legendIndex = _.findIndex(legendItems, legend => legend.name === ticker.name.toUpperCase());
                if(legendIndex === -1) { // Check if ticker already added
                    getUnixStockData(ticker.name)
                    .then(performance => {
                        if(performance.length > 0){ // ticker search successful
                            this.addTickerToSeries(ticker, performance)
                        }
                    });
                }
            }); 
        } else {
            message.error(`Max of ${this.state.maxTickerCount} tickers can be added at once`);
        }
    }

    addTickerToSeries = (ticker, performance, visible = false) => {
        const {config, legendItems, color} = this.state;
        config.series.push({
            name: ticker.name.toUpperCase(),
            data: performance,
            visible,
            color: color[legendItems.length]
        });
        legendItems.push({
            name: ticker.name.toUpperCase(),
            x: '1994-16-02',
            y: 0,
            show: ticker.show,
            color: color[legendItems.length]
        });
        this.setState({config: _.cloneDeep(config), legendItems});
    }

    renderLegend = () => {
        const {legendItems} = this.state;
        const selectedTickers = legendItems.filter(item => item.show === true);
        return selectedTickers.map((item, index) => {
            return (
                <Tag color={item.color} key={index}>{item.name} {item.x} - {item.y.toFixed(2)}</Tag>
            );
        })
    }

    renderTickers = () => {
        const {legendItems} = this.state;
        return legendItems.map((item, index) => {
            return (
                <Checkbox key={index} checked={item.show} onChange={(e) => this.onCheckboxChange(e, item)}>
                    <span style={{color: legendItems[index].color}}>{index + 1}. {item.name}</span>
                </Checkbox>
            );
        });
    }

    onCheckboxChange = (e, ticker) => {
        const {legendItems} = this.state;
        const chart = this.refs.chart.getChart();
        const selectedLegendIndex = _.findIndex(legendItems, legend => legend.name === ticker.name);
        const selectedLegendCount = legendItems.filter(legend => legend.show === true).length;

        if(!e.target.checked) { // When checkbox is not checked
            legendItems[selectedLegendIndex].show = e.target.checked;
            chart.series[selectedLegendIndex].hide();
            this.setState({legendItems});
        } else {
            if(selectedLegendCount < 5) { // When checkbox checked
                legendItems[selectedLegendIndex].show = e.target.checked;
                chart.series[selectedLegendIndex].show();
                this.setState({legendItems});
            } else {
                message.error('Only 5 items can be added to the graph at once');
            }
        }
        
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={24}>
                        {this.renderTickers()}
                    </Col>
                    <Col span={24}>
                        {this.renderLegend()}
                    </Col>
                </Row>
                <h5>{this.state.tickerName} -{this.state.xAxisValue} -- {this.state.yAxisValue}</h5>
                <ReactHighstock ref='chart' isPureConfig={true} config={this.state.config} />
            </div>
        );
    }
}