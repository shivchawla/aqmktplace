import * as React from 'react';
import Loadable from 'react-loadable';
import axios from 'axios';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Tabs, Button, Modal, message, Input, Radio} from 'antd';
import {currentPerformanceColor, simulatedPerformanceColor, loadingColor, shadowBoxStyle, benchmarkColor, primaryColor, buttonStyle} from '../../constants';
import UpdateAdvice from '../../containers/UpdateAdvice';
import {AdviceDetailContent} from '../../containers/AdviceDetailContent';
import {ApprovalItemView} from '../../components/ApprovalItemView';
import {ApprovalItem} from '../../components/ApprovalItem';
import ForbiddenAccess from '../../components/ForbiddenAccess';
import {AqPageHeader} from '../../components/AqPageHeader';
import {ContestAdviceDetailCrumb} from '../../constants/breadcrumbs';
import {AdviceDetailMeta} from '../../metas';
import {Utils, getBreadCrumbArray,fetchAjax, getStockPerformance, openNotification, handleCreateAjaxError, getStockStaticPerformance, getStockRollingPerformance} from '../../utils';
import {benchmarks as benchmarkArray} from '../../constants/benchmarks';
import '../../css/adviceDetail.css';
import AppLayout from '../../containers/AppLayout';

const StockResearchModal = Loadable({
    loader: () => import('../../components/StockResearchModal'),
    loading: () => <div>Loading</div>
});
const TabPane = Tabs.TabPane;
const {TextArea} = Input;
const RadioGroup = Radio.Group;

const {requestUrl} = require('../../localConfig.js');
const DateHelper = require('../../utils/date');
const dateFormat = 'Do MMMM YYYY';

const approvalObj = {
    name: {
        valid: true,
        reason: '',
        fieldName: 'Name',
    },
    stockExposure: {
        valid: false,
        reason: '',
        fieldName: 'Stock Exposure',
    },
    industryExposure: {
        valid: false,
        reason: '',
        fieldName: 'Industry Exposure',
    },
    sectorExposure: {
        valid: false,
        reason: '',
        fieldName: 'Sector Exposure',
    },
    goal: {
        valid: true,
        reason: '',
        fieldName: 'Goal',
    },
    portfolioValuation: {
        valid: true,
        reason: '',
        fieldName: 'Portfolio Valuation',
    },
    capitalization: {
        valid: true,
        reason: '',
        fieldName: 'Capitalization',
    },
    sectors: {
        valid: true,
        reason: '',
        fieldName: 'Sectors',
    },
    userText: {
        valid: true,
        reason: '',
        fieldName: 'User Text'
    }
};

class AdviceDetailImpl extends React.Component {
    socketOpenConnectionTimeout = 1000;
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            adviceDetail: {
                active: false,
                withdrawn: false,
                prohibited: false,
                name: 'Advice Name',
                description: '',
                approvalStatus: "pending",
                heading: '',
                advisor: {},
                updatedDate: '',
                followers: -1,
                rating: 0,
                subscribers: -1,
                maxNotional: 300000,
                rebalanceFrequency: '',
                isPublic: false,
                isAdmin: false,
                isOwner: false,
                isSubscribed: false,
                isFollowing: false,
                contestOnly: false,
                benchmark: '',
                approval: [],
                approvalStatus: false,
                investmentObjective: {},
                approvalRequested: false
            },
            metrics: {
                annualReturn: 0,
                totalReturn:0,
                volatility:0,
                maxLoss:0,
                dailyNAVChangePct: 0,
                netValue: 0,
                period:0,
            },
            performance: {
                current: {},
                simulated: {}
            },
            performanceType: 'Simulated',
            tickers: [],
            isDialogVisible: false,
            isUpdateDialogVisible: false,
            userId: '',
            adviceResponse: {},
            portfolio: {},
            disableSubscribeButton: false,
            disableFollowButton: false,
            series: [],
            barDollarSeries: [],
            barPercentageSeries: [],
            positions: [],
            cash: -10,
            stockResearchModalVisible: false,
            unsubscriptionModalVisible: false,
            approvalModalVisible: false,
            stockResearchModalTicker: 'TCS',
            selectedPortfolioDate: moment(),
            realtimeSecurities: [],
            approveObj: {
                message: '',
                approved: true,
                prohibit: false
            },
            notAuthorized: false,
            approvalLoading: false,
            // Used to approve investment objective and other fields
            approvalObj,
            postWarningModalVisible: false,
            postToMarketPlaceLoading: false,
            requestApprovalLoading: false,
            loading: true,
            withdrawAdviceLoading: false,
            notPresentInLatestContest: false,
            withdrawModalVisible: false,
            prohibitModalVisible: false,
            participatedContests: [],
            benchmarkCurrentStaticPerformance: {}, // Stores the current static performance of the benchmark
            benchmarkSimulatedStaticPerformance: {}, // Stores the simulated static performance of the benchmark
            simulatedStaticPerformance: [], // stores the data of the static performance for a particular field eg: totalReturn or volatility
            currentStaticPerformance: [], // stores the data of the static performance for a particular field eg: totalReturn or volatility
            currentStaticPortfolioPerformance: {}, // stores performance object for the current static performance of the portfolio
            simulatedStaticPortfolioPerformance: {}, // stores performance object for the simulated static performance of the portfolio
            selectedPerformanceMetrics: 'returns.totalreturn', // stores the selected key for rendering static performance
            selectedRollingPerformanceMetric: 'returns.totalreturn', // stores the selected key for rendering rolling performance
            currentRollingPerformance: {},
            simulatedRollingPerformance: {},
            benchmarkRollingCurrentPerformance: {},
            benchmarkRollingSimulatedPerformance: {}
        };

        this.performanceSummary = {};
    }

    makeAdvicePublic = () => {
        const url = `${requestUrl}/advice/${this.props.match.params.id}/publish`;
        axios({
            method: 'POST',
            url,
            headers: Utils.getAuthTokenHeader(),
        })
        .then(response => {
            this.togglePostWarningModal();
            this.getAdviceData();
            message.success('Advice successfully made Public');
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            // console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    };

    getAdviceSummary = (response, performance = true) => {
        const {
            name = '',
            description = '',
            heading = '',
            advisor = '',
            updatedDate = '',
            rating = {current: 0, simulated: 0},
            isSubscribed = false,
            isFollowing = false,
            isOwner = false,
            isAdmin = false,
            numSubscribers = 0,
            numFollowers = 0,
            contestOnly = false,
            portfolio = {},
            performanceSummary = {},
            netValue = 0,
            stocks = 0,
            approvalStatus = 'pending',
            rebalance = '',
        } = response.data;
        const benchmark = _.get(portfolio, 'benchmark.ticker', 'NIFTY_50');
        this.performanceSummary = performanceSummary;
        const currentPerformance = _.get(performanceSummary, 'current', {}) || {};
        const simulatedPerformance = _.get(performanceSummary, 'simulated', {}) || {};
        const {annualReturn = 0, dailyNAVChangeEODPct = 0, netValueEOD = 0, totalReturn = 0, volatility = 0, maxLoss = 0, period = 0} = simulatedPerformance;
        const {nstocks = 0} = currentPerformance;
        var dailyNAVChangePct = 0.0
        var annualReturnEOD = annualReturn;
        const approval = _.get(response.data, 'latestApproval', {});
        const investmentObjective = _.get(response.data, 'investmentObjective', {});
        const approvalRequested = _.get(response.data, 'approvalRequested', false);
        this.updateApprovalObj(approval, investmentObjective);

        this.setState({
            adviceResponse: response.data,
            adviceDetail: {
                ...this.state.adviceDetail,
                benchmark,
                name,
                description,
                heading,
                advisor,
                approvalStatus,
                subscribers: numSubscribers,
                isSubscribed,
                isOwner,
                isAdmin,
                isFollowing,
                rebalanceFrequency: rebalance,
                followers: numFollowers,
                updatedDate: moment(updatedDate).format(dateFormat),
                rating: Number((rating.current || 0).toFixed(2)),
                isPublic: _.get(response.data, 'public', false),
                investmentObjective,
                approval,
                approvalRequested,
                contestOnly
            },
            metrics: {
                ...this.state.metrics,
                nstocks,
                annualReturn: annualReturnEOD,
                totalReturn,
                volatility,
                maxLoss,
                dailyNAVChangePct: 0,
                netValue
            },
            performance: {
                current: currentPerformance,
                simulated: simulatedPerformance
            }
        });
    }

    updateApprovalObj = (approval, investmentObjective) => {
        const detail = _.get(approval, 'detail', []);
        const {approvalObj} = this.state;
        detail.map(item => {
            const fieldValidIndex = Object.keys(approvalObj).indexOf(item.field);
            if (fieldValidIndex !== -1) {
                approvalObj[item.field].valid = item.valid;
                approvalObj[item.field].reason = item.reason;
            }
        });
        Object.keys(investmentObjective).map(item => {
            const fieldValidIndex = Object.keys(approvalObj).indexOf(item);
            if (fieldValidIndex !== -1) {
                approvalObj[item].valid = investmentObjective[item].valid;
                approvalObj[item].reason = investmentObjective[item].reason;
            }
        });
        this.setState({approvalObj});
    }

    getAdviceDetail = response => {
        const portfolio = {...this.state.portfolio};
        const positions = _.get(response.data, 'detail.positions', []);
        const {maxNotional, rebalance} = response.data;
        this.setState({
            positions,
            //cash: _.get(response.data, 'detail.cash', 0),
            realtimeSecurities: this.processPositionToWatchlistData(positions),
            adviceDetail: {
                ...this.state.adviceDetail,
                maxNotional,
                rebalance
            },
            portfolio: response.data.portfolio
        });
    }
    
    getAdvicePerformance = (performance, benchmark = 'NIFTY_50') => new Promise((resolve, reject) => {
        const tickers = [...this.state.tickers];
        const currentPortfolioPerformance = _.get(performance, 'current.metrics.portfolioPerformance', {});
        const simulatedPortfolioPerformance = _.get(performance, 'simulated.metrics.portfolioPerformance', {});
        const benchmarkRequestType = _.indexOf(benchmarkArray, benchmark) === -1 ? 'detail' : 'detail_benchmark';
        const simulatedPerformance = this.processPerformanceData(_.get(performance, 'simulated.portfolioValues', []));
        const truePerformance = this.processPerformanceData(_.get(performance, 'current.portfolioValues', []));
        Promise.all([
            getStockPerformance(benchmark, benchmarkRequestType),
            // getStockStaticPerformance(benchmark, benchmarkRequestType),
            // getStockRollingPerformance(benchmark, benchmarkRequestType)
        ])
        .then(([benchmarkResponse]) => {
            const benchmarkCurrentStaticPerformance = _.get(currentPortfolioPerformance, 'static_benchmark.monthly', {});    
            const benchmarkSimulatedStaticPerformance = _.get(simulatedPortfolioPerformance, 'static_benchmark.monthly', {});    
            const benchmarkRollingCurrentPerformance = _.get(currentPortfolioPerformance, 'rolling_benchmark', {});
            const benchmarkRollingSimulatedPerformance = _.get(simulatedPortfolioPerformance, 'rolling_benchmark', {});
            const simulatedStaticMonthlyPerformance = this.processStaticPerformance(_.get(simulatedPortfolioPerformance, 'static.monthly', {}), benchmarkSimulatedStaticPerformance);
            const currentStaticMonthlyPerformance = this.processStaticPerformance(_.get(currentPortfolioPerformance, 'static.monthly', {}), benchmarkCurrentStaticPerformance, 'returns.totalreturn', 'True');    
            const currentRollingPerformance = this.processRollingPerformance(_.get(currentPortfolioPerformance, 'rolling', {}), benchmarkRollingCurrentPerformance, 'returns.totalreturn', 'True');
            const simulatedRollingPerformance = this.processRollingPerformance(_.get(simulatedPortfolioPerformance, 'rolling', {}), benchmarkRollingSimulatedPerformance);
            let oneYearOldDate = moment().subtract(1, 'y');
            oneYearOldDate = oneYearOldDate.format('YYYY-MM-DD');
            benchmarkResponse = benchmarkResponse.filter(item => {
                const itemDate = moment(item[0]).format('YYYY-MM-DD');
                return moment(itemDate).isSameOrAfter(oneYearOldDate);
            });

            if (performance.simulated && simulatedPerformance.length > 0) {
                tickers.push({
                    name: 'Historical Performance',
                    data: simulatedPerformance,
                    color: simulatedPerformanceColor,
                    noLoadData: true
                });
            }
    
            if (performance.current && Utils.isLoggedIn() && truePerformance.length > 0) {
                tickers.push({
                    name: 'Active Performance',
                    data: truePerformance,
                    color: currentPerformanceColor,
                    noLoadData: true
                });
            }
            tickers.push({
                name: benchmark,
                color: benchmarkColor,
                data: benchmarkResponse
            });
            this.setState({
                tickers,
                simulatedStaticPerformance: simulatedStaticMonthlyPerformance,
                currentStaticPerformance: currentStaticMonthlyPerformance,
                currentStaticPortfolioPerformance: currentPortfolioPerformance,
                simulatedStaticPortfolioPerformance: simulatedPortfolioPerformance,
                benchmarkCurrentStaticPerformance,
                benchmarkSimulatedStaticPerformance,
                benchmarkRollingCurrentPerformance,
                benchmarkRollingSimulatedPerformance,
                currentRollingPerformance,
                simulatedRollingPerformance
            });
            resolve(true);
        })
        .catch(error => {
            reject(error);
        });
    })

    processStaticPerformance = (performance, benchmarkPerformance, field = 'returns.totalreturn', type='Historical') => {
        let performanceKeys = Object.keys(performance);
        let benchmarkPerformanceKeys = Object.keys(benchmarkPerformance);
        const dateOneyYearBack = moment().subtract(1, 'y').subtract(1, 'M');
        benchmarkPerformanceKeys = benchmarkPerformanceKeys.filter(item => 
            moment(item, 'YYYY_M').isSameOrAfter(dateOneyYearBack)
        );
        benchmarkPerformanceKeys = benchmarkPerformanceKeys.map(key => moment(key, 'YYYY_M'));
        benchmarkPerformanceKeys = benchmarkPerformanceKeys.sort((a, b) => {return moment(a).isBefore(b) ?-1:1});

        performanceKeys = performanceKeys.map(key => moment(key, 'YYYY_M'));
        performanceKeys = performanceKeys.sort((a, b) => {return moment(a).isBefore(b) ?-1:1});
        const currentData = [];
        const benchmarkData = [];
        const benchmarkTimelineData = [];
        const currentTimelineData = [];

        performanceKeys.map(key => {
            let metricValue = (_.get(performance, `${[moment(key).format('YYYY_M')]}.${field}`, 0) || 0);
            if (field === 'returns.monthlyreturn') {
                const annualreturn = (_.get(performance, `${[moment(key).format('YYYY_M')]}.returns.annualreturn`, 0) || 0);
                metricValue = Math.exp(Math.log(1 + annualreturn) / 12) - 1;
            }
            const metricValuePercentage = Number((metricValue * 100).toFixed(2));
            currentData.push(metricValuePercentage);
            currentTimelineData.push({
                timeline: key,
                value: metricValuePercentage
            });
        });
        performanceKeys.map(key => {
            let metricValue = (_.get(benchmarkPerformance, `${[moment(key).format('YYYY_M')]}.${field}`, 0) || 0);
            if (field === 'returns.monthlyreturn') {
                const annualreturn = (_.get(benchmarkPerformance, `${[moment(key).format('YYYY_M')]}.returns.annualreturn`, 0) || 0);
                metricValue = Math.exp(Math.log(1 + annualreturn) / 12) - 1;
            }
            const metricValuePercentage = Number((metricValue * 100).toFixed(2));
            benchmarkData.push({metricValuePercentage});
            benchmarkTimelineData.push({
                timeline: key,
                value: metricValuePercentage
            });
        });

        return [{
            name: `Portfolio (${type})`,
            data: currentData,
            timelineData: currentTimelineData
        }, { 
            name: `${this.state.adviceDetail.benchmark} (${type})`,
            data: benchmarkData,
            timelineData: benchmarkTimelineData
        }  
        ];
    }

    processRollingPerformance = (performance, benchmarkPerformance, field = 'returns.totalreturn', type='Historical') => {
        // let performanceKeys = Object.keys(performance);
        const timelineData = [];
        const benchmarkTimelineData = [];
        const timelines = ['wtd', '1wk', 'mtd', '1m', 'ytd', 'inception'];
        // const timelines = ['wtd', '1wk', 'mtd', '1m', 'ytd', '1y', '2y', '5y', '10y'];
        timelines.map(key => {
            const metricValue = _.get(performance, `[${key}].${field}`, 0);
            const metricPercentage = Number((metricValue * 100).toFixed(2));
            const benchmarkMetricvalue = _.get(benchmarkPerformance, `[${key}].${field}`, 0);
            const benchmarkMetricPercentage = Number((benchmarkMetricvalue * 100).toFixed(2));
            timelineData.push(metricPercentage);
            benchmarkTimelineData.push(benchmarkMetricPercentage);
        });
        return [
            {
                name: `Portfolio (${type})`,
                data: timelineData
            },
            {
                name: `${this.state.adviceDetail.benchmark} (${type})`,
                data: benchmarkTimelineData
            }
        ];
    }

    processPerformanceData = performanceData => {
        return performanceData.map(item => {
            const netValue = _.get(item, 'netValue', 0);
            return ([moment(item.date, 'YYYY-MM-DD').valueOf(), Number(netValue.toFixed(2))])
        })
    }

    getDefaultAdviceData = () => {
        const adviceId = this.props.match.params.id;
        const adviceSummaryUrl = `${requestUrl}/advice_default/${adviceId}?fullperformance=true`;
        this.setState({loading: true});
        fetchAjax(adviceSummaryUrl, this.props.history, this.props.match.url)
        .then(summaryResponse => {
            const benchmark = _.get(summaryResponse.data, 'portfolio.benchmark.ticker', 'NIFTY_50');
            this.getAdviceSummary(summaryResponse);
            this.getAdvicePerformance(summaryResponse.data.performance, benchmark);
        })
        .catch(error => {
            this.setState({
                positions: [],
                series: []
            });
            return error;
        })
        .finally(() => {
            this.setState({loading: false});
        });
    }

    //THIS IS BUGGY - 02/05/2018
    //ADVICE PORTFOLIO IS FETCHED ONLY WHEN USER IS AUTHORIZED
    //Also, choose the right variable name
    //Just "response" is a poor name, 
    //Choose adviceSummaryResponse or advicePortfolioResponse etc.
    
    handleErrorNotFoundInContestError = error => {
        const errorMessage = _.get(error, 'response.data.message', '');
        if (errorMessage === 'Advice is not present in this contest') {
            this.setState({notPresentInLatestContest: true});
        }
    }

    handleAllContestAdviceSummaryError = error => {
        // console.log('Advice Not found in any contest');
    }

    getAdviceLatestContestSummary = () => {
        const adviceContestUrl = `${requestUrl}/contest/entry/${this.props.match.params.id}`;
        fetchAjax(
            adviceContestUrl, 
            this.props.history, 
            this.props.match.url, undefined, this.handleErrorNotFoundInContestError
        )
        .then(contestResponse => {
            const adviceActive = _.get(contestResponse.data, 'active', false);
            const withdrawn = _.get(contestResponse.data, 'withDrawn', false);
            const prohibited = _.get(contestResponse.data, 'prohibited', false);
            this.setState({
                adviceDetail: {
                    ...this.state.adviceDetail, 
                    active: adviceActive,
                    withdrawn,
                    prohibited
                }
            });
        })
        .catch(err => err);
    }
    
    getAdviceData = (startDate = moment().format('YYYY-MM-DD')) => {
        const contestId = this.props.match.params.contestId;
        const adviceId = this.props.match.params.id;
        const adviceSummaryUrl = `${requestUrl}/advice/${adviceId}`;
        const advicePerformanceUrl = `${requestUrl}/performance/advice/${adviceId}`;
        const adviceContestUrl = `${requestUrl}/contest/entry/${adviceId}`;
        const adviceAllContestUrl = `${requestUrl}/contest/entry/all/${adviceId}`;
        let benchmark = '';
        this.setState({loading: true});
        return Promise.all([
            fetchAjax(adviceSummaryUrl, this.props.history, this.props.match.url),
            fetchAjax(advicePerformanceUrl, this.props.history, this.props.match.url),
            // fetchAjax(adviceContestUrl, this.props.history, this.props.match.url)
        ]) 
        // .then(([adviceSummaryResponse, advicePerformanceResponse, adviceContestResponse]) => {
        .then(([adviceSummaryResponse, advicePerformanceResponse]) => {
            benchmark = _.get(adviceSummaryResponse.data, 'portfolio.benchmark.ticker', 'NIFTY_50');
            const contestOnly = _.get(adviceSummaryResponse.data, 'contestOnly', false);
            this.getAdviceSummary(adviceSummaryResponse);
            const advicePortfolioUrl = `${adviceSummaryUrl}/portfolio?date=${startDate}`;
            
            const adviceDetail = this.state.adviceDetail;
            const authorizedToViewPortfolio = adviceDetail.isSubscribed || adviceDetail.isOwner || adviceDetail.isAdmin;
            return Promise.all([
                authorizedToViewPortfolio ? fetchAjax(advicePortfolioUrl) : null,
                contestOnly && fetchAjax(adviceContestUrl, this.props.history, this.props.match.url, undefined, this.handleErrorNotFoundInContestError),
                contestOnly && fetchAjax(adviceAllContestUrl, this.props.history, this.props.match.url, undefined, this.handleAllContestAdviceSummaryError),
                this.getAdvicePerformance(advicePerformanceResponse.data, benchmark)
            ])
        })
        .then(([advicePortfolioResponse, adviceContestResponse, allContestResponse])  => {
            if (advicePortfolioResponse) {
                this.getAdviceDetail(advicePortfolioResponse);
            }
            const participatedContests = _.get(allContestResponse, 'data', []);
            const adviceActive = _.get(adviceContestResponse.data, 'active', false);
            const withdrawn = _.get(adviceContestResponse.data, 'withDrawn', false);
            const prohibited = _.get(adviceContestResponse.data, 'prohibited', false);
            this.setState({
                adviceDetail: {
                    ...this.state.adviceDetail, 
                    active: adviceActive,
                    withdrawn,
                    prohibited,
                    benchmark
                },
                participatedContests: participatedContests,
            });
        })
        .catch(error => {
            this.setState({
                positions: [],
                series: []
            });
            return error;
        })
        .finally(() => {
            this.setState({loading: false});
            this.setUpSocketConnection();
        });
    };


    toggleDialog = () => {
        const {adviceDetail} = this.state;
        this.setState({isDialogVisible: !this.state.isDialogVisible});
    };

    subscribeAdvice = () => {
        this.setState({disableSubscribeButton: true});
        axios({
            method: 'POST',
            url: `${requestUrl}/advice/${this.props.match.params.id}/subscribe`,
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            this.toggleDialog();
            // this.getAdviceData();
            //message.success('Success');
            const portfolioUrl = `${requestUrl}/advice/${this.props.match.params.id}/portfolio`;
            const summaryUrl = `${requestUrl}/advice/${this.props.match.params.id}`;
            return Promise.all([
                fetchAjax(portfolioUrl, this.props.history, this.props.match.url),
                fetchAjax(summaryUrl, this.props.history, this.props.match.url)
            ]);
        })
        .then(([advicePortfolioResponse, adviceSummaryResponse]) => {
            this.getAdviceDetail(advicePortfolioResponse);
            this.getAdviceSummary(adviceSummaryResponse);
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            // console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({disableSubscribeButton: false});
        });
    };

    followAdvice = () => {
        const url = `${requestUrl}/advice/${this.props.match.params.id}`;
        this.setState({disableFollowButton: true});
        axios({
            method: 'POST',
            url: `${requestUrl}/advice/${this.props.match.params.id}/follow`,
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            message.success('Success');
            return axios.get(url, {headers: Utils.getAuthTokenHeader()})
        })
        .then(response => {
            this.getAdviceSummary(response, false);
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            // console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({disableFollowButton: false});
        });
    };

    toggleUpdateDialog = () => {
        this.setState({isUpdateDialogVisible: !this.state.isUpdateDialogVisible});
    };

    //Pick a better name
    renderModal = () => {
        return (
            <Modal
                    title={this.state.adviceDetail.isSubscribed ? "Cancel Subscription" : "Buy Advice"}
                    visible={this.state.isDialogVisible}
                    onOk={this.subscribeAdvice}
                    onCancel={this.toggleDialog}
            >
                <h3>
                    {
                        this.state.adviceDetail.isSubscribed
                        ? "Are you sure to cancel your subscription for this advice?"
                        : "At AdviceQube, first 3 advices are FREE for initial 2 months. We will inform you when your free subscription ends."
                    }
                </h3>
            </Modal>
        );
    }

    toggleWitdrawOrProhibitModal = (modalType) => {
        this.setState({[modalType]: !this.state[modalType]});
    }

    onProhibitButtonClicked = () => {
        this.prohibitAdvice();
        this.toggleWitdrawOrProhibitModal('prohibitModalVisible');
    }

    onWithdrawButtonClicked = () => {
        this.withdrawAdviceFromContest();
        this.toggleWitdrawOrProhibitModal('withdrawModalVisible');
    }

    renderProhibitModal = () => {
        return (
            <WarningActionModal 
                visible={this.state.prohibitModalVisible}
                onOk={this.onProhibitButtonClicked}
                onCancel={() => this.toggleWitdrawOrProhibitModal('prohibitModalVisible')}
                title="Prohibit Warning"
                text="Are you sure you want to prohibit this Entry !"
            />
        );
    }

    renderWithdrawModal = () => {
        return (
            <WarningActionModal 
                visible={this.state.withdrawModalVisible}
                onOk={this.onWithdrawButtonClicked}
                onCancel={() => this.toggleWitdrawOrProhibitModal('withdrawModalVisible')}
                title="Withdraw Warning"
                text="Are you sure you want to withdraw this Entry from the ongoing contest !"
            />
        );
    }

    renderUpdateModal = () => {
        return (
            <Modal
                    title="Update Advice"
                    visible={this.state.isUpdateDialogVisible}
                    onOk={this.toggleUpdateDialog}
                    onCancel={this.toggleUpdateDialog}
                    width={'100%'}
            >
                <UpdateAdvice adviceId={this.props.match.params.id}/>
            </Modal>
        );
    };

    getUserData = () => {
        const url = `${requestUrl}/me`;
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            const userId = _.get(response.data, '_id', '');
            this.setState({userId});
        });
    };

    componentWillMount() {
        this.mounted = true;
        if (!Utils.isLoggedIn()) {
            this.getDefaultAdviceData();
        } else {
            this.getAdviceData();
        }
    }

    componentWillUnmount() {
        this.unSubscribeToAdvice(this.props.match.params.id);
        this.state.realtimeSecurities.map(item => {
            this.unSubscribeToStock(item.name);
        });
        this.mounted = false;
    }

    setUpSocketConnection = () => {
        if (Utils.webSocket && Utils.webSocket.readyState == WebSocket.OPEN) {
            Utils.webSocket.onopen = () => {
                Utils.webSocket.onmessage = this.processRealtimeMessage;
                this.takeAdviceAction();
            }

            Utils.webSocket.onclose = () => {
                this.setUpSocketConnection();
            }
            
            Utils.webSocket.onmessage = this.processRealtimeMessage;
            this.takeAdviceAction();
        } else {
            setTimeout(function() {
                this.setUpSocketConnection()
            }.bind(this), 5000);
        }
    }

    takeAdviceAction = () => {
        if (this.mounted) {
            this.subscribeToAdvice(this.props.match.params.id);
            this.state.realtimeSecurities.map(item => {
                this.subscribeToStock(item.name);
            });
        } else {
            this.unSubscribeToAdvice(this.props.match.params.id);
            this.state.realtimeSecurities.map(item => {
                this.unSubscribeToStock(item.name);
            });
        }
    }

    subscribeToAdvice = adviceId => {
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'advice',
            'adviceId': adviceId,
            'detail': true
        };
        Utils.sendWSMessage(msg);
    }

    unSubscribeToAdvice = adviceId => {
        // console.log('UnSubscription');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'advice',
            'adviceId': adviceId,
        };
        Utils.sendWSMessage(msg);
    }

    subscribeToStock = ticker => {
        // console.log('Subscription Started');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    unSubscribeToStock = ticker => {
        // console.log('Unsubscription Started');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    processRealtimeMessage = msg => {
        if (this.mounted) {
            try {
                const realtimeData = JSON.parse(msg.data);
                const adviceId = _.get(realtimeData, 'adviceId', null);
                if (realtimeData.type === 'advice' && this.props.match.params.id === adviceId) {
                    const netValue = _.get(realtimeData, 'output.summary.netValue', 0);
                    let positions = _.get(realtimeData, 'output.detail.positions', []);
                    const staticPositions = this.state.positions; // old positions from state
                    const realtimeDate = DateHelper.getDate(_.get(realtimeData, 'date', null));
                    //Effectvive total return is valid is current summary has past netvalueEOD
                    //otherwie it means, it is a new advice and current changes have no significance
                    const netValueEOD = _.get(this.performanceSummary, 'current.netValueEOD', 0);
                    const netValueEODDate = _.get(this.performanceSummary, 'current.netValueDate', 0);
                    const dailyNAVChangePct = netValueEOD > 0.0 && DateHelper.compareDates(netValueEODDate, realtimeDate) == -1 ? 
                            Number((_.get(realtimeData, 'output.summary.dailyNavChangePct', 0) * 100).toFixed(2)) : 
                            Number((_.get(this.performanceSummary, 'current.dailyNAVChangeEODPct', 0) * 100).toFixed(2));
                    
                    var totalReturn = _.get(this.performanceSummary, 'current.totalReturn', 0.0);

                    var effTotalReturn = netValueEOD > 0.0 && DateHelper.compareDates(netValueEODDate, realtimeDate) == -1 ? 
                                (1 + totalReturn) * (1+dailyNAVChangePct/100) - 1.0 : 
                                totalReturn;
                    positions = positions.map(item => {
                        const targetPosition = staticPositions.filter(
                                positionItem => positionItem.security.ticker === item.security.ticker)[0];
                        item.avgPrice = item.avgPrice === 0 ? (targetPosition ? targetPosition.avgPrice : 0) : item.avgPrice;
                        item.lastPrice = item.lastPrice === 0 ? (targetPosition ? targetPosition.lastPrice : 0) : item.lastPrice;
                        return item;
                    });

                    this.setState({
                        metrics: {
                            ...this.state.metrics,
                            netValue,
                            dailyNAVChangePct,
                        },
                        positions
                    });

                } else if (realtimeData.type === 'stock') {
                    const realtimeSecurities = [...this.state.realtimeSecurities];
                    const targetSecurity = realtimeSecurities.filter(item => item.name === realtimeData.ticker)[0];
                    if (targetSecurity) {
                        targetSecurity.change = (realtimeData.output.changePct * 100).toFixed(2);
                        targetSecurity.y = realtimeData.output.current < 1 ? realtimeData.output.close : realtimeData.output.current;
                        this.setState({realtimeSecurities});
                    }
                }
            } catch(error) {return error;}
        }
    }

    processPositionToWatchlistData = (positions) => {
        return positions.map(item => {
            return {
                name: item.security.ticker,
                y: item.lastPrice,
                change: '-',
                hideCheckbox: true,
                disabled: true
            };
        });
    }

    renderApprovalButtons = (small = false) => {
        const isAdmin = _.get(this.state, 'adviceDetail.isAdmin', false);
        const approvalStatus = _.get(this.state, 'adviceDetail.approvalStatus', 'pending');
        const className = small ? 'action-button action-button-small' : 'action-button';
        if (isAdmin && approvalStatus !== 'approved') {
            return (
                <React.Fragment>
                    <Button 
                            className={className}
                            type="primary" 
                            style={buttonStyle}
                            onClick={this.toggleApprovalModal}
                    >
                        TAKE APPROVAL ACTION
                    </Button>
                </React.Fragment>
            );
        }

        return null;
    }

    onApprovalItemRadioChange = (e, field) => {
        this.setState({
            approvalObj: {
                ...this.state.approvalObj,
                [field]: {
                    ...this.state.approvalObj[field],
                    valid: e.target.value
                }
            }
        })

    }

    onApprovalInputChange = (e, field) => {
        this.setState({
            approvalObj: {
                ...this.state.approvalObj,
                [field]: {
                    ...this.state.approvalObj[field],
                    reason: e.target.value
                }
            }
        })
    }

    renderApprovalTabs = () => {
        const isAdmin = _.get(this.state, 'adviceDetail.isAdmin', false);
        const approvalStatus = _.get(this.state, 'adviceDetail.approvalStatus', 'pending');
        const approvalRequested = _.get(this.state, 'adviceDetail.approvalRequested', false);
        const isPublic = _.get(this.state, 'adviceDetail.isPublic', false);
        if (isAdmin && approvalRequested && isPublic) {
            return (
                <Row 
                        style={{...shadowBoxStyle, height: '680px', width: '95%', marginLeft: '20px'}}>
                    <Col span={24}>
                        <h3 style={{marginTop: '10px', marginLeft: '10px', color: '#595959', fontSize: '18px'}}>
                            Approve
                        </h3>
                    </Col>
                    <Col span={24}>
                        <Tabs defaultActiveKey="1" size="small" animated={false}>
                            <TabPane tab="General" key="1" style={approvalRowContainerStyle}>
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.name} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'name')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'name')}
                                />
                            </TabPane>
                            <TabPane tab="Objective" key="3" style={approvalRowContainerStyle}>
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.goal} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'goal')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'goal')}
                                />
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.portfolioValuation} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'portfolioValuation')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'portfolioValuation')}
                                />
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.capitalization} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'capitalization')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'capitalization')}
                                />
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.sectors} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'sectors')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'sectors')}
                                />
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.userText} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'userText')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'userText')}
                                />
                            </TabPane>
                            <TabPane tab="Portfolio" key="2" style={approvalRowContainerStyle}>
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.stockExposure} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'stockExposure')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'stockExposure')}
                                />
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.industryExposure} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'industryExposure')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'industryExposure')}
                                />
                                <ApprovalItem 
                                        approvalObj={this.state.approvalObj.sectorExposure} 
                                        onRadioChange={e => this.onApprovalItemRadioChange(e, 'sectorExposure')}
                                        onInputChange={e => this.onApprovalInputChange(e, 'sectorExposure')}
                                />
                            </TabPane>
                        </Tabs>
                    </Col>
                    <Col span={24} style={{padding: '0 15px', position: 'absolute', bottom: '20px'}}>
                        <Button 
                                onClick={this.toggleApprovalModal} 
                                style={{width: '100%'}} 
                                type="primary"
                        >
                            SEND APPROVAL
                        </Button>
                    </Col>
                </Row>
            );
        }
    }

    renderApprovalModal = () => {
        const approval = [{label: 'Approve', value: true}, {label: 'Unapprove', value: false}];
        const {approvalObj} = this.state;

        return (
            <Modal
                    title="Take Approval Action"
                    onCancel={this.toggleApprovalModal}
                    visible={this.state.approvalModalVisible}
                    style={{top: 20}}
                    bodyStyle={{height: '600px'}}
                    footer={[
                        <Button 
                                key={1} 
                                type="secondary"
                                onClick={this.toggleApprovalModal}
                        >Cancel</Button>,
                        <Button 
                                key={2}
                                type="primary" 
                                onClick={this.handleApprovalSubmission}
                                loading={this.state.approvalLoading}
                        >Done</Button>
                    ]}
            >
                <Row style={{height: '100%'}}>
                    <Col span={24}>
                        <Tabs defaultActiveKey="1" size="small" animated={false}>
                            <TabPane tab="General" key="1" style={approvalModalTabStyle}>
                                <ApprovalItemView 
                                        label="Name" 
                                        approved={approvalObj.name.valid} 
                                        reason={approvalObj.name.reason}
                                />
                            </TabPane>
                            <TabPane tab="Objective" key="3" style={approvalModalTabStyle}>
                                <ApprovalItemView 
                                        label="Goal" 
                                        approved={approvalObj.goal.valid}
                                        reason={approvalObj.goal.reason}
                                />
                                <ApprovalItemView 
                                        label="Portfolio Valuation" 
                                        approved={approvalObj.portfolioValuation.valid}
                                        reason={approvalObj.portfolioValuation.reason}
                                />
                                <ApprovalItemView 
                                        label="Capitalization" 
                                        approved={approvalObj.capitalization.valid}
                                        reason={approvalObj.capitalization.reason}
                                />
                                <ApprovalItemView 
                                        label="Sectors" 
                                        approved={approvalObj.sectors.valid}
                                        reason={approvalObj.sectors.reason}
                                />
                                <ApprovalItemView 
                                        label="UserText" 
                                        approved={approvalObj.userText.valid}
                                        reason={approvalObj.userText.reason}
                                />
                            </TabPane>
                            <TabPane tab="Portfolio" key="2" style={approvalModalTabStyle}>
                                <ApprovalItemView 
                                        label="Stock Exposure" 
                                        approved={approvalObj.stockExposure.valid}
                                        reason={approvalObj.stockExposure.reason}
                                />
                                <ApprovalItemView 
                                        label="Industry Exposure" 
                                        approved={approvalObj.industryExposure.valid}
                                        reason={approvalObj.industryExposure.reason}
                                />
                                <ApprovalItemView 
                                        label="Sector Exposure" 
                                        approved={approvalObj.sectorExposure.valid}
                                        reason={approvalObj.sectorExposure.reason}
                                />
                            </TabPane>
                        </Tabs>
                    </Col>
                    <Col span={24} style={{position: 'absolute', bottom: '0px'}}>
                        <Row>
                            <Col span={24}>
                                <TextArea 
                                        placeholder="General Message" 
                                        autosize={{ minRows: 2, maxRows: 2 }} 
                                        onChange={this.handleApprovalInputChange} 
                                        value={this.state.approveObj.message}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Modal>
        );
    }

    handleApprovalSubmission = () => {
        const url = `${requestUrl}/advice/${this.props.match.params.id}/approveNew`;
        this.setState({approvalLoading: false});
        axios({
            url,
            method: 'PATCH',
            headers: Utils.getAuthTokenHeader(),
            data: this.constructApprovalMessage()
        })
        .then(response => {
            const adviceUrl = `${requestUrl}/advice/${this.props.match.params.id}`;
            message.success('Sucess');
            this.toggleApprovalModal();
            return fetchAjax(adviceUrl, this.props.history, this.props.match.url);
        })
        .then(response => {
            this.getAdviceSummary(response, false);
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            message.error('Error Occured');
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({approvalLoading: false});
        })
    }

    constructApprovalMessage = () => {
        const {approveObj, approvalObj, adviceDetail} = this.state;
        const {investmentObjective = {}} = adviceDetail;
        // Fields that are required to check for validation in approvalObj
        const requiredDetailFields = ['name', 'stockExposure', 'industryExposure', 'sectorExposure'];
        let detail = [];
        Object.keys(approvalObj).map(key => {
            const keyIndex = requiredDetailFields.indexOf(key);
            if (keyIndex !== -1) {
                detail.push({
                    field: key,
                    reason: approvalObj[key].reason,
                    valid: approvalObj[key].valid,
                    requirements: []
                });
            }
        });
        detail.push({
            field: 'investmentObjective',
            reason: 'See Investment Objective',
            requirements: [],
            valid: this.checkInvestmentObjectiveValidity()
        })

        return {
            message: approveObj.message,
            status: approveObj.approved,
            detail,
            investmentObjective: {
                goal: {
                    field: _.get(investmentObjective, 'goal.field', ''),
                    investorType: _.get(investmentObjective, 'goal.investorType', ''),
                    suitability: _.get(investmentObjective, 'goal.suitability', ''),
                    valid: approvalObj.goal.valid,
                    reason: approvalObj.goal.reason
                },
                sectors: {
                    detail: _.get(investmentObjective, 'sectors.detail', []),
                    valid: approvalObj.sectors.valid,
                    reason: approvalObj.sectors.reason
                },
                portfolioValuation: {
                    field: _.get(investmentObjective, 'portfolioValuation.field', ''),
                    valid: approvalObj.portfolioValuation.valid,
                    reason: approvalObj.portfolioValuation.reason
                },
                capitalization: {
                    field: _.get(investmentObjective, 'capitalization.field', ''),
                    valid: approvalObj.capitalization.valid,
                    reason: approvalObj.capitalization.reason
                },
                userText: {
                    detail: _.get(investmentObjective, 'userText.detail', ''),
                    valid: approvalObj.userText.valid,
                    reason: approvalObj.userText.reason
                }
            }
        };
    }

    // Used to check if all the items in investmentObjArray is marked as valid
    checkInvestmentObjectiveValidity = () => {
        const {adviceDetail, approvalObj} = this.state;
        const {investmentObjective = {}} = adviceDetail;
        // The fields that's checked for validation
        const investmentObjArray = ['goal', 'sectors', 'capitalization', 'portfolioValuation', 'userText'];
        let falseCount = 0;
        investmentObjArray.map(item => {
            // Checking only the items in investmentObjective for validation in approvalObj
            if (approvalObj[item].valid === false) {
                falseCount++;
            }
        });

        return falseCount === 0;
    }

    handleApprovalRadioChange = e => {
        this.setState({approveObj: {
            ...this.state.approveObj,
            approved: e.target.value
        }});
    }

    handleProhibitRadioChange = e => {
        this.setState({approveObj: {
            ...this.state.approveObj,
            prohibit: e.target.value
        }});
    }

    handleApprovalInputChange = e => {
        this.setState({
            approveObj: {
                ...this.state.approveObj,
                message: e.target.value
            }
        });
    }

    toggleApprovalModal = () => {
        this.setState({approvalModalVisible: !this.state.approvalModalVisible});
    }

    renderUnsubscriptionModal = () => {
        const unsubscriptionPendingDays = _.get(this.state, 'adviceResponse.subscriptionDetail.subscriptionPendingDays'); 

        return (
            <Modal
                    title="Unsubscription Process Pending"
                    visible={this.state.unsubscriptionModalVisible}
                    onCancel={this.toggleUnsubscriptionModal}
                    footer={null}
            >
                <h3>Unsubscription process is pending {unsubscriptionPendingDays} days left</h3>
            </Modal>
        );
    }

    toggleUnsubscriptionModal = () => {
        this.setState({unsubscriptionModalVisible: !this.state.unsubscriptionModalVisible});
    }

    redirectToLogin = () => {
        Utils.localStorageSave('redirectToUrlFromLogin', this.props.match.url);
        this.props.history.push('/login');
    }

    requestApproval = () => {
        const url = `${requestUrl}/advice/${this.props.match.params.id}/requestapproval`;
        this.setState({requestApprovalLoading: true});
        axios({
            url,
            method: 'POST',
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            message.success('Approval Requested');
            const summaryUrl = `${requestUrl}/advice/${this.props.match.params.id}`;
            return Promise.all([
                fetchAjax(summaryUrl, this.props.history, this.props.match.url)
            ]);
        })
        .then(([adviceSummaryResponse]) => {
            this.getAdviceSummary(adviceSummaryResponse);
        })
        .catch(error => {
            message.error('Error Occured');
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                if (error.response.status === 400 || error.response.status === 403) {
                    this.props.history.push('/forbiddenAccess');
                }
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({requestApprovalLoading: false});
        })
    }

    withdrawAdviceFromContest = () => {
        const contestId = this.props.match.params.contestId;
        const withdrawAdviceUrl = `${requestUrl}/contest/${this.props.match.params.id}/action?type=withdraw`;
        this.setState({withdrawAdviceLoading: true});
        axios({
            method: 'POST',
            url: withdrawAdviceUrl,
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            const active = _.get(response.data, 'active', false);
            this.setState({adviceDetail: {...this.state.adviceDetail, active}});
            openNotification('info', 'Success', 'Advice Successfully Withdrawn from contest');
            this.getAdviceLatestContestSummary();
        })
        .catch(error => {
            return handleCreateAjaxError(
                error, 
                this.props.history, 
                this.props.match.url
            );
        })
        .finally(() => {
            this.setState({withdrawAdviceLoading: false});
        })
    }

    prohibitAdvice = () => {
        const prohibitAdviceUrl = `${requestUrl}/contest/${this.props.match.params.id}/action?type=prohibit`;
        this.setState({withdrawAdviceLoading: true});
        axios({
            method: 'POST',
            url: prohibitAdviceUrl,
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            const active = _.get(response.data, 'active', false);
            this.setState({adviceDetail: {...this.state.adviceDetail, active}});
            openNotification('info', 'Success', 'Advice Successfully Prohibited from contest');
            this.getAdviceLatestContestSummary();
        })
        .catch(error => {
            return handleCreateAjaxError(
                error, 
                this.props.history, 
                this.props.match.url
            );
        })
        .finally(() => {
            this.setState({withdrawAdviceLoading: false});
        })
    }

    togglePostWarningModal = () => {
        this.setState({postWarningModalVisible: !this.state.postWarningModalVisible});
    }

    renderPostWarningModal = () => {
        return (
            <Modal
                    visible={this.state.postWarningModalVisible}
                    title="Warning"
                    bodyStyle={{height: '200px', top: '20'}}
                    footer={[
                        <Button key="2" onClick={this.togglePostWarningModal}>CANCEL</Button>,
                        <Button  
                                loading={this.state.postToMarketPlaceLoading} 
                                type="primary" 
                                key="1" 
                                onClick={this.makeAdvicePublic}
                        >
                            POST
                        </Button>
                    ]}
            >   
                <Row>
                    <Col span={24}>
                        <h3 style={{fontSize: '16px'}}>
                            Your advice will be submitted for Approval.<br></br>
                            If approved, modifications to the advice, except <span style={{color: primaryColor}}>Start Date</span> 
                            &nbsp;and <span style={{color: primaryColor}}>Portfolio</span>&nbsp;
                            will not be possible after you post to MarketPlace.
                        </h3>
                    </Col>
                </Row>
            </Modal>
        );
    }

    renderActionButtons = (small=false) => {
        const {userId} = this.state;
        const isOwner = _.get(this.state, 'adviceDetail.isOwner', false);
        let advisorId = this.state.adviceDetail.advisor.user ? this.state.adviceDetail.advisor.user._id: '';
        const unsubscriptionPending = _.get(this.state, 'adviceResponse.subscriptionDetail.unsubscriptionPending', false);
        const className = small ? 'action-button action-button-small' : 'action-button';
        const isValid = _.get(this.state, 'adviceDetail.approval.status', false);
        const isAdmin = _.get(this.state, 'adviceDetail.isAdmin', false);
        const isPublic = _.get(this.state, 'adviceDetail.isPublic', false);
        const active = _.get(this.state, 'adviceDetail.active', false);
        const contestOnly = _.get(this.state, 'adviceDetail.contestOnly', false);
        const approvalRequested = _.get(this.state, 'adviceDetail.approvalRequested', false);
        if (!isOwner) {
            return (
                <div style={{width: '95%'}}>
                    {/* {this.renderApprovalButtons(small)} */}
                    {/* <Button
                            onClick={() => 
                                Utils.isLoggedIn() 
                                ? unsubscriptionPending ? this.toggleUnsubscriptionModal() : this.toggleDialog() 
                                : this.redirectToLogin()
                                
                            }
                            className={className}
                            style={buttonStyle}
                            type="primary"
                            disabled={this.state.disableSubscribeButton}
                    >
                        {
                            !this.state.adviceDetail.isSubscribed 
                            ? "BUY ADVICE" 
                            : unsubscriptionPending ? "UNSUBSCRIPTION PENDING" : "CANCEL SUBSCRIPTION"
                        }
                    </Button> */}
                    {
                        isAdmin && contestOnly && active &&
                        <Button
                                onClick={() => this.toggleWitdrawOrProhibitModal('prohibitModalVisible')}
                                className={className}
                                style={buttonStyle}
                                type="primary"
                        >
                            PROHIBIT ADVICE
                        </Button>
                    }
                    <Button
                            onClick={() => 
                                Utils.isLoggedIn()
                                ? this.followAdvice()
                                : this.redirectToLogin()
                            }
                            className={className}
                            style={buttonStyle}
                            disabled={this.state.disableFollowButton}
                    >
                        {!this.state.adviceDetail.isFollowing ? "ADD TO WISHLIST" : "REMOVE FROM WISHLIST"}
                    </Button>
                </div>
            );
        } else {
            return (
                <div style={{width: '95%'}}>
                    {/* {this.renderApprovalButtons(small)} */}
                    <Button
                            onClick={() => this.props.history.push(`/contest/updateentry/${this.props.match.params.id}`)}
                            className={className}
                            style={buttonStyle}
                            type="primary"
                    >
                        {
                            (this.state.notPresentInLatestContest || !this.state.adviceDetail.active) 
                                ? "ENTER CONTEST" 
                                : "UPDATE ENTRY"
                        }
                    </Button>
                    {
                        this.state.adviceDetail.contestOnly &&
                        this.state.adviceDetail.isPublic &&
                        this.state.adviceDetail.active &&
                        <Button 
                                onClick={() => this.toggleWitdrawOrProhibitModal('withdrawModalVisible')}
                                className={className} 
                                style={buttonStyle} 
                                loading={this.state.withdrawAdviceLoading}
                        >
                            WITHDRAW
                        </Button>
                    }
                    {
                        isAdmin && contestOnly && active &&
                        <Button
                                onClick={() => this.toggleWitdrawOrProhibitModal('prohibitModalVisible')}
                                className={className}
                                style={buttonStyle}
                                loading={this.state.withdrawAdviceLoading}
                        >
                            PROHIBIT ADVICE
                        </Button>
                    }
                    {
                        !this.state.adviceDetail.contestOnly &&
                        this.state.adviceDetail.isPublic &&
                        !isValid &&
                        !this.state.adviceDetail.approvalRequested &&
                        <Button 
                                onClick={this.requestApproval} 
                                className={className} 
                                style={buttonStyle} 
                                loading={this.state.requestApprovalLoading}
                        >
                            REQUEST APPROVAL
                        </Button>
                    }
                    {
                        !this.state.adviceDetail.isPublic && 
                        <Button 
                                onClick={this.togglePostWarningModal} 
                                className={className} 
                                style={buttonStyle} 
                        >
                            POST  TO MARKETPLACE
                        </Button>
                    }                    
                </div>
            );
        }
    };

    handleChange = value => {
        this.setState({selectedValue: value});
    }

    updateTicker = record => {
        // console.log(record);
        this.setState({stockResearchModalTicker: record}, () => {
            this.toggleModal();
        });
    }

    toggleModal = ticker => {
        this.setState({stockResearchModalVisible: !this.state.stockResearchModalVisible});
    }

    handlePortfolioStartDateChange = date => {
        const startDate = date.format('YYYY-MM-DD');
        const url = `${requestUrl}/advice/${this.props.match.params.id}`;
        fetchAjax(`${url}/portfolio?date=${startDate}`, this.props.history, this.props.match.url)
        .then(response => {
            this.setState({selectedPortfolioDate: date}, () => {
                this.getAdviceDetail(response);
            });
        })

    }

    handleWatchListClick = name => {
        this.updateTicker({symbol: name, name});
    }

    handlePerformanceToggleChange = e => {
        const {
            annualReturn = 0, 
            dailyNAVChangeEODPct = 0,
            netValueEOD = 0, 
            totalReturn = 0, 
            volatility = 0, 
            maxLoss = 0, 
            nstocks = 0, 
            period = 0
        } = e.target.value ? this.state.performance.current : this.state.performance.simulated;
        this.setState({
            metrics: {
                ...this.state.metrics,
                annualReturn,
                totalReturn,
                volatility,
                maxLoss,
            },
            performanceType: e.target.value ? 'Current' : 'Simulated'
        })
    }

    handleStaticPerformanceSelectorChange = e => {
        const selectedMetric = e.target.value;
        const currentPortfolioPerformance = this.state.currentStaticPortfolioPerformance;
        const simulatedPortfolioPerformance = this.state.simulatedStaticPortfolioPerformance;
        const benchmarkCurrentStaticPerformance = this.state.benchmarkCurrentStaticPerformance;
        const benchmarkSimulatedStaticPerformance = this.state.benchmarkSimulatedStaticPerformance;
        const currentStaticPerformance = this.processStaticPerformance(_.get(currentPortfolioPerformance, 'static.monthly', {}), benchmarkCurrentStaticPerformance, selectedMetric, 'True');
        const simulatedStaticPerformance = this.processStaticPerformance(_.get(simulatedPortfolioPerformance, 'static.monthly', {}), benchmarkSimulatedStaticPerformance, selectedMetric, 'Historical');
        this.setState({
            selectedPerformanceMetrics: selectedMetric,
            simulatedStaticPerformance,
            currentStaticPerformance
        });
    }

    renderStaticPerformanceSelectorRadioGroup = () => {
        return (
            <RadioGroup 
                    onChange={this.handleStaticPerformanceSelectorChange} 
                    value={this.state.selectedPerformanceMetrics}
            >
                <Radio value={'returns.totalreturn'}>Total Return</Radio>
                {/* <Radio value={'returns.monthlyreturn'}>Monthly Return</Radio>
                <Radio value={'returns.annualreturn'}>Annual Return</Radio> */}
                <Radio value={'deviation.annualstandarddeviation'}>Volatility</Radio>
                <Radio value={'drawdown.maxdrawdown'}>Max Loss</Radio>
            </RadioGroup>
        );
    }

    handleRollingPerformanceSelectorChange = e => {
        const selectedMetric = e.target.value;
        const currentPortfolioPerformance = this.state.currentStaticPortfolioPerformance;
        const simulatedPortfolioPerformance = this.state.simulatedStaticPortfolioPerformance;
        const benchmarkRollingCurrentPerformance = this.state.benchmarkRollingCurrentPerformance;
        const benchmarkRollingSimulatedPerformance = this.state.benchmarkRollingSimulatedPerformance;
        const currentRollingPerformance = this.processRollingPerformance(_.get(currentPortfolioPerformance, 'rolling', {}), benchmarkRollingCurrentPerformance, selectedMetric, 'True');
        const simulatedRollingPerformance = this.processRollingPerformance(_.get(simulatedPortfolioPerformance, 'rolling', {}), benchmarkRollingSimulatedPerformance, selectedMetric, 'Historical');
        this.setState({
            selectedRollingPerformanceMetric: selectedMetric,
            currentRollingPerformance,
            simulatedRollingPerformance
        });
    }

    renderRollingPerformanceSelectorRadioGroup = () => {
        return (
            <RadioGroup 
                    onChange={this.handleRollingPerformanceSelectorChange} 
                    value={this.state.selectedRollingPerformanceMetric}
            >
                <Radio value={'returns.totalreturn'}>Total Return</Radio>
                {/* <Radio value={'returns.annualreturn'}>Annual Return</Radio> */}
                <Radio value={'deviation.annualstandarddeviation'}>Volatility</Radio>
                <Radio value={'drawdown.maxdrawdown'}>Max Loss</Radio>
            </RadioGroup>
        );
    }

    renderPageContent = () => {
        const {name, heading, description, advisor, updatedDate} = this.state.adviceDetail;
        const {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;
        const breadCrumbs = getBreadCrumbArray(ContestAdviceDetailCrumb, [
            {name, url: '#'}
        ]);
        
        return (
            this.state.notAuthorized
            ?   <ForbiddenAccess />
            :   <React.Fragment>
                    {this.renderProhibitModal()}
                    {this.renderWithdrawModal()}
                    <Row style={{marginBottom:'20px'}} className='aq-page-container'>
                        <AqPageHeader title={name} breadCrumbs={breadCrumbs}>
                            <Col xl={0} xs={24} md={24} style={{textAlign: 'right'}}>
                                {this.renderActionButtons(true)}
                            </Col>
                        </AqPageHeader>
                        <StockResearchModal
                                ticker={this.state.stockResearchModalTicker}
                                visible={this.state.stockResearchModalVisible}
                                toggleModal={this.toggleModal}
                        />
                        <AdviceDetailContent 
                                adviceDetail={this.state.adviceDetail}
                                metrics={this.state.metrics}
                                handlePortfolioStartDateChange={this.handlePortfolioStartDateChange}
                                selectedPortfolioDate={this.state.selectedPortfolioDate}
                                positions={this.state.positions}
                                updateTicker={this.updateTicker}
                                tickers={this.state.tickers}
                                showPerformanceToggle={Utils.isLoggedIn()}
                                handlePerformanceToggleChange={this.handlePerformanceToggleChange}
                                performanceType={this.state.performanceType}
                                loading={false}
                                participatedContests={this.state.participatedContests}
                                currentStaticPerformance={this.state.currentStaticPerformance}
                                simulatedStaticPerformance={this.state.simulatedStaticPerformance}
                                renderStaticPerformanceSelector={this.renderStaticPerformanceSelectorRadioGroup}
                                renderRollingPerformanceSelector={this.renderRollingPerformanceSelectorRadioGroup}
                                currentRollingPerformance={this.state.currentRollingPerformance}
                                simulatedRollingPerformance={this.state.simulatedRollingPerformance}
                        />
                        <Col xl={6} md={0} sm={0} xs={0}>
                            {this.renderActionButtons()}
                            {/* {this.renderApprovalTabs()} */}
                        </Col>
                    </Row>
                </React.Fragment>
        );
    }

    render() {
        return (
            <AppLayout 
                loading = {this.state.loading}
                content={
                   <Row>
                        <AdviceDetailMeta name={this.state.adviceDetail.name}/>
                        {this.renderModal()}
                        {this.renderPostWarningModal()}
                        {this.renderUpdateModal()}
                        {this.renderApprovalModal()}
                        {this.renderUnsubscriptionModal()}
                        {this.renderPageContent()}
                   </Row>
               }>
           </AppLayout>
        );
    }
}

export default withRouter(AdviceDetailImpl);

const WarningActionModal = ({title, visible, onOk, onCancel, text}) => {
    return (
        <Modal
                title={title.toUpperCase()}
                visible={visible}
                onOk={onOk}
                onCancel={onCancel}
        >
            <Row>
                <Col span={24}>
                    <h3 style={{fontSize: '16px'}}>{text}</h3>
                </Col>
            </Row>
        </Modal>
    );
}

const approvalRowContainerStyle = {
    padding: '0 15px',
};

const approvalModalTabStyle = {
    height: '400px',
    overflow: 'hidden',
    overflowY: 'scroll'
}