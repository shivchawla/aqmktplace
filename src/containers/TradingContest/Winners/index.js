import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import styled from 'styled-components';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import DateComponent from '../Misc/DateComponent';
import WinnerList from './WinnerList';
import {verticalBox} from '../../../constants';
import TimerComponent from '../Misc/TimerComponent';
import {getContestSummary, processWinnerStocks} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Winners extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment().format(dateFormat),
            winnerStocks: [],
            contestActive: false,
            startDate: moment().format(dateFormat),
            endDate: moment().add(2, 'days').format(dateFormat)
        };
    }

    getContestRankings = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date});
        const errorCallback = err => {
            this.setState({winnerStocks: [], contestActive: false});
        }
        getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const winnerParticipants = _.get(response.data, 'topStocks', []);
            const contestActive = _.get(response.data, 'active', false);
            const startDate = moment(_.get(response.data, 'startDate', null)).format(dateFormat);
            const endDate = moment(_.get(response.data, 'endDate', null)).format(dateFormat);
            const processedParticipants = await processWinnerStocks(winnerParticipants);
            this.setState({
                winnerStocks: processedParticipants, 
                contestActive,
                startDate, 
                endDate
            });
        });
    }

    componentWillMount() {
        this.getContestRankings(this.state.selectedDate);
    }

    render() {
        const contestStarted = moment().isSameOrAfter(moment(this.state.startDate, dateFormat));
        
        return (
            <Row>
                <Col span={24} style={topContainerStyle}>
                    <DateComponent 
                        color='#737373'
                        onDateChange={this.getContestRankings}
                        style={{padding: '0 10px'}}
                    />
                    {
                        !this.state.contestActive
                            ?   this.state.winnerStocks.length > 0 
                                    ? <ContestEndedView />
                                    : <ContestNotPresentView />
                            :   contestStarted
                                ?   <TimerComponent date={this.state.endDate} contestStarted={true} />
                                :   <TimerComponent date={this.state.startDate} />
                    }
                </Col>
                <Col span={24} style={{padding: '0 10px'}}>
                    <WinnerList winners={this.state.winnerStocks} />
                </Col>
            </Row>
        );
    }
}

export default withRouter(Winners);

const ContestNotPresentView = () => {
    return (
        <Row style={{marginTop: '60px'}}>
            <Col span={24} style={verticalBox}>
                <ContestNotAvailableText>No contest avaiable for selected date</ContestNotAvailableText>
            </Col>
        </Row>
    );
}

const ContestEndedView = () => {
    return (
        <Row style={{marginTop: '60px'}}>
            <Col span={24} style={verticalBox}>
                <ContestStatus>Contest Ended</ContestStatus>
                <WinnerHeader>Winner Stocks</WinnerHeader>
                <WinnerSubHeader>The stocks that were most voted today</WinnerSubHeader>
            </Col>
        </Row>
    );
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

const ContestNotAvailableText = styled.h3`
    font-size: 15px;
    font-weight: 700;
    color: #15C08F;
`;