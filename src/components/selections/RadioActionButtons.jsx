import React from 'react';
import {Button} from 'antd';
import {Button as MobileButton} from 'antd-mobile';
import styled from 'styled-components';
import {metricColor, horizontalBox} from '../../constants';

export default class RadioActionButtons extends React.Component {
    render() {
        const {onChange, defaultValue = false, small = false} = this.props;
        const buyBtnColor = defaultValue ? {color: metricColor.positive} : {};
        const sellBtnColor = defaultValue ? {} : {color: metricColor.negative};

        return (
            <div style={{...horizontalBox, justifyContent: 'flex-start'}}>
                <AButton 
                        {...buyBtnColor} 
                        size='small' 
                        onClick={() => onChange('buy')}
                        style={{marginRight: '5px'}}
                        small={small}
                >
                    BUY
                </AButton>
                <AButton 
                        {...sellBtnColor} 
                        size='small' 
                        onClick={() => onChange('sell')}
                        small={small}
                >
                    SELL
                </AButton>
                <MobileButton></MobileButton>
            </div>
        );
    }
}

const AButton = styled(Button)`
    width: ${props => props.small ? '70px' : 'inherit'};
    height: ${props => props.small ? '30px' : 'inherit'};
    background-color: ${props => props.color || '#f9f9f9'};
    border-color: ${props => props.color || '#B7B7B7'};
    color: ${props => props.color ? '#fff' : '#444'};
    transition: all 0.3s ease-in-out;
    font-size: 12px;

    &:hover {
        background-color: ${props => props.color || '#f9f9f9'};
        border-color: ${props => props.color || '#B7B7B7'};
        color: ${props => props.color ? '#fff' : '#444'};
    }

    &:enabled {
        background-color: ${props => props.color || '#f9f9f9'};
        border-color: ${props => props.color || '#B7B7B7'};
        color: ${props => props.color ? '#fff' : '#444'};
    }
`;