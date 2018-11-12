import React from 'react';
import styled from 'styled-components';
import {Icon} from 'antd';
import {primaryColor} from '../../../constants';

export default class ActionIcons extends React.Component {
    render() {
        const {type = 'left', onClick = null} = this.props;

        return (
            <SIcon onClick={() => onClick && onClick()} type={type} theme="outlined" />
        );
    }
}

const SIcon = styled(Icon)`
    color: ${primaryColor};
    font-size: 20px;
    transition: all 0.2s ease-in-out;
    &:hover {
        color: ${primaryColor};
    }
`;