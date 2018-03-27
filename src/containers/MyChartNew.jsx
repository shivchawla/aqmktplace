import * as React from 'react';
import HighStock from 'highcharts/highstock';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Checkbox, message} from 'antd';
import {getStockPerformance} from '../utils';

export class MyChartNew extends React.Component {
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
                yAxis: {
                    gridLineColor: 'transparent'
                },
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
            legendItems: []
        }
    }

    getPlotOptions = () => {
        return {
            series: {
                compare: 'percent',
                point: {
                    events: {
                        mouseOver: (e) =>  {
                            // console.log(e.target.series.name);
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

    componentDidMount() {
        this.initializeChart();
        this.updateSeries(this.props.series);
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.series !== this.props.series) {
            this.updateSeries(nextProps.series);
        }
    }

    updateSeries = (series) => {
        const legendItems = [...this.state.legendItems];
        if (series.length > this.chart.series.length) { // Item needs to be added
            series.map(item => {
                const itemIndex = _.findIndex(this.chart.series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                if (itemIndex === -1) {
                    if (item.data === undefined || item.data.length < 1) { // When no data is passed
                        getStockPerformance(item.name)
                        .then(performance => {
                            this.chart.addSeries({
                                name: item.name.toUpperCase(),
                                data: performance
                            });
                            legendItems.push({
                                name: item.name.toUpperCase(),
                                x: '1994-16-02',
                                y: 0,
                                disabled: false,
                                show: true,
                                color: '#323131'
                            });
                            this.setState({legendItems});
                        });
                    } else {
                        this.chart.addSeries({
                            name: item.name.toUpperCase(),
                            data: item.data
                        });
                        legendItems.push({
                            name: item.name.toUpperCase(),
                            x: '1994-16-02',
                            y: 0,
                            disabled: false,
                            show: true,
                            color: '#323131'
                        });
                        this.setState({legendItems});
                    }
                }
            });
        } else if (series.length < this.chart.series.length) { // Item needs to be deleted
            this.chart.series.map((item, index) => {
                const seriesIndex = _.findIndex(series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                if (seriesIndex === -1) {
                    this.chart.series[index].remove();
                    this.updateSeries(series);
                    legendItems.splice(index, 1);
                    this.setState({legendItems});
                }
            }); 
        } else { // Items need to be updated
            series.map((item, index) => {
                const seriesIndex = _.findIndex(this.chart.series, 
                            seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                if (seriesIndex === -1) {
                    if (item.data === undefined || item.data.length < 1) { // When no data is passed
                        getStockPerformance(item.name.toUpperCase())
                        .then(performance => {
                            this.chart.series[index].update({name: item.name.toUpperCase(), data: performance}, true);
                            legendItems[index].name = item.name.toUpperCase();
                            this.setState({legendItems});
                            this.chart.redraw();
                        });
                    } else {
                        this.chart.series[index].update({name: item.name.toUpperCase(), data: item.data}, true);
                        legendItems[index].name = item.name.toUpperCase();
                        this.setState({legendItems});
                        this.chart.redraw();
                    }
                }
            });
        }
    }

    clearSeries = () => {
        while(this.chart.series.length > 0) {
            this.chart.series[0].remove();
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    initializeChart() {
        this.chart = new HighStock['StockChart']('highchart-container', this.state.config);
    }

    onCheckboxChange = (e, ticker) => {
        const {legendItems} = this.state;
        const selectedLegendIndex = _.findIndex(legendItems, legend => legend.name === ticker.name);
        const selectedLegendCount = legendItems.filter(legend => legend.show === true).length;
        if(!e.target.checked) { // When checkbox is not checked
            const newLegendItems = [...legendItems];
            newLegendItems[selectedLegendIndex].show = e.target.checked;
            this.chart.series[selectedLegendIndex].hide();
            this.setState({legendItems: newLegendItems});
        } else {
            if(selectedLegendCount < 5) { // When checkbox checked
                const newLegendItems = [...legendItems];
                newLegendItems[selectedLegendIndex].show = e.target.checked;
                this.chart.series[selectedLegendIndex].show();
                this.setState({legendItems: newLegendItems});
            } else {
                message.error('Only 5 items can be added to the graph at once');
            }
        }
        
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

    render() {
        return(
            <Row>
                <Col span={24}>{this.renderLegendBox()}</Col>
                <Col span={24} id="highchart-container"></Col>
            </Row>
        );
    }
}