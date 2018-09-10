import React from 'react';
import styled from 'styled-components';
import {Row, Col} from 'antd';
import DateComponent from '../Misc/DateComponent';
import ParticipantList from './ParticipantList';
import {verticalBox} from '../../../constants';

export default class Participants extends React.Component {
    render() {
        return (
            <Row>
                <Col span={24} style={topContainerStyle}>
                    <DateComponent />
                    <Row>
                        <Col span={24}> 
                            <h3 style={{fontSize: '18px', color: '#fff'}}>Winners</h3>
                            <h3 style={{fontSize: '26px', color: '#fff'}}>20th Jul 2018</h3>
                        </Col>
                    </Row>
                </Col>
                <Col span={24} style={listContainer}>
                    <ParticipantList />
                </Col>
            </Row>
        );
    }
}

const topContainerStyle = {
    ...verticalBox,
    height: '150px',
    backgroundColor: '#15C08F',
    alignItems: 'flex-start',
    padding: '0 10px'
};

const listContainer = {
    padding: '0 10px'
}