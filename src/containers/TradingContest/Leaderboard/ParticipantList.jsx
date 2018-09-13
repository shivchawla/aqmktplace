import React from 'react';
import {Row, Col} from 'antd';
import ParticipantListItem from './ParticipantListItem';

export default class ParticipantList extends React.Component {
    render() {
        const {winners = []} = this.props;

        return (
            <Row>
                <Col span={24}>
                    {
                        winners.map(winner => (
                            <ParticipantListItem {...winner} />
                        ))
                    }
                </Col>
            </Row>
        );
    }
}