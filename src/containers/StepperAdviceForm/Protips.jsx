import * as React from 'react';
import {Row, Col} from 'antd';
import {shadowBoxStyle} from '../../constants';

export class Protips extends React.Component {
    render() {
        return (
            <Row style={{...shadowBoxStyle, padding: '10px 20px', height: '100%'}}>
                <Col span={24}>
                    <h3>PRO-TIPS</h3>
                </Col>
                <Col span={24}></Col>
            </Row>
        );
    }
}