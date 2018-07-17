import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Badge, Icon, Button, Select} from 'antd';
import Radium, {StyleRoot} from 'radium';
import AppLayout from '../AppLayout';
import {primaryColor, verticalBox, horizontalBox, metricColor} from '../../constants';
import {fetchAjax} from '../../utils';
import './css/leaderBoard.css';

const Option = Select.Option;
const {requestUrl} = require('../../localConfig');
// const contestId = '5b49cbe8f464ce168007bb79'; // For testing purpose only, this should be removed

const leaderboardListItem = {
    adviceName: 'Large Cap Investment Advice',
    advisorName: 'Shiv Chawla',
    metrics: {
        totalReturn: 1.5,
        volatility: 10.5,
        annualReturn: 4.5,
        beta: 3.2,
        alpha: 4.8
    }
};

const metrics = [
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    }
];


export default class LeaderBoard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: [], // list of advices currently participating in the contest
            selectedAdviceId: null,
            loading: false,
            selectedPage: 0,
            limit: 10,
            activeContests: [],
            selectedContestId: null,
            selectedContest: {}
        };
    }

    renderLeaderboardListHeader = () => {
        const disabledColor = '#BDBDBD';

        return (
            <Row
                    type="flex"
                    align="middle" 
                    style={{
                        borderBottom: '1px solid #eaeaea', 
                        backgroundColor: '#fff',
                        height: '40px',
                        borderTopLeftRadius: '4px',
                        borderTopRightRadius: '4px',
                        paddingTop: '7px'
                    }}
            >
                <Col span={12}>
                    <Row>
                        <Col span={2} style={{paddingLeft: '10px'}}>
                            <Button
                                style={{
                                    fontSize: '20px', 
                                    fontWeight: '700', 
                                    color: this.state.selectedPage === 0 ? disabledColor : primaryColor,
                                    backgroundColor: '#fff',
                                    border: 'none',
                                    marginTop: '-6px'
                                }} 
                                shape="circle"
                                icon="left" 
                                disabled={this.state.selectedPage === 0}
                                onClick={() => this.handlePagination('previous')}
                            />
                        </Col>
                        {/* <Col offset={4} span={20}> */}
                        <Col offset={2} span={20}>
                            <h3 style={{color: primaryColor, fontSize: '14px'}}>ADVICE</h3>
                        </Col>
                    </Row>
                </Col>
                <Col span={4}>
                    <h3 style={{color: primaryColor, fontSize: '14px'}}>TOTAL RETURN</h3>
                </Col>
                <Col span={4}>
                    <h3 style={{color: primaryColor, fontSize: '14px'}}>VOLATILITY</h3>
                </Col>
                <Col span={4} style={{...horizontalBox, position: 'relative'}}>
                    <h3 style={{color: primaryColor, fontSize: '14px'}}>SCORE</h3>
                    <Button
                        style={{
                            fontSize: '20px', 
                            fontWeight: '700', 
                            color: this.state.advices.length % 10 !== 0 ? disabledColor : primaryColor,
                            position: 'absolute',
                            right: '20px',
                            backgroundColor: '#fff',
                            border: 'none'
                        }} 
                        type="primary"
                        shape="circle"
                        icon="right" 
                        disabled={this.state.advices.length % 10 !== 0}
                        onClick={() => this.handlePagination('next')}
                    />
                </Col>
            </Row>
        );
    }

    renderLeaderList = () => {
        const leaders = this.state.advices;

        return (
            <Row>
                <Col span={24}>
                    {this.renderLeaderboardListHeader()}
                </Col>
                <Col span={24} style={{padding: '20px', paddingTop: '0px'}}>
                    {
                        leaders.map((leader, index) => 
                            <LeaderItem 
                                key={index}
                                selected={_.get(leader, 'adviceId', null) === this.state.selectedAdviceId}
                                leaderItem={leader} 
                                index={index + 1} 
                                onClick={this.handleAdviceItemClicked} 
                            />
                        )
                    }
                </Col>
            </Row>
        );

    }

    getLeaderList = () => {
        const leaders = [];
        for(let i = 0; i < 10; i++) {
            leaders.push(leaderboardListItem);
        }

        return leaders;
    }

    getActiveContests = () => {
        const contestsUrl = `${requestUrl}/contest`;
        this.setState({loading: true});
        fetchAjax(contestsUrl, this.props.history, this.props.match.url)
        .then(response => {
            let contests = _.get(response.data, 'contests', []).map(contest => {
                return {
                    id: _.get(contest, '_id', null),
                    name: _.get(contest, 'name', null)
                };
            })
            this.setState({activeContests: contests});
            if (contests[0] !== undefined) {
                this.setState({selectedContestId: contests[0].id, selectedContest: contests[0]});
                return this.getLatestContestSummary(contests[0].id, false);
            }

            return null;
        })
        .catch(err => err)
        .finally(() => {
            this.setState({loading: false});
        })
    }

    // Gets the summary of the latest ongoing contest
    getLatestContestSummary = (contestId = this.state.selectedContestId, showLoader=true) => {
        showLoader && this.setState({loading: true});
        const limit = this.state.limit;
        const skip = this.state.selectedPage * limit;
        const contestSummaryUrl = `${requestUrl}/contest/${contestId}/advices?skip=${skip}&limit=${limit}`;
        fetchAjax(contestSummaryUrl, this.props.history, this.props.match.params.url)
        .then(({data: contestSummaryData}) => {
            let advices = _.get(contestSummaryData, 'advices', []);
            advices = advices.map(advice => this.processAdviceForLeaderboardListItem(advice));
            advices = _.orderBy(advices, 'rank', 'asc');
            this.setState({advices, selectedAdviceId: advices[0].adviceId});
        })
        .catch(err => {
            return err;
        })
        .finally(() => {
            showLoader && this.setState({loading: false});
        })
    }

    /**
     * Usage: Gets the advice item from response and processes the advice
     * @param: advice
     * @returns: {adviceName, advisorName, metrics: {}}
     */
    processAdviceForLeaderboardListItem = advice => {
        const adviceId = _.get(advice, 'advice._id', null);
        const adviceName = _.get(advice, 'advice.name', null);
        const advisorFirstName = _.get(advice, 'advice.advisor.user.firstName', null);
        const advisorLastName = _.get(advice, 'advice.advisor.user.lastName', null);
        const advisorName = `${advisorFirstName} ${advisorLastName}`;
        const currentAdviceMetrics = _.get(advice, 'latestRank.rating.current.detail', []);
        const simulatedAdviceMetrics = _.get(advice, 'latestRank.rating.simulated.detail', []);
        const rank = _.get(advice, 'latestRank.value', null);
        const simulatedRank = _.get(advice, 'latestRank.rating.simulated.rank', null);

        return {
            adviceName,
            advisorName,
            adviceId,
            metrics: {
                current: {
                    totalReturn: {label: 'Total Return', ...this.getAdviceMetric(currentAdviceMetrics, 'totalReturn')},
                    volatility: {label: 'Volatility', ...this.getAdviceMetric(currentAdviceMetrics, 'volatility')},
                    annualReturn: {label: 'Annual Return', ...this.getAdviceMetric(currentAdviceMetrics, 'annualReturn')},
                    maxLoss: {label: 'Max Loss', ...this.getAdviceMetric(currentAdviceMetrics, 'maxLoss')},
                    sharpe: {label: 'Sharpe', ...this.getAdviceMetric(currentAdviceMetrics, 'sharpe')},
                    score: Number((_.get(advice, 'latestRank.rating.current.value') || 0).toFixed(2)),
                    alpha: {label: 'Alpha', ...this.getAdviceMetric(currentAdviceMetrics, 'alpha')},
                },
                simulated: {
                    totalReturn: {label: 'Total Return', ...this.getAdviceMetric(simulatedAdviceMetrics, 'totalReturn')},
                    volatility: {label: 'Volatility', ...this.getAdviceMetric(simulatedAdviceMetrics, 'volatility')},
                    annualReturn: {label: 'Annual Return', ...this.getAdviceMetric(simulatedAdviceMetrics, 'annualReturn')},
                    maxLoss: {label: 'Max Loss', ...this.getAdviceMetric(simulatedAdviceMetrics, 'maxLoss')},
                    sharpe: {label: 'Sharpe', ...this.getAdviceMetric(simulatedAdviceMetrics, 'sharpe')},
                    score: Number((_.get(advice, 'latestRank.rating.simulated.value') || 0).toFixed(2)),
                    alpha: {label: 'Alpha', ...this.getAdviceMetric(simulatedAdviceMetrics, 'alpha')}
                }
            },
            rank,
            simulatedRank
        };
    }

    /**
     * Usage: Gets the advice metric based on the key provided
     * @param: metrics - advice metrics obtained from the N/W response of each individual advice
     * @param: metricKey - name of the metric that we want the value of eg: volatility, totalReturn or annualReturn
     */
    getAdviceMetric = (metrics, metricKey) => {
        return metrics.filter(metric => metric.field === metricKey) !== undefined 
                ? metrics.filter(metric => metric.field === metricKey)[0]
                : null;
    }

    /**
     * Usage: Get the adviceId of the advice that's clicked and store in state (selectedAdviceId)
     * @param: adviceId - The Advice Id of the selected advice
     */
    handleAdviceItemClicked = adviceId => {
        this.setState({
            selectedAdviceId: adviceId
        });
    }

    /**
     * Usage: Processes the metrics based on the selected advice and the metric type provided
     * @param: metricType - The metric type (current or simulated)
     */
    processMetricsForSelectedAdvice = metricType => {
        const {selectedAdviceId = null, advices = []} = this.state;
        const selectedAdvice = advices.filter(advice => advice.adviceId === selectedAdviceId)[0];
        if (selectedAdvice !== undefined) {
            const adviceMetrics = _.get(selectedAdvice, `metrics.${metricType}`, {});
            const metricKeys = Object.keys(adviceMetrics);

            return metricKeys.map(key => {
                if (key !== 'score') {
                    return {
                        metricValue: adviceMetrics[key].metricValue,
                        rank: adviceMetrics[key].rank,
                        label: adviceMetrics[key].label
                    };
                }
            })
        } else {
            return metrics;
        }
    }

    handlePagination = type => {
        let {selectedPage = 0} = this.state;
        selectedPage = type === 'next' ? selectedPage + 1 : selectedPage - 1;
        this.setState({
            selectedPage
        }, () => {
            this.getLatestContestSummary();
        })
    }

    componentWillMount() {
        this.getActiveContests();
    }

    renderMetricsHeader = (rank, header, score) => {
        const rankColor = rank === 1 ? metricColor.positive : '#565656d9';

        return (
            <Row>
                <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                    <Badge style={{backgroundColor: rankColor}} count={rank}/>
                    <h3 style={{marginLeft: '5px'}}>{header}</h3>
                </Col>
                <Col span={24} style={verticalBox}>
                    <h3 style={{fontSize: '14px'}}>
                        Score: <span style={{fontSize: '16px', fontWeight: 700}}>{score}</span>
                    </h3>
                </Col>
            </Row>
        );
    }

    handleContestChange = contestId => {
        this.setState({
            selectedContestId: contestId, 
            selectedContest: this.state.activeContests.filter(contest => contest.id === contestId)[0]
        });
        this.getLatestContestSummary(contestId);
    }

    renderContestDropdown = () => {
        const {activeContests = []} = this.state;
        return (
            <Select 
                    style={{width: 200, position: 'absolute', right: 0}} 
                    value={this.state.selectedContestId} 
                    onChange={this.handleContestChange}
            >
                {
                    activeContests.map((contest, index) => {
                        return <Option key={index} value={_.get(contest, 'id', null)}>{_.get(contest, 'name', null)}</Option>
                    })
                }
            </Select>
        );
    }

    renderPageContent() {
        const {advices = [], selectedAdviceId = null} = this.state;
        const selectedAdvice = advices.filter(advice => advice.adviceId === selectedAdviceId)[0];
        const adviceName = selectedAdvice !== undefined ? selectedAdvice.adviceName: '';
        const adviceNameStyle = {
            marginTop: '10px',
            marginLeft: '10px',
            fontSize: '18px',
            fontWeight: '700',
            color: primaryColor,
            cursor: 'pointer',
            textAlign: 'center'
        };
        const currentMetrics = this.processMetricsForSelectedAdvice('current');
        const simulatedMetrics = this.processMetricsForSelectedAdvice('simulated');

        return (
            <Row style={{padding: '20px', paddingTop: '10px'}}>
                <Col span={24} style={{...horizontalBox, marginBottom: '20px'}}>
                    <Row>
                        <Col span={24}>
                            <h3 style={{fontSize: '26px', color: '#252a2f', marginBottom: '0px'}}>
                                <span 
                                        style={{
                                            color: primaryColor, 
                                            marginRight: '10px',
                                            display: 'inline-block',
                                            paddingRight: '10px',
                                            borderRight: `1px solid ${primaryColor}`
                                        }}
                                >
                                    {this.state.selectedContest.name}
                                </span>
                                Leaderboard
                            </h3>
                        </Col>
                        <Col span={24}>
                            <h5 style={{fontSize: '14px', color: '#6F6F6F'}}>View leaderboard of the selected contest</h5>
                        </Col>
                    </Row>
                    {this.renderContestDropdown()}
                </Col>
                <Col 
                        span={16}
                        style={{
                            backgroundColor: '#fff',
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                            borderRadius: '4px',
                        }}
                >
                    {this.renderLeaderList()}
                </Col>
                <Col 
                        offset={1}
                        span={7}
                        style={{
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)', 
                            height: '-webkit-fill-available',
                            backgroundColor: '#fff',
                        }}
                >
                    <div style={{...horizontalBox, justifyContent: 'center'}}>
                        <h3 
                                onClick={() => this.props.history.push(`/advice/${this.state.selectedAdviceId}`)} 
                                style={adviceNameStyle}
                        >
                            {adviceName}
                        </h3>
                        <Icon type="right" style={{fontSize: '20px', color: primaryColor, marginTop: '10px', marginLeft: '10px'}}/>
                    </div>
                    <MetricContainer 
                        header={this.renderMetricsHeader(_.get(selectedAdvice, 'rank', null), 'Current Performance', _.get(selectedAdvice, 'metrics.current.score', 0))}
                        metrics={currentMetrics} 
                    />
                    <MetricContainer 
                        header={this.renderMetricsHeader(_.get(selectedAdvice, 'simulatedRank', null), 'Simulated Performance', _.get(selectedAdvice, 'metrics.simulated.score', 0))}
                        metrics={simulatedMetrics} 
                    />
                </Col>
            </Row>
        );
    }

    render() {
        return (
            <AppLayout
                noFooter={true}
                content={<StyleRoot>{this.renderPageContent()}</StyleRoot>}
                loading={this.state.loading}
            ></AppLayout>
        );
    }
}

let LeaderItem = ({leaderItem, onClick, selected}) => {
    const containerStyle = {
        borderBottom: '1px solid #eaeaea',
        cursor: 'pointer',
        paddingBottom: '10px',
        paddingTop: '15px',
        marginTop: '10px',
        backgroundColor: selected ? '#ECEFF1' : '#fff'
    };
    const adviceId = _.get(leaderItem, 'adviceId', null);

    return (
        <Row className='leader-item' style={containerStyle} onClick={() => onClick(adviceId)} >
            <Col span={12}>
                <Row>
                    <Col span={3}>
                        <h3 style={{fontSize: '14px', margin: 0}}>{leaderItem.rank} .</h3>
                    </Col>
                    <Col span={20}>
                        <Row>
                            <Col span={24}>
                                <h3 style={{fontSize: '14px', margin: 0}}>{leaderItem.adviceName}</h3>
                            </Col>
                            <Col span={24}>
                                <h5 style={{fontSize: '12px', margin: 0}}>{leaderItem.advisorName}</h5>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
            <Col span={4}>
                <h3 style={{fontSize: '14px'}}>{((leaderItem.metrics.current.totalReturn).metricValue * 100).toFixed(2)} %</h3>
            </Col>
            <Col span={4} style={{paddingLeft: '10px'}}>
                <h3 style={{fontSize: '14px'}}>{((leaderItem.metrics.current.volatility).metricValue * 100).toFixed(2)} %</h3>
            </Col>
            <Col span={4} style={{paddingLeft: '12px'}}>
                <h3 style={{fontSize: '14px'}}>{(leaderItem.metrics.current.score).toFixed(2)} / 100</h3>
            </Col>
        </Row>
    );
};

const MetricContainer = ({header, metrics}) => {
    return (
        <Row style={{padding: '10px'}}>
            <Col span={24} style={{marginBottom: '10px'}}>
                {header}
            </Col>
            {
                metrics.map((metric, index) => {
                    if (metric !== undefined) {
                        return (
                            <Col 
                                    key={index}
                                    span={12} 
                                    style={{
                                        ...verticalBox, 
                                        border: '1px solid #E5E5E5', 
                                        padding: '5px',
                                        boxSizing: 'border-box'
                                    }}
                            >
                                <ContestMetricItems key={index} {...metric} />
                            </Col>
                        );
                    }
                })
            }
        </Row>
    );
}

let ContestMetricItems = ({metricValue, rank, label}) => {
    const containerStyle = {
        marginBottom: '10px'
    };
    const metricValueStyle = {
        fontSize: '15px', 
        fontWeight: '700', 
        color: primaryColor
    };
    const rankBadgeColor = rank === 1 ? metricColor.positive : '#565656d9';
    const metricValueRounded = metricValue.toFixed(2);


    return (
        <Col span={24} style={containerStyle}>
            <Row type="flex" justify="center" style={{position: 'relative'}}>
                <Col 
                        span={4} 
                        style={{
                            ...horizontalBox, 
                            position: 'absolute',
                            left: '5px',
                            alignItems: 'flex-start', 
                            justifyContent: 'flex-start'
                        }}
                >
                    <Badge 
                        style={{backgroundColor: rankBadgeColor}} 
                        count={rank} 
                    />
                </Col>
                <Col span={20} style={{...verticalBox, width: 'fit-content'}}>
                    <h5 style={{fontSize: '12px', display: 'inline-block'}}>{label}</h5>
                    <h5 style={{fontSize: '14px', display: 'inline-block'}}>{metricValueRounded}</h5>
                </Col>
            </Row>
        </Col>
    );
}

