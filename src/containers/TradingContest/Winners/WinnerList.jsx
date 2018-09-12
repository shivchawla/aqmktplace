import React from 'react';
import {Row, Col} from 'antd';
import WinnerListItem from './WinnerListItem';

export default class WinnerList extends React.Component {
    render() {
        const {winners = []} = this.props;

        return (
            <Row>
                <Col span={24}>
                    {
                        winners.map((winner, index) => (
                            <WinnerListItem {...winner} key={index} />
                        ))
                    }
                </Col>
            </Row>
        );
    }
}