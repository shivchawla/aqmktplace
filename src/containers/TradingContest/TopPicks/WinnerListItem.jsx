import React from 'react';
import styled from 'styled-components';
import {Row, Col} from 'antd';
import {horizontalBox, verticalBox} from '../../../constants';
import {getRankMedal} from '../utils';

export default class WinnerListItem extends React.Component {
    render() {
        const {symbol = 'TCS', numUsers = 1, img = null, name = '', rank = 5} = this.props;
        const medal = getRankMedal(rank);

        return (
            <SRow type='flex'>
                <Col span={2} style={{...verticalBox, justifyContent: 'center'}}>
                    <img src={medal} width={20}/>
                </Col>
                <Col span={18} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <Symbol>{symbol}</Symbol>
                    <SecondaryText>{name}</SecondaryText>
                </Col>
                <Col span={4} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                    <Points>{numUsers}</Points>
                    <SecondaryText>&nbsp;users</SecondaryText>
                </Col>
            </SRow>
        ); 
    }
}

const SRow = styled(Row)`
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 10px;
    margin-bottom: 20px;
    background-color: #FAFCFF;
    border-radius: 4px;
    box-shadow: 0 3px 5px #C3E0F9;
    margin-top: 20px;
    border: 1px solid #F2F5FF;
`;

const Symbol = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: #717171;
`;

const SecondaryText = styled.h3`
    font-size: 14px;
    font-weight: 300;
    color: #717171;
`;

const Points = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: #717171;
`;