import * as React from 'react';
import axios from 'axios';
import SkyLight from 'react-skylight';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Divider, Tabs, Button, Modal, message, Card, Rate, Collapse, DatePicker, Radio, Input} from 'antd';
import {currentPerformanceColor, simulatedPerformanceColor, newLayoutStyle, metricsHeaderStyle, pageHeaderStyle, dividerNoMargin, loadingColor, pageTitleStyle, shadowBoxStyle, benchmarkColor, statusColor, cashStyle, primaryColor, buttonStyle} from '../constants';
import UpdateAdvice from './UpdateAdvice';
import {AdviceDetailContent} from './AdviceDetailContent';
import {AqTableMod, AqStockPortfolioTable, AqHighChartMod, MetricItem, AqCard, HighChartNew, HighChartBar, AdviceMetricsItems, StockResearchModal, AqPageHeader, StatusBar, WatchList, ForbiddenAccess, AqRate} from '../components';
import {MyChartNew} from './MyChartNew';
import {AdviceDetailCrumb} from '../constants/breadcrumbs';
import {generateColorData, Utils, getBreadCrumbArray, convertToDecimal,fetchAjax, getStockPerformance} from '../utils';
import '../css/adviceDetail.css';


const TabPane = Tabs.TabPane;
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;
const {TextArea} = Input;

const {aimsquantToken, requestUrl} = require('../localConfig.js');
const DateHelper = require('../utils/date');
const dateFormat = 'Do MMMM YYYY';

class AdviceDetailImpl extends React.Component {
    socketOpenConnectionTimeout = 1000;
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            adviceDetail: {
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
                rebalance: '',
                isPublic: false,
                isAdmin: false,
                isOwner: false,
                isSubscribed: false,
                isFollowing: false
            },
            netValue: 0,
            metrics: {
                annualReturn: 0,
                totalReturn:0,
                volatility:0,
                maxLoss:0,
                dailyNAVChangePct: 0,
                //netValue: 0,
                period:0,
            },
            performance: {
                current: {},
                simulated: {}
            },
            performanceType: 'Current',
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
            show: false,
            cash: -10,
            stockResearchModalVisible: false,
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
            approvalLoading: false
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
            name,
            description,
            heading,
            advisor,
            updatedDate,
            rating = {current: 0, simulated: 0},
            isSubscribed,
            isFollowing,
            isOwner,
            isAdmin,
            numSubscribers,
            numFollowers,
            portfolio,
            performanceSummary,
            netValue,
            stocks,
            approvalStatus
        } = response.data;

        this.performanceSummary = performanceSummary;
        const currentPerformance = _.get(performanceSummary, 'current', {});
        const simulatedPerformance = _.get(performanceSummary, 'simulated', {});
        const {annualReturn, dailyNAVChangeEODPct, netValueEOD, totalReturn, volatility, maxLoss, nstocks, period} = currentPerformance;
        const benchmark = _.get(portfolio, 'benchmark.ticker', 'N/A');
        if (!Utils.isLoggedIn()) {
            getStockPerformance(benchmark, 'detail_benchmark')
            .then(performanceArray => {
                const benchMarkticker = {name: benchmark, color: benchmarkColor, data: performanceArray};
                this.setState({tickers: performance ? [...this.state.tickers, benchMarkticker] : this.state.tickers});
            })
        } else {
            getStockPerformance(benchmark)
            .then(performanceArray => {
                const benchMarkticker = {name: benchmark, color: benchmarkColor, data: performanceArray};
                this.setState({tickers: performance ? [...this.state.tickers, benchMarkticker] : this.state.tickers});
            })
        }

        //Compute change in NAV from EOD nav
        //Number(((netValueEOD > 0.0 && netValue > 0.0 ? (netValue - netValueEOD)/netValueEOD : dailyNAVChangeEODPct)*100).toFixed(2));

        var dailyNAVChangePct = 0.0
        var annualReturnEOD = annualReturn;
        var effTotalReturn = _.get(this.performanceSummary, 'current.totalReturn', 0.0);
            //(1 + ) * (1+dailyNAVChangePct/100) - 1.0 : 0;

        this.setState({
            // tickers: performance ? tickers : this.state.tickers,
            adviceResponse: response.data,
            adviceDetail: {
                ...this.state.adviceDetail,
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
                followers: numFollowers,
                updatedDate: moment(updatedDate).format(dateFormat),
                rating: Number(rating.current.toFixed(2)),
                isPublic: response.data.public,
            },
            metrics: {
                ...this.state.metrics,
                nstocks,
                annualReturn: annualReturnEOD,
                totalReturn: effTotalReturn,
                volatility,
                maxLoss,
                dailyNAVChangePct: 0,
            },
            netValue: netValue,
            performance: {
                current: currentPerformance,
                simulated: simulatedPerformance
            }
        });
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
        }, () => {
            this.setUpSocketConnection();
        });
    }

    getAdvicePerformance = (performance) => {
        const tickers = [...this.state.tickers];
        if (performance.simulated) {
            tickers.push({
                name: 'Simulated Performance',
                data: this.processPerformanceData(_.get(performance, 'simulated.portfolioValues', [])),
                color: simulatedPerformanceColor
            });
        }

        if (performance.current && Utils.isLoggedIn()) {
            tickers.push({
                name: 'True Performance',
                data: this.processPerformanceData(_.get(performance, 'current.portfolioValues', [])),
                color: currentPerformanceColor
            });
        }
        
        this.setState({tickers});
    }

    processPerformanceData = performanceData => {
        return performanceData.map(item => {
            return ([moment(item.date, 'YYYY-MM-DD').valueOf(), Number(item.netValue.toFixed(2))])
        })
    }

    getDefaultAdviceData = () => {
        const adviceId = this.props.match.params.id;
        const adviceSummaryUrl = `${requestUrl}/advice_default/${adviceId}?fullperformance=true`;
        this.setState({show: true});
        
        fetchAjax(adviceSummaryUrl)
        .then(summaryResponse => {
            this.getAdviceSummary(summaryResponse);
            this.getAdvicePerformance(summaryResponse.data.performance);
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            this.setState({
                positions: [],
                series: []
            });
            if (error.response) {
                if (error.response.status === 400) {
                    this.setState({notAuthorized: true});
                }
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({show: false});
        });
    }


    //THIS IS BUGGY - 02/05/2018
    //ADVICE PORTFOLIO IS FETCHED ONLY WHEN USER IS AUTHORIZED
    //Also, choose the right variable name
    //Just "response" is a poor name, 
    //Choose adviceSummaryResponse or advicePortfolioResponse etc.
    
    getAdviceData = (startDate = moment().format('YYYY-MM-DD')) => {
        const adviceId = this.props.match.params.id;
        const adviceSummaryUrl = `${requestUrl}/advice/${adviceId}`;
        const advicePerformanceUrl = `${requestUrl}/performance/advice/${adviceId}`;
        this.setState({show: true});
        
        return Promise.all([
            fetchAjax(adviceSummaryUrl),
            fetchAjax(advicePerformanceUrl)
        ]) 
        .then(([adviceSummaryResponse, advicePerformanceResponse]) => {
            this.getAdviceSummary(adviceSummaryResponse);
            this.getAdvicePerformance(advicePerformanceResponse.data);
            
            const advicePortfolioUrl = `${adviceSummaryUrl}/portfolio?date=${startDate}`;
            //ADVICE SUMMARY IN BACKEND first calculated full performance
            //With the right output from backend, this call (advice performance) can be
            //made redundant 
            
            const adviceDetail = this.state.adviceDetail;
            const authorizedToViewPortfolio = adviceDetail.isSubscribed || adviceDetail.isOwner || adviceDetail.isAdmin;

            return authorizedToViewPortfolio ? fetchAjax(advicePortfolioUrl) : null;
        })
        .then(advicePortfolioResponse  => {

            let positions = [];
            if (advicePortfolioResponse) {
                this.getAdviceDetail(advicePortfolioResponse);
                //positions = _.get(response.data, 'detail.positions', []).map(item => item.security.ticker);

                /*const series = [];
                const colorData = generateColorData(positions);
                const portfolioComposition = _.get(response.data, 'current.metrics.portfolioMetrics.composition', []).map((item, index) =>{
                    return {name: item.ticker, y: Math.round(item.weight * 10000) / 100, color: colorData[item.ticker]};
                });
                const constituentDollarPerformance = _.get(response.data, 'current.metrics.constituentPerformance', []).map((item, index) => {
                    return {name: item.ticker, data: [Number(item.pnl.toFixed(2))], color: colorData[item.ticker]}
                });
                const constituentPercentagePerformance = _.get(response.data, 'current.metrics.constituentPerformance', []).map(item => {
                    return {name: item.ticker, data: [item.pnl_pct], color: colorData[item.ticker]};
                });
                series.push({name: 'Composition', data: portfolioComposition});
                
                this.setState({
                    series,
                    barDollarSeries: constituentDollarPerformance,
                    barPercentageSeries: constituentPercentagePerformance
                });*/
            }
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            this.setState({
                positions: [],
                series: []
            });
            console.log(error);
            if (error.response) {
                if (error.response.status === 400) {
                    this.setState({notAuthorized: true});
                }
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({show: false});
        });
    };

    renderAdviceData = () => {
        const {followers, subscribers, rating} = this.state.adviceDetail;
        return (
            <Row>
                <MetricItem value={followers} label="Followers" style={{border: 'none'}} />
                <MetricItem value={rating} label="Average Rating" style={{border: 'none'}} />
                <MetricItem value={subscribers} label="Subscribers" style={{border: 'none'}} />
            </Row>
        );
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
                fetchAjax(portfolioUrl),
                fetchAjax(summaryUrl)
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

    renderModal = () => {
        return (
            <Modal
                    title="Subscribe"
                    visible={this.state.isDialogVisible}
                    onOk={this.subscribeAdvice}
                    onCancel={this.toggleDialog}
            >
                <h3>
                    {
                        this.state.adviceDetail.isSubscribed
                        ? "Are you sure you want to Unsubscribe"
                        : "Are you sure you want to Subscribe"
                    }
                </h3>
            </Modal>
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
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const userId = response.data._id;
            this.setState({userId});
        })
        .catch(error => {
            // console.log(error.message);
            if (error.response) {
                // console.log(error.response.status);
                if (error.response.status === 400) {
                    this.setState({notAuthorized: true});
                }
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    };

    componentWillMount() {
        this.mounted = true;
        if (!Utils.isLoggedIn()) {
            this.getDefaultAdviceData();
        } else {
            this.getUserData();
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
            // 'detail': true
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
            const realtimeData = JSON.parse(msg.data);
            if (realtimeData.type === 'advice') {
                const netValue = _.get(realtimeData, 'output.summary.netValue', 0);
                
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

                this.setState({
                    netValue,
                    metrics: {
                        ...this.state.metrics,
                        dailyNAVChangePct,
                        //netValue,
                        //totalReturn: this.state.performanceType == "Current" ? effTotalReturn : this.state.metrics.totalReturn,
                    },
                    positions: _.get(realtimeData, 'output.detail.positions', [])
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
        // console.log(isAdmin);
        if (isAdmin && approvalStatus !== 'approved') {
            return (
                <React.Fragment>
                    {/* <Button>Unapprove</Button> */}
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

    renderApprovalModal = () => {
        const approval = [{label: 'Approve', value: true}, {label: 'Unapprove', value: false}];
        const prohibit = [{label: 'Prohibit', value: true}, {label: 'Allow', value: false}]
        return (
            <Modal
                    title="Take Approval Action"
                    onCancel={this.toggleApprovalModal}
                    visible={this.state.approvalModalVisible}
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
                <Col span={24}>
                    <TextArea 
                            placeholder="Enter message here" 
                            autosize={{ minRows: 2, maxRows: 6 }} 
                            onChange={this.handleApprovalInputChange} 
                            value={this.state.approveObj.message}
                    />
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    <h5>Set Approval Action</h5>
                    <RadioGroup 
                            style={{marginTop: '10px', fontSize: '14px'}}
                            onChange={this.handleApprovalRadioChange} 
                            value={this.state.approveObj.approved}
                    >
                        {
                            approval.map((item, index) => <Radio key={index} value={item.value}>{item.label}</Radio>)
                        }
                    </RadioGroup>
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    <h5>Set Prohibit Action</h5>
                    <RadioGroup 
                            style={{marginTop: '10px', fontSize: '14px'}}
                            onChange={this.handleProhibitRadioChange} 
                            value={this.state.approveObj.prohibit}
                    >
                        {
                            prohibit.map((item, index) => <Radio key={index} value={item.value}>{item.label}</Radio>)
                        }
                    </RadioGroup>
                </Col>
            </Modal>
        );
    }

    handleApprovalSubmission = () => {
        const url = `${requestUrl}/advice/${this.props.match.params.id}/approve`;
        this.setState({approvalLoading: false});
        const data = this.state.approveObj;
        // console.log(data);
        axios({
            url,
            method: 'POST',
            headers: Utils.getAuthTokenHeader(),
            data: {
                ...this.state.approveObj,
                prohibit: false
            }
        })
        .then(response => {
            message.success('Sucess');
            this.toggleApprovalModal();
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            message.error('Error Occured');
            // console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({approvalLoading: false});
        })
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

    renderActionButtons = (small=false) => {
        const {userId} = this.state;
        let advisorId = this.state.adviceDetail.advisor.user ? this.state.adviceDetail.advisor.user._id: '';
        const className = small ? 'action-button action-button-small' : 'action-button';
        if (userId !== advisorId) {
            return (
                <React.Fragment>
                    {/* <Col span={24} style={{textAlign: 'right'}}> */}
                        <Button
                                onClick={() => 
                                    Utils.isLoggedIn() 
                                    ? this.toggleDialog() 
                                    : this.props.history.push('/login')
                                }
                                className={className}
                                style={buttonStyle}
                                type="primary"
                                disabled={this.state.disableSubscribeButton}
                        >
                            {!this.state.adviceDetail.isSubscribed ? "PURCHASE ADVICE" : "CANCEL SUBSCRIPTION"}
                        </Button>
                    {/* </Col> */}
                    {/* <Col span={24} style={{textAlign: 'right'}}> */}
                        <Button
                                onClick={() => 
                                    Utils.isLoggedIn()
                                    ? this.followAdvice()
                                    : this.props.history.push('/login') 
                                }
                                className={className}
                                style={buttonStyle}
                                disabled={this.state.disableFollowButton}
                        >
                            {!this.state.adviceDetail.isFollowing ? "Add To Wishlist" : "Remove From Wishlist"}
                        </Button>
                    {/* </Col> */}
                </React.Fragment>
            );
        } else {
            return (
                <React.Fragment>
                    {this.renderApprovalButtons(small)}
                    {
                        !this.state.adviceDetail.isPublic && 
                        <Button 
                                onClick={this.makeAdvicePublic} 
                                className={className} 
                                style={buttonStyle} 
                                type="primary"
                        >
                            POST  TO MARKETPLACE
                        </Button>
                    }
                    <Button
                            onClick={() => this.props.history.push(`/advisordashboard/updateadvice/${this.props.match.params.id}`)}
                            className={className}
                            style={buttonStyle}
                    >
                        Update Advice
                    </Button>
                </React.Fragment>
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
        axios.get(`${url}/portfolio?date=${startDate}`, {headers: Utils.getAuthTokenHeader()})
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

    renderPageContent = () => {
        const {name, heading, description, advisor, updatedDate} = this.state.adviceDetail;
        const {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;
        const breadCrumbs = getBreadCrumbArray(AdviceDetailCrumb, [
            {name, url: '#'}
        ]);
        
        return (
            this.state.notAuthorized
            ?   <ForbiddenAccess />

            :   <Row style={{marginBottom:'20px'}}>
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
                            netValue={this.state.netValue}
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
                    />
                    <Col xl={6} md={0} sm={0} xs={0}>
                        {this.renderActionButtons()}
                    </Col>
                </Row>
        );
    }

    render() {
        return (
           <Row>
                <Loading
                    show={this.state.show}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
               {this.renderModal()}
               {this.renderUpdateModal()}
               {this.renderApprovalModal()}
               {
                    !this.state.show &&
                    this.renderPageContent()
               }

           </Row>
        );
    }
}

export default withRouter(AdviceDetailImpl);

const cardItemStyle = {
    border: '1px solid #444'
};

const metricItemStyle = {
    padding: '10px'
};

const userStyle = {
    fontWeight: 700,
    fontSize: '12px',
    color: '#595959'
};

const textStyle = {
    fontSize: '14px',
    marginTop: '10px'
};

const dateStyle = {
    color: '#757474',
    fontWeight: 500,
    marginLeft: '10px'
};

const dividerStyle = {
    backgroundColor: '#E0E0E0',
    height: '1px'
};

const labelStyle = {
    fontSize: '13px'
};

const valueStyle = {
    fontSize: '16px',
    fontWeight: '400',
    color: '#555454'
};

const adviceNameStyle = {
    fontSize: '20px',
    color: '#353535'
};

const customPanelStyle = {
    background: 'transparent',
    borderRadius: 4,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
};
