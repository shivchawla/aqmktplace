import * as React from 'react';
import * as Radium from 'radium';
import {Row, Col} from 'antd';
import {metricColor} from '../constants';
import '../css/metricItem.css';

const MetricItemImpl = (props) => {
    const {style = {}} = props;
    const height = !props.bordered ? 'fit-content' : '70px';
    const border = props.bordered ? '1px solid #eaeaea' : 'none';
    const padding = props.bordered ? '10px' : 0;
    const change = props.dailyChange, changePct = props.dailyChangePct;
    const changeColor = changePct >= 0 ? metricColor.positive : metricColor.negative;
    // const fontSize = props.isNetValue ? {fontSize: '30px' } : {};

    return (
        <Row style={{...containerStyle, ...style, height, border, padding}}>
            <Col span={24}>
                <h5 style={{...valueStyle, ...props.valueStyle}}>
                    {props.value}
                    {props.isNetValue && change !== null && <span style={{marginLeft: '2px', color: changeColor}}>{change}</span>}
                    {props.isNetValue && changePct !== null && <span style={{marginLeft: '2px', color: changeColor}}>({changePct}%)</span>}
                </h5>
            </Col>
            <Col><h5 style={{...labelStyle, ...props.labelStyle}} value={labelStyle}>{props.label}</h5></Col>
        </Row>
    );
};

export const MetricItem = Radium(MetricItemImpl);

const containerStyle = {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    ':hover': {
        backgroundColor: '#44'
    },
    width: '100%'
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