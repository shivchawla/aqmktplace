import * as React from 'react';
import {Row, Col, Spin} from 'antd';
import {shadowBoxStyle, tabBackgroundColor, noOverflowStyle} from '../constants';

export class DashboardCard extends React.Component {
    render() {
        const {cardStyle, children, title, menu = null, loading = false, xl=12, lg=24, headerSpan=10, menuSpan=12} = this.props;

        return (
            <Col span={24} style={{...shadowBoxStyle, ...cardStyle, ...noOverflowStyle}}>
                <Row style={{...headerStyle, ...this.props.headerStyle}} type="flex" justify="space-between">
                    <Col span={headerSpan}>
                        <h3 style={{marginLeft: '20px'}}>{title}</h3>
                    </Col>
                    <Col span={menuSpan} style={{textAlign: 'right'}}>
                        {menu}
                    </Col>
                </Row>
                <Row style={{...contentStyle, ...this.props.contentStyle}}>
                    <Spin spinning={loading} style={{position: 'absolute'}}>
                        {children}
                    </Spin>
                </Row>
            </Col>
        );
    }
}

const headerStyle = {
    backgroundColor: tabBackgroundColor, 
    padding: '10px 10px 5px 5px',
};

const contentStyle = {
    //height: '350px', 
    overflow: 'hidden', 
    overflowY: 'scroll',
};