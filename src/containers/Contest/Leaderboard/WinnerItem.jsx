import React from 'react';
import _ from 'lodash';
import {Row, Col} from 'antd';

export default class WinnerItem extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }
    
    /**
     * Usage: Gets the advice metric based on the key provided
     * @param: metrics - advice metrics obtained from the N/W response of each individual advice
     * @param: metricKey - name of the metric that we want the value of eg: volatility, totalReturn or annualReturn
     */
    getAdviceMetric = (metrics, metricKey) => {
        return metrics.filter(metric => metric.field === metricKey) !== undefined 
                ? metrics.filter(metric => metric.field === metricKey)[0]
                : null;
    }
    
    render() {
        // const {leaderItem, onClick, selected} = this.props;
        const {advice, rank} = this.props;
        const advisorFirstName = _.get(advice, 'advisor.user.firstName', '');
        const advisorLastName = _.get(advice, 'advisor.user.firstName', '');
        const advisorId = _.get(advice, 'advisor.user._id', null);
        const advisorName = `${advisorFirstName} ${advisorLastName}`;
        const currentAdviceMetrics = _.get(rank, 'rating.current.detail', []);
        const currentScore = _.get(rank, 'rating.current.value', 0);
        const simulatedAdviceMetrics = _.get(rank, 'rating.current.detail', []);
        const rankValue = _.get(rank, 'value', null);

        const containerStyle = {
            borderBottom: '1px solid #eaeaea',
            cursor: 'pointer',
            paddingBottom: '10px',
            paddingTop: '15px',
            marginTop: '0px',
            // backgroundColor: selected ? '#e6f5f3' : '#fff'
        };
        // const adviceId = _.get(leaderItem, 'adviceId', null);
        const metricStyle = {paddingLeft: '10px', fontSize: '14px'};

        // const annualReturn = formatMetric(_.get(leaderItem, 'metrics.current.annualReturn.metricValue', NaN), "pct");
        // const volatility = formatMetric(_.get(leaderItem, 'metrics.current.volatility.metricValue', NaN), "pct");
        const excessReturn = this.getAdviceMetric(currentAdviceMetrics, 'annualReturn').metricValue;
        const trackingError = this.getAdviceMetric(currentAdviceMetrics, 'volatility').metricValue;
        // console.log(excessReturn.metricValue);
        // console.log(trackingError.metricValue);

        return (
            <Row className='leader-item' style={containerStyle}>
                <Col span={4}>
                    <h3 style={{...metricStyle, margin: 0}}>{rankValue} .</h3>
                </Col>
                <Col span={6}>
                    <h5 style={{...metricStyle, margin: 0}}>{advisorName}</h5>
                </Col>
                <Col span={5}>
                    <h3 style={metricStyle}>{excessReturn}</h3>
                </Col>
                <Col span={5}>
                    <h3 style={metricStyle}>{trackingError}</h3>
                </Col>
                <Col span={4}>
                    <h3 style={metricStyle}>{(currentScore).toFixed(2)} / 100</h3>
                </Col>
            </Row>
        );
    }
};