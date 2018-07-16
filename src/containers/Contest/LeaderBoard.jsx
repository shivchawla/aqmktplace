import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Badge} from 'antd';
import AppLayout from '../AppLayout';
import {primaryColor, verticalBox, horizontalBox, metricColor} from '../../constants';
import {fetchAjax} from '../../utils';
import './css/leaderBoard.css';

const {requestUrl} = require('../../localConfig');
const contestId = '5b49cbe8f464ce168007bb79'; // For testing purpose only, this should be removed

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
            loading: false
        };
    }

    renderLeaderboardListHeader = () => {
        return (
            <Row
                    type="flex"
                    align="middle" 
                    style={{
                        borderBottom: '1px solid #eaeaea', 
                        marginBottom: '20px',
                        backgroundColor: '#fff',
                        height: '40px',
                        borderTopLeftRadius: '4px',
                        borderTopRightRadius: '4px',
                        paddingTop: '7px'
                    }}
            >
                <Col span={12}>
                    <Row>
                        <Col offset={4} span={20}>
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
                <Col span={4}>
                    <h3 style={{color: primaryColor, fontSize: '14px'}}>SCORE</h3>
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

    // Gets the summary of the latest ongoing contest
    getLatestContestSummary = () => {
        this.setState({loading: true});
        const contestSummaryUrl = `${requestUrl}/contest/${contestId}`;
        fetchAjax(contestSummaryUrl, this.props.history, this.props.match.params.url)
        .then(({data: contestSummaryData}) => {
            let advices = _.get(contestSummaryData, 'advices', []);
            advices = advices.map(advice => this.processAdviceForLeaderboardListItem(advice));
            advices = _.orderBy(advices, 'rank', 'asc');
            console.log('Advices', advices);
            this.setState({advices, selectedAdviceId: advices[0].adviceId});
        })
        .catch(err => {
            console.log(err);
            return err;
        })
        .finally(() => {
            this.setState({loading: false});
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

    componentWillMount() {
        this.getLatestContestSummary();
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
                <Col span={24} style={{marginBottom: '20px'}}>
                    <h3 style={{fontSize: '26px', color: '#252a2f', marginBottom: '0px'}}>Leaderboard</h3>
                    <h5 style={{fontSize: '14px', color: '#6F6F6F'}}>View leaderboard of the recent contest</h5>
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
                            // position: 'fixed',
                            // right: '20px',
                            // top: '100px'
                        }}
                >
                    <h3 
                            onClick={() => this.props.history.push(`/advice/${this.state.selectedAdviceId}`)} 
                            style={adviceNameStyle}
                    >
                        {adviceName}
                    </h3>
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
                content={this.renderPageContent()}
                loading={this.state.loading}
            ></AppLayout>
        );
    }
}

const LeaderItem = ({leaderItem, index, onClick}) => {
    const containerStyle = {
        borderBottom: '1px solid #eaeaea',
        marginBottom: '10px',
        cursor: 'pointer',
        paddingBottom: '10px'
    };
    const adviceId = _.get(leaderItem, 'adviceId', null);

    return (
        <Row style={containerStyle} onClick={() => onClick(adviceId)} >
            <Col span={12}>
                <Row>
                    <Col span={4}>
                        <h3 style={{fontSize: '14px', margin: 0, width: '200px'}}>{leaderItem.rank} .</h3>
                    </Col>
                    <Col span={20}>
                        <Row>
                            <Col span={22}>
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
            <Col span={4}>
                <h3 style={{fontSize: '14px'}}>{((leaderItem.metrics.current.volatility).metricValue * 100).toFixed(2)} %</h3>
            </Col>
            <Col span={4}>
                <h3 style={{fontSize: '14px'}}>{(leaderItem.metrics.current.score).toFixed(2)} / 100</h3>
            </Col>
        </Row>
    );
}

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

const ContestMetricItems = ({metricValue, rank, label}) => {
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
