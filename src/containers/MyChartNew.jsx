import * as React from 'react';
import HighStock from 'highcharts/highstock';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Row, Col, Checkbox, message, Tabs, AutoComplete, Input, Icon} from 'antd';
import {ChartTickerItem} from '../components';
import {getStockPerformance, dateFormat} from '../utils';
import '../css/myChart.css';

const TabPane = Tabs.TabPane;
const Option = AutoComplete.Option;

export class MyChartNew extends React.Component {
    constructor(props) {
        super(props);
        const self = this;
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
                    buttonPosition: {
                        align: props.verticalLegend ? 'left' : 'right'
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
                plotOptions: {
                    series: {
                        compare: 'percent',
                    }
                },
                yAxis: {
                    gridLineColor: 'transparent',
                    labels: {
                        formatter: function () {
                            return (this.value > 0 ? ' + ' : '') + this.value + '%';
                        }
                    }
                },
                dataLabels: {
                    enabled: true
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: '#f9f9f9',
                    borderWidth: 0,
                    borderRadius: 0,
                    shared: true,
                    headerFormat: '{point.key} ',
                    pointFormat: '<br><span class="myToolTip" style="color:{series.color}">{series.name}</span>: <b>{point.y}</b>',
                    formatter: function() {
                        var s = [];
                        self.updatePoints(this.points);
                    },
                    positioner: function () {
                        return { x: -100, y: 35 };
                    },
                    backgroundColor: 'transparent',
                    shadow: false,
                    split: false,
                    useHTML: true
                },
                chart: {
                    height: 350 
                },
                credits: {
                    enabled: false
                }
            },
            series: [],
            legendItems: [],
            selectedDate: moment().format(dateFormat),
            dataSource: []
        }
    }

    updatePoints = points => {
        console.log(points);
        const legendItems = [...this.state.legendItems];
        points.map(point => {
            const item = legendItems.filter(item => item.name === point.series.name)[0];
            item.y = point.y;
            item.change = Number(point.point.change.toFixed(2));
        });
        this.setState({legendItems, selectedDate: moment(points[0].x).format(dateFormat)});
    }

    componentDidMount() {
        this.initializeChart();
        this.setState({series: this.props.series}, () => {
            this.updateSeries(this.state.series);
        });
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.series !== this.props.series) {
            this.setState({series: nextProps.series}, () => {
                this.updateSeries(this.state.series);
            });
        }
    }

    addItemToSeries = (name, data, destroy = false) => {
        if (destroy) {
            this.clearSeries();
        }
        const legendItems = destroy ? [] : [...this.state.legendItems];
        const seriesIndex = _.findIndex(this.chart.series, seriesItem => seriesItem.name.toUpperCase() === name.toUpperCase());
        const legendIndex = _.findIndex(legendItems, legendItem => legendItem.name.toUpperCase() === name.toUpperCase());
        if (legendIndex === -1 && seriesIndex === -1) {
            this.chart.addSeries({
                name: name.toUpperCase(),
                data,
                visible: this.chart.series.length < 5,
                selected: true
            });
            legendItems.push({
                name: name.toUpperCase(),
                x: '1994-16-02',
                y: 0,
                change: 0,
                disabled: destroy,
                checked: legendItems.length < 5 ,
                color: this.chart.series[this.chart.series.length - 1].color
            });
        }   
        this.setState({legendItems});
    }

    updateItemInSeries = (index, name, data) => {
        const legendItems = [...this.state.legendItems];
        this.chart.series[index].update({name: name.toUpperCase(), data}, false);
        legendItems[index].name = name.toUpperCase();
        this.setState({legendItems});
        this.chart.redraw();
    }

    updateSeries = (series) => {
        let legendItems = [...this.state.legendItems];
        if (series.length == 1 && series[0].destroy) { // Items needs to be destroyed
            console.log("Items will be destroyed");
            const item = series[0];
            if (item.data === undefined || item.data.length < 1) {
                getStockPerformance(item.name.toUpperCase())
                .then(performance => {
                    this.addItemToSeries(item.name, performance, true);
                })
            } else {
                this.addItemToSeries(item.name, item.data, true);
            }
        } else {
            if (series.length > legendItems.length) { // Item needs to be added
                console.log("Items will be added");
                series.map(item => {
                    if (item.data === undefined || item.data.length < 1) { // When no data is passed
                        getStockPerformance(item.name)
                        .then(performance => {
                            this.addItemToSeries(item.name, performance);
                        });
                    } else {
                        this.addItemToSeries(item.name, item.data);
                    }
                });
            } else if (series.length < legendItems.length) { // Item needs to be deleted
                console.log("Items will be deleted");
                this.chart.series.map((item, index) => {
                    const seriesIndex = _.findIndex(series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    if (seriesIndex === -1) {
                        this.chart.series[index].remove();
                    }
                }); 
                legendItems.map((item, index) => {
                    const legendIndex = _.findIndex(series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    if (legendIndex === -1) {
                        legendItems.splice(index, 1);
                        this.setState({legendItems}, () => {
                            this.updateSeries(series);
                        });
                    }
                });
            } else { // Items need to be updated
                console.log("Items will be updated");
                series.map((item, index) => {
                    const seriesIndex = _.findIndex(this.chart.series, 
                                seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    if (seriesIndex === -1) {
                        if (item.data === undefined || item.data.length < 1) { // When no data is passed
                            getStockPerformance(item.name.toUpperCase())
                            .then(performance => {
                                console.log('Updating index', index);
                                this.updateItemInSeries(index, item.name, performance);
                            });
                        } else {
                            this.updateItemInSeries(index, item.name, item.data);
                        }
                    }
                });
            }
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
        const selectedLegendCount = legendItems.filter(legend => legend.checked === true).length;
        if(!e.target.checked) { // When checkbox is not checked
            const newLegendItems = [...legendItems];
            newLegendItems[selectedLegendIndex].checked = e.target.checked;
            this.chart.series[selectedLegendIndex].hide();
            this.setState({legendItems: newLegendItems});
        } else {
            if(selectedLegendCount < 5) { // When checkbox checked
                const newLegendItems = [...legendItems];
                newLegendItems[selectedLegendIndex].checked = e.target.checked;
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
                    <Checkbox disabled={legend.disabled} key={index} checked={legend.checked} onChange={(e) => this.onCheckboxChange(e, legend)}>
                        <span style={{color: legend.color}}>{legend.name}</span> -
                        <span>{legend.y}</span>
                    </Checkbox>
                </Col>
            );
        })
    }

    deleteTicker = name => {
        const legendItems = [...this.state.legendItems];
        this.props.deleteItem(name);
        const legendIndex = _.findIndex(legendItems, item => item.name === name);
        legendItems.splice(legendIndex, 1);
        this.updateSeries(legendItems);
    }

    renderOption = item => {
        return (
            <Option key={item.name}>
              {item.name}
            </Option>
        );
    }

    handleSearch = query => {
        // this.setState({spinning: true});
        axios.get(`http://localhost:3001/tickers?q=${query}`)
        .then(response => {
            this.setState({dataSource: response.data})
        })
        .finally(() => {
            // this.setState({spinning: false});
        });
    }

    onCompareSelect = tickerName => {
        const series = [...this.state.series];
        series.push({name: tickerName});
        this.props.addItem(tickerName);
        this.setState({series}, () => {
            this.updateSeries(this.state.series);
        });
    }

    renderVerticalLegendList = () => {
        const {legendItems} = this.state;
        return (
            <Row style={{marginTop: '10px', height: '300px', overflow: 'hidden', overflowY: 'scroll'}}>
                {
                    legendItems.map((legend, index) => {
                        return (
                            <Col span={24} key={index}>
                                <ChartTickerItem 
                                        legend={legend}
                                        onChange={(e) => this.onCheckboxChange(e, legend)}
                                        deleteItem = {this.deleteTicker}
                                />
                            </Col>
                        );
                    })
                }
            </Row>
        );
    }

    renderHorizontalLegendList = () => {
        const {legendItems} = this.state;
        return (
            <Row>
                {
                    legendItems.map((legend, index) => {
                        const changeColor = legend.change < 0 ? '#F44336' : '#00C853';

                        return (
                            <Col span={6} key={index}>
                                <Row type="flex" align="middle"> 
                                    <Col span={2}>
                                        <Checkbox checked={legend.checked} onChange={e => this.onCheckboxChange(e, legend)} />
                                    </Col>
                                    <Col span={10}>
                                        <h3 style={{fontSize: '14px'}}>
                                            <span style={{color: legend.color}}>{legend.name}</span>
                                            <span style={{marginLeft: '10px', fontSize: '14px', fontWeight: '700'}}>{legend.y}</span>
                                        </h3>
                                    </Col>
                                    <Col span={8}>
                                        <h3 style={{fontSize: '16px', color: changeColor}}>{legend.change} %</h3>
                                    </Col>
                                </Row>
                            </Col>
                        );
                    })
                }
            </Row>
        );
    }

    renderVerticalLegend = () => {
        const {dataSource} = this.state;

        return (
            <Row>
                <Col span={14} id="highchart-container" style={{borderRight: '1px solid #DCD6D6', paddingRight: '20px'}}></Col>
                <Col span={9} style={{marginLeft: '20px'}}>
                    <Row type="flex" align="middle">
                        <Col span={12}>
                            <h2 style={{fontSize: '12px', margin: '0'}}>
                                Date <span style={{fontWeight: '700', color: '#555454'}}>{this.state.selectedDate}</span>
                            </h2>
                        </Col>
                        <Col span={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <AutoComplete
                                // disabled={!this.state.tickers.length}
                                className="global-search"
                                dataSource={dataSource.map(this.renderOption)}
                                onSelect={this.onCompareSelect}
                                onSearch={this.handleSearch}
                                placeholder="Search Stocks"
                                optionLabelProp="name"
                                style={{width: '100%'}}
                            >
                                <Input suffix={<Icon style={searchIconStyle} type="search" />} />
                            </AutoComplete>
                        </Col>
                    </Row>
                    {this.renderVerticalLegendList()}
                </Col>
            </Row>
        );
    }

    renderHorizontalLegend = () => {
        return (
            <Row>
                <Col span={24}>
                    <h2 style={{fontSize: '12px', margin: '0'}}>
                        Date <span style={{fontWeight: '700', color: '#555454'}}>{this.state.selectedDate}</span>
                    </h2>
                </Col>
                <Col span={24}>
                    {this.renderHorizontalLegendList()}
                </Col>
                <Col span={24} id="highchart-container"></Col>
            </Row>
        );
    }

    render() {
        if (this.props.verticalLegend) {
            return this.renderVerticalLegend();
        }

        return this.renderHorizontalLegend();
    }
}

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};