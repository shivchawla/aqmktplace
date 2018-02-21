import * as React from 'react';
import {Collapse, Row, Col} from 'antd';

const Panel = Collapse.Panel;

export class AdviceTransactionItem extends React.Component {
    render() {
        return (
            <Panel header={<HeaderItem title={this.props.adviceName}/>} key={this.props.key}>
                <h1>HEllo World</h1>
            </Panel>
        );
    }
}

const HeaderItem = (props) => {
    return (
        <Row>
            <Col span={6}>
                <h5>{props.title}</h5>
            </Col>
        </Row>
    );
}