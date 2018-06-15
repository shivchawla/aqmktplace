import * as React from 'react';
import HighStock from 'highcharts/highstock';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Row, Col, Checkbox, message, Tabs, AutoComplete, Input, Icon, Spin} from 'antd';
import {ChartTickerItem} from '../components';
import {getStockPerformance, dateFormat, Utils} from '../utils';
import '../css/myChart.css';

const Option = AutoComplete.Option;
const {requestUrl} = require('../localConfig');

class MyChartNewImpl extends React.Component {
    constructor(props) {
        super(props);
        const self = this;
        this.state = {
            config: {
                //colors: ["#1DE9B6", "#f44336", "#00B0FF", "#009688", "#FFEA00", "#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"],
                //colors: ["#00B0FF", "#0375b4", "#cc6666", "#FFAA1D", "#007849", "#6e2667", "#fc4a1a"],
                colors: ['#0082c8','#e6194b','#3cb44b','#ffe119','#f58231','#911eb4','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff','#aa6e28','#fffac8','#800000','#aaffc3','#808000','#ffd8b1','#000080', '#808080'],
                rangeSelector: {
                    selected: 3,
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
                    },
                    buttons: [{
                        type: 'month',
                        count: 1,
                        text: '1m'
                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m'
                    }, {
                        type: 'ytd',
                        text: 'YTD'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'year',
                        count: 2,
                        text: '2y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    buttonTheme: { // styles for the buttons
                        fill: 'none',
                        stroke: 'none',
                        'stroke-width': 0,
                        r: 8,
                        style: {
                            color: '#039',
                            fontWeight: 'bold',
                            zIndex: 20
                        },
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
                        dataGrouping: {
                            groupPixelWidth: 10,
                        },
                    },
                },
                yAxis: {
                    //gridLineColor: 'transparent',
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
                    height: this.props.height || 350 
                },
                credits: {
                    enabled: false
                }
            },
            series: [],
            legendItems: [],
            selectedDate: moment().format(dateFormat),
            dataSource: [],
            loading: false
        };
    }

    updatePoints = points => {
        const legendItems = [...this.state.legendItems];
        points.map(point => {
            // // console.log(point.series.name);
            try{
                const item = legendItems.filter(item => item.name.toUpperCase() === point.series.name.toUpperCase())[0];
                item.y = point.y;
                item.change = Number(point.point.change.toFixed(2));
                this.setState({legendItems, selectedDate: moment(points[0].x).format(dateFormat)});
            }
            catch(err) {
                // console.log(err);
            }
        });
    }

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.series !== this.props.series) {
            this.setState({series: nextProps.series}, () => {
                this.updateSeries(this.state.series);
            });
        }
    }

    addItemToSeries = ({name, data, color = null, destroy = false, disabled = false}) => {
        if (destroy) {
            this.clearSeries();
        }
        const initialYValue = data.length > 0 ? data[data.length - 1][1] : 0;
        const legendItems = [...this.state.legendItems];
        const seriesIndex = _.findIndex(this.chart.series, seriesItem => seriesItem.name.toUpperCase() === name.toUpperCase());
        const legendIndex = _.findIndex(legendItems, legendItem => legendItem.name.toUpperCase() === name.toUpperCase());
        if (seriesIndex === -1) {
            this.chart.addSeries({
                name: name, 
                data,
                visible: this.chart.series.length < 5,
                selected: true,
                color
            });
        }
        if (legendIndex === -1) {
            this.setState(prevState => {
                if (destroy) {
                    return {
                        legendItems: [
                            {
                                name: name, //.toUpperCase(),
                                x: '1994-16-02',
                                y: initialYValue,
                                change: 0,
                                disabled,
                                checked: legendItems.length < 5 ,
                                color: color || this.chart.series[this.chart.series.length - 1].color
                            }
                        ]
                    }
                } else {
                    return {
                        legendItems: [...prevState.legendItems, {
                            name: name , //toUpperCase(),
                            x: '1994-16-02',
                            y: initialYValue,
                            change: 0,
                            disabled,
                            checked: legendItems.length < 5 ,
                            color: color || this.chart.series[this.chart.series.length - 1].color
                        }]
                    }
                }
            });
        }   
    }

    updateItemInSeries = (index, {name, data, disabled}) => {
        const legendItems = [...this.state.legendItems];
        const initialYValue = data.length > 0 ? data[data.length - 1][1] : '0';
        try {
            if (this.chart.series[index] !== undefined) {
                this.chart.series[index].update({name: name, /*.toUpperCase()*/ data}, false);
                legendItems[index].name = name; //.toUpperCase();
                legendItems[index].y = initialYValue; // This line can be removed
                legendItems[index].change = 0; // This line can be removed
                legendItems[index].disabled = disabled;
                this.setState({legendItems});
                this.chart.redraw();
            }
        } catch(err) {
            // console.log(err);
        }
        
    }

    showLoader = () => {
        this.setState({loading: true});
    }

    hideLoader = () => {
        this.setState({loading: false});
    }

    updateSeries = (series) => {
        let legendItems = [...this.state.legendItems];
        if (series.length == 1 && series[0].destroy) { // Items needs to be destroyed
            // console.log("Items will be destroyed");
            const item = series[0];
            if ((item.data === undefined || item.data.length < 1) && (item.noLoadData === undefined || item.noLoadData === false)) {
                this.showLoader();
                getStockPerformance(item.name.toUpperCase())
                .then(performance => {
                    this.addItemToSeries({
                        name: item.name, 
                        data: performance, 
                        color: item.color, 
                        destroy: true,
                        disabled: true
                    });
                })
                .catch(err => {
                    // console.log(err);
                })
                .finally(() => {
                    this.hideLoader();
                })
            } else {
                this.addItemToSeries(item.name, item.data, item.color, true);
            }
        } else {
            if (series.length > legendItems.length) { // Item needs to be added
                // console.log("Items will be added");
                series.map(item => {
                    const seriesIndex = _.findIndex(this.chart.series, seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    if (seriesIndex === -1) {
                        if ((item.data === undefined || item.data.length < 1) && (item.noLoadData === undefined || item.noLoadData === false)) { // When no data is passed
                            // // console.log('Network call required', item.name);
                            this.showLoader();
                            getStockPerformance(item.name)
                            .then(performance => {
                                this.addItemToSeries({
                                    name: item.name, 
                                    data: performance, 
                                    color: item.color,
                                    disabled: item.disabled
                                });
                            })
                            .catch(err => {
                                // console.log(err);
                            })
                            .finally(() => {
                                this.hideLoader();
                            });
                        } else {
                            this.addItemToSeries(item);
                        }
                    }
                });
            } else if (series.length < legendItems.length) { // Item needs to be deleted
                // console.log("Items will be deleted");
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
                series.map((item, index) => {
                    const seriesIndex = _.findIndex(this.chart.series, 
                                seriesItem => seriesItem.name.toUpperCase() === item.name.toUpperCase());
                    // if (seriesIndex === -1) {
                        if ((item.data === undefined || item.data.length < 1) && (item.noLoadData === undefined || item.noLoadData === false)) { // When no data is passed
                            this.showLoader();
                            getStockPerformance(item.name.toUpperCase())
                            .then(performance => {
                                // // console.log('Updating index', index);
                                this.updateItemInSeries(
                                    index, 
                                    {name: item.name, data: performance, disabled: item.disabled}
                                );
                            })
                            .catch(err => {
                                // console.log(err);
                            })
                            .finally(() => {
                                this.hideLoader();
                            });
                        } else {
                            this.updateItemInSeries(index, item);
                        }
                    // }
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
        const {chartId='highchart-container'} = this.props;
        this.chart = new HighStock['StockChart'](chartId, this.state.config);
        this.setState({series: this.props.series}, () => {
            this.updateSeries(this.state.series);
        });
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
        if (this.props.deleteItem) {
            this.props.deleteItem(name);
        }
        const legendIndex = _.findIndex(legendItems, item => item.name === name);
        legendItems.splice(legendIndex, 1);
        this.updateSeries(legendItems);
    }

    renderOption = item => {
        return (
            <Option key={item.id} text={item.symbol} value={item.symbol}>
                <div>
                    <span>{item.symbol}</span><br></br>
                    <span style={{fontSize: '10px'}}>{item.name}</span>
                </div>
            </Option>
        );
    }

    handleSearch = query => {
        this.setState({spinning: true});
        const url = `${requestUrl}/stock?search=${query}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)})
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({spinning: false});
        });
    }

    onCompareSelect = tickerName => {
        const series = [...this.state.series];
        series.push({name: tickerName});
        if (this.props.addItem) {
            this.props.addItem(tickerName);
        }
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
            <Col style={{ zIndex:'20'}} span={24} >
                {
                    legendItems.map((legend, index) => {
                        const changeColor = legend.change < 0 ? '#F44336' : '#00C853';

                        return (
                                <Row key={index} type="flex" align="middle"> 
                                    <Col span={2}>
                                        <Checkbox disabled={legend.disabled} checked={legend.checked} onChange={e => this.onCheckboxChange(e, legend)} />
                                    </Col>
                                    <Col span={22}>
                                        <h3 style={{fontSize: '12px'}}>
                                            <span style={{color: legend.color}}>{legend.name}</span>
                                            <span 
                                                    style={{marginLeft: '10px', fontSize: '12px', fontWeight: '400'}}
                                            >
                                                {Number(legend.y).toFixed(2)}
                                            </span>
                                            <span style={{fontSize: '12px', color: changeColor, marginLeft: '5px'}}>({legend.change} %)</span>
                                        </h3>
                                    </Col>
                                </Row>
                        );
                    })
                }
            </Col>
        );
    }

    renderVerticalLegend = () => {
        const {dataSource} = this.state;
        const {chartId="highchart-container"} = this.props;

        return (
            <Row>
                <Spin spinning={this.state.loading}>
                    <Col 
                            span={14} id={chartId} 
                            style={{borderRight: '1px solid #DCD6D6', paddingRight: '10px'}}>
                    </Col>
                    <Col span={10} style={{marginLeft: '0px', padding:'0px 4px'}}>
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
                                    style={{width: '100%'}}
                                    optionLabelProp="value"
                                >
                                    <Input suffix={<Icon style={searchIconStyle} type="search" />} />
                                </AutoComplete>
                            </Col>
                        </Row>
                        {this.renderVerticalLegendList()}
                    </Col>
                </Spin>
            </Row>
        );
    }

    renderHorizontalLegend = () => {
        const {chartId="highchart-container"} = this.props;

        return (
            <Col>
                {
                    !this.props.hideLegend &&
                    <Row>
                        <h2 style={{fontSize: '12px', margin: '0'}}>
                            Date <span style={{fontWeight: '700', color: '#555454'}}>{this.state.selectedDate}</span>
                        </h2>
                    </Row>
                }
                {
                    !this.props.hideLegend &&
                    
                    <Row style={{position:'absolute', width: '300px'}}>{this.renderHorizontalLegendList()}</Row>
                }
                <Row style={{marginTop:'30px'}} id={chartId}></Row>
            </Col>
        );
    }

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                symbol: _.get(item, 'detail.NSE_ID', null) || _.get(item, 'ticker', ''),
                name: _.get(item, 'detail.Nse_Name', null) || _.get(item, 'ticker', ''),
            }
        })
    }

    render() {
        if (this.props.verticalLegend) {
            return this.renderVerticalLegend();
        }

        return this.renderHorizontalLegend();
    }
}

export default withRouter(MyChartNewImpl);

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};