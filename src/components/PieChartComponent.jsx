import * as React from 'react';
import Chart from 'chart.js';
import _ from 'lodash';

export default class PieChartComponent extends React.Component {
    constructor(props) {
        super(props);
        this.pieChartId = null;
        this.chart = null;
        this.state = {
            data: [],
            backgroundColor: [],
            labels: []
        }
    }

    processData = (props = this.props) => {
        const {data = []} = props;
        const labels = [];
        const pieData = [];
        const backgroundColor = [];
        data.map(item => {
            labels.push(item.label);
            pieData.push(item.value);
            backgroundColor.push(item.color);
        });

        return {data: pieData, labels, backgroundColor};
    }

    // shouldComponentUpdate(nextProps) {
    //     if (_.isEqual(nextProps, this.props)) {
    //         return true;
    //     }

    //     return false;
    // }

    componentWillReceiveProps(nextProps) {
        const chartData = this.processData(nextProps);
        this.setState({
            data: chartData.data,
            backgroundColor: chartData.backgroundColor,
            labels: chartData.labels
        });
    }

    initializeChart = () => {
        const ctx = document.getElementById(this.pieChartId || 'pie-chart');
        const chartData = this.processData();
        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                datasets: [{
                    data: this.state.data,
                    backgroundColor: this.state.backgroundColor
                }],
            
                // These labels appear in the legend and in the tooltips when hovering different arcs
                labels: this.state.labels
            },
            options: {
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero:true
                        }
                    }]
                }
            }
        });
    }

    componentDidMount() {
        const chartData = this.processData();
        this.setState({
            data: chartData.data,
            backgroundColor: chartData.backgroundColor,
            labels: chartData.labels
        }, () => {
            
        })
        this.initializeChart();
    }

    render() {
        const pieChartId = this.props.chartId ? this.props.chartId : 'pie-chart';
        const width = this.props.width || 400;
        const height = this.props.height || 400;
        console.log('Pie Chart Component rendered');

        return <canvas id={pieChartId} width={this.width} height={this.height}></canvas>;
    }
}