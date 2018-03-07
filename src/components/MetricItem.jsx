import * as React from 'react';
import {Row, Col} from 'antd';

export const MetricItem = (props) => {
    return (
        <Row>
            <Col span={24}><h5>{props.value}</h5></Col>
            <Col><h5>{props.label}</h5></Col>
        </Row>
    );
};