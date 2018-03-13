import * as React from 'react';
import * as Radium from 'radium';
import {Row, Col} from 'antd';
import '../css/metricItem.css';

const MetricItemImpl = (props) => {
    const {style = {}} = props;
    return (
        <Row style={{...containerStyle, ...style}}>
            <Col span={24} style={valueStyle}><h5>{props.value}</h5></Col>
            <Col><h5 style={labelStyle} value={labelStyle}>{props.label}</h5></Col>
        </Row>
    );
};

export const MetricItem = Radium(MetricItemImpl);

const containerStyle = {
    // boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
    // padding: '10px',
    border: '1px solid #eaeaea',
    width: '130px',
    height: '70px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ':hover': {
        backgroundColor: '#44'
    }
};

const valueStyle = {
    fontSize: '18px',
    fontWeight: '700',
};

const labelStyle = {
    fontWeight: '400',
    fontSize: '12px',
    color: '#8C8C8C',
};