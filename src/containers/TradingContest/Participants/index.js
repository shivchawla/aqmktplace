import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col} from 'antd';
import {withRouter} from 'react-router';
import DateComponent from '../Misc/DateComponent';
import ParticipantList from './ParticipantList';
import {verticalBox} from '../../../constants';
import {getContestSummary, processParticipants} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class Participants extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment().format(dateFormat),
            winners: []
        };
    }

    getContestRankings = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date});
        const errorCallback = err => {
            this.setState({winners: []});
        }
        getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const winnerParticipants = _.get(response.data, 'winners', []);
            const processedParticipants = await processParticipants(winnerParticipants);
            this.setState({winners: processedParticipants});
        });
    }

    renderEmptyScreen = () => {
        return (
            <Col span={24} style={{...listContainer, marginTop: '50%'}}>
                <h3 style={{textAlign: 'center', padding: '0 20px', color: '#4B4B4B'}}>
                    Winner list not present for this date. 
                </h3>
            </Col>
        );
    }

    renderWinnerList = () => {
        return (
            <Col span={24} style={listContainer}>
                <ParticipantList winners={this.state.winners} />
            </Col>
        );
    }
    
    componentWillMount() {
        this.getContestRankings(this.state.selectedDate);
    }

    render() {
        return (
            <Row>
                <Col span={24} style={topContainerStyle}>
                    <DateComponent 
                        onDateChange={this.getContestRankings}
                        style={{padding: '0 10px'}}
                    />
                    <Row style={{padding: '0 10px', width: '100%'}}>
                        <Col span={24}> 
                            <h3 style={{fontSize: '18px', color: '#fff'}}>Winners</h3>
                            <h3 style={{fontSize: '26px', color: '#fff'}}>{this.state.selectedDate}</h3>
                        </Col>
                    </Row>
                </Col>
                {
                    this.state.winners.length > 0
                    ? this.renderWinnerList()
                    : this.renderEmptyScreen()
                }
            </Row>
        );
    }
}

export default withRouter(Participants);

const topContainerStyle = {
    ...verticalBox,
    height: '150px',
    backgroundColor: '#15C08F',
    alignItems: 'flex-start',
    // padding: '0 10px'
};

const listContainer = {
    padding: '0 10px'
}