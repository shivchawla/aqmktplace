import * as React from 'react';
import moment from 'moment';
import Radium from 'radium';
import {withRouter} from 'react-router';
import {Row, Col, Icon, Tag, Rate} from 'antd';
import {MetricItem} from './MetricItem';
import medalIcon from '../assets/award.svg';
import trendingUpIcon from '../assets/trending-up.svg';

const dateFormat = 'Do MMMM YYYY';
const ReactHighcharts = require('react-highcharts');
const HighchartsMore = require('highcharts-more');
const SolidGauge = require("highcharts-solid-gauge");

HighchartsMore(ReactHighcharts.Highcharts);
SolidGauge(ReactHighcharts.Highcharts);

class AdviceListItemImpl extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            diversityConfig: {
                chart: {
                    type: 'pie',
                    height: 85,
                    width: 85
                },
                title: {
                    text: '',
                },
                tooltip: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        innerSize: 0
                    },
                    series: {
                        dataLabels: {
                            enabled: false
                        }
                    }
                },
                series: [{
                    name: 'Brands',
                    colorByPoint: true,
                    data: [{
                        name: 'Chrome',
                        y: 61.41,
                    }, {
                        name: 'Internet Explorer',
                        y: 11.84
                    }, {
                        name: 'Firefox',
                        y: 10.85
                    }, {
                        name: 'Edge',
                        y: 4.67
                    }, {
                        name: 'Safari',
                        y: 4.18
                    }]
                }],
                colors: ["#009688", "#76FF03", "#F44336", "#FFEB3B", "#1DE9B6"],
            },
            betaConfig: {
                chart: {
                    type: 'bar',
                    width: 130,
                    height: 80

                },
                xAxis: {
                    categories: ['Apples', 'Oranges', 'Pears', 'Grapes', 'Bananas'],
                    labels: {
                        enabled: false
                    },
                    gridLineColor: 'transparent',
                    visible: false,
                },
                tooltip: {
                    enabled: false
                },
                yAxis: {
                    min: 0,
                    max: 200,
                    labels: {
                        enabled: false
                    },
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
                credits: {
                    enabled: false
                },
                legend: {
                    enabled: false
                },
                series: [{
                    name: 'Market',
                    data: [100]
                }],
                pane: {
                    center: ['50%', '85%'],
                    size: '100%',
                },
                colors: ['#E19E39', '#3EBB72']
            },
            volatilityConfig: {
                chart: {
                    type: 'solidgauge',
                    height: 70
                },
                title: null,
                pane: {
                    center: ['50%', '85%'],
                    size: '100%',
                    startAngle: -90,
                    endAngle: 90,
                    background: {
                        innerRadius: '60%',
                        outerRadius: '100%',
                        shape: 'arc'
                    }
                },
                tooltip: {
                    enabled: false
                },
                // the value axis
                yAxis: {
                    stops: [
                        [0.1, '#7CB342'], // green
                        [0.5, '#FBC02D'], // yellow
                        [0.9, '#E65100'] // red
                    ],
                    min: 0,
                    max: 200,
                    lineWidth: 0,
                    minorTickInterval: null,
                    tickAmount: 2,
                    title: {
                        y: -70
                    },
                    labels: {
                        y: 16
                    },
                    visible: false
                },
                credits: {
                    enabled: false
                },
                plotOptions: {
                    solidgauge: {
                        dataLabels: {
                            y: 5,
                            borderWidth: 0,
                            useHTML: true,
                            enabled: false
                        }
                    }
                },
                series: []
                // {
                //     name: 'Speed',
                //     data: [180],
                // }
            }
        }
    }

    handleClick = (id) => {
        this.props.history.push(`/advice/${id}`);
    }

    renderSectors = (sectors) => {
        if (sectors.length > 2) {
            return (
                <Tag 
                    color="#ECFAFF" 
                    style={{color: '#414141'}} 
                    onClick={e => {e.stopPropagation()}} 
                >
                    Diversified
                </Tag>
            );
        } 
        return sectors.slice(0, 2).map((sector, index) => {
            return <Tag 
                    color="#ECFAFF" 
                    style={{color: '#414141'}} 
                    onClick={e => {e.stopPropagation()}} 
                    key={index}
                >
                    {sector}
                </Tag>
        });
    }

    renderDiversityChart = () => {
        return (
            <Row style={{textAlign: 'center'}} type="flex" justify="center">
                <Col span={24}>
                    <ReactHighcharts config = {this.state.diversityConfig} /> 
                </Col>
                <Col span={24} style={{marginTop: '-20px', marginLeft: '-25px'}}>
                    <h5>Diversity <span style={{fontSize: "14px"}}>80%</span></h5>
                </Col>
            </Row>
        );
    }

    renderBetaChart = (beta) => {
        const series = [...this.state.betaConfig.series];
        series.push({name: 'Advice', data: [beta * 100]})
        const betaConfig = {
            ...this.state.betaConfig,
            series
        };
        console.log(betaConfig)

        return (
            <Row style={{textAlign: 'center'}} type="flex" justify="center">
                <Col span={24}>
                    <ReactHighcharts config = {betaConfig} /> 
                </Col>
                <Col span={24} style={{marginTop: '-15px', marginLeft: '-15px'}}>
                    <h5>Beta <span style={{fontSize: "14px"}}>{beta * 100} %</span></h5>
                </Col>
            </Row>
        );
    }

    renderVolatilityChart = (volatility) => {
        // const series = [...this.state.volatilityConfig.series];
        // series.push({
        //     name: 'Advice',
        //     data: 
        // })
        return (
            <Row style={{textAlign: 'center'}} type="flex" justify="center">
                <Col span={24}>
                    <ReactHighcharts config = {this.state.volatilityConfig} /> 
                </Col>
                <Col span={24} style={{marginTop: '-10px'}}>
                    <h5>Volatility <span style={{fontSize: "14px"}}>{Number((volatility * 100).toFixed(2))}</span></h5>
                </Col>
            </Row>
        );
    }

    render() {
        const {
            name, 
            advisor = null, 
            createdDate = null, 
            heading = null, 
            subscribers, 
            rating, 
            latestPerformance, 
            id,
            isFollowing
        } = this.props.advice;
        const sectors = latestPerformance.industries;

        return (
            <Row type="flex" style={cardStyle} align="top">
                <Col span={8}>
                    <Row>
                        <Col span={24}>
                            <h3>{name}</h3>
                        </Col>
                        <Col span={24} style={{margin: '5px 0'}}>
                            {this.renderSectors(sectors)}
                        </Col>
                        <Col span={24}>
                            <Row>
                            <Col span={8}>
                                <MetricItem 
                                        style={{border: 'none'}} 
                                        value={subscribers} 
                                        label="Subscribers"
                                        valueStyle={{fontSize: '16px', fontWeight: '400', color: '#3B3737'}}
                                        labelStyle={{fontSize: '14px', fontWeight: '400', color: '#716E6E'}}
                                />
                            </Col>
                            <Col span={8}>
                                <MetricItem 
                                        style={{border: 'none'}} 
                                        value={`${(latestPerformance.maxLoss * 100).toFixed(2)} %`} 
                                        label="Max Loss"
                                        valueStyle={{fontSize: '16px', fontWeight: '400', color: '#3B3737'}}
                                        labelStyle={{fontSize: '14px', fontWeight: '400', color: '#716E6E'}}
                                />
                            </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    <Row style={{left: '-20px'}}>
                        <Col span={24} style={{textAlign: 'center'}}>
                            <Rate disabled value={rating}/>
                        </Col>
                        <Col span={24}>
                            <Row>
                                <Col span={8}>
                                    {this.renderDiversityChart()}
                                </Col>
                                <Col span={8}>
                                    {this.renderBetaChart(latestPerformance.beta)}
                                </Col>
                                <Col span={8}>
                                    {this.renderVolatilityChart(latestPerformance.volatility)}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col span={7} offset={1}>
                    <Row type="flex" justify="end">
                        <Col span={24}>
                            <Row type="flex" align="bottom" style={{textAlign: 'center'}}>
                                <Col span={6}>
                                    <MetricItem 
                                            value={latestPerformance.netValue} 
                                            label="Net Value" 
                                            valueStyle={netValueStyle} 
                                            labelStyle={netLabelStyle}
                                    />
                                </Col>
                                <Col span={18}>
                                    <Row>
                                        <Col span={8} offset={2}>
                                            <MetricItem 
                                                    valueStyle={{
                                                        ...returnValueStyle, 
                                                        color: latestPerformance.return < 0 ? '#FA4747' : '#3EBB72'
                                                    }} 
                                                    labelStyle={returnLabelStyle} 
                                                    value={latestPerformance.return.toFixed(2)} 
                                                    label="Total Return"
                                            />
                                        </Col>
                                        <Col span={8} offset={1}>
                                            <MetricItem 
                                                    valueStyle={{
                                                        ...returnValueStyle,
                                                        color: latestPerformance.dailyChange < 0 ? '#FA4747' : '#3EBB72'
                                                    }} 
                                                    labelStyle={returnLabelStyle} 
                                                    value={latestPerformance.dailyChange.toFixed(3)} 
                                                    label="Daily Return"
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24} style={{marginTop: '25px'}}>
                            <Row type="flex" justify="end">
                                <Col span={10}>
                                    <IconItem src={medalIcon} imageStyle={{transform: 'scale(0.7, 0.7)'}} label="Approved"/>
                                </Col>
                                <Col span={10}>
                                    <IconItem src={trendingUpIcon} imageStyle={{transform: 'scale(0.7, 0.7)'}} label="Trending" labelStyle={{marginLeft: "10px"}}/>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const AdviceListItemMod = withRouter(Radium(AdviceListItemImpl));

const IconItem = ({src, label, imageStyle={}, labelStyle={}}) => {
    return (
        <Row>
            <Col span={4} style={iconItemImageStyle}>
                <img style={imageStyle} src={src} />
            </Col>
            <Col span={8}>
                <span style={{...iconItemLabelStyle, ...labelStyle}}>{label}</span>
            </Col>
        </Row>
    );
}

const iconItemImageStyle = {
    color: '#5A5A5A',
    fontSize: '14px',
    fontWeight: 400
};

const iconItemLabelStyle = {

};

const cardStyle = {
    backgroundColor: '#fff',
    padding: '10px 5px 10px 15px',
    borderBottom: '1px solid #eaeaea',
    cursor: 'pointer',
};

const adviceTitleStyle = {
    fontWeight: '700',
    fontSize: '16px',
    color: '#646464'
};

const authorStyle = {
    color: '#238090',
    fontSize: '12px',
    marginTop: '-30px'
};

const dateStyle = {
    color: '#8C8C8C',
    fontSize: '12px'
};

const headingStyle = {
    color: '#1F1F1F',
    fontSize: '14px',
    marginTop: '5px'
};

const netValueStyle = {
    fontSize: '20px',
    fontWeight: 400,
    color: '#3B3737'
};

const netLabelStyle = {
    fontSize: '14px',
    color: '#716E6E'
};

const returnValueStyle = {
    fontSize: '16px',
    color: '#3AC089',
    fontWeight: 400
};

const returnLabelStyle = {
    fontSize: '14px',
    color: '#716E6E',
    fontSize: '10px'
};
