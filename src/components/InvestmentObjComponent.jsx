import * as React from 'react';
import {Row, Col} from 'antd';
import {horizontalBox} from '../constants';
import {WarningIcon} from './WarningIcon';

export const InvestMentObjComponent = ({header, content, warning = false, reason = ''}) => {
    return (
        <Row type="flex" align="middle" style={{marginBottom: '10px'}}>
            <Col span={2} style={horizontalBox}>
                
                <div style={investmentObjLabelStyle}>{header}:</div>
                
            </Col>
            <Col span={20}>{content}</Col>
            <Col span={2}>{
                    warning &&
                    <WarningIcon reason={reason}/>
                }</Col>
        </Row>
    );
}

const investmentObjLabelStyle = {
    fontSize: '14px',
    color: labelColor
};

const labelColor = '#898989';