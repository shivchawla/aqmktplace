import React from 'react';
import styled from 'styled-components';
import {Row, Col} from 'antd';
import {horizontalBox, verticalBox, metricColor} from '../../../constants';
import goldLogo from '../../../assets/gold.svg';

export default class ParticipantListItem extends React.Component {
    render() {
        const {name = 'Saurav Biswas', score = 99.5, img = null, excessReturn = -55.1} = this.props;

        return (
            <SRow type='flex'>
                <Col span={2} style={{...verticalBox, justifyContent: 'center'}}>
                    <img src={goldLogo} width={20}/>
                </Col>
                <Col span={18} style={{...verticalBox, alignItems: 'flex-start'}}>
                    <Name>{name}</Name>
                    <div style={horizontalBox}>
                        <SecondaryText>Excess Return</SecondaryText>
                        <SecondaryText color={metricColor.negative} style={{marginLeft: '5px'}}>{excessReturn}%</SecondaryText>
                    </div>
                </Col>
                <Col span={4} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                    <Score>{score}</Score>
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

const Name = styled.h3`
    font-size: 16px;
    font-weight: 700;
    color: #717171;
`;

const SecondaryText = styled.h3`
    font-size: 14px;
    font-weight: 300;
    color: ${props => props.color || '#717171'};
`;

const Score = styled.h3`
    font-size: 20px;
    font-weight: 700;
    color: #717171;
`;