import * as React from 'react';
import {Row, Col} from 'antd';
import {listMetricItemLabelStyle, listMetricItemValueStyle} from '../constants';

export const ListMetricItem = ({label, value, labelColor = listMetricItemLabelStyle.color, valueColor = listMetricItemValueStyle.color}) => {
    return (
        <Row>
            <Col span={24}>
                <h3 style={{...listMetricItemValueStyle, color: valueColor}}>{value}</h3>
            </Col>
            <Col span={24}>
                <h3 style={{...listMetricItemLabelStyle, color: labelColor}}>{label}</h3>
            </Col>
        </Row>
    );
}