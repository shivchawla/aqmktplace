import * as React from 'react';
import axios from 'axios';
import SkyLight from 'react-skylight';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Divider, Tabs, Button, Modal, message, Card, Rate, Collapse, DatePicker} from 'antd';
import {currentPerformanceColor, simulatedPerformanceColor, newLayoutStyle, metricsHeaderStyle, pageHeaderStyle, dividerNoMargin, loadingColor, pageTitleStyle, shadowBoxStyle, benchmarkColor, statusColor} from '../constants';
import {UpdateAdvice} from './UpdateAdvice';
import {AqTableMod, AqStockPortfolioTable, AqHighChartMod, MetricItem, AqCard, HighChartNew, HighChartBar, AdviceMetricsItems, StockResearchModal, AqPageHeader, StatusBar} from '../components';
import {MyChartNew} from './MyChartNew';
import {AdviceDetailCrumb} from '../constants/breadcrumbs';
import {generateColorData, Utils, getBreadCrumbArray, convertToDecimal} from '../utils';
import '../css/adviceDetail.css';

const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;

const {aimsquantToken, requestUrl} = require('../localConfig.js');
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
                dailyChangePct: 0,
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
            stockResearchModalTicker: 'TCS',
            selectedPortfolioDate: moment()
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
            console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    };

    getAdviceSummary = response => {
        const tickers = [];
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
            numSubscribers,
            numFollowers,
            portfolio,
            performanceSummary
        } = response.data;
        const {annualReturn, dailyChange, dailyChangePct, netValue, totalReturn} = _.get(performanceSummary, 'current', {});
        const benchmark = _.get(portfolio, 'benchmark.ticker', 'N/A');
        tickers.push({name: benchmark, color: benchmarkColor});
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
                rating: Number(rating.current.toFixed(2)),
                isPublic: response.data.public
            },
            metrics: {
                ...this.state.metrics,
                annualReturn,
                totalReturn,
                dailyChange,
                dailyChangePct,
                netValue
            }
        });
    }

    getAdviceDetail = response => {
        const portfolio = {...this.state.portfolio};
        const positions = _.get(response.data, 'detail.positions', []);
        const {maxNotional, rebalance} = response.data;
        console.log('Advice Detail', response.data);
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

    getAdvicePerformance = (response, series = []) => {
        const tickers = [...this.state.tickers];
        if (response.data.simulated) {
            tickers.push({
                name: 'ADVICE SIM',
                data: this.processPerformanceData(_.get(response.data, 'simulated.portfolioValues', [])),
                color: simulatedPerformanceColor
            });
        }
        if (response.data.current) {
            tickers.push({
                name: 'ADVICE CURR',
                data: this.processPerformanceData(_.get(response.data, 'current.portfolioValues', [])),
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

    getAdviceData = (startDate = moment().format('YYYY-MM-DD')) => {
        const adviceId = this.props.match.params.id;
        const url = `${requestUrl}/advice/${adviceId}`;
        const performanceUrl = `${requestUrl}/performance/advice/${adviceId}`;
        let positions = [];
        this.setState({show: true});
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.getAdviceSummary(response);
            return axios.get(`${url}/portfolio?date=${startDate}`, {headers: Utils.getAuthTokenHeader()});
        })
        .then(response => {
            this.getAdviceDetail(response);
            positions = _.get(response.data, 'detail.positions', []).map(item => item.security.ticker);
            return axios.get(performanceUrl, {headers: Utils.getAuthTokenHeader()});
        })
        .then(response => {
            const series = [];
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
            this.getAdvicePerformance(response, series);
            this.setState({
                series,
                barDollarSeries: constituentDollarPerformance,
                barPercentageSeries: constituentPercentagePerformance
            });
        })
        .catch(error => {
            this.setState({
                positions: [],
                series: []
            });
            console.log(error);
            if (error.response) {
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

    renderAdviceMetrics = () => {
        const {annualReturn, dailyChange, dailyChangePct, netValue, totalReturn} = this.state.metrics;
        const {followers, subscribers} = this.state.adviceDetail;
        const metricsItems = [
            {value: subscribers, label: 'Subscribers'},
            {value: followers, label: 'Wishlisters'},
            {value: totalReturn, label: 'Total Return', percentage: true, color: true, fixed: 2},
            {value: dailyChange, label: 'Daily PnL (\u20B9)', color: true, fixed: Math.round(dailyChange) == dailyChange ? 0 : 2},
            {value: dailyChangePct, label: 'Daily PnL (%)', percentage: true, color: true, fixed: 2},
            {value: netValue, label: 'Net Value (\u20B9)', fixed: Math.round(netValue) == netValue ? 0 : 2},
        ]

        return <AdviceMetricsItems metrics={metricsItems} />
    };

    toggleDialog = () => {
        const {adviceDetail} = this.state;
        this.setState({isDialogVisible: !this.state.isDialogVisible});
    };

    subscribeAdvice = () => {
        const url = `${requestUrl}/advice/${this.props.match.params.id}`;
        this.setState({disableSubscribeButton: true});
        axios({
            method: 'POST',
            url: `${requestUrl}/advice/${this.props.match.params.id}/subscribe`,
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            this.toggleDialog();
            // this.getAdviceData();
            message.success('Success');
            return axios.get(url, {headers: Utils.getAuthTokenHeader()})
        })
        .then(response => {
            this.getAdviceSummary(response);
        })
        .catch(error => {
            console.log(error);
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
            this.getAdviceSummary(response);
        })
        .catch(error => {
            console.log(error);
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
            console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
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
                    <Col span={24} style={{textAlign: 'right'}}>
                        <Button
                                onClick={this.toggleDialog}
                                style={{width: 170}}
                                type="primary"
                                disabled={this.state.disableSubscribeButton}
                        >
                            {!this.state.adviceDetail.isSubscribed ? "SUBSCRIBE" : "UNSUBSCRIBE"}
                        </Button>
                    </Col>
                    <Col span={24} style={{textAlign: 'right'}}>
                        <Button
                                onClick={this.followAdvice}
                                style={{width: 170, marginTop: 10}}
                                disabled={this.state.disableFollowButton}
                        >
                            {!this.state.adviceDetail.isFollowing ? "Add To Wishlist" : "Remove From Wishlist"}
                        </Button>
                    </Col>
                </Row>
            );
        }

        return (
            <Row>
                <Col span={24} style={{textAlign: 'right'}}>
                    {
                        !this.state.adviceDetail.isPublic
                        && <Button onClick={this.makeAdvicePublic} style={{width: 150}} type="primary">Publish</Button>}
                </Col>
                <Col span={24} style={{textAlign: 'right'}}>
                    <Button
                            onClick={() => this.props.history.push(`/advisordashboard/updateadvice/${this.props.match.params.id}`)}
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

    renderPageContent = () => {
        const {name, heading, description, advisor, updatedDate} = this.state.adviceDetail;
        const {annualReturn, totalReturns, averageReturns, dailyReturns} = this.state.metrics;
        const breadCrumbs = getBreadCrumbArray(AdviceDetailCrumb, [
            {name, url: '#'}
        ]);
        const statusBarColor = this.state.adviceDetail.isOwner
                ? statusColor.owner
                : (this.state.adviceDetail.isSubscribed ? statusColor.subscribed : statusColor.notSubscribed);

        return (
            <Row>
                <AqPageHeader title={name} breadCrumbs={breadCrumbs}/>
                <StockResearchModal
                        ticker={this.state.stockResearchModalTicker}
                        visible={this.state.stockResearchModalVisible}
                        toggleModal={this.toggleModal}
                />
                <Col xl={18} md={24} style={shadowBoxStyle}>
                    <StatusBar color={statusBarColor} />
                    <Row className="row-container" type="flex" justify="space-between">
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
                        <Col span={6}>
                            {this.renderActionButtons()}
                        </Col>
                    </Row>
                    <Row className="row-container">
                        {this.renderAdviceMetrics()}
                    </Row>
                    <Row>
                        <Col span={24} style={dividerStyle}></Col>
                    </Row>
                    <Collapse bordered={false} defaultActiveKey={this.state.barDollarSeries.length > 0 ? ["2"] : ["3"]}>
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
                                    header={<h3 style={metricsHeaderStyle}>Summary</h3>}
                            >
                                {
                                    this.state.barDollarSeries.length > 0
                                    ?   <Row className="row-container">
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
                                    :   <Row type="flex" align="middle" justify="center">
                                            <h3>No Data Available</h3>
                                        </Row>
                                }

                            </Panel>
                        }

                        <Panel
                            key="3"
                            style={customPanelStyle}
                            header={<h3 style={metricsHeaderStyle}>Performance</h3>}>
                            <Row className="row-container">
                                <MyChartNew series={this.state.tickers} />
                            </Row>
                        </Panel>

                        {
                            (this.state.adviceDetail.isSubscribed || this.state.adviceDetail.isOwner) &&

                            <Panel
                                key="4"
                                style={customPanelStyle}
                                header={<h3 style={metricsHeaderStyle}>Portfolio</h3>}>
                                <Row className="row-container">
                                    <Col span={24} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                        {
                                            this.state.adviceDetail.isOwner &&
                                            <DatePicker
                                                    value={this.state.selectedPortfolioDate}
                                                    onChange={this.handlePortfolioStartDateChange}
                                            />
                                        }
                                    </Col>
                                    <Col span={24} style={{marginTop: '10px'}}>
                                        <AqStockPortfolioTable
                                                    positions={this.state.positions}
                                                    updateTicker={this.updateTicker}
                                        />
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
           <Row>
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
