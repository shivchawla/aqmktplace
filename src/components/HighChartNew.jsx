import * as React from 'react';
import {Col} from 'antd';
import HighChart from 'highcharts';

export class HighChartNew extends React.Component {
    constructor(props) {
        super(props);
        this.chart = null;
        this.state = {
            config: {
                chart: {
                    type: 'pie',
                    height: 280,
                },
                title: {
                    text: 'Hello World',
                    align: 'center',
                    verticalAlign: 'middle',
                    y: -5,
                    style: {
                        fontSize: '16px'
                    }
                },
                tooltip: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        innerSize: 150,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '{point.name} {point.percentage:.1f}%',
                            distance: -15,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 0
                            }
                        },
                        ...this.subsPerAdviceChart()
                    },
                },
                series: [],
                colors: ["#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"],
            }
        }
    }

    subsPerAdviceChart= () => ({
        events: {
            click: e => {
                this.chart.update({
                    title: {
                        text: `${e.point.name}<br>${e.point.y}`
                    }
                })
            },
            load: () => {
                // console.log('Successfully loaded');
            }
        }
    })

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        // console.log(nextProps.series);
        if (nextProps.series !== this.props.series) {
            // console.log('Data Changed');
            this.updateSeries(nextProps.series);
        } else {
            // console.log('Data Same');
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    initializeChart = () => {
        const {series} = this.props;
        this.chart = new HighChart['Chart']('chart-container', this.state.config);
        this.updateSeries(series);
    }

    updateSeries = series => {
        this.clearSeries();
        series.map((item, index) => {
            this.chart.addSeries({
                name: item.name,
                data: item.data
            });
        });
        this.updateTitle(series);
    }

    updateTitle = series => {
        this.chart.update({
            title: {
                text: `${series[0].data[0].name}<br>${series[0].data[0].y}`
            }
        });
    }

    clearSeries = () => {
        while (this.chart.series.length) {
            this.chart.series[0].remove();
        }
    }

    render() {
        return(
            <Col span={24} style={{textAlign: 'center'}} id="chart-container"></Col>
        );
    }
}