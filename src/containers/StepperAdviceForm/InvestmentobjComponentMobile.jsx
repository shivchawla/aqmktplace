import * as React from 'react';
import {Row, Col, Icon} from 'antd';
import {horizontalBox} from '../../constants';
import {WarningIcon} from '../../components/WarningIcon';

export const InvestMentObjComponent = ({
    header, 
    content, 
    warning = false, 
    reason = '', 
    span={label: 4, content: 18, warning: 2},
    tooltip={text: null, placement: 'top'}
}) => {
    return (
        <Row type="flex" align="middle" style={{...investmentObjLabelStyle, marginBottom: '10px'}}>
            <Col span={24}>
                {header}:
            </Col>
            <Col span={24} style={{...horizontalBox, alignItems: 'center'}}>
                {content}
            </Col>
        </Row>
    );
}

const labelColor = '#000000';
const investmentObjLabelStyle = {
    fontSize: '16px',
    fontWeight: 300,
    color: labelColor
};