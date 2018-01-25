import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Checkbox, Switch, message, Tag, Row, Col, Spin, Icon} from 'antd';
import {getStockPerformance} from '../utils';
import { error } from 'util';

const ReactHighstock = require('react-highcharts/ReactHighstock.src');
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

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
            spinning: false,
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
        // const {tickers} = this.props;
        // const {config, legendItems} = this.state;
        // if(tickers.length <= this.state.maxTickerCount) {
        //     this.setState({spinning: true});
        //     tickers.map((ticker, index) => {
        //         getStockPerformance(ticker.name)
        //         .then(performance => {
        //             this.addTickerToSeries(ticker, performance, ticker.show);
        //             if(index === tickers.length - 1) {
        //                 this.setState({spinning: false});
        //             }
        //         })
        //         .catch(error => {
        //             console.log(error);
        //         });
        //     });
        // } else {
        //     message.error(`Max of ${this.state.maxTickerCount} tickers can be added at once`);
        // }
        this.setState({spinning: true});
        this.lodInitialBenchmarkPerformance()
        .then(response => {
            this.setState({spinning: false});
        })
        .catch(response => {
            message.error(error);
        });
    }

    componentWillReceiveProps(nextProps) {
        const {tickers} = nextProps;
        const {config, legendItems} = this.state;
        if(legendItems.length < this.state.maxTickerCount) {
            tickers.map((ticker, index) => {
                const legendIndex = _.findIndex(legendItems, legend => legend.name === ticker.name.toUpperCase());
                if(legendIndex === -1) { // Check if ticker already added
                    getStockPerformance(ticker.name)
                    .then(performance => {
                        this.addTickerToSeries(ticker, performance);
                    })
                    .catch(error => {
                        message.error(error.message);
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
                <Tag color={item.color} key={index}>{item.name} - {item.y.toFixed(2)}</Tag>
            );
        })
    }

    renderTickers = () => {
        const {legendItems} = this.state;
        return legendItems.map((item, index) => {
            return (
                <Checkbox key={index} checked={item.show} onChange={(e) => this.onCheckboxChange(e, item)}>
                    <span style={{color: item.color}}>{index + 1}. {item.name}</span>
                </Checkbox>
            );
        });
    }

    renderLegendBox = () => {
        const {legendItems} = this.state;

        return legendItems.map((legend, index) => {
            return (
                <Col key={index} span={6}>
                    <Checkbox key={index} checked={legend.show} onChange={(e) => this.onCheckboxChange(e, legend)}>
                        <span style={{color: legend.color}}>{legend.name}</span> -
                        <span>{legend.y}</span>
                    </Checkbox>
                </Col>
            );
        })
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

    lodInitialBenchmarkPerformance = () => {
        const {tickers} = this.props;
        const {config, legendItems} = this.state;

        return new Promise((resolve, reject) => {
            if(tickers.length <= this.state.maxTickerCount) {
                const allStockRequests = tickers.map((ticker, index) => {
                    return getStockPerformance(ticker.name);
                });
                Promise.all(allStockRequests)
                .then(performanceArray => {
                    performanceArray.map((performance, index) => {
                        this.addTickerToSeries(tickers[index], performance, tickers[index].show);
                    });
                })
                .catch(error => {
                    console.log(error);
                    reject(error);
                })
                .finally(() => {
                    resolve('Initial Metrics Loaded');
                });
            } else {
                reject(`Max of ${this.state.maxTickerCount} tickers can be added at once`);
            }
        })
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={12}>
                        <Row>
                            {this.renderLegendBox()}
                        </Row>
                    </Col>
                    <Col span={6} offset={6}>
                        <Spin indicator={antIcon} spinning={this.state.spinning}/>
                    </Col>
                </Row>
                <ReactHighstock ref='chart' isPureConfig={true} config={this.state.config} />
            </div>
        );
    }
}