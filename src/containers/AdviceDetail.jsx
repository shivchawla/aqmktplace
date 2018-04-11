import * as React from 'react';
import axios from 'axios';
import SkyLight from 'react-skylight';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Divider, Tabs, Button, Modal, message, Card, Rate, Collapse} from 'antd';
import {newLayoutStyle, metricsHeaderStyle, pageHeaderStyle, dividerNoMargin, loadingColor, pageTitleStyle, shadowBoxStyle} from '../constants';
import {UpdateAdvice} from './UpdateAdvice';
import {AqTableMod, AqPortfolioTable, AqHighChartMod, MetricItem, AqCard, HighChartNew, HighChartBar, AdviceMetricsItems, StockResearchModal, BreadCrumb} from '../components';
import {MyChartNew} from './MyChartNew';
import {AdviceDetailCrumb} from '../constants/breadcrumbs';
import {generateColorData, Utils, getBreadCrumbArray} from '../utils';
import '../css/adviceDetail.css';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const {aimsquantToken, requestUrl, investorId} = require('../localConfig.js');
const dateFormat = 'Do MMMM YYYY';

class AdviceDetailImpl extends React.Component {
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
                annualReturn: 0,
                dailyChange: 0,
                netValue: 0,
                totalReturn: 0,
                netValue: 0
            },
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
            stockResearchModalVisible: false,
            stockResearchModalTicker: 'TCS'
        };
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
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
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
            portfolio,
            performanceSummary
        } = response.data;
        const {annualReturn, dailyChange, netValue, totalReturn} = _.get(performanceSummary, 'current', {});
        const benchmark = _.get(portfolio, 'benchmark.ticker', 'N/A');
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
            },
            metrics: {
                ...this.state.metrics,
                annualReturn,
                totalReturn,
                dailyChange,
                netValue
            }
        });
    }

    getAdviceDetail = response => {
        const portfolio = {...this.state.portfolio};
        const positions = _.get(response.data, 'detail.positions', []);
        const {maxNotional, rebalance} = response.data;
        this.setState({
            positions, 
            adviceDetail: {
                ...this.state.adviceDetail,
                maxNotional,
                rebalance
            },
            portfolio: response.data.portfolio
        });
    }

    getAdvicePerformance = response => {
        const tickers = [...this.state.tickers];
        if (response.data.simulated) {
            tickers.push({
                name: 'ADVICE SIM',
                data: this.processPerformanceData(_.get(response.data, 'simulated.portfolioValues', []))
            });
        }
        if (response.data.current) {
            tickers.push({
                name: 'ADVICE CURR',
                data: this.processPerformanceData(_.get(response.data, 'current.portfolioValues', []))
            });
        }
        this.setState({tickers});
    }

    processPerformanceData = performanceData => {
        return performanceData.map(item => {
            return ([moment(item.date).valueOf(), Number(item.netValue.toFixed(2))])
        })
    }

    getAdviceData = () => {
        const adviceId = this.props.match.params.id;
        const url = `${requestUrl}/advice/${adviceId}`;
        const performanceUrl = `${requestUrl}/performance/advice/${adviceId}`;
        let positions = [];
        this.setState({show: true});
        axios.get(url, {headers: Utils.getAuthTokenHeader()}
        )
        .then(response => {
            this.getAdviceSummary(response);
            return axios.get(`${url}/portfolio`, {headers: Utils.getAuthTokenHeader()});
        })
        .then(response => {
            this.getAdviceDetail(response);
            positions = _.get(response.data, 'detail.positions', []).map(item => item.security.ticker);
            return axios.get(performanceUrl, {headers: Utils.getAuthTokenHeader()});
        })
        .then(response => {
            const series = [];
            const colorData = generateColorData(positions);
            this.getAdvicePerformance(response);
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
            });
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
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

    renderAdviceMetrics = () => {
        const {annualReturn, dailyChange, netValue, totalReturn} = this.state.metrics;
        const {followers, subscribers, rating} = this.state.adviceDetail;
        const positiveColor = '#8BC34A';
        const negativeColor = '#F44336';
        const metricsItems = [
            {value: subscribers, label: 'Subscribers'},
            {value: followers, label: 'Followers'},
            {value: Number(netValue.toFixed(2)), label: 'Net Value'},
            {value: dailyChange, label: 'Daily Change'},
            {value: totalReturn, label: 'Total Return', percentage: true, color: true},
            {value: annualReturn, label: 'Annual Return', percentage: true, color:true},
        ]

        return <AdviceMetricsItems metrics={metricsItems} />
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
            this.getAdviceData();
            message.success('Success');
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
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
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            this.getAdviceData();
            message.success('Success');
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
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
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        });
    };

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            this.getUserData();
            this.getAdviceData();
        }
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
                        Update Advice
                    </Button>
                </Col>
            </Row>
        );  
    };

    handleChange = value => {
        this.setState({selectedValue: value});
    }

    updateTicker = record => {
        this.setState({stockResearchModalTicker: record}, () => {
            this.toggleModal();
        });
    }

    toggleModal = ticker => {
        this.setState({stockResearchModalVisible: !this.state.stockResearchModalVisible});        
    }

    

    renderPageContent = () => {
        const {name, heading, description, advisor, updatedDate} = this.state.adviceDetail;
        const {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;
        const breadCrumbs = getBreadCrumbArray(AdviceDetailCrumb, [
            {name, url: '#'}
        ]);

        return (
            <Row>
                <Col span={24}>
                    <h1 style={pageTitleStyle}>{name}</h1>
                </Col>
                <Col span={24}>
                    <BreadCrumb breadCrumbs={breadCrumbs}/>
                </Col>
                <Col span={18} style={shadowBoxStyle}>
                    <StockResearchModal 
                            ticker={this.state.stockResearchModalTicker} 
                            visible={this.state.stockResearchModalVisible}
                            toggleModal={this.toggleModal}
                    />
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
                            <Rate value={this.state.adviceDetail.rating} disabled allowHalf/>
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
                                            {/* <ReactHighcharts config = {this.state.performanceConfig} /> */}
                                            <Col span={24} style={{paddingTop: '10px'}}>
                                                <HighChartBar 
                                                        dollarSeries={this.state.barDollarSeries} 
                                                        percentageSeries={this.state.barPercentageSeries}
                                                />
                                            </Col>
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
                                        <Tabs animated={false} defaultActiveKey="2">
                                            <TabPane tab="Performance" key="1" className="row-container">
                                                <MyChartNew series={this.state.tickers} />
                                            </TabPane>
                                            <TabPane tab="Portfolio" key="2" className="row-container">
                                                <AqPortfolioTable 
                                                        positions={this.state.positions} 
                                                        updateTicker={this.updateTicker}
                                                />
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

    render() { 
        return (
           <Row style={{marginTop: '20px'}}>
                <Loading
                    show={this.state.show}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
               {this.renderModal()}
               {this.renderUpdateModal()}
               {
                    !this.state.show &&
                    this.renderPageContent()
               }
               
           </Row>
        );
    }
}

export const AdviceDetail = withRouter(AdviceDetailImpl);

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