import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Radio} from 'antd';
import {Utils} from '../utils';
import {metricColor} from '../constants/';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

export class AqPerformanceMetrics extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            metrics: []
        };
    }

    handleRadioSelection = e => {
        this.setState({metrics: this.getMetrics(e.target.value)});
    }

    /*
        Renders the RadioGroup which renders RadioButtons based on the timelines provided as a prop
    */
    renderRadioTimelineSelection = performanceMetricsTimeline => {
        return (
            <RadioGroup 
                    onChange={this.handleRadioSelection} 
                    defaultValue={performanceMetricsTimeline[0]}
                    size="small"
                    style={{fontSize: '12px', height: '22px'}}
            >
                {
                    performanceMetricsTimeline.map((item, index) => (
                        <RadioButton key={index} value={item}>{item.toUpperCase()}</RadioButton>
                    ))
                }
            </RadioGroup>
        );
    }

    /*
        Renders the performance metrics based on the selected timeline
    */
    renderPerformanceMetrics = () => {
        const {type = "old"} = this.props; 

        return ( 
            <div>
            {   type == "new" ?
                    <Row gutter={8}>
                        {
                            this.state.metrics.map((metric, index) => {
                                var color = metric.color || '#3b3737'; 
                                return (
                                    <Col key={index} span={8} style={{marginTop: '20px', textAlign: 'center'}}>
                                        <h3 style={{fontSize: '18px', color: color, fontWeight: 300}}>{metric.value}</h3>
                                        <h3 style={{fontSize: '12px', color: '#000000a6'}}>{metric.label}</h3>
                                    </Col>
                                );
                            })
                        }
                    </Row>
                : 
                    <Row gutter={24}>
                        {
                            this.state.metrics.map((metric, index) => {
                                return (
                                    <Col 
                                            key={index}
                                            span={12} 
                                            style={{
                                                display: 'flex', 
                                                flexDirection: 'row', 
                                                justifyContent: 'space-between',
                                                marginBottom: '10px'
                                            }}
                                    >
                                        <h3 style={{fontSize: '14px', color: '#000000a6'}}>{metric.label}</h3>
                                        <h3 style={{fontSize: '14px', color: '#3b3737'}}>{metric.value}</h3>
                                    </Col>
                                );
                            })
                        }
                    </Row>
            }
            </div>
        );

    }

    /*
        Gets the metrics for the selected timeline based on the RadioButton click
        * selectedTimeline is one of the attributes present in rollingPerformance
        * rollingPerformance: {ytd: {...metrics}}
        * where 'ytd' is the selectedTimeline
    */
    getMetrics = selectedTimeline => {
        const {rollingPerformance = {}} = this.props;
        const selectedTimelineMetrics = _.get(rollingPerformance, selectedTimeline, {});
        const ratios = _.get(selectedTimelineMetrics, 'ratios', {});
        const returns = _.get(selectedTimelineMetrics, 'returns', {});
        const deviation = _.get(selectedTimelineMetrics, 'deviation', {});
        const drawdown = _.get(selectedTimelineMetrics, 'drawdown', {});

        const metrics = [
            {label: 'Ann. Return', value: Utils.formatReturnTypeVariable(_.get(returns, 'annualreturn', 0)), color: _.get(returns, 'annualreturn', 0) > 0 ? metricColor.positive : metricColor.negative},
            {label: 'Volatility', value: Utils.formatReturnTypeVariable(_.get(deviation, 'annualstandarddeviation', 0))},
            {label: 'Beta', value: _.get(ratios, 'beta', 0)},
            {label: 'Sharpe Ratio', value: _.get(ratios, 'sharperatio', 0)},
            {label: 'Alpha', value: Utils.formatReturnTypeVariable(_.get(ratios, 'alpha', 0)), color: _.get(ratios, 'alpha', 0) > 0 ? metricColor.positive : metricColor.negative},
            {label: 'Max Loss', value: Utils.formatReturnTypeVariable(_.get(drawdown, 'maxdrawdown', 0)), color: _.get(drawdown, 'maxdrawdown', 0) > 0 ? metricColor.negative : metricColor.neutral},
        ];

        return metrics;
    }

    componentWillMount() {
        const performanceTimeline = this.getPerformanceTimeline();
        this.setState({metrics: this.getMetrics(performanceTimeline[0])});
    }

    componentWillReceiveProps(nextProps) {
        const performanceTimeline = this.getPerformanceTimeline();
        if (!_.isEqual(nextProps, this.props)) {
            this.setState({metrics: this.getMetrics(performanceTimeline[0])});
        }
    }

    /*
        Gets the selected timelines provided by the user
        eg: ['ytd', '1y', '2y', ...]
    */
    getPerformanceTimeline = (props=this.props) => { 
        let {rollingPerformance = {}, selectedTimeline = []} = props;
        return selectedTimeline;
    }
    
    render() {
        const {type = "old"} = this.props; 
        return (
            <Row 
                style={{
                        padding: '10px', 
                        border: '1px solid rgb(234, 234, 234)',
                        borderRadius: '4px',
                        ...this.props.style
                    }}>
                {!this.props.noTitle && 
                    <Col span={10}>
                        <h3 style={{fontSize: '16px'}}>Performance Metrics</h3>
                    </Col>
                }
                {type=="old" && 
                    <Col span={14}
                        style={{display: 'flex', justifyContent: 'flex-end', marginTop: '0px'}}>
                        {this.renderRadioTimelineSelection(this.getPerformanceTimeline())}
                    </Col>
                }
                {type != "old" && 
                    <Col span={24}
                            style={{textAlign: 'center', marginTop: '0px'}}>
                        {this.renderRadioTimelineSelection(this.getPerformanceTimeline())}
                    </Col>
                }
                <Col span={24} style={{marginTop: '30px'}}>
                    {this.renderPerformanceMetrics()}
                </Col>
            </Row>
        );
    }
}