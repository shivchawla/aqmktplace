import * as React from 'react';
import axios from 'axios';
import SkyLight from 'react-skylight';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Divider, Tabs, Button, Modal, message, Card, Rate, Collapse} from 'antd';
import {newLayoutStyle, metricsHeaderStyle, pageHeaderStyle, dividerNoMargin} from '../constants';
import {UpdateAdvice} from './UpdateAdvice';
import {AqTableMod, AqPortfolioTable, AqHighChartMod, MetricItem, AqCard, HighChartNew} from '../components';
import {MyChartNew} from './MyChartNew';
import '../css/adviceDetail.css';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const {aimsquantToken, requestUrl, investorId} = require('../localConfig.js');
const ReactHighcharts = require('react-highcharts');
const dateFormat = 'Do MMMM YYYY';

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
                totalReturns: 0,
                averageReturns: 0,
                dailyReturns: 0,
                annualReturn: 0
            },
            portfolioArray: [],
            tickers: [],
            isDialogVisible: false,
            isUpdateDialogVisible: false,
            userId: '',
            adviceResponse: {},
            portfolio: {},
            disableSubscribeButton: false,
            disableFollowButton: false,
            series: [],
            performanceConfig: {
                colors: ["#e91e63", "#444", "#90ed7d", "#f7a35c", "#8085e9"],
                chart: {
                    type: 'bar',
                    // width: 300,
                    height: 280
                },
                yAxis: {
                    labels: {
                        enabled: true
                    },
                    title: {
                        enabled: false
                    },
                    gridLineColor: 'transparent',
                },
                xAxis: {
                    title: {
                        enabled: false
                    },
                    gridLineColor: 'transparent',
                },
                title: {
                    style: {
                        display: 'none'
                    }
                },
                legend: {
                    layout: 'vertical',
                    align: 'right',
                    itemDistance: '30px',
                    itemStyle: {
                        color: '#444',
                        fontSize:'12px',
                        fontWeight: '400',
                    },
                    itemWidth: 100,
                    verticalAlign: 'middle',
                    itemMarginBottom:10
                },
                credits: {
                    enabled: false
                },
                series: []
            }
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
            this.getAdviceData();
            message.success('Advice successfully made Public');
        })
        .catch(error => {
            console.log(error.message);
        });
    };

    getAdviceSummary = response => {
        const tickers = [...this.state.tickers];
        const {
            name, 
            description, 
            heading, 
            advisor, 
            updatedDate, 
            rating, 
            isSubscribed, 
            isFollowing, 
            isOwner,
            numSubscribers,
            numFollowers,
            portfolio
        } = response.data;
        const benchmark = portfolio.benchmark.ticker;
        tickers.push({name: benchmark});
        this.setState({
            tickers,
            adviceResponse: response.data,
            adviceDetail: {
                ...this.state.adviceDetail, 
                name, 
                description, 
                heading,
                advisor,
                subscribers: numSubscribers,
                isSubscribed,
                isOwner,
                isFollowing,
                followers: numFollowers,
                updatedDate: moment(updatedDate).format(dateFormat),
                rating: Number(rating.current.toFixed(0)),
                isPublic: response.data.public
            }
        });
    }

    getAdviceDetail = response => {
        console.log('Advice Detail Reponse', response.data);
        let portfolioArray = [...this.state.portfolioArray]; 
        const portfolio = {...this.state.portfolio};
        const subPositions = response.data.detail.positions;
        const {maxNotional, rebalance} = response.data;
        subPositions.map((position, index) => {
            portfolioArray.push({
                key: index,
                name: position.security.detail.Nse_Name,
                weight: 0,
                sector: position.security.detail.Sector,
                price: position.lastPrice.toFixed(2),
                shares: position.quantity,
                symbol: position.security.ticker,
            });
        });
        portfolioArray = this.updateWeights(portfolioArray);
        this.setState({
            portfolioArray, 
            adviceDetail: {
                ...this.state.adviceDetail,
                maxNotional,
                rebalance
            },
            portfolio: response.data.portfolio
        });
    }

    updateWeights = portfolioArray => {
        return portfolioArray.map(item => {
            const price = Number(item.price);
            const shares = Number(item.shares);
            return {
                ...item,
                weight: Number(((price * shares) / this.getTotalWeight(portfolioArray)).toFixed(2))
            }
        });
    }

    getTotalWeight = portfolioArray => {
        let totalWeight = 0;
        portfolioArray.map(item => {
            totalWeight += Number(item.price) * Number(item.shares);
        });

        return totalWeight;
    }

    getAdvicePerformance = response => {
        const tickers = [...this.state.tickers];
        if (response.data.simulated) {
            const {
                annualreturn, 
                averagedailyreturn, 
                dailyreturn, 
                totalreturn
            } = response.data.current.metrics.portfolioPerformance.returns;
            tickers.push({
                name: 'ADVICE SIM',
                data: this.processPerformanceData(response.data.simulated.portfolioValues)
            });
            tickers.push({
                name: 'ADVICE CURR',
                data: this.processPerformanceData(response.data.current.portfolioValues)
            });
            this.setState({
                metrics: {
                    ...this.state.metrics,
                    annualReturn: annualreturn,
                    totalReturns: totalreturn,
                    averageReturns: averagedailyreturn,
                    dailyReturns: dailyreturn
                },
                tickers
            });
        }
    }

    processPerformanceData = performanceData => {
        return performanceData.map(item => {
            return ([moment(item.date).valueOf(), item.netValue])
        })
    }

    getAdviceData = () => {
        const adviceId = this.props.match.params.id;
        const url = `${requestUrl}/advice/${adviceId}`;
        const performanceUrl = `${requestUrl}/performance/advice/${adviceId}`
        axios.get(url, {
            headers: {
                'aimsquant-token': aimsquantToken
            }
        })
        .then(response => {
            this.getAdviceSummary(response);
            return axios.get(`${url}/portfolio`, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => {
            this.getAdviceDetail(response);
            return axios.get(performanceUrl, {headers: {'aimsquant-token': aimsquantToken}});
        })
        .then(response => {
            const series = [];
            this.getAdvicePerformance(response);
            const portfolioComposition = response.data.current.metrics.portfolioMetrics.composition.map((item, index) =>{
                return {name: item.ticker, y: Math.round(item.weight * 10000) / 100};
            });
            const constituentDollarPerformance = response.data.current.metrics.constituentPerformance.map((item, index) => {
                return {name: item.ticker, data: [item.pnl]}
            });
            series.push({name: 'Composition', data: portfolioComposition});
            this.setState({
                series,
                performanceConfig: {
                    ...this.state.performanceConfig,
                    series: constituentDollarPerformance
                }
            });
        })
        .catch((error) => {
            console.log(error);
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

    renderAdviceMetrics = () => {
        let {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;
        console.log(this.state.metrics);
        const {followers, subscribers, rating} = this.state.adviceDetail;
        const positiveColor = '#8BC34A';
        const negativeColor = '#F44336';
        const metricsItems = [
            {value: subscribers, label: 'Subscribers', valueColor: '#353535'},
            {value: followers, label: 'Followers', valueColor: '#353535'},
            {value: totalReturns, label: 'Total Returns', valueColor: totalReturns >= 0 ? positiveColor : negativeColor, percentage: true},
            {value: averageReturns, label: 'Avg Daily Returns', valueColor: averageReturns >= 0 ? positiveColor : negativeColor, percentage: true},
            {value: annualReturn, label: 'Annual Return', valueColor: annualReturn >= 0 ? positiveColor : negativeColor, percentage: true},
            // {value: dailyreturns, label: 'Daily Returns', valueColor: dailyreturns > 0 ? positiveColor : negativeColor},
        ]

        return (
            <Row>
                {
                    metricsItems.map((item, index) => {
                        const value = item.percentage ? `${(item.value * 100).toFixed(2)} %` : item.value;
                        return (
                            <MetricItem 
                                    valueStyle = {{...valueStyle, color: item.valueColor}} 
                                    labelStyle={labelStyle} 
                                    value={value} 
                                    label={item.label} 
                                    style={metricItemStyle} 
                            />
                        );
                    })
                }
                {/* <MetricItem 
                        valueStyle = {valueStyle} 
                        labelStyle={labelStyle} 
                        value={subscribers} 
                        label="Subscribers" 
                        style={{border: 'none'}} 
                />
                <MetricItem 
                        valueStyle = {valueStyle} 
                        labelStyle={labelStyle} 
                        value={followers} 
                        label="Followers" 
                        style={{border: 'none'}} 
                />
                <MetricItem 
                        valueStyle = {valueStyle} 
                        labelStyle={labelStyle} 
                        value={totalReturns} 
                        label="Total Returns" 
                        style={metricItemStyle} 
                />
                <MetricItem 
                        valueStyle = {valueStyle} 
                        labelStyle={labelStyle} 
                        value={averageReturns} 
                        label="Average Daily Return" 
                        style={metricItemStyle} 
                />
                <MetricItem 
                        valueStyle = {valueStyle} 
                        labelStyle={labelStyle} 
                        value={annualReturn} 
                        label="Annual Return" 
                        style={metricItemStyle} 
                />
                <MetricItem 
                        valueStyle = {valueStyle} 
                        labelStyle={labelStyle} 
                        value={dailyReturns} 
                        label="Daily Return" 
                        style={metricItemStyle} 
                /> */}
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
            headers: {'aimsquant-token': aimsquantToken}
        })
        .then(response => {
            this.toggleDialog();
            this.getAdviceData();
            message.success('Success');
        })
        .catch(error => {
            message.error('Error Occured');
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
            this.getAdviceData();
            message.success('Success');
        })
        .catch(error => {
            message.error('Error occured');
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
        this.getAdviceData();
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
                                style={{width: 170}} 
                                type="primary" 
                                className="primary-btn"
                                disabled={this.state.disableSubscribeButton}
                        >
                            {!this.state.adviceDetail.isSubscribed ? "Subscribe" : "Unsubscribe"}
                        </Button>
                    </Col>
                    <Col span={24}>
                        <Button 
                                onClick={this.followAdvice} 
                                style={{width: 170, marginTop: 10}} 
                                className="secondary-btn"
                                disabled={this.state.disableFollowButton}
                        >
                            {!this.state.adviceDetail.isFollowing ? "Add to wishlist" : "Remove from wishlist"}
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
                    <Button 
                            onClick={() => this.props.history.push(`/dashboard/updateadvice/${this.props.match.params.id}`)} 
                            style={{width: 150, marginTop: 10}}
                    >
                        Update Portfolio
                    </Button>
                </Col>
            </Row>
        );  
    };

    render() { 
        const {name, heading, description, advisor, updatedDate} = this.state.adviceDetail;
        const {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;
   
        return (
           <Row style={{marginTop: '20px'}}>
               {this.renderModal()}
               {this.renderUpdateModal()}
               <Col span={18} style={newLayoutStyle}>
                    <Row className="row-container">
                        <Col span={18}>
                            <h1 style={adviceNameStyle}>{name}</h1>
                            {
                                advisor.user &&
                                <h5 style={userStyle}>
                                    By {advisor.user.firstName} {advisor.user.lastName} 
                                    <span style={dateStyle}>{updatedDate}</span>
                                </h5>
                            }
                            <Rate value={this.state.rating} disabled allowHalf/>
                        </Col>
                        <Col span={4} offset={2}>
                            {this.renderActionButtons()}
                        </Col>
                    </Row>
                    <Row className="row-container">
                        {this.renderAdviceMetrics()}
                    </Row>
                    <Row>
                        <Col span={24} style={dividerStyle}></Col>
                    </Row>
                    <Collapse bordered={false} defaultActiveKey={["3"]}>
                        <Panel 
                                key="1"
                                style={customPanelStyle} 
                                header={<h3 style={metricsHeaderStyle}>Description</h3>}
                        >
                            <Row className="row-container">
                                <Col span={24}>
                                    <h5 style={{...textStyle, marginTop: '-10px', marginLeft: '20px'}}>{description}</h5>
                                </Col>
                            </Row>
                        </Panel>
                        {
                            (this.state.adviceDetail.isSubscribed || this.state.adviceDetail.isOwner) && 
                            <Panel
                                    key="2"
                                    style={customPanelStyle} 
                                    header={<h3 style={metricsHeaderStyle}>Advice Summary</h3>}
                            >
                                <Row className="row-container">
                                    <Col span={24}>
                                        <AqCard title="Portfolio Summary">
                                            <HighChartNew series = {this.state.series} />
                                        </AqCard>
                                        <AqCard title="Performance Summary" offset={2}>
                                            <ReactHighcharts config = {this.state.performanceConfig} />
                                        </AqCard>
                                    </Col>
                                </Row>
                            </Panel>
                        }
                        {
                            (this.state.adviceDetail.isSubscribed || this.state.adviceDetail.isOwner) && 
                            <Panel
                                    key="3"
                                    style={customPanelStyle} 
                                    header={<h3 style={metricsHeaderStyle}>Detail</h3>}
                            >
                                <Row>
                                    <Col span={24}>
                                        <Tabs animated={false} defaultActiveKey="1">
                                            <TabPane tab="Performance" key="1" className="row-container">
                                                <MyChartNew series={this.state.tickers} />
                                            </TabPane>
                                            <TabPane tab="Portfolio" key="2" className="row-container">
                                                <AqPortfolioTable data={this.state.portfolioArray} />
                                            </TabPane>
                                        </Tabs>
                                    </Col>
                                </Row>
                            </Panel>
                        }
                    </Collapse>
               </Col>
           </Row>
        );
    }
}

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