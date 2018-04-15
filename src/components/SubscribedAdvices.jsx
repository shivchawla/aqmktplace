import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Collapse, Checkbox, Row, Col, Tabs, Table, DatePicker} from 'antd';
import {AdviceTransactionTable} from '../components';
import {MyChartNew} from '../containers/MyChartNew';
import {currentPerformanceColor, simulatedPerformanceColor, nameEllipsisStyle} from '../constants';
import {Utils} from '../utils';
import {adviceTransactions} from '../mockData/AdviceTransaction';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

const {requestUrl, aimsquantToken} = require('../localConfig.js');

const dateFormat = 'YYYY-MM-DD';

class SubscribedAdvicesImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: props.subscribedAdvices,
            selectedAdvices: []
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
                title: 'LAST PRICE',
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
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            response.data.map((advice, index) => {
                const adviceUrl = `${requestUrl}/advice/${advice._id}`;
                axios.get(adviceUrl, {headers: Utils.getAuthTokenHeader()})
                .then(response => {
                    const portfolioUrl = `${requestUrl}/advice/${advice._id}/portfolio`;
                    const performanceUrl = `${requestUrl}/performance/advice/${advice._id}`;
                    const newAdvice = {
                        id: advice._id,
                        portfolio: {detail: null},
                        name: response.data.name,
                        advisor: response.data.advisor,
                        updatedDate: moment(response.data.updatedDate).format(dateFormat),
                        performance: {},
                        subscribers: response.data.numSubscribers,
                        followers: response.data.numFollowers,
                        isSelected: false,
                        isAdded: false,
                        disabled: false,
                        rating: response.data.rating,
                        date: moment().format(dateFormat),
                        createdDate: response.data.createdDate,
                        currentPerformance: [],
                        simulatedPerformance: []
                    };
                    axios.get(portfolioUrl, {headers: Utils.getAuthTokenHeader()})
                    .then(response => {
                        newAdvice.portfolio.detail = response.data.detail;
                        advices.push(newAdvice);
                        this.props.updateSubscribedAdvices(advices);
                        this.setState({advices});
                    })
                    .catch(error => {
                        console.log(error);
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    })
                })
                .catch(error => {
                    console.log(error);
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                });
                
            });
        })
        .catch(error => {
            console.log(error);
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        });
        
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
                <Panel header={this.renderHeaderItem(item)} key={index}>
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
                    lastPrice: item.lastPrice,
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

        return (
            <Row>
                <Col span={24}>
                    <Row>
                        <Col span={2}>
                            <Checkbox 
                                    checked={advice.isSelected} 
                                    onChange={(e) => this.handleCheckboxChange(e, advice)}
                                    disabled={advice.disabled || false}
                            />
                        </Col>
                        <Col span={22}>
                            <Row>
                                <Col span={24}>
                                    <h5>{advice.name || ''}</h5>
                                </Col>
                                <Col span={24}>
                                    <h5>
                                        By &nbsp;&nbsp;
                                        {_.get(advice, 'advisor.user.firstName', '')} &nbsp;&nbsp;
                                        {_.get(advice, 'advisor.user.lastName', '')} &nbsp;&nbsp;
                                        {_.get(advice, 'updatedDate', '')}
                                    </h5>
                                </Col>
                                <Col span={24}>
                                    <Row>
                                        <Col span={4}>
                                            <MetricItem
                                                    value={advice.subscribers || 0}
                                                    label="Subscribers"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem
                                                    value={advice.followers || 0}
                                                    label="Followers"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem
                                                    value={advice.rating.current.toFixed(2)}
                                                    label="Current Rating"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem
                                                    value={advice.rating.simulated.toFixed(2)}
                                                    label="Simulated Rating"
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }

    render() {
        return (
            <Collapse>
                {this.renderAdvices()}
            </Collapse>
        );
    }
}

export const SubscribedAdvices = withRouter(SubscribedAdvicesImpl);

const MetricItem = (props) => {
    return (
        <Row>
            <Col span={24}><h5 style={{fontWeight: 600, fontSize: '16px'}}>{props.value}</h5></Col>
            <Col><h5>{props.label}</h5></Col>
        </Row>
    );
};

const HeaderItem = ({text}) => {
    return (
        <h5>Symbols - {text}</h5>
    );
}