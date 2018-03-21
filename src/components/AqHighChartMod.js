import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Checkbox, Switch, message, Tag, Row, Col, Spin, Icon} from 'antd';
import {getStockPerformance, getStockData} from '../utils';
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

export class AqHighChartMod extends React.PureComponent {
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
                    text: 'Stock Graph',
                    style: {
                        display: 'none'
                    }
                },
                legend: {
                    enabled: false,
                },
                navigator: {
                    outlineColor: '#F86C6C',
                    enabled: false
                },
                series: [],
                plotOptions: this.getPlotOptions(),
                yAxis: defaultYAxis,
                tooltip: {
                    enabled: !props.showLegend
                },
                chart: {
                    height: props.height === undefined ? 350 : props.height
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
                            const legendItems = [...this.state.legendItems];
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
        this.setState({spinning: true});
        this.lodInitialBenchmarkPerformance()
        .then(successMessage => {
            message.success(successMessage);
        })
        .catch(error => {
            console.log(error.message);
            message.error('Error occurred while load initial benchmark');
        })
        .finally(() => {
            this.setState({spinning: false});
        });
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.tickers !== this.props.tickers) {
            const {tickers} = nextProps;
            const {config, legendItems} = this.state;
            const series = [...config.series];
            if (tickers.length === 1) {
                const ticker = tickers[0];
                if (series.length == 0) { // empty array
                    console.log(ticker);
                    this.addTickerToEmptyArray(ticker);
                } else if (series.length == 1) { // series[0] should be updated
                    if (ticker.name.toUpperCase() !== legendItems[0].name) {
                        console.log(ticker);
                        console.log('series[0] should be updated');
                        this.updateTicker(ticker);
                    }
                } else { // Items more than 1, array should be destroyed and current ticker should be added
                    this.destroyAndAddTicker(ticker);
                }
            } else if (tickers.length > legendItems.length) { // Item should be added
                console.log("Item will be added");
                // Check to see if the no. of tickers added is lesser than max count
                if (legendItems.length < this.state.maxTickerCount) { 
                    this.addTickersToCompare(tickers);
                } else {
                    message.error(`Max of ${this.state.maxTickerCount} tickers can be added at once`);
                }
            } else if (tickers.length < legendItems.length) {
                this.deleteTickersFromSeries(tickers);
            }
        }
    }

    addTickerToEmptyArray = (ticker) => {
        this.setState({spinning: true});
        if (ticker.data === undefined || ticker.data.length < 1) {
            getStockPerformance(ticker.name)
            .then(performance => {
                this.addTickerToSeries(ticker, performance);
            })
            .catch(error => {
                message.error('Error occurred');
                console.log(error);
            })
            .finally(() => {
                this.setState({spinning: false});
            });
        } else {
            this.addTickerToSeries(ticker, ticker.data);
        }
    }

    updateTicker = (ticker) => {
        const {config, legendItems} = this.state;
        const series = [...config.series];
        this.setState({spinning: true});
        if (ticker.data === undefined || ticker.data.length < 1) {
            getStockPerformance(ticker.name)
            .then(performance => {
                series[0].data = performance;
                series[0].name = ticker.name;
                legendItems[0].name = ticker.name;
                this.setState({config: {...this.state.config, series}});
            })
            .catch(error => {
                message.error(error.message);
                console.log(error);
            }) 
            .finally(() => {
                this.setState({spinning: false});
            });
        } else {
            series[0].data = ticker.data;
            series[0].name = ticker.name;
            legendItems[0].name = ticker.name;
            this.setState({config: {...this.state.config, series}});
        }
    
    }

    destroyAndAddTicker = (ticker) => {
        this.setState({config: {...this.state.config, series: []}, legendItems: [], spinning: true});
        if (ticker.data === undefined || ticker.data.length < 1) {
            getStockPerformance(ticker.name)
            .then(performance => {
                this.addTickerToSeries(ticker, performance);
            })
            .catch(error => {
                message.error(error.message);
                console.log(error);
            })
            .finally(() => {
                this.setState({spinning: false});
            });
        } else {
            this.addTickerToSeries(ticker, ticker.data);
        }
    }

    addTickersToCompare = (tickers) => {
        const {config, legendItems} = this.state;
        tickers.map((ticker, index) => {
            const legendIndex = _.findIndex(legendItems, legend => legend.name === ticker.name.toUpperCase());
            if (legendIndex === -1) { // Adding ticker to series
                if (ticker.data === undefined || ticker.data.length < 1) {
                    this.setState({spinning: true});
                    getStockPerformance(ticker.name)
                    .then(performance => {
                        this.addTickerToSeries(ticker, performance);
                    })
                    .catch(error => {
                        console.log(error);
                        message.error(error.message);
                    })
                    .finally(() => {
                        this.setState({spinning: false});
                    });
                } else {
                    this.addTickerToSeries(ticker, ticker.data);
                }
            }
        });
    }

    addTickerToSeries = (ticker, performance) => {
        let isLegendVisible, isSeriesVisible;
        const {color} = this.state;
        const legendItems = [...this.state.legendItems];
        const series = [...this.state.config.series];
        const legendLength = legendItems.filter(item => item.show === true).length;
        isSeriesVisible = isLegendVisible = legendLength < 5 ? true: false;
        series.push({
            name: ticker.name.toUpperCase(),
            data: performance,
            visible: isSeriesVisible,
            color: color[legendItems.length]
        });
        legendItems.push({
            name: ticker.name.toUpperCase(),
            x: '1994-16-02',
            y: 0,
            disabled: ticker.disabled || false,
            show: isLegendVisible,
            color: color[legendItems.length]
        });
        this.setState({config: {...this.state.config, series}, legendItems});
    }

    deleteTickerFromSeries = (ticker) => {
        console.log('Deleting ' + ticker);
        const legendItems = [...this.state.legendItems];
        const series = [...this.state.config.series];
        _.remove(series, item => item.name === ticker);
        _.remove(legendItems, item => item.name === ticker);
        console.log(legendItems);
        this.setState({config: {...this.state.config, series}, legendItems}, () => {
            console.log(legendItems);
        });
    }

    deleteTickersFromSeries = tickers => {
        const legendItems = [...this.state.legendItems];
        const series = [...this.state.config.series];
        legendItems.map((legend, index) => {
            const tickerIndex = _.findIndex(tickers, ticker => ticker.name === legend.name);
            if (tickerIndex === -1) {
                _.remove(legendItems, item => legend.name = item.name);
                _.remove(series, item => item.name === legend.name);
            }
        });
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
                    <Checkbox disabled={legend.disabled} key={index} checked={legend.show} onChange={(e) => this.onCheckboxChange(e, legend)}>
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
            const newLegendItems = [...legendItems];
            newLegendItems[selectedLegendIndex].show = e.target.checked;
            chart.series[selectedLegendIndex].hide();
            this.setState({legendItems: newLegendItems});
        } else {
            if(selectedLegendCount < 5) { // When checkbox checked
                const newLegendItems = [...legendItems];
                newLegendItems[selectedLegendIndex].show = e.target.checked;
                chart.series[selectedLegendIndex].show();
                this.setState({legendItems: newLegendItems});
            } else {
                message.error('Only 5 items can be added to the graph at once');
            }
        }
        
    }

    lodInitialBenchmarkPerformance = () => {
        const {tickers} = this.props;
        console.log(tickers[0]);
        const {config, legendItems} = this.state;

        return new Promise((resolve, reject) => {
            if(tickers.length <= this.state.maxTickerCount) {
                const allStockRequests = tickers.map((ticker, index) => {
                    if (ticker.data === undefined || ticker.data.length < 1) {
                        return getStockPerformance(ticker.name);
                    } else {
                        this.addTickerToSeries(ticker, ticker.data);
                    }
                }).filter((ticker) => ticker != undefined);
                Promise.all(allStockRequests)
                .then(performanceArray => {
                    performanceArray.map((performance, index) => {
                        this.addTickerToSeries(tickers[index], performance);
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
        const showLegend = this.props.showLegend === undefined ? true : this.props.showLegend;
        return (
            <div>
                <Row>
                    {
                        showLegend &&
                        <Col span={12}>
                            <Row>
                                {this.renderLegendBox()}
                            </Row>
                        </Col>
                    }
                    {/* <Col span={6} offset={6}>
                        <Spin indicator={antIcon} spinning={this.state.spinning}/>
                    </Col> */}
                </Row>
                <ReactHighstock ref='chart' isPureConfig={true} config={this.state.config} />
            </div>
        );
    }
}