import * as React from 'react';
import {Card, Row, Col} from 'antd';

export class AqCard extends React.Component {
    render() {
        const {title, children, offset=0} = this.props;

        return(
            <Col style={overviewStyle} offset={offset}>
                <Row type="flex" align="middle">
                    <Col span={24} style={overHeadContainerStyle}>
                        <h3 style={overviewHeaderStyle}>{title}</h3>
                    </Col>
                    <Col span={24}>
                        {children}
                    </Col>
                </Row>
            </Col>
        );
    }
}

const overviewStyle = {
    borderRadius: '2px',
    overflow: 'hidden',
    boxShadow: '0 2px 2px rgba(0, 0, 0, 0.2)',
    border: '1px solid #eaeaea'
};

const overHeadContainerStyle = {
    backgroundColor: '#f7f7f7',
    padding: '5px 10px',
    borderBottom: '1px solid #eaeaea'
}

const overviewHeaderStyle = {
    fontSize: '12px',

};