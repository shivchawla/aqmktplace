import * as React from 'react';
import {Col, Row, Radio} from 'antd';
import HighChart from 'highcharts';

export class HighChartSpline extends React.Component { 
    constructor(props) {
        super(props);
        this.chart = null;
        this.state = {
            config: {
                chart: {
                    // type: 'spline',
                    height: 300,
                    width: 400
                },
                plotOptions: {
                    series: {
                        marker: {
                            enabled: false
                        },
                        states: { hover: { enabled: false}} 
                    }
                },
                tooltip: {
                    enabled: false
                },
                title: {
                    style: {display: 'none'}
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    title: {
                        text: props.xAxisTitle === undefined ? 'Rating' : props.xAxisTitle
                    }
                },
                legend: {
                    enabled: true
                },
                
                series: []
            }
        };
    }

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (nextProps.series !== this.props.series) {
            try {
                this.updateSeries(nextProps.series);
            } catch(err) {
                // console.log(err);
            }
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    initializeChart = () => {
        const {series} = this.props;
        this.chart = new HighChart['Chart'](this.props.id, this.state.config);
        try {
            this.updateSeries(series);
        } catch(err) {
            // console.log(err);
        } 
    }

    updateSeries = series => {
        this.clearSeries();
        series.map(item => {
            this.chart.addSeries(item);
        });
    }

    clearSeries = () => {
        while (this.chart.series.length) {
            this.chart.series[0].remove();
        }
    }

    render() {
        return(
            <Col span={24} id={this.props.id}></Col>
        );
    }
}


