import * as React from 'react';
import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';
import Loading from 'react-loading-bar';
import {Row, Col, Avatar, Rate, Button, Modal, Icon, Select, message} from 'antd';
import {Twitter} from 'twitter-node-client';
import {MetricItem, AdviceListItem, AdviceFilterComponent, AdviceSortingMenu, AdviceListItemMod, AqPageHeader} from '../components';
import {UpdateAdvisorProfile} from '../containers';
import {layoutStyle, shadowBoxStyle, loadingColor} from '../constants';
import {Utils, getBreadCrumbArray} from '../utils';
import {AdvisorProfileCrumb} from '../constants/breadcrumbs';

const {requestUrl, aimsquantToken} = require('../localConfig');
const dateFormat = 'YYYY-MM-DD';
const Option = Select.Option;

export class AdvisorProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: [],
            adviceUrl: `${requestUrl}/advice?all=true&trending=false&subscribed=false&following=false&order=-1&personal=1`,
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
            isFollowing: false,
            updateModalVisible: false,
            isCompany: false,
            filterModalVisible: false,
            sortBy: 'rating',
            loading: false,
            followLoading: false
        };
    }

    renderMetrics = () => {
        const {numAdvices, numFollowers} = this.state.metrics;
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
            <Col span={24} style={{...shadowBoxStyle, padding: '20px 30px', borderRadius: '4px'}}>
                <Row style={{textAlign: 'center'}}>
                    <h3 
                            style={{fontSize: '12px', color: '#909090'}}>
                        Member Since {moment(this.state.memberSince).format(dateFormat)} 
                    </h3>
                </Row>
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
                    <Col span={4} offset={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
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
            return <AdviceListItemMod key={index} advice={advice}/>
        })
    }

    getAdvisorDetail = () => {
        const advisorIdCurrent = this.props.match.params.id;
        const url = `${requestUrl}/advisor/${advisorIdCurrent}?dashboard=0`;
        const advicesUrl = `${requestUrl}/advice?personal=1`;
        this.setState({loading: true});
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const {latestAnalytics = {}, user} = response.data;
            this.setState({
                advisor: response.data,
                // advices: response.data.advices,
                metrics: {
                    name: `${user.firstName} ${user.lastName}`,
                    numAdvices: _.get(latestAnalytics, 'numAdvices', null),
                    numFollowers: _.get(latestAnalytics, 'numFollowers', null),
                    rating: Number(_.get(latestAnalytics, 'rating.current', 0).toFixed(2)),
                },
                ownProfile: _.get(response, 'data.isOwner', false),
                isFollowing: _.get(response.data, 'isFollowing', false),
                picUrl: _.get(response.data, 'profile.linkedIn.photoUrl', this.state.picUrl),
                isCompany: response.data.profile ? response.data.profile.isCompany : false
            });
            return axios.get(advicesUrl, {headers: Utils.getAuthTokenHeader()})
        })
        .then(response => {
            this.setState({advices: this.processAdvices(response.data)});
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loading: false});
        });
    }

    processAdvices = (responseAdvices) => {
        const advices = [];
        responseAdvices.map((advice, index) => {
            console.log('Advice Item', advice);
            advices.push({
                isFollowing: advice.isFollowing || false,
                id: advice._id || 0,
                name: advice.name || '',
                advisor: advice.advisor || {},
                createdDate: advice.createdDate || '',
                heading: advice.heading || '',
                subscribers: advice.numSubscribers || 0,
                followers: advice.numFollowers || 0,
                rating: _.get(advice, 'rating.current', 0).toFixed(2),
                performanceSummary: advice.performanceSummary,
                rebalancingFrequency: _.get(advice, 'rebalance', 'N/A'),
                isApproved: _.get(advice, 'approvalStatus', 'N/A'),
                isOwner: _.get(advice, 'isOwner', false),
                isSubscribed: _.get(advice, 'isSubscribed', false),
                isTrending: false
            })
        });

        return advices;
    }

    renderPage = () => {
        return this.state.page;
    }

    followUser = () => {
        this.setState({followLoading: true});
        axios({
            method: 'POST',
            url: `${requestUrl}/advisor/${this.props.match.params.id}/follow`,
            headers: Utils.getAuthTokenHeader()
        })
        .then(response => {
            message.success('Following User');
            this.getAdvisorDetail();
        })
        .catch(error => {
            message.error('Error occured !')
        })
        .finally(() => {
            this.setState({followLoading: false});
        })
    }

    renderActionButtons = () => {
        if (this.state.ownProfile) {
            return (
                <Button type="primary" onClick={this.toggleUpdateModal}>Update Profile</Button>
            );
        }

        return (
            <Button 
                    onClick={this.followUser} 
                    type="primary"
                    loading={this.state.followLoading}
            >
                {this.state.isFollowing ? 'UN - Follow' : 'Follow'}
            </Button>
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
                    bodyStyle={{height: '600px', overflow: 'hidden', overflowY: 'scroll'}}
                    width={900}
            >
                <UpdateAdvisorProfile 
                        isCompany={this.state.isCompany}
                        advisorId={Utils.getUserInfo().advisor}
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

    updateAdvices = (advices) => {
        this.setState({advices: advices});
    }

    updateAdviceUrl = (url) => {
        this.setState({adviceUrl: url});
    }

    toggleFilterModal = () => {
        this.setState({filterModalVisible: !this.state.filterModalVisible});
    }

    renderFilterModal = () => {
        return (
            <Modal
                    title="Apply Filters"
                    visible={this.state.filterModalVisible}
                    footer={null}
                    onCancel={this.toggleFilterModal}
            >
                <AdviceFilterComponent 
                        updateAdvices={this.updateAdvices}
                        updateAdviceUrl={this.updateAdviceUrl}
                        toggleModal = {this.toggleFilterModal}
                        orderParam={this.state.sortBy}
                />
            </Modal>
        );
    }

    updateSortBy = sortBy => {
        this.setState({sortBy});
    }

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            this.getAdvisorDetail();
        }
    }

    renderPageContent = () => {
        const breadCrumbs = getBreadCrumbArray(AdvisorProfileCrumb, [
            {name: 'Advisor Profile', url: '#'}
        ]);

        return (
            <Row>
                {this.renderUpdateModal()}
                <AqPageHeader 
                    title="Advisor Profile"
                    breadCrumbs={breadCrumbs}
                />
                <Col span={18}>
                    <Row>
                        {this.renderProfileDetails()}
                    </Row>
                    <Row>
                        <Col span={24} style={{marginTop: '20px'}}>
                            <h3>Advisor Advices</h3>
                        </Col>
                        <Col span={24}>
                            <Row>
                                {/* <Col span={4}>
                                    <Icon type="filter" onClick={this.toggleFilterModal}/>
                                </Col> */}
                                <Col span={8} offset={12}>
                                    {/* {this.renderSortingMenu()}  */}
                                    {/* <AdviceSortingMenu 
                                            updateAdvices={this.updateAdvices}
                                            updateSortBy={this.updateSortBy}
                                            adviceUrl={this.state.adviceUrl}
                                            sortBy={this.state.sortBy}
                                    /> */}
                                </Col>
                                <Col span={24}>
                                    {this.renderAdvices()}
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
            <React.Fragment>
                <Loading
                        show={this.state.loading}
                        color={loadingColor}
                        className="main-loader"
                        showSpinner={false}
                />
                {
                    !this.state.loading &&
                    this.renderPageContent()
                }
            </React.Fragment>
        );
    }
}