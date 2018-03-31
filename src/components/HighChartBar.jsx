import * as React from 'react';
import {Col} from 'antd';
import HighChart from 'highcharts';

export class HighChartBar extends React.Component {
    constructor(props) {
        super(props);
        this.chart = null;
        this.state = {
            config: {
                colors: ["#e91e63", "#444", "#90ed7d", "#f7a35c", "#8085e9"],
                chart: {
                    type: 'bar',
                    height: 280
                },
                yAxis: {
                    labels: {
                        enabled: true
                    },
                    title: {
                        enabled: false
                    },
                    gridLineColor: 'transparent',
                },
                xAxis: {
                    title: {
                        enabled: false
                    },
                    gridLineColor: 'transparent',
                },
                title: {
                    style: {
                        display: 'none'
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    itemDistance: '30px',
                    itemStyle: {
                        color: '#444',
                        fontSize:'12px',
                        fontWeight: '400',
                    },
                    itemWidth: 100,
                    verticalAlign: 'middle',
                    itemMarginBottom:10
                },
                credits: {
                    enabled: false
                },
                series: []
            }
        }
    }

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.series !== this.props.series) {
            this.updateSeries(nextProps.series);
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    initializeChart = () => {
        const {series} = this.props;
        console.log(series);
        this.chart = new HighChart['Chart']('bar-chart', this.state.config);
        this.updateSeries(series);
    }

    updateSeries = series => {
        if (series.length > 0) {
            this.clearSeries();
            series.map((item, index) => {
                this.chart.addSeries({
                    name: item.name,
                    data: item.data
                });
            });
        }
    }

    clearSeries = () => {
        while (this.chart.series.length) {
            this.chart.series[0].remove();
        }
    }

    render() {
        return (
            <Col span={24} style={{textAlign: 'center'}} id='bar-chart'></Col>
        );
    }
}