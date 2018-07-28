import * as React from 'react';
import _ from 'lodash';
import {Motion, spring} from 'react-motion';
import {Row, Col, Icon} from 'antd';
import {horizontalBox, verticalBox, primaryColor} from '../../constants';
import {AqMobileLayout} from '../AqMobileLayout/Layout';
import {MetricItem} from '../../components/MetricItem';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {formatMetric} from './utils';

export default class LeaderBoardMobile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            bottomSheetOpenStatus: false
        };
    }

    toggleBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    renderBottomSheet = () => {
        return (
            // <SwipeableBottomSheet 
            //         fullScreen 
            //         style={{zIndex: '20000'}}
            //         overlayStyle={{overflow: 'hidden'}}
            //         open={this.state.bottomSheetOpenStatus}
            //         onChange={this.toggleBottomSheet}
            //         swipeableViewsProps={{
            //             disabled: false
            //         }}
            // >
                // <EntryDetailBottomSheet 
                //     closeBottomSheet={this.toggleBottomSheet}
                //     renderContestDetail={this.props.renderContestDetail}
                // />
            // </SwipeableBottomSheet>
            <Motion style={{x: spring(this.state.bottomSheetOpenStatus ? -44 : global.screen.height)}}>
                {
                    ({x}) => (
                        <div 
                                style={{
                                    transform: `translate3d(0, ${x}px, 0)`,
                                    position: 'fixed',
                                    backgroundColor: '#fff',
                                    zIndex: '10000',
                                    height: global.screen.height
                                }}
                        >
                            <EntryDetailBottomSheet 
                                closeBottomSheet={this.toggleBottomSheet}
                                renderContestDetail={this.props.renderContestDetail}
                            />
                        </div>
                    )
                }
            </Motion>
        );
    }

    onLeaderItemClicked = adviceId => {
        this.props.onLeaderItemClick(adviceId);
        this.toggleBottomSheet();
    }

    renderParticipants = () => {
        const {leaders = []} = this.props;

        return (
            <Col span={24}>
                {
                    leaders.map((leader, index) => {
                        return (
                            <LeaderItem 
                                key={index}
                                onClick={this.onLeaderItemClicked}
                                leaderItem={leader} 
                                getRankColor={this.getRankColor}
                            />
                        );
                    })
                }
            </Col>
        );
    }

    getRankColor = rank => {
        switch(rank) {
            case 1:
                return '#4CAF50';
            case 2:
                return '#FFC107';
            case 3:
                return  '#3F51B5';
            default:
                return primaryColor;
        }
    }

    render() {
        return (
            <AqMobileLayout 
                    loading={this.props.loading}
                    customHeader={<h3 style={{fontSize: '16px'}}>Leaderboard</h3>}
            >
                {this.renderBottomSheet()}
                <Row>
                    <Col span={24} style={{...horizontalBox, justifyContent: 'center', marginTop: '15px'}}>
                        {this.props.renderContestDropdown('150px')}
                    </Col>
                    <Col span={24} style={{marginTop:'5px'}}>{this.renderParticipants()}</Col>
                    <Col span={24}>
                        {
                            !this.props.loading && this.props.leaders.length >= 6 &&
                            this.props.renderPagination()
                        }
                    </Col>
                </Row>
                <div style={{height: '20px'}}></div>
            </AqMobileLayout>
        );
    }
}

const LeaderItem = ({leaderItem, onClick, getRankColor}) => {
    const annualReturn = formatMetric(_.get(leaderItem, 'metrics.current.annualReturn.metricValue', NaN), "pct");
    const volatility = formatMetric(_.get(leaderItem, 'metrics.current.volatility.metricValue', NaN), "pct");
    const adviceId = _.get(leaderItem, 'adviceId', null);
    
    const containerStyle = {
        margin: '5px 10px 0px 10px',
        borderRadius: '2px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        border: '1px solid #eaeaea',
        padding: '5px 10px',
        cursor: 'pointer',
        borderLeft: `3px solid ${getRankColor(Number(leaderItem.rank))}`
    };
    
    return (
        <Row style={containerStyle} onClick={() => onClick(adviceId)}>
            <Col span={24} style={horizontalBox}>
                <h3 style={{color: '#767676'}}>{leaderItem.rank}</h3>
                <h3 style={{marginLeft: '18px'}}>{leaderItem.advisorName}</h3>
            </Col>
            <Col span={24} style={{marginLeft: '26px'}}>
                <Row>
                    <LeaderboardMetricItems
                        label="Excess Return"
                        value={annualReturn}
                    />
                    <LeaderboardMetricItems 
                        label="Tracking Error"
                        value={volatility}
                    />
                    <LeaderboardMetricItems 
                        label="Score"
                        value={(leaderItem.metrics.current.score).toFixed(2)}
                    />
                </Row>
            </Col>
        </Row>
    );
};

const LeaderboardMetricItems = ({label, value, onClick = null}) => {
    return (
        <Col span={8} onClick={onClick}>
            <MetricItem
                label={label}
                value={value}
                labelStyle={{fontSize: '12px', color: '#767676'}}
                valueStyle={{fontSize: '14px', fontWeight: '400', color: '#767676'}}
                noNumeric
            />
        </Col>
    );
};

const RankItem = ({rank}) => {
    return (
        <div 
                style={{
                    backgroundColor: primaryColor,
                    borderRadius: '50%',
                    width: '22px', height: '22px',
                    textAlign: 'center'
                }}
        >
            <h3 style={{color: '#fff', fontSize: '14px'}}>{Number(rank)}</h3>
        </div>
    );
};

const EntryDetailBottomSheet = ({closeBottomSheet, renderContestDetail}) => {
    return(
        <Row>
            <Col span={24} style={{...horizontalBox, justifyContent: 'center', padding: '10px'}}>
                <Icon 
                    style={{fontSize: '22px', position: 'absolute', left: '10px'}}
                    type="close-circle" 
                    onClick={closeBottomSheet}
                />
                <h3>ENTRY DETAIL</h3>
            </Col>
            <Col span={24}>
                {renderContestDetail()}
            </Col>
        </Row>
    );
};