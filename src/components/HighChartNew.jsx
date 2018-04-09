import * as React from 'react';
import {Col} from 'antd';
import _ from 'lodash';
import HighChart from 'highcharts';
import VariablePie from 'highcharts/modules/variable-pie'
VariablePie(HighChart); 

export class HighChartNew extends React.Component {
    constructor(props) {
        super(props);
        this.chart = null;
        this.state = {
            config: {
                colors: ['#f58231','#911eb4','#3cb44b','#ffe119','#46f0f0','#f032e6','#d2f53c','#fabebe','#008080','#e6beff','#aa6e28','#fffac8','#800000','#aaffc3','#808000','#ffd8b1','#000080', '#808080'],
                chart: {
                    type: 'variablepie',
                    height: 280,
                    animation:false,
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
                    variablepie: {
                        innerSize: 150,
                        cursor: 'pointer',
                        zMin:0,
                        zMax:1,
                        minPointSize:30,
                        point:{
                            events:{
                                click: function(){
                                    this.series.points.forEach(item => {
                                        item.update({z:0});
                                    });

                                    this.update({z:1});
                                }
                            }
                        },
                        states: {
                            hover: {
                                enabled:  false
                            }
                        },
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
        if (!_.isEqual(nextProps.series,this.props.series)) {
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