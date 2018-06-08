import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Radio} from 'antd';

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
        Renders the RadioGroup which renders RadioButtons based on the timeline provided as a prop
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
        return (
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
            {label: 'Ann. Return', value: `${(_.get(returns, 'annualreturn', 0) * 100).toFixed(2)}%`},
            {label: 'Volatility', value: `${(_.get(deviation, 'annualstandarddeviation', 0) * 100).toFixed(2)}%`},
            {label: 'Beta', value: _.get(ratios, 'beta', 0)},
            {label: 'Sharpe Ratio', value: _.get(ratios, 'sharperatio', 0)},
            {label: 'Alpha', value: `${(_.get(ratios, 'alpha', 0) * 100).toFixed(2)}%`},
            {label: 'Max Loss', value: `${(_.get(drawdown, 'maxdrawdown', 0) * 100).toFixed(2)}%`},
        ];

        return metrics;
    }

    componentWillMount() {
        const performanceTimeline = this.getPerformanceTimeline();
        this.setState({metrics: this.getMetrics(performanceTimeline[0])});
    }

    /*
        Gets the selected timelines provided by the user
        eg: ['ytd', '1y', '2y', ...]
    */
    getPerformanceTimeline = () => { 
        let {rollingPerformance = {}, selectedTimeline = []} = this.props;
        // console.log(Object.keys(rollingPerformance));
        // console.log(selectedTimeline);
        // const timelineToDelete = _.difference(Object.keys(rollingPerformance), selectedTimeline);
        // console.log(timelineToDelete);
        // rollingPerformance = _.omit(rollingPerformance, ...timelineToDelete);
        // // return Object.keys(rollingPerformance);
        return selectedTimeline;
    }

    render() {
        return (
            <Row 
                    style={{
                            padding: '10px', 
                            border: '1px solid rgb(234, 234, 234)',
                            borderRadius: '4px',
                            ...this.props.style
                        }}
                    >
                <Col span={24}>
                    <h3 style={{fontSize: '16px'}}>Performance Metrics</h3>
                </Col>
                <Col span={24}
                        style={{display: 'flex', justifyContent: 'flex-end', marginTop: '10px'}}
                >
                    {this.renderRadioTimelineSelection(this.getPerformanceTimeline())}
                </Col>
                <Col span={24} style={{marginTop: '10px'}}>
                    {this.renderPerformanceMetrics()}
                </Col>
            </Row>
        );
    }
}