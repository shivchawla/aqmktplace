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
                    plotBackgroundColor: null,
                    plotBorderWidth: null,
                    plotShadow: false,
                },
                title: {
                    text: '',
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
                        // allowPointSelect: true,
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
            }
        }
    }

    subsPerAdviceChart= () => ({
        events: {
            click: e => {
                this.chart.update({
                    title: {
                        text: `${e.point.name}<br>${e.point.y} %`,
                        style: {
                            color: e.point.color,
                        }
                    }
                })
            }
        }
    })

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        console.log('Old Series', this.props.series);
        console.log('Next Series', nextProps.series);
        if (nextProps.series !== this.props.series) {
            this.updateSeries(nextProps.series);
            console.log('Different');
        } else {
            console.log('Same');
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
        if (series.length > 0) {
            this.clearSeries();
            series.map((item, index) => {
                this.chart.addSeries({
                    name: item.name,
                    data: item.data,
                    // sliced: true,
                    selected: true,
                });
            });
            this.updateTitle(series);
        }
    }

    updateTitle = series => {
        const titleIndex = this.getValidTitle(series);
        try {
            this.chart.update({
                title: {
                    text: `${series[0].data[titleIndex].name}<br>${series[0].data[titleIndex].y} %`,
                    style: {
                        color: series[0].data[titleIndex].color,
                        fontSize: '14px'
                    }
                }
            });
        } catch(err) {
            console.log(err);
        }
    }

    getValidTitle = series => {
        const dataArray = series[0].data;
        let i = 0;
        while(i < dataArray.length) {
            if (dataArray[i].y > 0){ 
                break;
            }
            i++;
        }
        return i;
    }

    clearSeries = () => {
        while (this.chart.series.length) {
            this.chart.series[0].remove();
        }
    }

    render() {
        return(
            <Col span={24} style={{textAlign: 'center', height: '320px'}} id="chart-container"></Col>
        );
    }
}