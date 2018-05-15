import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import Loading from 'react-loading-bar';
import {Row, Col, Radio, Table, Icon, Button, Tabs, Select, Modal, Rate, Spin} from 'antd';
import {MyChartNew} from './MyChartNew';
import {graphColors} from '../constants';
import {AqHighChartMod, AdviceFilterComponent, AdviceListItem, ListMetricItem, HighChartSpline, DashboardCard, AqPageHeader, HighChartNew, ForbiddenAccess, AqRate} from '../components';
import {pageTitleStyle, newLayoutStyle, noOverflowStyle, shadowBoxStyle, listMetricItemLabelStyle, listMetricItemValueStyle, tabBackgroundColor, loadingColor, benchmarkColor, simulatedPerformanceColor} from '../constants';
import {dateFormat, Utils, getBreadCrumbArray, fetchAjax, getStockPerformance} from '../utils';
import '../css/advisorDashboard.css';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ReactHighcharts = require('react-highcharts');
const {requestUrl, aimsquantToken} = require('../localConfig');

export default class AdvisorDashboard extends React.Component {
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
            show: true,
            notAuthorized: false
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
        let totalSubscribers = 0;
        this.setState({dashboardDataLoading: true, myAdvicesLoading: true, show: true});
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            const currentRating = _.get(response.data, 'advices[0].rating.current', 0).toFixed(2);
            const simulatedRating = _.get(response.data, 'advices[0].rating.simulated', 0).toFixed(2);
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
            // console.log('Valid Advice', validAdvice);
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
        })
        .finally(() => {
            this.setState({dashboardDataLoading: false, myAdvicesLoading: false, show: false});
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
            const rating = type === 'current' ? _.get(item, 'rating.current', 0) : _.get(item, 'rating.simulated', 0);
            monthData[month - 1] = rating !== undefined ? Number(rating.toFixed(2)) : 0;
        });

        return monthData;
    }

    renderSubscriberStatsView = () => {
        const {subscribeScreen, subscriberStats} = this.state;
        const {totalSubscribers, selectedAdviceSubscribers, name} = subscriberStats;

        return (
            <Spin spinning={this.state.dashboardDataLoading}>
                <Row>
                    <Col span={24}>
                        <Tabs defaultActiveKey="1" size="small" animated={false} tabBarStyle={{backgroundColor: tabBackgroundColor}}>
                            <TabPane tab="Total Subscribers" key="1" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <Col span={24}>
                                    <HighChartSpline 
                                            id="subsriber-rating-chart" 
                                            xAxisTitle="Subscribers"
                                            series={this.state.subscriberRating}
                                    />
                                </Col>
                                <Col span={10} style={{marginRight: '20px', marginTop: '-20px'}}>
                                    <Row type="flex" align="middle">
                                        <StatsMetricItem label="Subscribers" value={this.state.subscriberStats.totalSubscribers}/>
                                    </Row>
                                </Col>
                            </TabPane>
                            <TabPane tab="Subscribers / Advice" key="2" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <Col span={12}>
                                    <HighChartNew 
                                            series = {
                                                [{name: 'Subs PerAdvice Composition', data: this.state.subsPerAdviceSeries}]
                                            } 
                                            handleChartClick={this.handleChartClick}
                                    />
                                </Col>
                                <Col span={10} style={{marginRight: '20px', marginTop: '-20px'}}>
                                    <Row type="flex" justify="end">
                                        <h3 style={{color: '#444444', fontSize: '22px', fontWeight: '700'}}>{name}</h3>
                                        <StatsMetricItem label="Subscribers" value={selectedAdviceSubscribers}/>
                                        <StatsMetricItem label="Total Subscribers" value={totalSubscribers}/>
                                    </Row>
                                </Col>
                            </TabPane>
                        </Tabs>
                    </Col>
                </Row>
            </Spin>
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

    renderAdvicesMenu = (handleSelect, top = 0, right = 0) => {
        const advices = this.state.staticAdvices;

        if(advices.length > 0) {
            return (
                <Select 
                        defaultValue={advices[0].name} 
                        style={{width: 160, position: 'absolute', right, top}}
                        onChange={handleSelect}
                        size="small"
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
        const currentRating = _.get(advice, 'rating.current', 0).toFixed(2);
        const simulatedRating = _.get(advice, 'rating.simulated', 0).toFixed(2);    

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
        this.getAdvicePerformance(advice);
    }

    getAdvicePerformance = advice => {
        const newTickers = [];
        const url = `${requestUrl}/performance/advice/${advice._id}`;
        this.setState({advicePerformanceLoading: true});
        Promise.all([
            fetchAjax(url, this.props.history, this.props.match.url),
            getStockPerformance('NIFTY_50', 'detail_benchmark')
        ])
        .then(([adviceResponse, benchmarkResponse]) => {
            // console.log(benchmarkResponse);
            const data = _.get(adviceResponse.data, 'simulated.portfolioValues', []).map(item => [moment(item.date).valueOf(), item.netValue]);
            newTickers.push({
                name: advice.name,
                data,
                color: simulatedPerformanceColor
            });
            newTickers.push({
                name: "NIFTY_50",
                data: benchmarkResponse,
                color: benchmarkColor
            });
            this.setState({tickers: newTickers});
        })
        .finally(() => {
            this.setState({advicePerformanceLoading: false});
        });
    }

    renderFilterModal = () => {
        return (
            <Modal
                    title="Apply Filters"
                    visible={this.state.filterModalVisible}
                    footer={null}
                    onCancel={this.toggleFilterModal}
            >
                <AdviceFilterComponent 
                        updateAdvices={this.updateAdvices}
                        updateAdviceUrl={this.updateAdviceUrl}
                        toggleModal = {this.toggleFilterModal}
                        orderParam={this.state.sortBy}
                />
            </Modal>
        );
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
            this.getUserDashboardData();
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
                    onClick={() => this.props.history.push(`/advice/${advice._id}`)}
                    className='advice-row'>
                    <Col span={7}>
                        <ListMetricItem label="Name" value={advice.name} />
                    </Col>
                    <Col span={6}>
                        <ListMetricItem 
                                value={(_.get(advice, 'performanceSummary.current.netValueEOD', 0) || 0).toFixed(2)} 
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

    renderPageContent = () => {
        const {radioValue} = this.state;
        const breadCrumbArray = getBreadCrumbArray([{name: 'Advisor Dashboard'}]);
        const button = !this.state.showEmptyScreen ? {route: '/advisordashboard/createadvice', title: 'Create Advice'} : null;
        if (this.state.notAuthorized) {
            return <ForbiddenAccess />
        } else {
            return (
                <Row>
                    <AqPageHeader title="Advisor Dashboard" breadCrumbs = {breadCrumbArray} />
                {
                    this.state.showEmptyScreen
                    ?   <Row>
                            <Col span={24} style={emptyPortfolioStyle}>
                                <h1>You have not created any advices yet. Get started by creating One</h1>
                                <Button 
                                        type="primary" 
                                        onClick={() => this.props.history.push('/advisordashboard/createadvice')}
                                        style={{marginTop: '20px'}}
                                >
                                    Create Advice
                                </Button>
                            </Col>
                        </Row>
                    :   <Row style={{paddingBottom: '20px', marginTop: '-20px'}}>
                            {this.renderFilterModal()}
                            <Col span={24} style={{marginTop: '10px'}}>
                                <Row gutter={12}>
                                    <Col xl={12} lg={24}>
                                        <DashboardCard 
                                                headerStyle={headerStyle}
                                                title=" MY ADVICES"
                                                cardStyle={{marginTop:'10px', height:'425px'}}  
                                                menu={this.renderSortingMenu()}
                                                loading={this.state.myAdvicesLoading}
                                                contentStyle={{height: '90%', overflow: 'hidden', overflowY: 'scroll'}}
                                        >
                                            {this.renderAdvices()}
                                        </DashboardCard>
                                    </Col>
                                    <Col xl={12} lg={24}>
                                        <DashboardCard 
                                                headerStyle={headerStyle}
                                                cardStyle={{marginTop:'10px', height:'425px'}} 
                                                title="PERFORMANCE CHART" 
                                                menu={this.renderAdvicesMenu(this.handleSelectAdvicePerformance, 0 ,5)}
                                                loading={this.state.advicePerformanceLoading}
                                        >
                                            <Col
                                                    style={{paddingLeft: '20px', paddingTop: '10px'}}
                                            >
                                                <MyChartNew series={this.state.tickers} />
                                            </Col>
                                        </DashboardCard>
                                    </Col>
                                </Row>
                                <Row gutter={12}>
                                    <Col xl={12} lg={24} style={{marginTop: '12px'}}>
                                        <Row style={{height: '380px', ...shadowBoxStyle, ...noOverflowStyle}}>
                                            <Col span={24}>
                                                {this.renderSubscriberStatsView()}
                                            </Col>
                                        </Row>
                                    </Col>
                                    <Col xl={12} lg={24} style={{marginTop: '12px'}}>
                                        <Spin spinning={this.state.dashboardDataLoading}>
                                            <Row style={{height: '380px', ...shadowBoxStyle, ...noOverflowStyle}}>
                                                <Col span={24}>
                                                    <Tabs size="small" defaultActiveKey="1" animated={false} tabBarStyle={{backgroundColor: tabBackgroundColor}}>
                                                        <TabPane key="1" tab="Advice Rating">
                                                            {/* <Row type="flex" align="middle">
                                                                <Col span={6} offset={18}>
                                                                    {this.renderAdvicesMenu(this.handleSelectAdvice)}
                                                                </Col>
                                                            </Row> */}
                                                            <Row style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                                <Col span={12}>
                                                                    <HighChartSpline id="advice-rating-chart" series={this.state.adviceRating}/>
                                                                </Col>
                                                                <Col span={10} style={{marginRight: '20px', marginTop: '-20px'}}>
                                                                    <Row type="flex" align="middle">
                                                                        <Col span={24}>
                                                                            {this.renderAdvicesMenu(this.handleSelectAdvice, -20)}
                                                                        </Col>
                                                                        <StatsMetricItem style={{marginTop: '30px'}} label="Current Rating" value={this.state.ratingStats.currentRating}/>
                                                                        <StatsMetricItem label="Simulated Rating" value={this.state.ratingStats.simulatedRating}/>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        </TabPane>
                                                        <TabPane key="2" tab="Advisor Rating">
                                                            <Row style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                                <Col span={12}>
                                                                    <HighChartSpline id="advisor-rating-chart" series={this.state.advisorRating}/>
                                                                </Col>
                                                                <Col span={10} style={{marginRight: '20px', marginTop: '-20px'}}>
                                                                    <Row type="flex" align="middle">
                                                                        <StatsMetricItem label="Rating" value={this.state.advisorRatingStat}/>
                                                                    </Row>
                                                                </Col>
                                                            </Row>
                                                        </TabPane>
                                                    </Tabs>
                                                </Col>
                                            </Row>
                                        </Spin>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                }
                </Row>
            );
        }
    }

    render() {
        return(
            <Row>
                <Loading 
                    show={this.state.show}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                {
                    !this.state.show &&
                    this.renderPageContent() 
                }
            </Row>
        );
    }
}

const StatsMetricItem = ({label, value, style}) => {
    return (
        <Col span={14} offset={10} style={{textAlign: 'right', marginBottom: '10px', ...style}}>
            <h3 style={metricValueStyle}>{value}</h3>
            <h3 style={metricLabelStyle}>{label}</h3>
        </Col>
    );
};

const cardHeaderStyle = {
    marginTop: '10px',
    marginLeft: '10px'
};

const metricValueStyle = {
    color: '#26BABC',
    fontSize: '35px',
    fontWeight: 700
};

const metricLabelStyle = {
    color: '#6C6C6C',
    fontSize: '19px'
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