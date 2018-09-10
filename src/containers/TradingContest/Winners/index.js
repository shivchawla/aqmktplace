import React from 'react';
import styled from 'styled-components';
import {Row, Col} from 'antd';
import DateComponent from '../Misc/DateComponent';
import WinnerList from './WinnerList';
import {verticalBox} from '../../../constants';

export default class Winners extends React.Component {
    render() {
        return (
            <Row>
                <Col span={24} style={topContainerStyle}>
                    <DateComponent style={{padding: '0 10px'}} color='#737373'/>
                    <Row style={{marginTop: '60px'}}>
                        <Col span={24} style={verticalBox}>
                            <ContestStatus>Contest Ended</ContestStatus>
                            <WinnerHeader>Winner Stocks</WinnerHeader>
                            <WinnerSubHeader>The stocks that were most voted today</WinnerSubHeader>
                        </Col>
                    </Row>
                </Col>
                <Col span={24} style={{padding: '0 10px'}}>
                    <WinnerList />
                </Col>
            </Row>
        );
    }
}

const topContainerStyle = {
    ...verticalBox,
    height: '140px',
    padding: '0 10px'
};

const ContestStatus = styled.h3`
    color: #15C08F;
    font-weight: 700;
    font-size: 15px
`;

const WinnerHeader = styled.h3`
    font-size: 18px;
    font-weight: 400;
    color: #4B4B4B;
`;

const WinnerSubHeader = styled.h3`
    font-size: 15px;
    font-weight: 300;
    color: #717171;
`;