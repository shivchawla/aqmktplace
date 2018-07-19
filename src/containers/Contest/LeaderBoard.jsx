import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Badge, Icon, Button, Select, Radio, Tooltip} from 'antd';
import Radium, {StyleRoot} from 'radium';
import AppLayout from '../AppLayout';
import {primaryColor, verticalBox, horizontalBox, metricColor} from '../../constants';
import {fetchAjax} from '../../utils';
import './css/leaderBoard.css';
import {formatMetric} from './utils';
import {metricDefs} from './constants';
import {ContestHomeMeta} from '../../metas';

const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

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
            selectedContest: {},
            showActivePerformance: true
        };
    }

    renderLeaderboardListHeader = () => {
        const headerStyle = {fontSize: '14px', color: '#fff', fontWeight:300, paddingLeft: '10px'};
        return (
            <Row
                    type="flex"
                    align="middle" 
                    style={{
                        borderBottom: '1px solid #eaeaea', 
                        //backgroundColor: '#fff',
                        backgroundColor: primaryColor,
                        color: '#fff',
                        height: '40px',
                        borderTopLeftRadius: '4px',
                        borderTopRightRadius: '4px',
                        paddingTop: '7px'
                    }}
            >
                <Col span={4}>
                    <h3 style={headerStyle}>RANK</h3>
                </Col>
                <Col span={6}>
                    <h3 style={headerStyle}>NAME</h3>
                </Col>
                <Col span={5}>
                    <h3 style={headerStyle}>EXCESS RETURN</h3>
                </Col>
                <Col span={5}>
                    <h3 style={headerStyle}>TRACKING ERROR</h3>
                </Col>
                <Col span={4} style={{...horizontalBox, position: 'relative'}}>
                    <h3 style={headerStyle}>SCORE</h3>
                </Col>
            </Row>
        );
    }

    renderPagination() {
        const disabledColor = '#BDBDBD';
        return (
            <Row type="flex" justify="space-between" style={{marginBottom: '10px'}}>
                <Col span={4} >
                    <Button
                        style={{
                            fontSize: '14px', 
                            fontWeight: '300', 
                            color: this.state.selectedPage === 0 ? disabledColor : '#fff',
                            //backgroundColor: '#fff',
                            //border: 'none',
                            //marginTop: '-6px'
                        }}
                        size="small" 
                        disabled={this.state.selectedPage === 0}
                        onClick={() => this.handlePagination('previous')}
                    >PREVIOUS</Button>
                </Col>

                <Col span={4} style={{textAlign:'end'}}>
                    <Button
                        style={{
                            fontSize: '14px', 
                            fontWeight: '300', 
                            color: this.state.advices.length % 10 !== 0 ? disabledColor : '#fff'}} 
                        size="small"
                        disabled={this.state.advices.length % 10 !== 0}
                        onClick={() => this.handlePagination('next')}
                    >NEXT</Button>
                </Col>
            </Row>
        );
    }

    renderLeaderList = () => {
        const leaders = this.state.advices;

        return (
            <Row>
                <Col span={24}>
                    {this.renderPagination()}
                </Col>

                <Col span={24}>
                    {this.renderLeaderboardListHeader()}
                </Col>
                
                <Col span={24}>
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
                    //totalReturn: {label: 'Total Return', ...this.getAdviceMetric(currentAdviceMetrics, 'totalReturn')},
                    annualReturn: {label: 'Excess Return', ...this.getAdviceMetric(currentAdviceMetrics, 'annualReturn')},
                    volatility: {label: 'Tracking Error', ...this.getAdviceMetric(currentAdviceMetrics, 'volatility')},
                    maxLoss: {label: 'Max. Loss', ...this.getAdviceMetric(currentAdviceMetrics, 'maxLoss')},
                    sharpe: {label: 'Information Ratio', ...this.getAdviceMetric(currentAdviceMetrics, 'sharpe')},
                    score: Number((_.get(advice, 'latestRank.rating.current.value') || 0).toFixed(2)),
                    calmar: {label: 'Calmar Ratio', ...this.getAdviceMetric(currentAdviceMetrics, 'calmar')},
                    concentration: {label: 'Concentration', ...this.getAdviceMetric(currentAdviceMetrics, 'concentration')},
                    //alpha: {label: 'Alpha', ...this.getAdviceMetric(currentAdviceMetrics, 'alpha')},
                },
                simulated: {
                    //totalReturn: {label: 'Total Return', ...this.getAdviceMetric(simulatedAdviceMetrics, 'totalReturn')},
                    annualReturn: {label: 'Excess Return', ...this.getAdviceMetric(simulatedAdviceMetrics, 'annualReturn')},
                    volatility: {label: 'Tracking Error', ...this.getAdviceMetric(simulatedAdviceMetrics, 'volatility')},
                    maxLoss: {label: 'Max. Loss', ...this.getAdviceMetric(simulatedAdviceMetrics, 'maxLoss')},
                    sharpe: {label: 'Information Ratio', ...this.getAdviceMetric(simulatedAdviceMetrics, 'sharpe')},
                    score: Number((_.get(advice, 'latestRank.rating.simulated.value') || 0).toFixed(2)),
                    //alpha: {label: 'Alpha', ...this.getAdviceMetric(simulatedAdviceMetrics, 'alpha')},
                    calmar: {label: 'Calmar Ratio', ...this.getAdviceMetric(simulatedAdviceMetrics, 'calmar')},
                    concentration: {label: 'Concentration', ...this.getAdviceMetric(simulatedAdviceMetrics, 'concentration')}
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

            var pctMetrics = ['annualReturn', 'volatility', 'maxLoss'];
            
            return metricKeys.filter(key => key!="score").map(key => {
                var idx = pctMetrics.indexOf(key);
                var rawVal = _.get(adviceMetrics,`${key}.metricValue`, NaN);
                var adjustedVal = idx != -1 ? 
                                    formatMetric(rawVal, "pct") : formatMetric(rawVal);
                                    

                return {
                    metricValue: adjustedVal,
                    rank: adviceMetrics[key].rank,
                    label: adviceMetrics[key].label,
                    tooltip: _.get(metricDefs, key, "")
                };
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
        return (
            <Row >
                <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                    
                    <h3 style={{marginLeft: '5px', fontWeight: 400, fontSize: '14px'}}><span style={{color: primaryColor, marginRight:'4px'}}>{rank}</span>{header}</h3>
                </Col>
                <Col span={24} style={verticalBox}>
                    <h3 style={{fontSize: '14px', fontWeight: 400}}>
                        Score: <span style={{fontSize: '14px', fontWeight: 400}}>{score}</span>
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
                    style={{width: 200}} 
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

    onPerformanceToggle = (e) => {
        this.setState({showActivePerformance: e.target.value == '0'});
    }

    renderPageContent() {
        const {advices = [], selectedAdviceId = null} = this.state;
        const selectedAdvice = advices.filter(advice => advice.adviceId === selectedAdviceId)[0];
        const advisorName = selectedAdvice !== undefined ? selectedAdvice.advisorName: '';
        const adviceName = selectedAdvice !== undefined ? selectedAdvice.adviceName: '';

        const adviceNameStyle = {
            fontSize: '18px',
            fontWeight: '400',
            color: primaryColor,
            height: '30px',
            textAlign:'center'
        };

        const currentMetrics = this.processMetricsForSelectedAdvice('current');
        const simulatedMetrics = this.processMetricsForSelectedAdvice('simulated');

        return (
            <Row gutter={0} style={{padding: '10px 20px'}}>
                <ContestHomeMeta />
                <Col span={16} style={{marginBottom: '20px'}}>
                    <h3 style={{fontSize: '26px', color: primaryColor, marginBottom: '0px'}}>
                        Leaderboard
                    </h3>
                    <h5 style={{fontSize: '14px', color: '#6F6F6F'}}>For {this.state.selectedContest.name}</h5>
                    <div style={{textAlign: 'end', marginTop: '-30px'}}>{this.renderContestDropdown()}</div>
                </Col>

                <Col span={16}>
                    {this.renderLeaderList()}
                </Col>
                <Col 
                    span={7}
                    offset={1}
                    style={{
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)', 
                        height: '-webkit-fill-available',
                        backgroundColor: '#fff',
                        marginTop:'-40px',
                        height:'500px',
                        borderTop: `5px solid ${primaryColor}`
                    }}
                >
                    <div style={{...horizontalBox, 
                            margin:'10px auto 0px auto', 
                            padding: '5px 0',
                            //border: `1px solid ${primaryColor}`, 
                            width: '80%', 
                            color: primaryColor, 
                            backgroundColor: '#fff',
                            display:'block'}}>
                        <h3  style={{...adviceNameStyle, marginBottom: '-10px'}}>
                            {advisorName}
                        </h3>
                        <span style={{fontSize: '12px', display: 'block', textAlign: 'center'}}>
                            ({adviceName})
                        </span>
                    </div>
                    
                    <div style={{textAlign: 'center', margin: '20px 0 20px 0'}}>
                        <RadioGroup size="small" onChange={this.onPerformanceToggle} defaultValue="0">
                            <RadioButton value="0">Active</RadioButton>
                            <RadioButton value="1">Historical</RadioButton>
                        </RadioGroup>
                    </div>

                    {this.state.showActivePerformance ?
                        <MetricContainer 
                        header={this.renderMetricsHeader(_.get(selectedAdvice, 'rank', null), 'Active Performance', _.get(selectedAdvice, 'metrics.current.score', 0))}
                        metrics={currentMetrics} 
                        />
                    :
                        <MetricContainer 
                            header={this.renderMetricsHeader(_.get(selectedAdvice, 'simulatedRank', null), 'Historical Performance', _.get(selectedAdvice, 'metrics.simulated.score', 0))}
                            metrics={simulatedMetrics} 
                        />
                    }

                    <div style={{textAlign: 'center', marginTop: '40px'}}>
                        <Button 
                            type="primary" 
                            style={{width: '150px',fontWeight: 300}} 
                            onClick={() => this.props.history.push(`/contest/entry/${this.state.selectedAdviceId}`)}
                            >
                            DETAIL
                        </Button>
                    </div>

                </Col>
            </Row>
        );
    }

    render() {
        return (
            <AppLayout
                content={this.renderPageContent()}
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
        marginTop: '0px',
        backgroundColor: selected ? '#e6f5f3' : '#fff'
    };
    const adviceId = _.get(leaderItem, 'adviceId', null);
    const metricStyle = {paddingLeft: '10px', fontSize: '14px'};

    const annualReturn = formatMetric(_.get(leaderItem, 'metrics.current.annualReturn.metricValue', NaN), "pct");
    const volatility = formatMetric(_.get(leaderItem, 'metrics.current.volatility.metricValue', NaN), "pct")

    return (
        <Row className='leader-item' style={containerStyle} onClick={() => onClick(adviceId)} >
            <Col span={4}>
                <h3 style={{...metricStyle, margin: 0}}>{leaderItem.rank} .</h3>
            </Col>
            <Col span={6}>
                <h5 style={{...metricStyle, margin: 0}}>{leaderItem.advisorName}</h5>
            </Col>
            <Col span={5}>
                <h3 style={metricStyle}>{annualReturn}</h3>
            </Col>
            <Col span={5}>
                <h3 style={metricStyle}>{volatility}</h3>
            </Col>
            <Col span={4}>
                <h3 style={metricStyle}>{(leaderItem.metrics.current.score).toFixed(2)} / 100</h3>
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
                    var borderRight = index % 2 == 0 ? '0.5px solid #E5E5E5' : 'none';
                    var borderBottom = index < 4 ? '0.5px solid #E5E5E5' : 'none';
                
                    if (metric !== undefined) {
                        return (
                            <Col 
                                    key={index}
                                    span={12} 
                                    style={{
                                        ...verticalBox, 
                                        borderRight: borderRight,
                                        borderBottom: borderBottom,
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

let ContestMetricItems = ({metricValue, rank, label, tooltip}) => {
    const containerStyle = {
        marginBottom: '10px'
    };
    const metricValueStyle = {
        fontSize: '15px', 
        fontWeight: '700', 
        color: primaryColor
    };
    // const rankBadgeColor = rank === 1 ? metricColor.positive : '#565656d9';
    // const metricValueRounded = (metricValue || 0).toFixed(2);

    console.log(tooltip);

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
                </Col>
                <Col span={20} style={{...verticalBox, width: 'fit-content'}}>
                    <Tooltip title={tooltip} placement="top">
                        <h5 style={{fontSize: '14px', display: 'inline-block', fontWeight: 400}}><span style={{backgroundColor: '#fff', color: primaryColor, marginRight: '4px'}}>{rank}</span>{label}</h5>
                    </Tooltip>
                    <h5 style={{fontSize: '14px', display: 'inline-block', fontWeight: 400}}>{metricValue}</h5>
                    
                </Col>
            </Row>
        </Col>
    );
}

