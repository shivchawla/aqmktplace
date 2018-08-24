import * as React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import {Col, Row, Radio} from 'antd';
import HighChart from 'highcharts';
import {benchmarkColor, currentPerformanceColor, simulatedPerformanceColor} from '../constants';
import {Utils} from '../utils';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

export class HighChartBar extends React.Component {
    constructor(props) {
        super(props);
        this.dollarChart = null;
        this.percentageChart = null;
        const {legendEnabled = false} = props; 
        this.state = {
            config: {
                chart: {
                    type: 'column',
                    height: 280,
                    animation:false,
                },
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: legendEnabled,
                            crop: false,
                            overflow: 'none',
                            color: '#555454'
                        }
                    }
                },
                yAxis: {
                    labels: {
                        format: '{value}%'
                    },
                    title: {
                        enabled: false,
                    },
                    gridLineColor: 'transparent',
                    tickInterval: 5,
                },
                xAxis: {
                    gridLineColor: 'transparent',
                    title: {
                        enabled: false,
                        name: 'Stock',
                        text: null
                    },
                    categories: props.dollarCategories ? props.dollarCategories : props.categories || null
                },
                title: {
                    style: {
                        display: 'none'
                    }
                },
                legend: {
                    enabled: true,
                },
                credits: {
                    enabled: false
                },
                tooltip: {
                    valueSuffix: '%',
                    headerFormat: '<h3 style="font-size: 14px; font-weight: 700">{point.key}</h3><br></br>',
                    shared: true,
                },
                series: []
            },
            dollarVisible: true,
        }
    }

    getCategories = () => {
        if (this.dollarChart !== null) {
            return this.dollarChart.series.map(item => item.name)
        }
        return [];
    };

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.dollarSeries !== this.props.dollarSeries) {
            try {
                this.updateDollarSeries(nextProps.dollarSeries);
                this.updatePercentageSeries(nextProps.percentageSeries)
            } catch(err) {
                // console.log(err);
            }
        }
    }

    componentWillUnmount() {
        this.dollarChart.destroy();
        this.percentageChart.destroy();
    }

    initializeChart = () => {
        const {dollarSeries, percentageSeries} = this.props;
        const highChartId = _.get(this.props, 'id', '');
        this.dollarChart = new HighChart['Chart'](`${highChartId}-bar-chart-dollar`, this.state.config);
        this.percentageChart = new HighChart['Chart'](`${highChartId}-bar-chart-percentage`, this.state.config);
        try {
            this.updateDollarSeries(dollarSeries);
            this.updatePercentageSeries(percentageSeries)
        } catch(err) {
            // console.log(err);
        } 
    }

    updateDollarSeries = series => {
        if (series.length > 0) {
            this.clearDollarSeries();
            series.map((item, index) => {
                this.dollarChart.addSeries({
                    name: item.name,
                    data: this.props.updateTimeline 
                        ? item.timelineData.map(itemValue  => itemValue.value)
                        : item.data,
                });
            });
            this.dollarChart.update({colors: [simulatedPerformanceColor, benchmarkColor]});
            this.props.updateTimeline && this.dollarChart.update({
                xAxis: {
                    gridLineColor: 'transparent',
                    categories: this.props.dollarCategories 
                            ? this.props.dollarCategories 
                            : series[0].timelineData.map(item => item.timeline.format('MMM YY'))
                }
            })
        }
    }

    updatePercentageSeries = series => {
        if (series.length > 0) {
            this.clearPercentageSeries();
            series.map((item, index) => {
                this.percentageChart.addSeries({
                    name: item.name,
                    data: this.props.updateTimeline 
                            ? item.timelineData.map(itemValue  => itemValue.value)
                            : item.data,
                });
            });
            this.percentageChart.update({colors: [currentPerformanceColor, benchmarkColor]});
            this.props.updateTimeline && this.percentageChart.update({
                xAxis: {
                    gridLineColor: 'transparent',
                    categories: this.props.percentageCategories 
                            ? this.props.percentageCategories 
                            : series[0].timelineData.map(item => item.timeline.format('MMM YY'))
                }
            })
        }
    }

    findYAxisMaxValue = series => {
        let data = [];
        series.map(seriesItem => {
            data = [...data, ..._.get(seriesItem, 'data', [])];
        });
        const maxValue = _.max(data);

        return Math.ceil(maxValue / 10) * 10;
    }

    findYAxisMinValue = series => {
        let data = [];
        series.map(seriesItem => {
            data = [...data, ..._.get(seriesItem, 'data', [])];
        });
        const minValue = _.min(data);
        
        return Math.ceil(minValue / 10) * 10;
    }

    clearDollarSeries = () => {
        while (this.dollarChart.series.length) {
            this.dollarChart.series[0].remove();
        }
    }

    clearPercentageSeries = () => {
        while (this.percentageChart.series.length) {
            this.percentageChart.series[0].remove();
        }
    }

    handleRadioGroupChange = e => {
        this.setState({
            dollarVisible: e.target.value === 'dollarPerformance' ? true : false,
        });
        if (this.props.dollarCategories) {
            if (e.target.value === 'dollarPerformance') {
                this.dollarChart.update({
                    xAxis: {
                        gridLineColor: 'transparent',
                        categories: this.props.dollarCategories
                    }
                });
            } else {
                this.percentageChart.update({
                    xAxis: {
                        gridLineColor: 'transparent',
                        categories: this.props.percentageCategories
                    }
                });
            }
        }
    }

    render() {
        const chartPercentageStyle = !this.state.dollarVisible ? {display: 'block'} : {display: 'none'};
        const chartDollarStyle = this.state.dollarVisible ? {display: 'block'} : {display: 'none'};
        const {alignLegend = 'right', legendStyle = {}} = this.props;
        const highChartId = _.get(this.props, 'id', '');

        return (
            <Row style={{height: '320px'}}>
                <Col span={24} style={{textAlign: alignLegend, ...legendStyle, marginTop: '5px'}}>
                    <RadioGroup 
                            size="small" 
                            defaultValue="dollarPerformance" 
                            style={{marginRight: '10px'}} 
                            onChange={this.handleRadioGroupChange}
                    >
                        <RadioButton 
                                value="dollarPerformance" 
                        >
                            {_.get(this.props, 'radiogroupLabels[0]', '&#x20b9;')}
                        </RadioButton>
                        <RadioButton 
                                value="percentagePerformance" 
                        >
                            {_.get(this.props, 'radiogroupLabels[1]', '%')}
                        </RadioButton>
                    </RadioGroup>
                </Col>
                <Col span={24} style={{textAlign: 'center', ...chartDollarStyle}} id={`${highChartId}-bar-chart-dollar`}></Col>
                <Col span={24} style={{textAlign: 'center', ...chartPercentageStyle}} id={`${highChartId}-bar-chart-percentage`}></Col>
            </Row>
        );
    }
}