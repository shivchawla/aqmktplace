import * as React from 'react';
import {Row, Col, Icon} from 'antd';
import {metricColor} from '../constants';

export class ApprovalItemView extends React.Component {
    render() {
        const {label = 'undefined', approved = false, reason = ''} = this.props;
        const iconType = approved ? "check-circle" : "close-circle";
        const iconColor = approved ? metricColor.positive : metricColor.negative;

        return (
            <Row style={{marginBottom: '20px', ...this.props.style}}>
                <Col span={24}>
                    <h3 style={{fontSize: '16px'}}>{label}</h3>
                </Col>
                <Col span={24} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <Icon type={iconType} style={{color: iconColor, fontSize: '16px',  marginRight: '5px'}} />
                    <h5 style={{color: iconColor, fontSize: '16px'}}>{approved ? "Approved" : "Unapproved"}</h5>
                </Col>
                {
                    reason.length > 0 &&
                    <Col span={24}>
                        <h3 style={{color: '#6F6F6F', fontSize: '14px', marginLeft: '20px'}}>{reason}</h3>
                    </Col>
                }
            </Row>
        );
    }
}