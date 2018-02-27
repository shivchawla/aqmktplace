import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import {Collapse, Checkbox, Row, Col, Tabs, Table} from 'antd';
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
            advices: [],
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
        const advices = [...this.state.advices];
        const url = `${requestUrl}/investor/${investorId}/detail`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            response.data.subscribedAdvices.map((advice, index) => {
                if(advice.active) {
                    const url = `${requestUrl}/advice/${advice.advice}/detail?fields=portfolio%20name%20updatedDate%20followers%20subscribers`;
                    axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
                    .then(response => {
                        const url = `${requestUrl}/performance/advice/${advice.advice}`;
                        advices.push({
                            id: advice.advice,
                            portfolio: response.data.portfolio,
                            name: response.data.name,
                            advisor: response.data.advisor,
                            updatedDate: moment(response.data.updatedDate).format(dateFormat),
                            performance: {},
                            subscribers: response.data.subscribers,
                            followers: response.data.followers
                        });
                        this.setState({advices});

                        return axios.get(url, {headers: {'aimsquant-token': aimsquantToken}});
                    })
                    // .then(response => {
                    //     const target = advices.filter(item => item.id === advice.advice)[0];
                    //     target['performance'] = response.data;
                    //     this.setState({advices});
                    // })
                    .catch(error => {
                        console.log(error.message)
                    });
                }
            });
        })
        .catch(error => {
            console.log(error.message);
        });
        
    }

    renderAdvices = () => {
        const {advices} = this.state;

        return advices.map((item, index) => {
            const data = this.processComposition(item);

            return (
                <Panel header={this.renderHeaderItem(item)} key={index}>
                    <Tabs>
                        <TabPane tab="Composition" key="1">
                            <Table size="small" columns={this.columns} dataSource={data} pagination={false}/>
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
        advice.portfolio.detail.positions.map((item, index) => {
            compositions.push({
                key: index,
                symbol: item.security.ticker,
                quantity: item.quantity,
                lastPrice: 100,
                costBasic: 200,
                unrealizedPL: 200,
                weight: 200
            });
        });

        return compositions;
    }  
    
    handleCheckboxChange = (e, advice) => {
        if (e.target.checked) {
            this.props.addAdvice(this.processAdvice(advice));
        } else {
            this.props.deleteAdvice(this.processAdvice(advice));
        }
        e.stopPropagation();
    }

    processAdvice = (advice) => {
        const key = this.adviceKey++;

        return {
            adviceId: advice.id,
            name: advice.name,
            netAssetValue: 1234,
            weight: '12.4%',
            profitLoss: '+12.4%',
            units: 1,
            key,
            date: moment().format('YYYY-MM-DD'),
            composition: this.processAdviceComposition(advice, key)
        }
    }

    processAdviceComposition = (advice, key) => {
        const composition = [];
        advice.portfolio.detail.positions.map((item, index) => {
            composition.push({
                key: index,
                adviceKey: key,
                symbol: item.security.ticker,
                shares: item.quantity,
                modifiedShares: item.quantity,
                price: 15,
                costBasic: 12,
                unrealizedPL: 1231,
                weight: '12%',
            });
        });

        return composition;
    }

    renderHeaderItem = (advice) => {
        const performance = advice.performance.historicalPerformance;
        return (
            <Row>
                <Col span={24}>
                    <Row>
                        <Col span={2}>
                            <Checkbox onChange={(e) => this.handleCheckboxChange(e, advice)}/>
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
                                                    value={advice.subscribers.length}
                                                    label="Subscribers"
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <MetricItem
                                                    value={advice.followers.length}
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