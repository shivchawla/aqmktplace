import React from 'react';
import {Row, Col} from 'antd';
import {Tabs} from 'antd-mobile';
import CreateEntry from './CreateEntry';
import TopPicks from './TopPicks';
import Leaderboard from './Leaderboard';

export default class TradingContest extends React.Component {
    renderTab = data => {
        return (
            <h3 style={{width: 'fit-content', fontSize: '12px'}}>{data.title}</h3>
        );
    }

    render() {
        const tabs = [
            { title: 'MY PICKS' },
            { title: 'TOP PICKS' },
            { title: 'LEADERBOARD' },
        ];

        return (
            <div>
                <Tabs renderTab={this.renderTab} tabs={tabs} swipeable={false}>
                    <CreateEntry />
                    <Row>
                        <Col span={24}>
                            <TopPicks />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Leaderboard />
                        </Col>
                    </Row>
                </Tabs>
            </div>
        );
    }
}
