import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import Loading from 'react-loading-bar';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Collapse, Checkbox, Row, Col, Tabs, Table, DatePicker, Spin} from 'antd';
import {AqPortfolioCompositionAdvice, MetricItem} from '../components';
import {loadingColor} from '../constants';
import {MyChartNew} from '../containers/MyChartNew';
import {Utils} from '../utils';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {
    currentPerformanceColor, 
    simulatedPerformanceColor, 
    nameEllipsisStyle, 
    metricsValueStyle,
    metricsLabelStyle,
    metricColor
} from '../constants';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

const {requestUrl, aimsquantToken} = require('../localConfig.js');

const dateFormat = 'YYYY-MM-DD';

class SubscribedAdvicesImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: props.subscribedAdvices,
            selectedAdvices: [],
            loading: false
        };
        this.columns = [
            {
                title: 'NAME',
                dataIndex: 'name',
                key: 'name',
                width: 210,
                render: text => <h3 style={nameEllipsisStyle}>{text}</h3>
            },
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'SHARES',
                dataIndex: 'quantity',
                key: 'quantity'
            },
            {
                title: 'LAST PRICE (\u20B9)',
                dataIndex: 'lastPrice',
                key: 'lastPrice'
            },
            /*{
                title: 'AVG. PRICE',
                dataIndex: 'averagePrice',
                key: 'averagePrice'
            },*/
            /*{
                title: 'UNREALIZED P/L',
                dataIndex: 'unrealizedPL',
                key: 'unrealizedPL'
            },*/
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                render: text => <span>{text} %</span>
            }
        ];
        this.adviceKey = 0;
    }

    componentWillMount() {
        const {investorId} = this.props;
        let advices = [...this.state.advices];
        const url = `${requestUrl}/advice?subscribed=true`;
        this.setState({loading: true});
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            response.data.advices.map((advice, index) => {
                const adviceUrl = `${requestUrl}/advice/${advice._id}`;
                const portfolioUrl = `${requestUrl}/advice/${advice._id}/portfolio`;
                return Promise.all([
                    axios.get(adviceUrl, {headers: Utils.getAuthTokenHeader()}),
                    axios.get(portfolioUrl, {headers: Utils.getAuthTokenHeader()})
                ])
                .then(([adviceResponse, advicePortfolioResponse]) => {
                    var performanceSummary = _.get(adviceResponse.data, 'performanceSummary.current', {});
                    var portfolioPnlStats = _.get(advicePortfolioResponse.data, 'pnlStats', {});
                    var latestPerformanceSummary = Utils.computeLatestPerformanceSummary(performanceSummary, portfolioPnlStats);
                    const newAdvice = {
                        id: advice._id,
                        portfolio: {detail: null},
                        name: adviceResponse.data.name,
                        advisor: adviceResponse.data.advisor,
                        updatedDate: moment(adviceResponse.data.updatedDate).format(dateFormat),
                        performance: {},
                        subscribers: adviceResponse.data.numSubscribers,
                        followers: adviceResponse.data.numFollowers,
                        isSelected: false,
                        isAdded: false,
                        disabled: false,
                        rating: adviceResponse.data.rating,
                        date: moment().format(dateFormat),
                        createdDate: adviceResponse.data.createdDate,
                        currentPerformance: [],
                        simulatedPerformance: [],
                        netValue: _.get(latestPerformanceSummary, 'netValue', 0.0),
                        dailyChange: _.get(latestPerformanceSummary, 'dailyChange', 0.0),
                        dailyChangePct: _.get(latestPerformanceSummary, 'dailyNavChangePct', 0.0),
                        maxLoss: _.get(adviceResponse.data, 'performanceSummary.current.maxLoss', 0),
                        totalReturn: _.get(latestPerformanceSummary, 'totalReturn', 0.0),
                    };
                    newAdvice.portfolio.detail = advicePortfolioResponse.data.detail;
                    advices.push(newAdvice);
                    this.props.updateSubscribedAdvices(advices);
                    this.setState({advices});
                })
            })
            .finally(() => {
                this.setState({loading: false});
            });
        })
        .catch(error => {
            console.log(error);
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    getPerformance = (axiosInstance, adviceid) => {
        const advices = [...this.state.advices];
        const target = advices.filter(item => item.id === adviceid)[0];

        return new Promise((resolve, reject) => {
            axiosInstance.then(response => {
                const currentPerformanceUP = _.get(response.data, 'current.portfolioValues', []);
                const simulatedPerformanceUP = _.get(response.data, 'simulated.portfolioValues', []);
                const processedSimulatedPerformance = simulatedPerformanceUP.map(item => {
                    return [moment(item.date, dateFormat).valueOf(), Number(item.netValue.toFixed(2))]
                });
                const processerCurrentPerformance = currentPerformanceUP.map(item => {
                    return [moment(item.date, dateFormat).valueOf(), Number(item.netValue.toFixed(2))]
                });
                target.simulatedPerformance = processedSimulatedPerformance;
                target.currentPerformance = processerCurrentPerformance;
                this.setState({advices});
                resolve(response.data);
            })
            .catch(error => {
                reject(error);
            })
        })
    }

    renderDatePicker = item => {
        return (
            <DatePicker
                    style={{marginRight: '20px'}}
                    onChange={date => {this.handleDateChange(date, item)}}
                    format={dateFormat}
                    value={moment(item.date, dateFormat)}
                    disabledDate={current => this.props.disabledDate(current, item)}
                    allowClear={false}
            />
        );
    }

    renderAdvices = () => {
        const {advices = []} = this.state;

        return advices.map((item, index) => {
            const data = this.processComposition(item);
            const adviceSeries = [
                {name: 'Current Performance', data: item.currentPerformance, color: currentPerformanceColor},
                {name: 'Simulated Performance', data: item.simulatedPerformance, color: simulatedPerformanceColor}
            ];

            return (
                <Panel 
                        header={this.renderHeaderItem(item)} 
                        key={index}
                        
                >
                    <Tabs animated={false} tabBarExtraContent={this.renderDatePicker(item)}>
                        <TabPane tab="Composition" key="1">
                            <Row>
                                <Col span={24} style={{marginTop: 20, padding: '0 20px'}}>
                                    <Table size="small" columns={this.columns} dataSource={data} pagination={false}/>
                                </Col>
                            </Row>
                        </TabPane>
                        {/* <TabPane tab="Performance" key="2">
                            <MyChartNew series={adviceSeries} chartId={`${item.name}-chart-container`}/>
                        </TabPane> */}
                    </Tabs>
                </Panel>
            );
        });
    }

    processComposition = (advice) => {
        const compositions = [];
        if(advice.portfolio.detail) {
            advice.portfolio.detail.positions.map((item, index) => {
                compositions.push({
                    key: index,
                    name: _.get(item, 'security.detail.Nse_Name', 'N/A'), 
                    symbol: item.security.ticker,
                    quantity: item.quantity,
                    lastPrice: Utils.formatMoneyValueMaxTwoDecimals(item.lastPrice),
                    costBasic: 200,
                    //averagePrice: _.get(item, 'avgPrice', 0),
                    //unrealizedPL: _.get(item, 'unrealizedPnL', 0),
                    weight: Number((_.get(item, 'weightInPortfolio', 0) * 100).toFixed(2))
                });
            });
        }

        return compositions;
    }  
    
    handleCheckboxChange = (e, advice) => {
        const advices = [...this.state.advices];
        const targetAdvice = advices.filter(item => item.id === advice.id)[0];
        targetAdvice.isSelected = e.target.checked;
        this.setState({advices});
        this.props.updateSubscribedAdvices(advices);
    }

    handleDateChange = (date, advice) => {
        const adviceId = advice.id;
        const advices = [...this.state.advices];
        const targetAdvice = advices.filter(item => item.id === adviceId)[0];
        const url = `${requestUrl}/advice/${adviceId}/portfolio?date=${moment(date).format(dateFormat)}`;
        
        // improvement needed - this should be a common method
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const portfolio = response.data.detail;
            targetAdvice.date = moment(date).format(dateFormat);
            if (portfolio) {
                targetAdvice.portfolio.detail = portfolio;
                targetAdvice.disabled = false;
            } else {
                targetAdvice.disabled = true;
                targetAdvice.portfolio.detail = null;
            }
            this.setState({advices});
            this.props.updateSubscribedAdvices(advices);
            
        }).
        catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        });
    }

    renderHeaderItem = (advice) => {
        const performance = _.get(advice, 'performance.historicalPerformance', {});
        const dailyChangeColor = advice.dailyChange >= 0 ? metricColor.positive : metricColor.negative;
        const dailyChangePctColor = advice.dailyChange >= 0 ? metricColor.positive : metricColor.negative;
        const totalReturnColor = advice.totalReturn >=0 ? metricColor.positive : metricColor.negative;
        return (
            <Row type="flex" gutter={40}>
                <Col span={2}>
                    <Checkbox 
                            checked={advice.isSelected} 
                            onChange={(e) => this.handleCheckboxChange(e, advice)}
                            disabled={advice.disabled || false}
                    />
                </Col>
                <Col span={6}>
                    <MetricItem 
                        value={advice.name || ''} 
                        label="Advice"
                        noNumeric 
                        valueStyle={metricsValueStyle}
                        labelStyle={metricsLabelStyle}
                    />
                </Col>
                <Col span={4} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <MetricItem 
                        value={advice.totalReturn}
                        percentage 
                        label="Total Return" 
                        valueStyle={{...metricsValueStyle, color: totalReturnColor}}
                        labelStyle={metricsLabelStyle}
                    />
                </Col>
                <Col span={6} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                    <MetricItem 
                        value={advice.netValue}
                        isNetValue
                        money
                        dailyChangePct={(advice.dailyChangePct*100).toFixed(2)} 
                        label="Net Asset Value" 
                        valueStyle={{...metricsValueStyle, textAlign:'center'}}
                        labelStyle={{...metricsLabelStyle, textAlign: 'center'}}
                    />
                </Col>
            </Row>
        );
    }

    renderPageContent() {
        return (
            <Collapse bordered={false}>
                {this.renderAdvices()}
            </Collapse>
        );
    }

    render() {
        return (
            <Row style={{position: 'relative'}}>
                <Loading
                    style={{position: 'absolute', top: '100px'}}
                    show={this.state.loading}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                {
                    !this.state.loading &&
                    this.renderPageContent()
                }
            </Row>
        );
    }
}

export const SubscribedAdvices = withRouter(SubscribedAdvicesImpl);

const HeaderItem = ({text}) => {
    return (
        <h5>Symbols - {text}</h5>
    );
}

const customPanelStyle = {
    border: '1px solid #eaeaea',
};

const adviceNameStyle = {
    fontFamily: 'Lato, sans-serif',
    fontSize: '16px'
};

const tableHeaderStyle = {
    fontSize: '12px',
    color: '#787878'
};