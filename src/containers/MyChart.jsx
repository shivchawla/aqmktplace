import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import Highcharts from 'highcharts';
import HighStock from 'highcharts/highstock';
import {Checkbox, Switch, message, Tag, Row, Col, Spin, Icon} from 'antd';
import {getStockPerformance, getStockData} from '../utils';
import { error } from 'util';

// const ReactHighstock = require('react-highcharts/ReactHighstock.src');
const antIcon = <Icon type="loading" style={{ fontSize: 24 }} spin />;

const defaultYAxis = {
    labels:{
        formatter: function () {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
        }
    },
    gridLineColor: 'transparent',
};

export class MyChart extends React.Component {
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
                    enabled: true
                },
                series: [],
                plotOptions: this.getPlotOptions(),
                yAxis: defaultYAxis,
                tooltip: {
                    enabled: false
                },
                chart: {
                    height: 350 
                },
                credits: {
                    enabled: false
                }
            },
            legendItems: [],
            maxTickerCount: 10,
            spinning: false,
        };
        this.chart = undefined;
    }

    getPlotOptions = () => {
        return {
            series: {
                compare: 'percent',
                point: {
                    events: {
                        mouseOver: (e) =>  {
                            // // console.log(e.target.series.name);
                            const legendItems = [...this.state.legendItems];
                            const legendIndex = _.findIndex(legendItems, legend => legend.name.toUpperCase() === e.target.series.name.toUpperCase());
                            legendItems[legendIndex].x = moment(e.target.x).format('YYYY-MM-DD');
                            legendItems[legendIndex].y = e.target.y;
                            this.setState({legendItems});
                        }
                    }
                }
                
            }
        }
    }
    
    componentWillReceiveProps(nextProps) {
        this.updateSeries(nextProps.series);
    }

    componentDidMount() {
        this.initializeChart();
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
                    <Checkbox disabled={legend.disabled} checked={legend.show} onChange={(e) => this.onCheckboxChange(e, legend)}>
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

    updateSeries = (series) => {
        // console.log(this.chart.series);
        // console.log(series);
    }

    addItemToLegend = series => {
        const legendItems = [];
        series.map(item => {
            const legendIndex = _.findIndex(legendItems, legendItem => legendItem.name.toUpperCase() === item.name.toUpperCase());
            if (legendIndex === -1) {
                legendItems.push({
                    name: item.name.toUpperCase(),
                    x: '1994-16-02',
                    y: 0,
                    disabled: false,
                    show: true,
                    color: item.color
                });
            }
        });

        return legendItems;
    }

    initializeChart = () => {
        const legendItems = [];
        this.chart = new HighStock['StockChart']('highchart-container', this.state.config);
        getStockPerformance("TCS")
        .then(performance => {
            this.chart.addSeries({
                name: 'TCS',
                data: performance
            });
            legendItems.push({
                name: 'TCS',
                x: '1994-16-02',
                y: 0,
                disabled: false,
                show: true,
                color: "393939"
            });
            this.setState({legendItems});
        });
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    addItem = () => {
        // console.log(this.chart.series);
    }

    render() {
        const showLegend = this.props.showLegend === undefined ? true : this.props.showLegend;
        return (
            <div>
                <Row>
                    {/* {
                        showLegend && */}
                        <Col span={12}>
                            <Row>
                                {this.renderLegendBox()}
                                <button onClick={this.addItem}>Add Item</button>
                            </Row>
                        </Col>
                    {/* } */}
                    {/* <Col span={6} offset={6}>
                        <Spin indicator={antIcon} spinning={this.state.spinning}/>
                    </Col> */}
                </Row>
                {/* <ReactHighstock ref="chart" isPureConfig config={this.state.config} /> */}
                <Row>
                    <Col span={24} id="highchart-container"></Col>
                </Row>
            </div>
        );
    }
}