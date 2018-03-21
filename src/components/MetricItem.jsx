import * as React from 'react';
import * as Radium from 'radium';
import {Row, Col} from 'antd';
import '../css/metricItem.css';

const MetricItemImpl = (props) => {
    const {style = {}} = props;
    const height = !props.bordered ? 'fit-content' : '70px';
    const border = props.bordered ? '1px solid #eaeaea' : 'none';
    const padding = props.bordered ? '10px' : 0;
    return (
        <Col span={3} style={{marginRight: 30}}>
            <Row style={{...containerStyle, ...style, height, border, padding}}>
                <Col span={24} style={valueStyle}><h5>{props.value}</h5></Col>
                <Col><h5 style={labelStyle} value={labelStyle}>{props.label}</h5></Col>
            </Row>
        </Col>
    );
};

export const MetricItem = Radium(MetricItemImpl);

const containerStyle = {
    width: '130px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ':hover': {
        backgroundColor: '#44'
    }
};

const valueStyle = {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1F1F1F'
};

const labelStyle = {
    fontWeight: '400',
    fontSize: '14px',
    color: '#515151',
};