import * as React from 'react';
import {Row, Col, Tooltip, Icon} from 'antd';
import {horizontalBox} from '../constants';
import {WarningIcon} from './WarningIcon';

export const InvestMentObjComponent = ({
    header, 
    content, 
    warning = false, 
    reason = '', 
    span={label: 4, content: 18, warning: 2},
    tooltip={text: null, placement: 'top'}
}) => {
    return (
        <Row type="flex" align="middle" style={{marginBottom: '10px'}}>
            <Col span={span.label}>
                <Tooltip 
                        title={tooltip.text}
                        placement={tooltip.placement}
                >
                    <div style={{...investmentObjLabelStyle, ...horizontalBox, alignItems: 'center'}}>
                        {header}:
                        {
                            // tooltip.text !== null &&
                            // <Icon type="question-circle" style={{marginLeft: '5px'}}/>
                        }
                    </div>
                </Tooltip>
            </Col>
            <Col span={span.content} style={{...horizontalBox, alignItems: 'center'}}>
                {content}
                {
                    warning &&
                    <WarningIcon reason={reason}/>
                }
            </Col>
            {/* <Col span={span.warning}>
                {
                    warning &&
                    <WarningIcon reason={reason}/>
                }
            </Col> */}
        </Row>
    );
}

const labelColor = '#000000';

const investmentObjLabelStyle = {
    fontSize: '17px',
    fontWeight: 300,
    color: labelColor
};


//const labelColor = '#898989';
