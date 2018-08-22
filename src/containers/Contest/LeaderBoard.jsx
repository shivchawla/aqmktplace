import * as React from 'react';
import moment from 'moment';
import _ from 'lodash';
import Media from 'react-media';
import {Row, Col, Button, Select, Radio, Tooltip} from 'antd';
import {SegmentedControl} from  'antd-mobile';
import AppLayout from '../AppLayout';
import LeaderboardMobile from './LeaderBoardMobile';
import {primaryColor, verticalBox, horizontalBox} from '../../constants';
import {fetchAjax, Utils} from '../../utils';
import './css/leaderBoard.css';
import {formatMetric} from './utils';
import {metricDefs} from './constants';
import {ContestHomeMeta} from '../../metas';

const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const dateFormat = 'YYYY-MM-DD';

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
            selectedAdviceId: Utils.getFromLocalStorage('selectedAdviceId') || null,
            loading: false,
            paginationLoading: false,
            selectedPage: Number(Utils.getFromLocalStorage('contestSelectedPage')) || 0,
            limit: 10,
            activeContests: [],
            selectedContestId: Utils.getFromLocalStorage('contestId') || null,
            selectedContest: {},
            showActivePerformance: true,
            maxAdviceCount: 0,
        };
        this.entryDetailPosition = 'fixed';
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
        const advicesDisplayed = (this.state.selectedPage * this.state.limit) + this.state.limit;
        const disabledColor = '#BDBDBD';
        return (
            <Row 
                    type="flex" 
                    justify="space-between" 
                    style={{marginBottom: '10px'}}
                    align="middle"
            >
                <Col span={4} >
                    <Button
                        style={{
                            fontSize: '12px', 
                            fontWeight: '300', 
                        }}
                        size="small" 
                        disabled={this.state.selectedPage === 0}
                        onClick={() => this.handlePagination('previous')}
                    >PREVIOUS</Button>
                </Col>
                <div style={verticalBox}>
                    <h3 style={{fontSize: '14px'}}>{this.state.maxAdviceCount} Entries</h3>
                    <h3 style={{fontSize: '12px', fontWeight: 700}}>
                        Page {Number(this.state.selectedPage) + 1} / {Math.ceil(this.state.maxAdviceCount / this.state.limit)}
                    </h3>
                </div>
                <Col span={4} style={{textAlign:'end'}}>
                    <Button
                        style={{
                            fontSize: '12px', 
                            fontWeight: '300', 
                        }} 
                        type="primary"
                        disabled={advicesDisplayed >= this.state.maxAdviceCount}
                        size="small"
                        onClick={() => this.handlePagination('next')}
                    >
                        NEXT
                    </Button>
                </Col>
            </Row>
        );
    }

    renderPaginationMobile = () => {
        const advicesDisplayed = (this.state.selectedPage * this.state.limit) + this.state.limit;

        return (
            <Col 
                    span={24} 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'center', 
                        marginTop: '10px',
                        padding: '0 15px'
                    }}
            >
                {/* <Button 
                    disabled={this.state.selectedPage === 0}
                    onClick={() => this.handlePagination('previous')}
                >
                    Prev
                </Button> */}
                {/* {
                    this.state.loadingStocks &&
                    <Icon type="loading" style={{fontSize: '20px'}}/>
                } */}
                <Button
                    disabled={advicesDisplayed >= this.state.maxAdviceCount}
                    onClick={() => this.handlePagination('next')}
                    loading={this.state.paginationLoading}
                    type="primary"
                >
                    SHOW MORE
                </Button>
            </Col>
        );
    }

    renderLeaderList = () => {
        const leaders = this.state.advices;
        const advicesDisplayed = (this.state.selectedPage * this.state.limit) + this.state.limit;

        return (
            <Row id='leader-list'>
                {/* <Col span={24}>
                    {this.renderPagination()}
                </Col> */}

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
                <Col span={24} style={{textAlign:'center', marginTop: '20px'}}>
                    <Button
                        style={{
                            fontSize: '12px', 
                            fontWeight: '300', 
                        }} 
                        type="primary"
                        disabled={advicesDisplayed >= this.state.maxAdviceCount}
                        size="small"
                        onClick={() => this.handlePagination('next')}
                        loading={this.state.paginationLoading}
                    >
                        MORE
                    </Button>
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
        // Check if contestId is passed from the url
        const contestId = this.state.selectedContestId !== null || this.state.selectedContestId !== undefined
                ? this.state.selectedContestId 
                : _.get(this.props, 'match.params.id', null);
        this.setState({loading: true});
        fetchAjax(contestsUrl, this.props.history, this.props.match.url)
        .then(response => {
            let contests = _.get(response.data, 'contests', []).map(contest => {
                return {
                    id: _.get(contest, '_id', null),
                    name: _.get(contest, 'name', null),
                    startDate: _.get(contest, 'startDate', moment().format(dateFormat)),
                    endDate: _.get(contest, 'endDate', moment().format(dateFormat))
                };
            })
            this.setState({activeContests: contests});
            if (contestId !== null && contestId !== 'null') {
                const selectedContestIndex = _.findIndex(contests, contest => contest.id === contestId);
                this.setState({
                    selectedContestId: contestId, selectedContest: contests[selectedContestIndex]});

                return this.getLatestContestSummary(contestId, false);
            } else if(contests[contests.length - 1] !== undefined) {
                this.setState({selectedContestId: contests[contests.length - 1].id, selectedContest: contests[contests.length - 1]});

                return this.getLatestContestSummary(contests[contests.length - 1].id, false);
            }
            
            return null;
        })
        .catch(err => err)
        .finally(() => {
            this.setState({loading: false});
        })
    }

    // Gets the summary of the latest ongoing contest
    getLatestContestSummary = (contestId = this.state.selectedContestId, showLoader=true, updateAdviceId = false) => new Promise((resolve, reject) => {
        showLoader && this.setState({loading: true});
        this.setState({paginationLoading: true});
        const limit = (this.state.selectedPage + 1) * this.state.limit;
        const skip = 0;
        // const limit = this.state.limit;
        // const skip = this.state.selectedPage * limit;
        const contestSummaryUrl = `${requestUrl}/contest/${contestId}/advices?skip=${skip}&limit=${limit}`;
        fetchAjax(contestSummaryUrl, this.props.history, this.props.match.params.url)
        .then(({data: contestSummaryData}) => {
            let advices = _.get(contestSummaryData, 'advices', []);
            const adviceCount = _.get(contestSummaryData, 'advicesCount', 0);
            advices = advices.map(advice => this.processAdviceForLeaderboardListItem(advice));
            advices = _.orderBy(advices, 'rank', 'asc');
            const selectedAdviceId = (this.state.selectedAdviceId === 'null' || this.state.selectedAdviceId === null || updateAdviceId) 
                    ? advices[0].adviceId
                    : this.state.selectedAdviceId;
            Utils.localStorageSave('selectedAdviceId', selectedAdviceId);
            this.setState({
                advices, 
                selectedAdviceId, 
                maxAdviceCount: adviceCount
            });
            resolve(true);
        })
        .catch(err => {
            reject(err);
            // return err;
        })
        .finally(() => {
            showLoader && this.setState({loading: false});
            this.setState({paginationLoading: false});
        })
    })

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
        Utils.localStorageSave('selectedAdviceId', adviceId);
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

    // handlePagination = type => {
    //     let {selectedPage = 0} = this.state;
    //     selectedPage = type === 'next' ? selectedPage + 1 : selectedPage - 1;
    //     Utils.localStorageSave('contestSelectedPage', selectedPage);
    //     this.setState({
    //         selectedPage
    //     }, () => {
    //         this.getLatestContestSummary(this.state.selectedContestId, true, true);
    //     })
    // }

    handlePagination = type => {
        let {selectedPage = 0} = this.state;
        selectedPage += 1;
        Utils.localStorageSave('contestSelectedPage', selectedPage);
        this.setState({
            selectedPage
        }, () => {
            this.getLatestContestSummary(this.state.selectedContestId, false, true);
        })
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
        const selectedContest = this.state.activeContests.filter(contest => contest.id === contestId)[0];
        Utils.localStorageSave('contestId', contestId);
        Utils.localStorageSave('contestSelectedPage', 0);
        this.setState({
            selectedContestId: contestId, 
            selectedContest,
            selectedPage: 0
        }, () => this.getLatestContestSummary(contestId, true, true));
    }

    renderContestDropdown = (width = '200px') => {
        const {activeContests = []} = this.state;
        return (
            <Select 
                    style={{width}} 
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
        this.setState({showActivePerformance: e.target.value});
    }

    onPerformanceToggleMobile = (value) => {
        this.setState({showActivePerformance: value == "Active" ? true : false});
    }

    renderPageContent() {
        return (
            <Row gutter={0} style={{padding: '10px 20px'}}>
                <ContestHomeMeta />
                <Col span={16}>
                    <Row>
                        <Col span={24} style={{marginBottom: '20px'}}>
                            <h3 style={{fontSize: '26px', color: primaryColor, marginBottom: '0px'}}>
                                Leaderboard
                            </h3>
                            <div>
                                <h5 style={{fontSize: '16px', color: '#6F6F6F'}}>
                                    For {_.get(this.state, 'selectedContest.name', '')}
                                    <span style={{fontSize: '14px', marginLeft: '4px', fontWeight: 700}}>[{moment(_.get(this.state, 'selectedContest.startDate', '')).format(dateFormat)}</span>
                                    <span style={{fontSize: '12px', margin: '0 3px'}}>to</span>
                                    <span style={{fontSize: '14px', fontWeight: 700}}>{moment(_.get(this.state, 'selectedContest.endDate', '')).format(dateFormat)}]</span>
                                </h5>
                            </div>
                            <div style={{textAlign: 'end', marginTop: '-30px'}}>{this.renderContestDropdown()}</div>
                        </Col>
                        <Col span={24}>
                            {this.renderLeaderList()}
                        </Col>
                    </Row>
                </Col>
                <Col 
                    id='entry-detail-container'
                    span={7}
                    offset={1}
                    style={{
                        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)', 
                        height: '-webkit-fill-available',
                        backgroundColor: '#fff',
                        marginTop:'-40px',
                        height:'500px',
                        borderTop: `5px solid ${primaryColor}`,
                        position: this.entryDetailPosition,
                        top: '150px',
                        right: '20px',
                        // transition: 'top 0.4s ease-in-out'
                    }}
                >
                    {this.renderContestDetailMetrics()}
                </Col>
            </Row>
        );
    }

    componentWillMount() {
        this.getActiveContests();
    }

    componentDidMount() {
        window.addEventListener('scroll', this.handleWindowScroll);
    }

    handleWindowScroll = () => {
        try {
            const scrollYPosition = window.pageYOffset;
            const leaderList = document.getElementById('leader-list');
            const entryDetail = document.getElementById('entry-detail-container');
            const leaderListHeight = leaderList.clientHeight;
            const changeStyle = scrollYPosition > (leaderListHeight - 600);
            entryDetail.style.position = changeStyle ? 'absolute' : 'fixed';
            entryDetail.style.top = changeStyle 
                    ? `${leaderListHeight - 500}px` 
                    : scrollYPosition > 100
                        ? '80px'
                        : '150px';
        } catch(err) {
            
        }
    }

    renderContestDetailMetrics = (mobile=false) => {
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
            <ContestDetailMetrics 
                entryDetail={{
                    adviceName, 
                    advisorName, 
                    selectedAdvice,
                    currentMetrics, 
                    simulatedMetrics
                }}
                onPerformanceToggle={mobile ? this.onPerformanceToggleMobile : this.onPerformanceToggle}
                showActivePerformance={this.state.showActivePerformance}
                history={this.props.history}
                renderMetricsHeader={this.renderMetricsHeader}
                selectedAdviceId={this.state.selectedAdviceId}
            />
        );
        //onPerformanceToggle={mobile ? this.onPerformanceToggleMobile : this.onPerformanceToggle}
    }

    renderContestDetailMetricsMobile = () => {
        return this.renderContestDetailMetrics(true);
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() =>
                        <LeaderboardMobile 
                            leaders={this.state.advices} 
                            renderContestDetail={this.renderContestDetailMetricsMobile}
                            onLeaderItemClick={this.handleAdviceItemClicked} 
                            renderPagination={this.renderPaginationMobile}
                            loading={this.state.loading}
                            renderContestDropdown={this.renderContestDropdown}
                        />
                    }
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() =>
                        <AppLayout
                            content={this.renderPageContent()}
                            loading={this.state.loading}
                        />
                    }
                />
            </React.Fragment>
        );
    }
}
 
const ContestDetailMetrics = ({entryDetail, onPerformanceToggle, showActivePerformance, history, renderMetricsHeader, selectedAdviceId}) => {
    const {
        advisorName = '', 
        adviceName = '', 
        selectedAdvice = {},
        currentMetrics = {},
        simulatedMetrics = {}
    } = entryDetail;
    const adviceNameStyle = {
        fontSize: '18px',
        fontWeight: '400',
        color: primaryColor,
        height: '30px',
        textAlign:'center'
    };

    return (
        <React.Fragment>
            <div style={{
                ...horizontalBox, 
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
            
            <div 
                    style={{
                        display: 'flex', 
                        justifyContent: 'center', 
                        margin: '20px 0 20px 0'
                    }}
            >
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <SegmentedControl 
                            style={{width: '60%'}}
                            values={['Active', 'Historical']}
                            onValueChange={onPerformanceToggle}
                            selectedIndex={showActivePerformance === true ? 0 : 1}
                        />
                    )}
                />
                <Media 
                    query="(min-width: 600px)"
                    render={() => (
                        <RadioGroup 
                                size="small" 
                                onChange={onPerformanceToggle} 
                                value={showActivePerformance}
                        >
                            <RadioButton value={true}>Active</RadioButton>
                            <RadioButton value={false}>Historical</RadioButton>
                        </RadioGroup>
                    )}
                />
            </div>

            {showActivePerformance ?
                <MetricContainer 
                header={renderMetricsHeader(_.get(selectedAdvice, 'rank', null), 'Active Performance', _.get(selectedAdvice, 'metrics.current.score', 0))}
                metrics={currentMetrics} 
                />
            :
                <MetricContainer 
                    header={renderMetricsHeader(_.get(selectedAdvice, 'simulatedRank', null), 'Historical Performance', _.get(selectedAdvice, 'metrics.simulated.score', 0))}
                    metrics={simulatedMetrics} 
                />
            }

            <div style={{textAlign: 'center', marginTop: '40px'}}>
                <Button 
                    type="primary" 
                    style={{width: '150px',fontWeight: 300}} 
                    onClick={() => history.push(`/contest/entry/${selectedAdviceId}`)}
                    >
                    DETAIL
                </Button>
            </div>
        </React.Fragment>
    );
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

