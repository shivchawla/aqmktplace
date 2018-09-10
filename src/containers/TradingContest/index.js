import React from 'react';
import {Row, Col} from 'antd';
import {Button as MobileButton, SegmentedControl, Tabs, Button} from 'antd-mobile';
import CreateEntry from './CreateEntry';
import Winners from './Winners';
import Participant from './Participants';
import {verticalBox, horizontalBox} from '../../constants';

export default class TradingContest extends React.Component {
    renderTab = data => {
        return (
            <h3 style={{width: 'fit-content', fontSize: '12px'}}>{data.title}</h3>
        );
    }

    render() {
        const tabs = [
            { title: 'MY PICKS' },
            { title: 'WINNERS' },
            { title: 'PARTICIPANTS' },
        ];

        return (
            <div>
                <Tabs renderTab={this.renderTab} tabs={tabs} swipeable={false}>
                    <CreateEntry />
                    <Row>
                        <Col span={24}>
                            <Winners />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Participant />
                        </Col>
                    </Row>
                </Tabs>
                {/* <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                    <SegmentedControl style={{width: '40%'}} values={['SELL', 'BUY']} />
                </Col> */}
            </div>
        );
    }
}
