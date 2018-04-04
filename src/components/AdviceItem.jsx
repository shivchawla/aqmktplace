import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import {Collapse, Checkbox, Row, Col, Tabs, Table, DatePicker} from 'antd';
import {AdviceTransactionTable} from '../components';
import {adviceTransactions} from '../mockData/AdviceTransaction';

const Panel = Collapse.Panel;
const TabPane = Tabs.TabPane;

const {requestUrl, aimsquantToken} = require('../localConfig.js');

const dateFormat = 'YYYY-MM-DD';

export class AdviceItem extends React.Component {
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
        const url = `${requestUrl}/advice?subscribed=true`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            response.data.map((advice, index) => {
                const adviceUrl = `${requestUrl}/advice/${advice._id}`;
                axios.get(adviceUrl, {headers: {'aimsquant-token': aimsquantToken}})
                .then(response => {
                    const portfolioUrl = `${requestUrl}/advice/${advice._id}/portfolio`;
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
                        createdDate: response.data.createdDate
                    };
                    axios.get(portfolioUrl, {headers: {'aimsquant-token': aimsquantToken}})
                    .then(response => {
                        newAdvice.portfolio.detail = response.data.detail;
                        advices.push(newAdvice);
                        this.setState({advices});
                        this.props.updateSubscribedAdvices(advices);
                    })
                })
                .catch(error => {
                    console.log(error.message)
                });
                
            });
        })
        .catch(error => {
            console.log(error.message);
        });
        
    }

    renderAdvices = () => {
        const {advices = []} = this.state;

        return advices.map((item, index) => {
            const data = this.processComposition(item);

            return (
                <Panel header={this.renderHeaderItem(item)} key={index}>
                    <Tabs>
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
                            <h4>Performance</h4>
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
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
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
            console.log(error);
        });
    }

    renderHeaderItem = (advice) => {
        const performance = advice.performance.historicalPerformance;

        return (
            <Row>
                <Col span={24}>
                    <Row>
                        <Col span={2}>
                            <Checkbox 
                                    checked={advice.isSelected} 
                                    onChange={(e) => this.handleCheckboxChange(e, advice)}
                                    disabled={advice.disabled}
                            />
                        </Col>
                        <Col span={22}>
                            <Row>
                                <Col span={24}>
                                    <h5>{advice.name}</h5>
                                </Col>
                                <Col span={24}>
                                    <h5>
                                        By {advice.advisor.user.firstName} {advice.advisor.user.lastName} {advice.updatedDate}
                                    </h5>
                                </Col>
                                <Col span={24}>
                                    <Row>
                                        <Col span={4}>
                                            <MetricItem
                                                    value={advice.subscribers}
                                                    label="Subscribers"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem
                                                    value={advice.followers}
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
                                {
                                    performance && 
                                    <Col span={24}>
                                        <Col span={4}>
                                            <MetricItem 
                                                    value={Math.round(performance.analytics.ratios.calmarratio * 100) / 100}
                                                    label="Calmar Ratio"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem 
                                                    value={Math.round(performance.analytics.ratios.alpha * 100) / 100}
                                                    label="Alpha"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem 
                                                    value={Math.round(performance.analytics.ratios.sortinoratio * 100) / 100}
                                                    label="Sortino Ratio"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem 
                                                    value={Math.round(performance.analytics.ratios.treynorratio * 100) / 100}
                                                    label="Treynor Ratio"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem 
                                                    value={Math.round(performance.analytics.ratios.stability * 100) / 100}
                                                    label="Stability"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem 
                                                    value={Math.round(performance.analytics.ratios.informationratio * 100) / 100}
                                                    label="Information Ratio"
                                            />
                                        </Col>
                                    </Col>
                                }
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