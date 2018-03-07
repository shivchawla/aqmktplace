import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import {Row, Col, Avatar, Rate, Button} from 'antd';
import {MetricItem, AdviceListItem} from '../components';
import {layoutStyle} from '../constants';

const {requestUrl, advisorId, investorId, aimsquantToken} = require('../localConfig');

export class AdvisorProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: [],
            metrics: {
                name: '',
                numAdvices: 0,
                numFollowers: 0,
                rating: 0
            }
        };
    }

    renderMetrics = () => {
        const {name, numAdvices, numFollowers, rating} = this.state.metrics;
        return (
            <Row>
                <Col span={4}>
                    <MetricItem key="1" label="Advices" value={numAdvices} />
                </Col>
                <Col span={4}>
                    <MetricItem key="3" label="Followers" value={numFollowers} />
                </Col>
            </Row>
        );
    }

    renderProfileDetails = () => {
        return (
            <Col span={24} style={layoutStyle}>
                <Row>
                    <Col span={2}>
                        <Avatar
                                size="large" icon="user" 
                                style={{transform: 'scale(1.5, 1.5)'}}
                                src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                        />
                    </Col>
                    <Col span={6}>
                        <h3>{this.state.metrics.name}</h3>
                        <Rate disabled allowHalf value={this.state.metrics.rating} />
                    </Col>
                    <Col span={4} offset={12}>
                        <Button type="primary" >UNFOLLOW</Button>
                    </Col>
                </Row>
                <Row style={{marginTop: 20}}>
                    <Col span={24}>
                        {this.renderMetrics()}
                    </Col>
                </Row>
            </Col>
        );
    }

    renderAdvices = () => {
        const {advices} = this.state;

        return advices.map((advice, index) => {
            const adviceItem = {
                id: advice._id,
                name: advice.name,
                subscribers: advice.latestAnalytics.numSubscribers,
                rating: advice.latestAnalytics.rating,
                latestPerformance: advice.latestPerformance
            };

            return <AdviceListItem key={index} advice={adviceItem}/>
        })
    }

    getAdvisorDetail = () => {
        const url = `${requestUrl}/advisor/${advisorId}?dashboard=0`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(response.data);
            const {latestAnalytics, user} = response.data;
            this.setState({
                advices: response.data.advices,
                metrics: {
                    name: `${user.firstName} ${user.lastName}`,
                    numAdvices: latestAnalytics.numAdvices,
                    numFollowers: latestAnalytics.numFollowers,
                    rating: latestAnalytics.rating
                }
            }, () => {
                console.log(this.state.metrics);
            });
        })
        .catch(error => {
            console.log(error);
        });
    }

    componentWillMount() {
        this.getAdvisorDetail();
    }

    render() {
        return (
            <Row>
                <Col span={18} style={layoutStyle}>
                    <Row>
                        {this.renderProfileDetails()}
                    </Row>
                    <Row>
                        <Col span={24} style={{margin: '20px 0'}}>
                            <h3>Advisor Advices</h3>
                        </Col>
                        <Col span={24} style={{margin: '20px 0'}}>
                            {this.renderAdvices()}
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}