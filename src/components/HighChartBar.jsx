import * as React from 'react';
import {Col, Row, Radio} from 'antd';
import HighChart from 'highcharts';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


export class HighChartBar extends React.Component {
    constructor(props) {
        super(props);
        this.dollarChart = null;
        this.percentageChart = null;
        this.state = {
            config: {
                chart: {
                    type: 'column',
                    height: 280
                },
                plotOptions: {
                    column: {
                        dataLabels: {
                            enabled: true,
                            crop: false,
                            overflow: 'none',
                            color: '#555454'
                        }
                    }
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
                tooltip: {
                    enabled: false
                },
                series: []
            },
            dollarVisible: true
        }
    }

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        console.log('Next Props', nextProps);
        if (nextProps.dollarSeries !== this.props.dollarSeries) {
            try {
                this.updateDollarSeries(nextProps.dollarSeries);
                this.updatePercentageSeries(nextProps.percentageSeries)
            } catch(err) {
                console.log(err);
            }
        }
    }

    componentWillUnmount() {
        this.dollarChart.destroy();
        this.percentageChart.destroy();
    }

    initializeChart = () => {
        const {dollarSeries, percentageSeries} = this.props;
        this.dollarChart = new HighChart['Chart']('bar-chart-dollar', this.state.config);
        this.percentageChart = new HighChart['Chart']('bar-chart-percentage', this.state.config);
        try {
            this.updateDollarSeries(dollarSeries);
            this.updatePercentageSeries(percentageSeries)
        } catch(err) {
            console.log(err);
        } 
    }

    updateDollarSeries = series => {
        console.log('Dollar Series', series);
        if (series.length > 0) {
            this.clearDollarSeries();
            series.map((item, index) => {
                this.dollarChart.addSeries({
                    name: item.name,
                    data: item.data,
                    color: item.color
                });
            });
        }
    }

    updatePercentageSeries = series => {
        console.log('Percentage Series', series);
        if (series.length > 0) {
            this.clearPercentageSeries();
            series.map((item, index) => {
                this.percentageChart.addSeries({
                    name: item.name,
                    data: item.data,
                    color: item.color
                });
            });
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
        const {alignLegend = 'right'} = this.props;

        return (
            <Row style={{height: '320px'}}>
                <Col span={24} style={{textAlign: alignLegend}}>
                    <RadioGroup size="small" defaultValue="dollarPerformance" style={{marginRight: '10px', marginTop: '10px'}} onChange={this.handleRadioGroupChange}>
                        <RadioButton value="dollarPerformance">Dollar</RadioButton>
                        <RadioButton value="percentagePerformance">Percentage</RadioButton>
                    </RadioGroup>
                </Col>
                <Col span={24} style={{textAlign: 'center', ...chartDollarStyle, marginTop: '-5px'}} id='bar-chart-dollar'></Col>
                <Col span={24} style={{textAlign: 'center', ...chartPercentageStyle, marginTop: '-5px'}} id='bar-chart-percentage'></Col>
            </Row>
        );
    }
}