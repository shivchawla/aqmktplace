import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import {Row, Col} from 'antd';
import { verticalBox } from '../../../constants';
import {setEndTimeToDate} from '../utils';

export default class TimeComponent extends React.Component {
    constructor(props) {
        super(props);
        this.timer = null;
        this.state = {
            difference: null
        }
    }

    componentWillMount() {
        this.setTimer();
    }

    componentWillReceiveProps(nextProps) {
        this.setTimer(nextProps);
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    setTimer = (props = this.props) => {
        clearInterval(this.timer);
        this.timer = setInterval(() => {
            const {date = moment().format('YYYY-MM-DD')} = props;
            const hourToSet = props.contestStarted ? 15 : 9;
            const endTime = setEndTimeToDate(date, hourToSet);
            const startTime = moment();
            let difference = null;
            if (endTime.isAfter(startTime)) {
                const secondsDifference = endTime.diff(startTime, 'seconds');
                difference = moment.utc(secondsDifference * 1000).format('HH:mm:ss');
            }    
            this.setState({difference});   
        }, 1000)
    }

    render() {
        const type = this.props.type || 'normal';
        const {contestStarted = false} = this.props;

        return (
            <Row>
                <Col span={24} style={{...verticalBox}}>
                    <Header
                            fontSize={type === 'normal' ? '16px' : '14px'}
                    >
                        {
                            this.state.difference === null
                            ? "Contest Ended"
                            : contestStarted
                                ? "Contest ends in"
                                : "Contest will start in"
                        }
                    </Header>
                </Col>
                {
                    this.state.difference !== null &&
                    <Col span={24} style={{...verticalBox}}>
                        <TimerText 
                                fontSize={type === 'normal' ? '34px' : '20px'}
                                color={type === 'normal' ? '#15C08F' : '#686868'}
                        >
                            {this.state.difference}
                        </TimerText>
                    </Col>
                }
            </Row>
        );
    }
}

const TimerText = styled.h3`
    font-weight: 500;
    font-size: ${props => props.fontSize || '34px'};
    color: ${props => props.color || '#15C08F'};
`;

const Header = styled.h3`
    font-size: ${props => props.fontSize || '16px'};
    color: #686868;
`;