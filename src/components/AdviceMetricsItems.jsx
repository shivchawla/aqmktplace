import * as React from 'react';
import {Row, Col} from 'antd';
import {metricsLabelStyle, metricsValueStyle} from '../constants';
import {MetricItem} from '../components/MetricItem';

export class AdviceMetricsItems extends React.Component {
    render() {
        const {metrics} = this.props;

        return (
            <Row type="flex" justify="space-between">
                {
                    metrics.map((item, index) => {
                        return (
                            <Col span={item.isNetValue ? 5 : item.label == "Subscribers" ? 3 : 4} key={index}>
                                <MetricItem 
                                    key={index}
                                    valueStyle = {{...metricsValueStyle, fontSize: '20px'}} 
                                    labelStyle={metricsLabelStyle} 
                                    value={item.value} 
                                    label={item.label} 
                                    money={item.money}
                                    percentage={item.percentage}
                                    color={item.color}
                                    style={metricItemStyle} 
                                    isNetValue={item.isNetValue}
                                    dailyChange={item.dailyChange || null}
                                    dailyChangePct={item.dailyChangePct || null}
                                    tooltipText={item.tooltipText || null}
                                />
                            </Col>
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