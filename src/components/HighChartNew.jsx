import * as React from 'react';
import {Row,Col} from 'antd';
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
                    height: props.height || 280,
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
                        //center: [160, 100],
                        innerSize: props.innerSize || 150,
                        cursor: 'pointer',
                        zMin:0,
                        zMax:1,
                        minPointSize:30,
                        //showInLegend:true,
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

                    series: {
                        animation: false,
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
                        text: !this.props.numeric ? `${e.point.name}<br>${e.point.y} %` : `${e.point.name}<br>${e.point.y}`,
                        style: {
                            color: e.point.color,
                        }
                    }
                });
                if (this.props.handleChartClick) {
                    this.props.handleChartClick(e.point);
                }
            }
        }
    })

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (!_.isEqual(nextProps.series,this.props.series)) {
            if (nextProps.series !== undefined) {
                this.updateSeries(nextProps.series);
            }
        } else {
            // console.log('Same');
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
            const validIndex = this.getValidIndex(series);
            series.map((item, index) => {
                this.chart.addSeries({
                    name: item.name,
                    data: item.data.map((item, index) => {
                        return {
                            ...item,
                            z: index === validIndex ? 1 : 0
                        }
                    }),
                });
            });
            this.updateTitle(series);
        }
    }

    updateTitle = series => {
        const titleIndex = this.getValidIndex(series);
        try {
            this.chart.update({
                title: {
                    text: !this.props.numeric 
                        ? `${series[0].data[titleIndex].name}<br>${series[0].data[titleIndex].y} %`
                        : `${series[0].data[titleIndex].name}<br>${series[0].data[titleIndex].y}`,
                    style: {
                        color: series[0].data[titleIndex].color,
                        fontSize: '14px'
                    }
                }
            });
        } catch(err) {
            // console.log(err);
        }
    }

    // Gives the index of the first item of the series where y > 0
    getValidIndex = series => {
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
            <Row style={{height: '320px', ...this.props.chartContainerStyle}} id="chart-container"></Row>
        );
    }
}