import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Divider, Tabs, Button, Modal} from 'antd';
import {layoutStyle} from '../constants';
import {UpdateAdvice} from './UpdateAdvice';
import {AqTableMod, AqPortfolioTable, AqHighChartMod} from '../components';

const TabPane = Tabs.TabPane;

const {aimsquantToken, requestUrl, investorId} = require('../localConfig.js');
const dateFormat = 'YYYY-MM-DD';

export class AdviceDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            adviceDetail: {
                name: 'Advice Name',
                description: '',
                heading: '',
                advisor: {},
                updatedDate: '',
                followers: -1,
                rating: 0,
                subscribers: -1,
                maxNotional: 300000,
                rebalance: '',
                isPublic: false,
                isOwner: false,
                isSubscribed: false,
                isFollowing: false
            },
            metrics: {
                totalReturns: -1,
                averageReturns:-1,
                dailyReturns: -1,
                annualReturn: -1
            },
            portfolioArray: [],
            tickers: [],
            isDialogVisible: false,
            isUpdateDialogVisible: false,
            userId: '',
            adviceResponse: {},
            portfolio: {},
            disableSubscribeButton: false,
            disableFollowButton: false
        };
    }

    makeAdvicePublic = () => {
        const url = `${requestUrl}/advice/${this.props.match.params.id}/publish`;
        axios({
            method: 'POST',
            url,
            headers: {'aimsquant-token': aimsquantToken},
        })
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log(error.message);
        });
    };

    getAdviceDetail = () => {
        const adviceId = this.props.match.params.id;
        const url = `${requestUrl}/advice/${adviceId}`;
        const performanceUrl = `${requestUrl}/performance/advice/${adviceId}`
        axios.get(url, {
            headers: {
                'aimsquant-token': aimsquantToken
            }
        })
        .then((response) => {
            const {name, description, heading, advisor, updatedDate, analytics, isSubscribed, isFollowing, isOwner} = response.data;
            this.setState({
                adviceResponse: response.data,
                adviceDetail: {
                    ...this.state.adviceDetail, 
                    name, 
                    description, 
                    heading,
                    advisor,
                    subscribers: analytics[0].numSubscribers,
                    isSubscribed,
                    isOwner,
                    isFollowing,
                    followers: analytics[0].numFollowers,
                    updatedDate: moment(updatedDate).format(dateFormat),
                    rating: analytics[0].rating,
                    isPublic: response.data.public
                }
            });

            return axios.get(performanceUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then((response) => {
            // const {annualreturn, averagedailyreturn, dailyreturn, totalreturn} = response.data.analytics.returns;
            // this.setState({
            //     metrics: {
            //         ...this.state.metrics,
            //         annualReturn: annualreturn,
            //         totalReturns: totalreturn,
            //         averageReturns: averagedailyreturn,
            //         dailyReturns: dailyreturn
            //     }
            // });

            return axios.get(`${url}/detail`, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => {
            console.log(response.data);
            const portfolioArray = [...this.state.portfolioArray]; 
            const tickers = [...this.state.tickers];
            const portfolio = {...this.state.portfolio};
            const subPositions = response.data.portfolio.detail.subPositions;
            const {maxNotional, rebalance} = response.data;
            subPositions.map((position, index) => {
                portfolioArray.push({
                    key: index,
                    no: index + 1,
                    shares: position.quantity,
                    symbol: position.security.ticker,
                    country: position.security.country,
                    exchange: position.security.exchange,
                    securityType: position.security.securityType
                });
                tickers.push({name: position.security.ticker});
            });
            this.setState({
                portfolioArray, 
                tickers,
                adviceDetail: {
                    ...this.state.adviceDetail,
                    maxNotional,
                    rebalance
                },
                portfolio: response.data.portfolio
            });
        })
        .catch((error) => {
            console.log(error.data);
        });
    };

    renderAdviceData = () => {
        const {followers, subscribers, rating} = this.state.adviceDetail;
        return (
            <Col span={18}>
                <Row>
                    <CardItem value={followers} label="Followers"/>
                    <CardItem value={rating} label="Average Rating"/>
                    <CardItem value={subscribers} label="Subscribers"/>
                </Row>
            </Col>
        );
    };

    renderAdviceMetrics = () => {
        const {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;
        
        return (
            <Col span={24}>
                <Row>
                    <CardItem value={totalReturns} label="Total Returns"/>
                    <CardItem value={averageReturns} label="Average Daily Return"/>
                    <CardItem value={annualReturn} label="Annual Return"/>
                    <CardItem value={dailyReturns} label="Daily Return"/>
                </Row>
            </Col>
        );
    };

    toggleDialog = () => {
        const {adviceDetail} = this.state;
        console.log(adviceDetail.advisor.user._id);
        this.setState({isDialogVisible: !this.state.isDialogVisible});
    };

    subscribeAdvice = () => {
        this.setState({disableSubscribeButton: true});
        axios({
            method: 'POST',
            url: `${requestUrl}/advice/${this.props.match.params.id}/subscribe`,
            headers: {'aimsquant-token': aimsquantToken}
        })
        .then(response => {
            this.toggleDialog();
            this.getAdviceDetail();
        })
        .catch(error => {
            console.log(error.message);
        })
        .finally(() => {
            this.setState({disableSubscribeButton: false});
        });
    };

    followAdvice = () => {
        this.setState({disableFollowButton: true});
        axios({
            method: 'POST',
            url: `${requestUrl}/advice/${this.props.match.params.id}/follow`,
            headers: {'aimsquant-token': aimsquantToken}
        })
        .then(response => {
            this.getAdviceDetail();
        })
        .catch(error => {
            console.log(error.message);
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
                        this.state.isSubscribed
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
                    title="Update Portfolio"
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
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const userId = response.data._id;
            this.setState({userId});
        });
    };

    componentWillMount() {
        this.getUserData();
        this.getAdviceDetail();
    } 

    renderActionButtons = () => {
        const {userId} = this.state;
        let advisorId = this.state.adviceDetail.advisor.user ? this.state.adviceDetail.advisor.user._id: '';
        if (userId !== advisorId) {
            return (
                <Row>
                    <Col span={24}>
                        <Button 
                                onClick={this.toggleDialog} 
                                style={{width: 150}} 
                                type="primary" 
                                disabled={this.state.disableSubscribeButton}
                        >
                            {!this.state.isSubscribed ? "Subscribe" : "Unsubscribe"}
                        </Button>
                    </Col>
                    <Col span={24}>
                        <Button 
                                onClick={this.followAdvice} 
                                style={{width: 150, marginTop: 10}} 
                                disabled={this.state.disableFollowButton}
                        >
                            {!this.state.isFollowing ? "Follow" : "Unfollow"}
                        </Button>
                    </Col>
                </Row>
            );
        }

        return (
            <Row>
                <Col span={24}>
                    {
                        !this.state.adviceDetail.isPublic 
                        && <Button onClick={this.makeAdvicePublic} style={{width: 150}} type="primary">Publish</Button>}
                </Col>
                <Col span={24}>
                    <Button onClick={this.toggleUpdateDialog} style={{width: 150, marginTop: 10}}>Update Portfolio</Button>
                </Col>
            </Row>
        );  
    };

    render() { 
        const {name, heading, description, advisor, updatedDate} = this.state.adviceDetail;
        const {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;

        return (
           <Row>
               {this.renderModal()}
               {this.renderUpdateModal()}
               <Col span={18} style={layoutStyle}>
                    <Row>
                        <Col span={18}>
                            <h1 style={headerStyle}>{name}</h1>
                            {
                                advisor.user &&
                                <h5>By {advisor.user.firstName} {advisor.user.lastName} - {updatedDate}</h5>
                            }
                            <h5>{heading}</h5>
                        </Col>
                        <Col span={6}>
                            {this.renderActionButtons()}
                        </Col>
                    </Row>
                    <Row>
                        {this.renderAdviceData()}
                    </Row>
                    <DividerItem />
                    <Row>
                        <Col span={24}>
                            <h3 style={labelStyle}>Description</h3>
                            <h5>{description}</h5>
                        </Col>
                    </Row>
                    <DividerItem />
                    <Row>
                        <Col span={24}>
                            <h3 style={labelStyle}>Metrics</h3>
                        </Col>
                        <h3>{}</h3>
                        {this.renderAdviceMetrics()}
                    </Row>
                    <DividerItem />
                    <Row>
                        <Col span={24}>
                                <h3>Advice Summary</h3>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tabs>
                                <TabPane tab="Performance" key="1">
                                    <AqHighChartMod tickers={this.state.tickers} />
                                </TabPane>
                                <TabPane tab="Portfolio" key="2">
                                    <AqPortfolioTable data={this.state.portfolioArray} />
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
               </Col>
           </Row>
        );
    }
}

const CardItem = (props) => {
    return (
        <Col span={6}>
            <h2>{props.value}</h2>
            <h5>{props.label}</h5>
        </Col>
    );
};

const DividerItem = () => (
    <Row>
        <Col span={24}>
            <Divider />
        </Col>
    </Row>
);

const headerStyle = {
    fontSize: '20px'
};

const labelStyle = {
    fontsize: '18px'
};

const cardItemStyle = {
    border: '1px solid #444'
};