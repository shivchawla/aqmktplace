import * as React from 'react';
import {Row, Col, Spin} from 'antd';
import {newLayoutStyle, tabBackgroundColor} from '../constants';

export class DashboardCard extends React.Component {
    render() {
        const {cardStyle, children, title, menu = null, loading = false, xl=12, lg=24, contentStyle, headerSpan=10, menuSpan=12} = this.props;

        return (
            <Col style={cardStyle}>
                <Spin spinning={loading}>
                    <Row style={{...newLayoutStyle, height: '365px', ...contentStyle }}>
                        <Row style={{...headerStyle, ...this.props.headerStyle}} type="flex" justify="space-between">
                            <Col span={headerSpan}>
                                <h3 style={{marginLeft: '20px'}}>{title}</h3>
                            </Col>
                            <Col span={menuSpan} style={{textAlign: 'right'}}>
                                {menu}
                            </Col>
                        </Row>
                        <Row style={contentStyle}>
                            {children}
                        </Row>
                    </Row>
                </Spin>
            </Col>
        );
    }
}

const headerStyle = {
    backgroundColor: tabBackgroundColor, 
    padding: '10px 10px 5px 5px',
};

const contentStyle = {
    paddingTop: '20px', 
    height: '350px', 
    overflow: 'hidden', 
    overflowY: 'scroll'
};