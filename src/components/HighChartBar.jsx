import * as React from 'react';
import _ from 'lodash';
import $ from 'jquery';
import {Col, Row, Radio} from 'antd';
import HighChart from 'highcharts';
import {Utils} from '../utils';
import {benchmarkColor, currentPerformanceColor, simulatedPerformanceColor} from '../constants';

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
                },
                xAxis: {
                    gridLineColor: 'transparent',
                    title: {
                        enabled: false,
                        name: 'Stock',
                        text: null
                    },
                    categories: props.categories || null
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
                    formatter: function () {
                        var s = '<b>' + this.x + '</b>';
                        $.each(this.points, function () {
                            s += '<br/>' + this.series.name + ': <b>' +
                                this.y + '</b>%';
                        });

                        return s;
                    },
                    shared: true
                },
                colors: [simulatedPerformanceColor, benchmarkColor],
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
        // console.log('Categories', this.props.categories);
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
                    color: item.color
                });
            });
            this.props.updateTimeline && this.dollarChart.update({
                xAxis: {
                    gridLineColor: 'transparent',
                    categories: series[0].timelineData.map(item => item.timeline.format('MMM YY'))
                },
                colors: [simulatedPerformanceColor, benchmarkColor],
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
                    color: item.color
                });
            });
            this.props.updateTimeline && this.percentageChart.update({
                xAxis: {
                    gridLineColor: 'transparent',
                    categories: series[0].timelineData.map(item => item.timeline.format('MMM YY'))
                },
                colors: [currentPerformanceColor, benchmarkColor],
            })
        }
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
        this.setState({dollarVisible: e.target.value === 'dollarPerformance' ? true : false});
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