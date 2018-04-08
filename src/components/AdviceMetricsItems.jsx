import * as React from 'react';
import {Row} from 'antd';
import {metricsLabelStyle, metricsValueStyle} from '../constants';
import {MetricItem} from '../components';

export class AdviceMetricsItems extends React.Component {
    render() {
        const {metrics} = this.props;

        return (
            <Row>
                {
                    metrics.map((item, index) => {
                        const neutralColor = '#353535';
                        const positiveColor = '#8BC34A';
                        const negativeColor = '#F44336';
                        const valueColor = item.percentage ? (item.value >= 0 ? positiveColor : negativeColor) : neutralColor;
                        const value = item.percentage ? `${(item.value * 100).toFixed(2)} %` : item.value;
                        return (
                            <MetricItem 
                                    key={index}
                                    valueStyle = {{...metricsValueStyle, color: valueColor, fontSize: '20px'}} 
                                    labelStyle={metricsLabelStyle} 
                                    value={value} 
                                    label={item.label} 
                                    style={metricItemStyle} 
                                    isNetValue={item.isNetValue}
                                    dailyChange={item.dailyChange || null}
                                    dailyChangePct={item.dailyChangePct || null}
                            />
                        );
                    })
                }
            </Row>
        );
    }
}

const metricItemStyle = {
    padding: '10px'
};