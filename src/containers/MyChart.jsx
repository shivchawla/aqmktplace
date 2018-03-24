import * as React from 'react';
const ReactHighcharts = require('react-highcharts');

export class MyChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            chartConfig: {
                title: {
                    text: 'Solar Employment Growth by Sector, 2010-2016'
                },
            
                subtitle: {
                    text: 'Source: thesolarfoundation.com'
                },
            
                yAxis: {
                    title: {
                        text: 'Number of Employees'
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    verticalAlign: 'middle'
                },
            
                plotOptions: {
                    series: {
                        label: {
                            connectorAllowed: false
                        },
                        pointStart: 2010
                    }
                },
            
                series: props.series,
                responsive: {
                    rules: [{
                        condition: {
                            maxWidth: 500
                        },
                        chartOptions: {
                            legend: {
                                layout: 'horizontal',
                                align: 'center',
                                verticalAlign: 'bottom'
                            }
                        }
                    }]
                }                
            }
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (this.props.series === nextProps.series) {
            return false;
        }
        return true;
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            chartConfig: {...this.state.chartConfig, series: nextProps.series}
        })
    }

    render() {
        return (
            <ReactHighcharts config = {this.state.chartConfig} />
        );
    }
}