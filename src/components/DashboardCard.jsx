import * as React from 'react';
import {Row, Col, Spin} from 'antd';
import {newLayoutStyle, tabBackgroundColor} from '../constants';

export class DashboardCard extends React.Component {
    render() {
        const {cardStyle, children, title, menu = null, loading = false, xl=12, lg=24, contentStyle} = this.props;

        return (
            <Col xl={xl} lg={lg} style={cardStyle}>
                <Spin spinning={loading}>
                    <Row style={{...newLayoutStyle, height: '365px', ...contentStyle }}>
                        <Col span={24} style={headerStyle}>
                            <Row>
                                <Col span={8}>
                                    <h3 style={{marginLeft: '20px'}}>{title}</h3>
                                </Col>
                                <Col span={16} style={{textAlign: 'right'}}>
                                    {menu}
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24} style={contentStyle}>
                            {children}
                        </Col>
                    </Row>
                </Spin>
            </Col> 
        );
    }
}

const headerStyle = {
    backgroundColor: tabBackgroundColor, 
    padding: '5px 10px',
    borderBottom: '1px solid #eaeaea'
};

const contentStyle = {
    paddingTop: '20px', 
    height: '340px', 
    overflow: 'hidden', 
    overflowY: 'scroll'
};