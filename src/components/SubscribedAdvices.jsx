import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Collapse, Checkbox, Row, Col, Tabs, Table, DatePicker} from 'antd';
import {AdviceTransactionTable} from '../components';
import {MyChartNew} from '../containers/MyChartNew';
import {currentPerformanceColor, simulatedPerformanceColor} from '../constants';
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
                title: 'symbol',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'Shares',
                dataIndex: 'quantity',
                key: 'quantity'
            },
            {
                title: 'Last Price',
                dataIndex: 'lastPrice',
                key: 'lastPrice'
            },
            {
                title: 'Cost Basic',
                dataIndex: 'costBasic',
                key: 'costBasic'
            },
            {
                title: 'Unrealized P/L',
                dataIndex: 'unrealizedPL',
                key: 'unrealizedPL'
            },
            {
                title: 'Weight',
                dataIndex: 'weight',
                key: 'weight'
            }
        ];
        this.adviceKey = 0;
    }

    componentWillMount() {
        const {investorId} = this.props;
        let advices = [...this.state.advices];
        console.log('Component Mounted');
        const url = `${requestUrl}/advice?subscribed=true`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            console.log('Subscribed Advices', response.data);
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
                        disabled: false,
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
                        this.setState({advices}, () => {
                            this.getPerformance(axios.get(performanceUrl, {headers: Utils.getAuthTokenHeader()}), advice._id);
                        });
                    })
                    .then(response => {
                        console.log(response);
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
                    <Tabs animated={false}>
                        <TabPane tab="Composition" key="1">
                            <Row>
                                <Col span={6} offset={18}>
                                    <DatePicker
                                            style={{right: 0}}
                                            onChange={date => {this.handleDateChange(date, item)}}
                                            format={dateFormat}
                                            value={moment(item.date, dateFormat)}
                                            disabledDate={current => this.props.disabledDate(current, item)}
                                    />
                                </Col>
                                <Col span={24} style={{marginTop: 20}}>
                                    <Table size="small" columns={this.columns} dataSource={data} pagination={false}/>
                                </Col>
                            </Row>
                        </TabPane>
                        <TabPane tab="Performance" key="2">
                            <MyChartNew series={adviceSeries} chartId={`${item.name}-chart-container`}/>
                        </TabPane>
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
                    symbol: item.security.ticker,
                    quantity: item.quantity,
                    lastPrice: item.lastPrice,
                    costBasic: 200,
                    unrealizedPL: 200,
                    weight: 200
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
        // if (e.target.checked) {
        //     this.props.addAdvice(this.processAdvice(advice));
        // } else {
        //     this.props.deleteAdvice(this.processAdvice(advice));
        // }
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
                                        By 
                                        {_.get(advice, 'advisor.user.firstName', '')} 
                                        {_.get(advice, 'advisor.user.lastName', '')} 
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
                                                    value="4.9/5"
                                                    label="Rating"
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