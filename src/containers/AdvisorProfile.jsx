import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import {Row, Col, Avatar, Rate, Button, Modal} from 'antd';
import {Twitter} from 'twitter-node-client';
import {MetricItem, AdviceListItem} from '../components';
import {UpdateAdvisorProfile} from '../containers';
import {layoutStyle} from '../constants';

const {requestUrl, investorId, advisorId, aimsquantToken} = require('../localConfig');
const dateFormat = 'YYYY-MM-DD';
const clientId = '81udlgx5kk2aad';
const clientSecret = 'mtF7xm8K81Ipyevk';
const redirectUri = 'http://localhost:3000/advisorprofile';

export class AdvisorProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: [],
            advisor: {},
            metrics: {
                name: '',
                numAdvices: 0,
                numFollowers: 0,
                rating: 0
            },
            memberSince: moment(),
            page: '',
            picUrl: "https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png",
            ownProfile: false,
            updateModalVisible: false,
            isCompany: false
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
                                src={this.state.picUrl}
                        />
                    </Col>
                    <Col span={6}>
                        <h3>{this.state.metrics.name}</h3>
                        <Rate disabled allowHalf value={this.state.metrics.rating} />
                    </Col>
                    <Col span={4} offset={12}>
                        {this.renderActionButtons()}
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
        const advisorIdCurrent = this.props.match.params.id;
        const url = `${requestUrl}/advisor/${advisorIdCurrent}?dashboard=0`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(response.data);
            const {latestAnalytics, user} = response.data;
            this.setState({
                advisor: response.data,
                advices: response.data.advices,
                metrics: {
                    name: `${user.firstName} ${user.lastName}`,
                    numAdvices: latestAnalytics.numAdvices,
                    numFollowers: latestAnalytics.numFollowers,
                    rating: latestAnalytics.rating,
                },
                ownProfile: this.props.match.params.id === advisorId,
                isCompany: response.data.profile ? response.data.profile.isCompany : false
            });
        })
        .catch(error => {
            console.log(error);
        });
    }

    renderPage = () => {
        return this.state.page;
    }

    renderActionButtons = () => {
        if (this.state.ownProfile) {
            return (
                <Button onClick={this.toggleUpdateModal}>Update Profile</Button>
            );
        }

        return (
            <Button>Follow</Button>
        );
    }

    toggleUpdateModal = () => {
        this.setState({updateModalVisible: !this.state.updateModalVisible});
    }

    renderUpdateModal = () => {
        return (
            <Modal
                    title="Update Profile"
                    visible={this.state.updateModalVisible}
                    onOk={this.toggleUpdateModal}
                    onCancel={this.toggleUpdateModal}
                    footer={null}
                    width={900}
            >
                <UpdateAdvisorProfile 
                        isCompany={this.state.isCompany}
                        advisorId={advisorId}
                        toggleModal={this.toggleUpdateModal}
                        advisor={this.state.advisor}
                />
            </Modal>
        );
    }

    error = (err, response, body) => {
        console.log('ERROR [%s]', err);
    }

    success = (data) => {
        console.log(data);
    }

    componentWillMount() {
        this.getAdvisorDetail();
        console.log(this.props.match.params.id);
    }

    render() {
        return (
            <Row>
                {this.renderUpdateModal()}
                <Col span={18}>
                    Member Since {moment(this.state.memberSince).format(dateFormat)}
                </Col>
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