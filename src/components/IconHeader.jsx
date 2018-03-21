import * as React from 'react';
import {Row, Col, Icon, Checkbox} from 'antd';

export const IconHeader = ({icon = null, label, checked, filterType, onChange}) => {
    return (
        <Col span={24}>
            <Row type="flex" align="middle" justify="start">
                {   
                    icon !== null &&
                    <Col span={2} style={{fontSize: '16px', color: '#23BEC3', width: '25px'}}>
                        <Icon type={icon} />
                    </Col>
                }
                <Col span={16}>
                    <h5 style={labelStyle}>{label}</h5>
                </Col>
            </Row>
            {
                checked !== undefined &&
                <Row>
                    <Col span={24}>
                        <Checkbox 
                                checked={checked} 
                                onChange={(e) => onChange(e, filterType)}
                        >
                            <span style={selectAllStyle}>Select All</span>
                        </Checkbox>
                    </Col>
                </Row>
            }
        </Col>
    );
}

const labelStyle = {
    fontSize: '14px', 
    color: '#26899A',
    fontWeight: 400
};

const selectAllStyle = {
    fontWeight: '700',
    fontSize: '12px',
    color: '#656363'
};
// rating, sharpe ratio, max loss, current loss, volatility, return, net asset value