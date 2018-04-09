import * as React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Radium from 'radium';
import {withRouter} from 'react-router';
import {Row, Col, Icon, Tag, Rate} from 'antd';
import {MetricItem} from './MetricItem';
import medalIcon from '../assets/award.svg';
import trendingUpIcon from '../assets/trending-up.svg';
import sunrise from '../assets/sunrise.svg';
import pie from '../assets/pie.svg';
import barChart from '../assets/bar-chart-2.svg';
import totalReturnIcon from '../assets/totalReturn.svg';

const dateFormat = 'Do MMMM YYYY';

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
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                    <img style={iconStyle} src={pie} />
                </Col>
                <Col span={24} style={{fontSize: '16px'}}>
                    <h5>Diversification <span style={{fontSize: "14px"}}>80%</span></h5>
                </Col>
            </Row>
        );
    }

    renderBetaChart = (beta) => {
        return (
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                    <img style={{transform: 'scale(0.8, 0.8)'}} src={barChart} />
                </Col>
                <Col span={24} style={{marginTop: '6px'}}>
                    <h5>Beta <span style={{fontSize: "16px"}}>{(beta * 100).toFixed(2)}</span></h5>
                </Col>
            </Row>
        );
    }

    renderTotalReturnIcon = totalReturn => {
        return (
            <Row style={{textAlign: 'center', marginTop: '8px'}}>
                <Col span={24}>
                    <img style={{transform: 'scale(0.8, 0.8)'}} src={totalReturnIcon} />
                </Col>
                <Col span={24}>
                    <h5>Total Ret <span style={{fontSize: "16px"}}>{(totalReturn * 100).toFixed(2)} %</span></h5>
                </Col>
            </Row>
        );
    }

    renderVolatilityChart = (volatility) => {
        return (
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                <img style={iconStyle} src={sunrise} />
                </Col>
                <Col span={24}>
                    <h5>Volatility <span style={{fontSize: "16px"}}>{Number((volatility * 100).toFixed(2))} %</span></h5>
                </Col>
            </Row>
        );
    }

    renderTrendingApprovedIcon = () => {
        return (
            <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'center', marginLeft: '-7px'}}>
                <div>
                    <IconItem 
                            src={medalIcon} 
                            imageStyle={{transform: 'scale(0.7, 0.7)'}} 
                            labelStyle={{marginLeft: '5px'}}
                            label="Approved"
                    />
                </div>
                <div span={10} style={{marginLeft: '5px'}}>
                    <IconItem src={trendingUpIcon} imageStyle={{transform: 'scale(0.7, 0.7)'}} label="Trending" labelStyle={{marginLeft: "10px"}}/>
                </div>
            </div>
        );
    }

    renderMetricIcons = performanceSummary => {
        return (
            <Row>
                <Col span={6}>
                    {this.renderDiversityChart()}
                </Col>
                {
                    performanceSummary.current && 
                    <Col span={6}>
                        {this.renderBetaChart(performanceSummary.current.beta)}
                    </Col>
                }
                {
                    performanceSummary.current && 
                    <Col span={6}>
                        {this.renderVolatilityChart(performanceSummary.current.volatility)}
                    </Col>
                }
                {
                    performanceSummary.current && 
                    <Col span={6}>
                        {this.renderTotalReturnIcon(performanceSummary.current.totalReturn)}
                    </Col>
                }
            </Row>
        );
    }

    renderNetValueChange = performanceSummary => {
        let netValue = 0, dailyChange = 0, dailyChangePct = 0, totalReturn;
        if (performanceSummary && performanceSummary.current) {
            netValue = _.get(performanceSummary, 'performanceSummary.current.netValue', 0);
            dailyChange = _.get(performanceSummary, 'performanceSummary.current.dailyChange', 0);
            dailyChangePct = _.get(performanceSummary, performanceSummary.current.dailyChangePct, 0);
            totalReturn = _.get(performanceSummary, performanceSummary.current.dailyChangePct, 0);
        }
        return (
            <Row type="flex" align="bottom">
                <Col span={24}>
                    <h3
                            style={netValueStyle}
                    >
                        {`Rs ${netValue.toFixed(2)}`}
                    </h3>
                </Col>
                <Col span={24}>
                    <h3 
                            style={{
                                fontSize: '18px',
                                marginRight: '25px',
                                textAlign: 'right', color: dailyChange < 0 ? '#FA4747' : '#3EBB72'
                            }}
                    >
                        {(totalReturn * 100).toFixed(2)} ({(dailyChangePct * 100).toFixed(2)} %)
                    </h3>
                </Col>
                <Col span={24}>
                    <h3 
                            style={{fontSize: '12px', textAlign: 'right',marginRight: '25px'}}
                    >
                        Daily PnL. | Daily Chg
                    </h3>
                </Col>
            </Row>
        );
    }

    render() {
        let {
            name, 
            advisor = null, 
            createdDate = null, 
            heading = null, 
            subscribers, 
            followers,
            rating, 
            performanceSummary = {}, 
            id,
            isFollowing
        } = this.props.advice;
        let sectors = [];
        if (performanceSummary && performanceSummary.current) {
            sectors = performanceSummary.current.sectors;
        }

        return (
            <Row type="flex" style={cardStyle} align="top" onClick={e => this.handleClick(id)}>
                <Col span={8}>
                    <Row>
                        <Col span={24}>
                            <h3 style={{fontSize: '18px'}}>{name}</h3>
                        </Col>
                        {
                            sectors.length > 0 && sectors &&
                            <Col span={24} style={{margin: '5px 0'}}>
                                {this.renderSectors(sectors)}
                            </Col>
                        }
                        <Col span={24} style={{marginTop: '20px'}}>
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
                            {
                                performanceSummary.current && 
                                <Col span={8}>
                                    <MetricItem 
                                            style={{border: 'none'}} 
                                            value={followers} 
                                            label="Followers"
                                            valueStyle={{fontSize: '16px', fontWeight: '400', color: '#3B3737'}}
                                            labelStyle={{fontSize: '14px', fontWeight: '400', color: '#716E6E'}}
                                    />
                                </Col>
                            }
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Col span={16}>
                    <Row>
                        <Col span={22} offset={2}>
                            {this.renderMetricIcons(performanceSummary)}
                        </Col>
                        <Col span={24} style={{marginTop: '15px'}}>
                            <Row>
                                <Col span={12} style={{textAlign: 'center'}}>
                                    <Rate disabled value={rating}/>
                                    {this.renderTrendingApprovedIcon()}
                                </Col>
                                <Col span={11} offset={1}>
                                    {this.renderNetValueChange(performanceSummary)}
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
    fontSize: '14px'
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
    fontSize: '22px',
    fontWeight: 400,
    color: '#3B3737',
    textAlign: 'right',
    marginRight: '25px'
};

const netLabelStyle = {
    fontSize: '14px',
    color: '#716E6E',
    textAlign: 'right',
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

const iconStyle = {
    transform: 'scale(0.6, 0.6)'
};