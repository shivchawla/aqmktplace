import * as React from 'react';
import Loadable from 'react-loadable';
import moment from 'moment';
import _ from 'lodash';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router';
import {Row, Col, Button, Select, Spin, Icon} from 'antd';
import {AdvisorDashboardMeta} from '../metas';
import {graphColors} from '../constants';
import {ArrowButton} from './InvestorDashboard';
import {AqPageHeader} from '../components/AqPageHeader';
import {AqRate} from '../components/AqRate';
import ForbiddenAccess from '../components/ForbiddenAccess';
import {ListMetricItem} from '../components/ListMetricItem';
import {HighChartSpline} from '../components/HighChartSpline';
import {DashboardCard} from '../components/DashboardCard';
import {HighChartNew} from '../components/HighChartNew';
import {listMetricItemLabelStyle, loadingColor, benchmarkColor, simulatedPerformanceColor, currentPerformanceColor} from '../constants';
import {Utils, getBreadCrumbArray, fetchAjax, getStockPerformance} from '../utils';
import '../css/advisorDashboard.css';

const MyChartNew = Loadable({
    loader: () => import('./MyChartNew'),
    loading: () => <Icon type="loading" />
});
const Option = Select.Option;
const {requestUrl} = require('../localConfig');
const dashboardMediaqueries = {xl: 12, lg: 24, md: 24, sm: 24, xs: 24};
class AdvisorDashboard extends React.Component {
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;

    constructor(props) {
        super(props);
        this.state = {
            radioValue: 'all',
            advices: [],
            adviceUrl: `${requestUrl}/advice?all=true&trending=false&subscribed=false&following=false&order=-1&personal=1`,
            rawAdvices: [], // the advice structure is not changed, it is modified when new network call is done to sort the advices
            staticAdvices: [], // the advice is not changed, it is populated only the first time when getDashboardData is called
            subsPerAdviceSeries: [],
            selectedAdvice: '',
            selectedAdviceId: '',
            subscribeScreen: 'total',
            tickers: [],
            filterModalVisible: false,
            sortBy: 'rating',
            subscriberStats: {
                totalSubscribers: 0,
                selectedAdviceSubscribers: 0
            },
            ratingStats: {
                currentRating: 4.7,
                simulatedRating: 5
            },
            advisorRatingStat: 0,
            totalSubscribers: 0,
            newSubscribers: 0,
            adviceRating: [],
            advisorRating: [],
            subscriberRating: [],
            myAdvicesLoading: false,
            advicePerformanceLoading: false,
            dashboardDataLoading: false,
            showEmptyScreen: false,
            notAuthorized: false,
            loading: false
        };
        this.adviceColumns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Rating',
                dataIndex: 'rating',
                key: 'rating'
            },
            {
                title: ' ',
                dataIndex: 'id',
                render: (text, record) => (
                    <Button icon="edit" onClick={() => this.props.history.push(`/advice/${record.id}`)}/>
                )
            }
        ];
    }

    subsPerAdviceChart= () => ({
        events: {
            click: e => {
                this.setState({
                    subsPerAdviceConfig: this.setSubsPerAdviceTitle(e.point),
                    subscriberStats: {...this.state.subscriberStats, selectedAdviceSubscribers: e.point.y}
                });
            },
            load: () => {
                // console.log('Successfully loaded');
            }
        }
    })

    setSubsPerAdviceTitle = data => {
        return {
                ...this.state.subsPerAdviceConfig, 
                title: {
                    ...this.state.subsPerAdviceConfig.title,
                    text: `${data.name} <br> ${Number(data.percentage).toFixed(2)} %`
                }
            }
    }
    
    handleRadioGroupChange = (e) => {
        this.setState({radioValue: e.target.value});
    }

    getUserDashboardData = () => {
        const url = `${requestUrl}/advisor/${Utils.getUserInfo().advisor}?dashboard=1`;
        const subsTotalSeries = [];
        const ratingSeries = [];
        const advisorRating = [];
        let subscriberRating = {};
        this.setState({dashboardDataLoading: true, myAdvicesLoading: true, loading: true});
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            const currentRating = (_.get(response.data, 'advices[0].rating.current', 0) || 0).toFixed(2);
            const simulatedRating = (_.get(response.data, 'advices[0].rating.simulated', 0) || 0).toFixed(2);
            const analytics = _.get(response.data, 'analytics', []);
            const advisorRatingStat = (_.get(analytics[analytics.length - 1], 'rating.current', 0)).toFixed(2);
            const advisorSubscribers = _.get(response.data, 'analytics[response.data.analytics.length - 1].numFollowers', 0);
            const advices = _.get(response.data, 'advices', []);
            if (advices.length < 1) {
                this.setState({showEmptyScreen: true});
                return;
            }
            const validAdviceIndex = this.getValidIndex(advices);
            const validAdvice = advices[validAdviceIndex] || null;
            subscriberRating = {name: 'Total Subscribers', data: this.processTotalSubscribers(_.get(response.data, 'analytics', []))};
            subsTotalSeries.push({
                name: 'Total Subscribers', 
                data: this.processTotalSubscribers(_.get(response.data, 'analytics', [])),
                color: '#536DFE'
            });
            ratingSeries.push({
                name: 'Current Rating', 
                data: this.processRatingByAdvice(_.get(response.data, 'advices[0]', [])),
                color: '#607D8B'
            });
            ratingSeries.push({
                name: 'Simulated Rating', 
                data: this.processRatingByAdvice(_.get(response.data, 'advices[0]', []), 'simulated'),
                color: '#FF9800'
            });
            advisorRating.push({
                name: 'Advisor Analytics', 
                data: this.processAdvisorRating(_.get(response.data, 'analytics', [])),
                color: '#607D8B'
            });
            this.getAdvicePerformance(_.get(response.data, 'advices[0]', []));
            this.setState({
                selectedAdvice: _.get(response.data, 'advices[0].name', ''),
                rawAdvices: advices,
                staticAdvices: advices,
                showEmptyScreen: advices.length > 0 ? false : true,
                advices: this.processAdvices(this.sortAdvices(advices)),
                subsPerAdviceSeries: this.processSubsPerAdvice(advices),
                ratingsConfig: {...this.state.ratingsConfig, series: ratingSeries},
                adviceRating: ratingSeries,
                advisorRating,
                subscriberRating: subsTotalSeries,
                subscriberStats: {
                    selectedAdviceSubscribers: _.get(validAdvice, 'latestAnalytics.numSubscribers', 0), 
                    totalSubscribers: this.getTotalSubscribers(response.data.advices),
                    name: _.get(validAdvice, 'name', '')
                },
                ratingStats: {
                    currentRating,
                    simulatedRating
                },
                advisorRatingStat,
                totalSubscribers: advisorSubscribers
            }, () => {
                this.setUpSocketConnection();
            });
        })
        .catch(error => {
            console.log(error);
            return error;
        })
        .finally(() => {
            this.setState({dashboardDataLoading: false, myAdvicesLoading: false, loading: false});
        })
    }

    getValidIndex = advices => {
        let i = 0;
        while(i < advices.length) {
            const numSubscribers = _.get(advices[i], 'latestAnalytics.numSubscribers', 0);
            if (numSubscribers > 0){ 
                break;
            }
            i++;
        }
        return i;
    }

    processAdviceData = advices => {
        return advices.map((advice, index) => {
            return {
                name: advice.name,
                rating: _.get(advice, 'latestAnalytics.rating', 0),
                key: index,
                id: advice._id
            }
        });
    }

    processAdvices = (responseAdvices) => {
        const advices = [];
        responseAdvices.map((advice, index) => {
            advices.push({
                id: advice._id,
                name: advice.name,
                advisor: advice.advisor,
                createdDate: advice.createdDate,
                heading: advice.heading,
                subscribers: advice.numSubscribers,
                rating: advice.latestAnalytics !== undefined ? advice.latestAnalytics.rating : 0,
                latestPerformance: advice.latestPerformance
            })
        });

        return advices;
    }

    sortAdvices = (advices) => {
        return _.sortBy(advices, advice => _.get(advice, 'latestAnalytics.rating', {}));
    }

    calculateRating = advice => {
        let rating = 0;
        advice.analytics.map(item => {
            rating += item.rating;
        });

        return (rating / advice.analytics.length);
    }

    processSubsPerAdvice = advices => {
        const totalSubscribers = this.getTotalSubscribers(advices);
        const responseArray = advices.map((advice, index) => {
            const subscribers =_.get(advice, 'latestAnalytics.numSubscribers', 0);
            return {
                name: advice.name,
                y: Number(((subscribers / totalSubscribers) * 100).toFixed(2)),
                subscribers,
                color: graphColors[index] || '#444'
            }
        });

        return responseArray;
    }

    getTotalSubscribers = advices => {
        let totalSubscribers = 0;
        advices.map(advice => {
            totalSubscribers += _.get(advice, 'latestAnalytics.numSubscribers', 0)
        });

        return totalSubscribers;
    }

    processTotalSubscribers = advisorAnalytics => {
        if (advisorAnalytics.length > 0) {
            // Initializing month's data to null
            const monthData = [];
            for (let i=0; i < 12; i++) {
                monthData.push(null);
            };
            advisorAnalytics.map((item, index) => {
                const month = moment(item.date).format('M');
                monthData[month - 1] = item.numFollowers;
            });

            return monthData;
        } else {
            return [];
        }
        
    }

    processAdvisorRating = advisorAnalytics => {
        if (advisorAnalytics.length > 0) {
            const monthData = [];
            for (let i=0; i < 12; i++) {
                monthData.push(null);
            };
            advisorAnalytics.map((item, index) => {
                const month = moment(item.date).format('M');
                if (item.rating.current) {
                    monthData[month - 1] = Number(item.rating.current.toFixed(2));
                } else {
                    monthData[month - 1] = 0;
                }
            });

            return monthData;
        } else {
            return [];
        }
    }

    processRatingByAdvice = (advice, type='current') => {
        const monthData = [];
         // Initializing month's data to null
        for (let i=0; i < 12; i++) {
            monthData.push(null);
        };
        advice.analytics.map((item, index) => {
            const month = moment(item.date).format('M');
            const rating = type === 'current' ? (_.get(item, 'rating.current', 0) || 0) : (_.get(item, 'rating.simulated', 0) || 0);
            monthData[month - 1] = rating !== undefined ? Number(rating.toFixed(2)) : 0;
        });

        return monthData;
    }

    renderSubscriberStatsView = () => {
        const {subscribeScreen, subscriberStats} = this.state;
        const {totalSubscribers, selectedAdviceSubscribers, name} = subscriberStats;
        
        return (
            <Row gutter={16}>
                <Col {...dashboardMediaqueries}> {/* Total Subscribers */}
                    <DashboardCard
                            title="TOTAL SUBSCRIBERS"
                            cardStyle={{height:'365px', marginTop: '20px'}}
                            headerStyle={headerStyle}
                    >
                        <Row>
                            <Col span={16} style={{paddingTop: '20px'}}>
                                <HighChartSpline 
                                        id="subsriber-rating-chart" 
                                        xAxisTitle="Subscribers"
                                        series={this.state.subscriberRating}
                                        width={450}
                                />
                            </Col>
                            <Col span={8} style={{marginTop: '40px'}}>
                                <Row style={{paddingRight: '20px', textAlign: 'right'}}>
                                    <StatsMetricItem label="Subscribers" value={this.state.subscriberStats.totalSubscribers}/>
                                </Row>
                            </Col>
                        </Row>
                    </DashboardCard>
                </Col>
                <Col {...dashboardMediaqueries}> {/* Subscribers / Advice */}
                    <DashboardCard
                            title="SUBSCRIBERS / ADVICE"
                            headerStyle={headerStyle}
                            cardStyle={{height:'365px', marginTop: '20px'}}
                            headerSpan={24}
                    >
                        <Row tab="Subscribers / Advice" key="2">
                            <Col span={14}>
                                <HighChartNew 
                                        series = {
                                            [{name: 'Subs PerAdvice Composition', data: this.state.subsPerAdviceSeries}]
                                        } 
                                        handleChartClick={this.handleChartClick}
                                        innerSize={180}
                                        height={320}
                                />
                            </Col>
                            <Col span={10}>
                                <Row type="flex" justify="end" style={{textAlign: 'right', paddingRight: '40px', paddingTop: '30px'}}>
                                    <Col span={24}>
                                        <h3 
                                                style={{
                                                    color: '#444444', 
                                                    fontSize: '16px',
                                                }}
                                        >
                                            {name}
                                        </h3>
                                    </Col>
                                    <Col span={24}>
                                        <StatsMetricItem label="Subscribers" value={selectedAdviceSubscribers}/>
                                    </Col>
                                    <Col span={24} style={{marginTop: '30px'}}>
                                        <StatsMetricItem label="Total Subscribers" value={totalSubscribers}/>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    </DashboardCard>
                </Col>
            </Row>
        );
    }

    handleChartClick = data => {
        this.setState({
            subscriberStats: {
                ...this.state.subscriberStats,
                selectedAdviceSubscribers: data.subscribers,
                name: data.name
            }
        });
    }

    renderAdvicesMenu = (handleSelect, top = 0, right = 0, size = 'default') => {
        const advices = this.state.staticAdvices;

        if(advices.length > 0) {
            return (
                <Select 
                        defaultValue={advices[0].name} 
                        style={{width: 250}}
                        onChange={handleSelect}
                        autoFocus={true}
                        size={size}
                >
                    {
                        advices.map((advice, index) => {
                            return (
                                <Option key={index} value={advice._id}>{advice.name}</Option>
                            );
                        })
                    }
                </Select>
            );
        } else {
            return null;
        }
    }

    handleSubsciberViewChange = (e) => {
        this.setState({subscribeScreen: e.target.value})
    }

    handleSelectAdvice = value => {
        const advices = this.state.staticAdvices;
        const ratingSeries = [];
        const series = this.state.ratingsConfig.series;
        const advice = advices.filter(item => item._id === value)[0];
        const currentRating = (_.get(advice, 'rating.current', 0) || 0).toFixed(2);
        const simulatedRating = (_.get(advice, 'rating.simulated', 0) || 0).toFixed(2);

        ratingSeries.push({name: 'Current Rating', data: this.processRatingByAdvice(advice), color: '#607D8B'});
        ratingSeries.push({name: 'Simulated Rating', data: this.processRatingByAdvice(advice, 'simulated'), color: '#FF9800'});
        this.setState({
            adviceRating: ratingSeries,
            ratingStats: {
                currentRating,
                simulatedRating
            }
        });
    }

    handleSelectAdvicePerformance = value => {
        const advice = this.state.rawAdvices.filter(item => item._id === value)[0];
        this.setState({
            selectedAdvice: advice.name,
            selectedAdviceId: value
        }, () => {
            this.getAdvicePerformance(advice);
        });
    }

    getAdvicePerformance = advice => {
        const newTickers = [];
        console.log(advice);
        const url = `${requestUrl}/performance/advice/${advice._id}`;
        this.setState({advicePerformanceLoading: true, selectedAdviceId: advice._id});
        Promise.all([
            fetchAjax(url, this.props.history, this.props.match.url),
            getStockPerformance('NIFTY_50', 'detail_benchmark')
        ])
        .then(([adviceResponse, benchmarkResponse]) => {
            const simulatedPerformance = _.get(adviceResponse.data, 'simulated.portfolioValues', []).map(item => [moment(item.date).valueOf(), item.netValue]);
            const currentPerformance = _.get(adviceResponse.data, 'current.portfolioValues', []).map(item => [moment(item.date).valueOf(), item.netValue]);
            newTickers.push({
                name: `Advice - Simulated`,
                data: simulatedPerformance,
                color: simulatedPerformanceColor,
                noLoadData: true,
            });

            newTickers.push({
                name: `Advice - Current`,
                data: currentPerformance,
                color: currentPerformanceColor,
                noLoadData: true,
                disabled: currentPerformance.length < 1
            });

            newTickers.push({
                name: "NIFTY_50",
                data: benchmarkResponse,
                color: benchmarkColor,
            });
            this.setState({tickers: newTickers});
        })
        .finally(() => {
            this.setState({advicePerformanceLoading: false});
        });
    }

    toggleFilterModal = () => {
        this.setState({filterModalVisible: !this.state.filterModalVisible});
    }

    updateAdvices = (advices) => {
        this.setState({advices: this.processAdvices(advices)});
    }

    updateAdviceUrl = (url) => {
        this.setState({adviceUrl: url});
    }

    handleSortingMenuChange = (value) => {
        this.setState({sortBy: value}, () => {
            const url = `${this.state.adviceUrl}&orderParam=${this.state.sortBy}`;
            this.getAdvices(url);
        });
    }

    getAdvices = (url) => {
        this.setState({myAdvicesLoading: true});
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            this.setState({advices: response.data.advices, rawAdvices: response.data.advices});
        })
        .finally(() => {
            this.setState({myAdvicesLoading: false});
        });
    }

    renderSortingMenu = () => {
        return (
            <div> 
                <span style={{fontSize:'12px'}}>Sort By: </span> 
                <Select 
                    defaultValue={this.state.sortBy} 
                    style={{width: 120}} 
                    size="small"
                    onChange={this.handleSortingMenuChange}>
                    <Option value="rating">Rating</Option>
                    <Option value="return">Return</Option>
                    <Option value="name">Name</Option>
                    <Option value="volatility">Volatility</Option>
                    <Option value="sharpe">Sharpe</Option>
                    <Option value="maxloss">Max Loss</Option>
                    <Option value="numFollowers">Followers</Option>
                    <Option value="numSubscribers">Subscribers</Option>
                    <Option value="createdDate">Created Date</Option>
                </Select>
            </div>
        );
    }

    componentWillMount() {
        this.mounted = true;
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            Promise.all([this.getUserDashboardData()])
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.unSubscribeToAllAdvices(this.state.advices);
    }

    setUpSocketConnection = () => {
        if (Utils.webSocket && Utils.webSocket.readyState == WebSocket.OPEN) {
            Utils.webSocket.onopen = () => {
                Utils.webSocket.onmessage = this.processRealtimeMessage;
                this.takeAction();
            }

            Utils.webSocket.onclose = () => {
                this.setUpSocketConnection();
            }
        
            Utils.webSocket.onmessage = this.processRealtimeMessage;
            this.takeAction();
        } else {
            setTimeout(function() {
                this.setUpSocketConnection()
            }.bind(this), 5000);
        }
    }

    takeAction = () => {
        if (this.mounted) {
            this.subscribeToAllAdvices(this.state.advices);
        } else {
            this.unSubscribeToAllAdvices(this.state.advices);
        }
    }

    subscribeToAllAdvices = (advices = []) => {
        advices.map(advice => {
            this.subscribeToAdvice(advice.id);
        });
    }

    unSubscribeToAllAdvices = (advices = []) => {
        // console.log('Un Subscribing to all advices');
        advices.map(advice => {
            this.unSubscribeToAdvice(advice.id);
        });
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
        // console.log('UnSubscription to advice ' + adviceId);
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'advice',
            'adviceId': adviceId,
            // 'detail': true
        };
        Utils.sendWSMessage(msg);
    }

    processRealtimeMessage = msg => {
        if (this.mounted) {
            try {
                const realtimeData = JSON.parse(msg.data);
                if (realtimeData.type === 'advice') {
                    const rawAdvices = [...this.state.rawAdvices];
                    const targetAdvice = rawAdvices.filter(advice => advice._id === realtimeData.adviceId)[0];
                    if (targetAdvice) {
                        targetAdvice.performanceSummary.current.netValue = _.get(realtimeData, 'output.summary.netValue', 0);
                        targetAdvice.performanceSummary.current.totalReturn = _.get(realtimeData, 'output.summary.dailyNavChangePct', 0);
                        this.setState({rawAdvices});
                    }
                }
            } catch(error) {return error;}
        }
    }

    renderAdvices = () => {
        const advices = this.state.rawAdvices;
        return advices.map((advice, index) => {
            const returnColor = _.get(advice, 'performanceSummary.current.totalReturn', 0) < 0 ? '#ED4D4D' : '#3DC66B';
            return (
                <Row 
                    key={index} 
                    style={{padding: '10px 20px', cursor: 'pointer', }}
                    onClick={() => this.props.history.push(`/contest/entry/${advice._id}`)}
                    className='advice-row'>
                    <Col span={7}>
                        <ListMetricItem label="Name" value={advice.name} />
                    </Col>
                    <Col span={6}>
                        <ListMetricItem 
                                value={(_.get(advice, 'netValue', 0) || 0).toFixed(2)} 
                                label="Net Value" 
                        />
                    </Col>
                    <Col span={4}>
                        <ListMetricItem 
                                valueColor={returnColor} 
                                value={`${Number((_.get(advice, 'performanceSummary.current.totalReturn', 0) * 100).toFixed(2))} %`} 
                                label="Daily Chg (%)" 
                        />
                    </Col>
                    <Col span={7}>
                        <Row>
                            <Col span={24}>
                                <AqRate value={_.get(advice, 'rating.current', 0)} />
                            </Col>
                            <Col span={24}>
                                <h3 style={listMetricItemLabelStyle}>Rating</h3>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24} style={{backgroundColor: '#eaeaea', marginTop: '10px'}}>
                    </Col>
                </Row>
            );
        });
    }

    renderMetrics = () => {
        return (
            <Row gutter={16}>
                <Col {...dashboardMediaqueries}> {/* Advice Rating */}
                    <DashboardCard
                            title="ADVICE RATING"
                            headerStyle={headerStyle}
                            cardStyle={{height:'365px', marginTop: '20px'}} 
                            menu={this.renderAdvicesMenu(this.handleSelectAdvice, -20, 0, 'small')}
                    >
                        <Row>
                            <Col span={16} style={{paddingTop: '20px'}}>  
                                <HighChartSpline 
                                        id="advice-rating-chart" 
                                        series={this.state.adviceRating}
                                        width={450}
                                />
                            </Col>
                            <Col span={8} style={{marginTop: '20px'}}>
                                <Row style={{paddingRight: '20px', textAlign: 'right'}}>
                                    <StatsMetricItem 
                                            label="Current Rating" 
                                            value={this.state.ratingStats.currentRating}
                                    />
                                    <StatsMetricItem 
                                            style={{marginTop: '30px'}} 
                                            label="Simulated Rating" 
                                            value={this.state.ratingStats.simulatedRating}
                                    />
                                </Row>
                            </Col>
                        </Row>
                    </DashboardCard>
                </Col>
                <Col {...dashboardMediaqueries}> {/* Advisor Rating */}
                    <DashboardCard
                            title="ADVISOR RATING"
                            headerStyle={headerStyle}
                            cardStyle={{height:'365px', marginTop: '20px'}}
                    >
                        <Row>
                            <Col span={16} style={{paddingTop: '20px'}}>
                                <HighChartSpline 
                                        id="advisor-rating-chart" 
                                        series={this.state.advisorRating}
                                        width={450}
                                />
                            </Col>
                            <Col span={8} style={{marginTop: '20px'}}>
                                <Row style={{paddingRight: '20px', textAlign: 'right'}}>
                                    <StatsMetricItem label="Rating" value={this.state.advisorRatingStat}/>
                                </Row>
                            </Col>
                        </Row>
                    </DashboardCard>
                </Col>
                {/* Spacer */}
                <Col span={24} style={{height: '100px'}}></Col>
            </Row>
        );
    }

    renderPageContent = () => {
        const {radioValue} = this.state;
        const breadCrumbArray = getBreadCrumbArray([{name: 'Advisor Dashboard'}]);
        const button = !this.state.showEmptyScreen ? {route: '/advisordashboard/createadvice', title: 'Create Advice'} : null;
        if (this.state.notAuthorized) {
            return <ForbiddenAccess />
        } else {
            return (
                <Row className='aq-page-container'>
                    <AqPageHeader 
                            backgroundColor='transparent'
                            title="Advisor Dashboard" 
                            breadCrumbs = {breadCrumbArray} 
                    >
                        {
                            this.props.match.params.section === 'advicePerformance'
                            ? this.renderAdvicesMenu(this.handleSelectAdvicePerformance, 0 ,5)
                            : null
                        }
                    </AqPageHeader>
                    {
                        this.state.showEmptyScreen
                        ?   <Col span={24} style={emptyPortfolioStyle}>
                                <h1>You have not created any entries yet. Get started by creating one</h1>
                                <Button 
                                        type="primary" 
                                        onClick={() => this.props.history.push('/contest/createadvice')}
                                        style={{marginTop: '20px'}}
                                >
                                    Create Entry
                                </Button>
                            </Col>
                        :   <Col span={24} className='advisorDashboardContainer' style={{height: '100%'}}>
                                <Row>
                                    {
                                        (this.props.match.params.section === undefined || this.props.match.params.section === 'myAdvices') &&
                                        <Col span={24}>
                                            <DashboardCard 
                                                    headerStyle={headerStyle}
                                                    title="MY ENTRIES"
                                                    cardStyle={{marginTop:'10px', height:'550px'}}  
                                                    menu={this.renderSortingMenu()}
                                                    loading={this.state.myAdvicesLoading}
                                                    contentStyle={{height: '90%', overflow: 'hidden', overflowY: 'scroll'}}
                                            >
                                                {this.renderAdvices()}
                                            </DashboardCard>
                                        </Col>
                                    }
                                    {
                                        this.props.match.params.section === 'advicePerformance' &&
                                        <Col span={24}>
                                            {/* <Row type="flex" justify="end">
                                                {this.renderAdvicesMenu(this.handleSelectAdvicePerformance, 0 ,5)}
                                            </Row> */}
                                            <DashboardCard 
                                                    headerStyle={headerStyle}
                                                    cardStyle={{marginTop:'10px', height:'550px'}} 
                                                    title={`Performance Chart - (${this.state.selectedAdvice})`}
                                                    loading={this.state.advicePerformanceLoading}
                                                    menu={
                                                        <ArrowButton 
                                                                text="Go To Entry"
                                                                onClick={
                                                                    () => this.props.history.push(`/contest/entry/${this.state.selectedAdviceId}`)
                                                                }
                                                        />
                                                    }
                                            >
                                                <Col
                                                        style={{paddingLeft: '20px', paddingTop: '10px'}}
                                                >
                                                    <MyChartNew height={420} series={this.state.tickers} />
                                                </Col>
                                            </DashboardCard>
                                        </Col>
                                    }
                                    {
                                        (this.props.match.params.section === 'metrics' || this.props.match.params.section === 'ratings') &&
                                        <Row gutter={16}>
                                            <Col span={24}>
                                                <Spin spinning={this.state.dashboardDataLoading}>
                                                    {this.renderSubscriberStatsView()}
                                                </Spin>
                                            </Col>
                                            <Col span={24}>
                                                <Spin spinning={this.state.dashboardDataLoading}>
                                                    {this.renderMetrics()}
                                                </Spin>
                                            </Col>
                                        </Row>
                                    }
                                </Row>
                            </Col>
                    }
                </Row>
            );
        }
    }

    render() {
        return(
            <Col span={24}>
                <Loading 
                    show = {this.state.loading}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                <AdvisorDashboardMeta />
                {
                    !this.state.loading &&
                    this.renderPageContent()
                }
            </Col>
        );
    }
}

const StatsMetricItem = ({label, value, style}) => {
    return (
        <div style={style}>
            <h3 style={metricValueStyle}>{value}</h3>
            <h3 style={metricLabelStyle}>{label}</h3>
        </div>
    );
};

export default withRouter(AdvisorDashboard);

const metricValueStyle = {
    color: '#26BABC',
    fontSize: '30px',
    fontWeight: 700
};

const metricLabelStyle = {
    color: '#6C6C6C',
    fontSize: '14px'
};

const emptyPortfolioStyle = {
    height: '600px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center'
};

const headerStyle = {
    borderBottom: '1px solid #eaeaea'
};