import * as React from 'react';
import {Row, Col} from 'antd';
import {horizontalBox} from '../constants';
import {WarningIcon} from './WarningIcon';

export const InvestMentObjComponent = ({header, content, warning = false, reason = ''}) => {
    return (
        <Row type="flex" align="middle" style={{marginBottom: '10px'}}>
            <Col span={24} style={horizontalBox}>
                <h3 style={investmentObjLabelStyle}>{header}:</h3>
                {
                    warning &&
                    <WarningIcon reason={reason}/>
                }
            </Col>
            <Col span={24}>{content}</Col>
        </Row>
    );
}

const investmentObjLabelStyle = {
    fontSize: '14px',
    color: labelColor
};

const labelColor = '#898989';