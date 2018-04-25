import * as React from 'react';
import {Col, Row, Radio} from 'antd';
import HighChart from 'highcharts';
import {Utils} from '../utils';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


export class HighChartBar extends React.Component {
    constructor(props) {
        super(props);
        this.dollarChart = null;
        this.percentageChart = null;
        const {legendEnabled = true} = props; 
        this.state = {
            config: {
                chart: {
                    type: 'column',
                    height: 280
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
                        //enabled: true
                    },
                    title: {
                        enabled: false,
                    },
                    gridLineColor: 'transparent',
                },
                xAxis: {
                    gridLineColor: 'transparent',
                    title: {
                        enabled: true,
                        name: 'Stock'
                    }
                    // categories: props.categories || null
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
                        fontSize:'10px',
                        fontWeight: '400',
                        width: '200'
                    },
                    labelFormatter: function() {
                        return `<h3>${this.name} - <span style="color: #353535">${Utils.formatMoneyValueMaxTwoDecimals(this.yData[0])}</span></h3>`;
                    },
                    x: -20,
                    itemWidth: 100,
                    verticalAlign: 'middle',
                    itemMarginBottom:10,
                    useHTML: true
                },
                credits: {
                    //enabled: false
                },
                tooltip: {
                    enabled: true
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
        console.log('Categories', this.props.categories);
    }

    componentWillReceiveProps(nextProps, nextState) {
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
        if (series.length > 0) {
            this.clearDollarSeries();
            const categories = series.map(item => item.name);
            console.log('Categories', categories);
            series.map((item, index) => {
                this.dollarChart.addSeries({
                    name: item.name,
                    data: item.data,
                    color: item.color
                });
            });
            this.dollarChart.update({
                xAxis: {
                    gridLineColor: 'transparent',
                    categories: series.map(item => item.name)
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
        const {alignLegend = 'right', legendStyle = {}} = this.props;

        return (
            <Row style={{height: '320px'}}>
                <Col span={24} style={{textAlign: alignLegend, ...legendStyle, marginTop: '5px'}}>
                    <RadioGroup 
                            size="small" 
                            defaultValue="dollarPerformance" 
                            style={{marginRight: '10px'}} 
                            onChange={this.handleRadioGroupChange}
                    >
                        <RadioButton value="dollarPerformance" style={{fontSize: '18px'}}>&#x20b9;</RadioButton>
                        <RadioButton value="percentagePerformance" style={{fontSize: '18px'}}>%</RadioButton>
                    </RadioGroup>
                </Col>
                <Col span={24} style={{textAlign: 'center', ...chartDollarStyle}} id='bar-chart-dollar'></Col>
                <Col span={24} style={{textAlign: 'center', ...chartPercentageStyle}} id='bar-chart-percentage'></Col>
            </Row>
        );
    }
}