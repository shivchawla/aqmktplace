import * as React from 'react';
import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';
import {Row, Col, Avatar, Rate, Button, Modal, Icon, Select, message, Tooltip, Pagination} from 'antd';
import ForbiddenAccess from '../components/ForbiddenAccess';
import {AqPageHeader} from '../components/AqPageHeader';
import {AdviceListItemMod} from '../components/AdviceListeItemMod';
import {MetricItem} from '../components/MetricItem';
import {UpdateAdvisorProfile} from '../containers/UpdateAdvisorProfile';
import {shadowBoxStyle, loadingColor} from '../constants';
import {Utils, getBreadCrumbArray, fetchAjax} from '../utils';
import {AdvisorProfileCrumb} from '../constants/breadcrumbs';
import AppLayout from './AppLayout';

const {requestUrl, aimsquantToken} = require('../localConfig');
const dateFormat = 'YYYY-MM-DD';
const Option = Select.Option;

export default class AdvisorProfile extends React.Component {
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
            loading: true,
            adviceLoading: false,
            notAuthorized: false,
            followLoading: false,
            pageLimit: 5,
            advicesCount: 0,
            selectedPage: 1
        };
    }

    renderMetrics = () => {
        const {numAdvices, numSubscribers} = this.state.metrics;
        return (
            <Row>
                <Col span={4}>
                    <MetricItem key="1" label="Advices" value={numAdvices} />
                </Col>
                <Col span={4}>
                    <MetricItem key="3" label="Subscribers" value={numSubscribers} />
                </Col>
            </Row>
        );
    }

    renderProfileDetails = () => {
        const facebookUrl = _.get(this.state, 'advisor.profile.facebook.url', null);
        const linkedinUrl = _.get(this.state, 'advisor.profile.linkedIn.url', null);
        const twitterUrl = _.get(this.state, 'advisor.profile.twitter.url', null);
        const isCompany = _.get(this.state, 'advisor.profile.isCompany', false);
        const isSebiReigstered = _.get(this.state, 'advisor.profile.isSebiRegistered', false);
        const companyName = _.get(this.state, 'advisor.profile.companyName', null);

        return (
            <Col span={22} style={{...shadowBoxStyle, padding: '20px 30px', borderRadius: '4px'}}>
                <Row style={{textAlign: 'center'}}>
                    <h3 
                            style={{fontSize: '12px', color: '#909090'}}>
                        {/* Member Since {moment(this.state.memberSince).format(dateFormat)}  */}
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
                <Row style={{marginTop: 20}} type="flex" justify="space-between">
                    <Col span={16}>
                        {this.renderMetrics()}
                    </Col>
                    <Col span={8}>
                        <Row>
                            <Col span={24} style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                                {linkedinUrl && <Icon onClick={() => window.location.assign(linkedinUrl)} type="linkedin" style={socialIconStyle}/>}
                                {twitterUrl && <Icon onClick={() => window.location.assign(twitterUrl)} type="twitter" style={socialIconStyle}/>}
                                {facebookUrl && <Icon onClick={() => window.location.assign(facebookUrl)} type="facebook" style={socialIconStyle}/>}
                            </Col>
                            <Col 
                                    span={24} 
                                    style={{
                                        display: 'flex', 
                                        flexDirection: 'row', 
                                        justifyContent: 'flex-end', 
                                        marginTop: '20px',
                                        alignItems: 'center'
                                    }}
                            >
                                {
                                    companyName &&
                                    <h3 
                                            style={{fontSize: '12px', color: '#7A7878'}}
                                    >
                                        Company <span style={{fontSize: '14px', color: '#444'}}>{companyName}</span>
                                    </h3>
                                }
                                {
                                    isCompany &&
                                    <Tooltip title="This is a company">
                                        <Icon type="global" style={{...socialIconStyle, fontSize: '18px'}} />
                                    </Tooltip>
                                }
                                {
                                    isSebiReigstered &&
                                    <Tooltip title="Sebi Registered">
                                        <Icon type="safety" style={socialIconStyle} />
                                    </Tooltip>
                                }
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        );
    }

    renderAdvices = () => {
        const {advices} = this.state;
        if (advices.length > 0) {
            return advices.map((advice, index) => {
                return <AdviceListItemMod key={index} advice={advice}/>
            });    
        } else {
            return 
            (
                this.state.isOwner
                ?   <Row style={{marginTop: '40px'}}>
                        <Col span={24} style={{textAlign: 'center'}}>
                            <h3>You haven't created any advices yet.</h3>
                        </Col>
                        <Col span={24} style={{textAlign: 'center', marginTop: '20px'}}>
                            <Button 
                                    style={{width: '150px', height: '40px', fontSize: '16px'}}
                                    type="primary" 
                                    onClick={() => this.props.history.push('/dashboard/createadvice')}
                            >
                                Create One
                            </Button>
                        </Col>
                    </Row>
                :   null
            );
        }
    }

    getAdvisorDetail = () => {
        this.setState({loading: true});
        this.getAdvisorSummary()
        .then(response => {
            this.setState({
                advices: this.processAdvices(_.get(response.data, 'advices', [])),
                advicesCount: _.get(response.data, 'count', 0)
            });
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                if (error.response.status === 400) {
                    this.setState({notAuthorized: true});
                }
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loading: false});
        });
    }
    
    getAdvisorSummary = (getAdvices = true) => new Promise((resolve, reject) => {
        const advisorIdCurrent = this.props.match.params.id;
        const url = `${requestUrl}/advisor/${advisorIdCurrent}?dashboard=0`;
        const advicesUrl = `${requestUrl}/advice?advisor=${this.props.match.params.id}&skip=0&limit=${this.state.pageLimit}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const {latestAnalytics = {}, user} = response.data;
            // console.log(latestAnalytics);
            this.setState({
                advisor: response.data,
                metrics: {
                    name: `${user.firstName} ${user.lastName}`,
                    numAdvices: _.get(latestAnalytics, 'numAdvices', null),
                    numSubscribers: _.get(latestAnalytics, 'numSubscribers', null),
                    rating: Number(_.get(latestAnalytics, 'rating.current', 0).toFixed(2)),
                },
                ownProfile: _.get(response, 'data.isOwner', false),
                isFollowing: _.get(response.data, 'isFollowing', false),
                picUrl: _.get(response.data, 'profile.linkedIn.photoUrl', this.state.picUrl),
                isCompany: response.data.profile ? response.data.profile.isCompany : false
            });
            if (getAdvices) {
                resolve(axios.get(advicesUrl, {headers: Utils.getAuthTokenHeader()}));
            } else {
                resolve(true);
            }
        })
        .catch(error => {
            reject(error);
        })
        // .finally(() => {
        //     this.setState({loading: false});
        // });
    })

    processAdvices = (responseAdvices) => {
        const advices = [];
        responseAdvices.map((advice, index) => {
            advices.push({
                isFollowing: advice.isFollowing || false,
                id: advice._id || 0,
                name: advice.name || '',
                advisor: advice.advisor || {},
                createdDate: advice.createdDate || '',
                heading: advice.heading || '',
                subscribers: advice.numSubscribers || 0,
                followers: advice.numFollowers || 0,
                rating: (_.get(advice, 'rating.current', 0) || 0).toFixed(2),
                performanceSummary: advice.performanceSummary,
                rebalancingFrequency: _.get(advice, 'rebalance', 'N/A'),
                isApproved: _.get(advice, 'latestApproval.status', false),
                approvalStatus: _.get(advice, 'approvalRequested', false),
                isOwner: _.get(advice, 'isOwner', false),
                isSubscribed: _.get(advice, 'isSubscribed', false),
                public: _.get(advice, 'public', false),
                isTrending: false,
                netValue: _.get(advice, 'netValue', 0),
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
            // console.log(response.data);
            message.success('Success');
            this.getAdvisorSummary(false);
        })
        .catch(error => {
            message.error('Error occured !');
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                if (error.response.status === 400) {
                    this.setState({notAuthorized: true});
                }
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
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
                {this.state.isFollowing ? 'Unfollow' : 'Follow'}
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
                    style={{top: 20}}
            >
                <UpdateAdvisorProfile 
                        isCompany={this.state.isCompany}
                        advisorId={Utils.getUserInfo().advisor}
                        toggleModal={this.toggleUpdateModal}
                        advisor={this.state.advisor}
                        getAdvisorSummary={this.getAdvisorSummary}
                />
            </Modal>
        );
    }

    error = (err, response, body) => {
        // console.log('ERROR [%s]', err);
    }

    success = (data) => {
        // console.log(data);
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

    // renderFilterModal = () => {
    //     return (
    //         <Modal
    //                 title="Apply Filters"
    //                 visible={this.state.filterModalVisible}
    //                 footer={null}
    //                 onCancel={this.toggleFilterModal}
    //         >
    //             <AdviceFilterComponent 
    //                     updateAdvices={this.updateAdvices}
    //                     updateAdviceUrl={this.updateAdviceUrl}
    //                     toggleModal = {this.toggleFilterModal}
    //                     orderParam={this.state.sortBy}
    //             />
    //         </Modal>
    //     );
    // }

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

    onPaginationChange = (page, pageSize) => {
        const skip = this.state.pageLimit * (page - 1);
        window.scrollTo(0, 0);
        const adviceListUrl = `${requestUrl}/advice?advisor=${this.props.match.params.id}&skip=${skip}&limit=${this.state.pageLimit}`;
        this.setState({adviceLoading: true, selectedPage: page});
        fetchAjax(adviceListUrl, this.props.history, this.props.match.url)
        .then(response => {
            this.setState({advices: this.processAdvices(response.data.advices)});
        })
        .catch(error => error)
        .finally(() => {
            this.setState({adviceLoading: false});
        });
    }

    renderPageContent = () => {
        const breadCrumbs = getBreadCrumbArray(AdvisorProfileCrumb, [
            {name: 'Advisor Profile', url: '#'}
        ]);

        return (
            this.state.notAuthorized 
            ?   <ForbiddenAccess />
            :   <Row className='aq-page-container'>
                    {this.renderUpdateModal()}
                    <AqPageHeader 
                        title="Advisor Profile"
                        breadCrumbs={breadCrumbs}
                    />
                    <Col 
                            xl={17} 
                            md={24} 
                            className="row-container" 
                            style={{...shadowBoxStyle, marginBottom: '20px', minHeight: '600px', position: 'relative', paddingBottom: '60px'}}
                    >
                        <Row style={{paddingLeft: '40px', paddingTop: '20px'}}>
                            {this.renderProfileDetails()}
                        </Row>

                        <Row style={{ paddingLeft: '40px'}}>
                            {/*<Col span={22} style={{marginTop: '20px'}}>
                                <h3>Advisor Advices</h3>
                            </Col>*/}
                            <Col span={22}>
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
                                    <Col span={24} className='pagination-container'>
                                        {this.renderAdvices()}
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                        <Row style={{textAlign: 'center', width: '100%', position: 'absolute', bottom: '10px'}}>
                            {
                                this.state.advices.length > 0 &&
                                <Pagination
                                        // current={Number(this.state.selectedPage)}
                                        current={this.state.selectedPage} 
                                        total={this.state.advicesCount} 
                                        pageSize={this.state.pageLimit}
                                        onChange={this.onPaginationChange}
                                />
                            }
                        </Row>   
                    </Col>
                </Row>
        );
    }

    render() {
        return (
             <AppLayout 
                loading={this.state.loading || this.state.adviceLoading}
                content={this.renderPageContent()}>
            </AppLayout>
        );
    }
}

const socialIconStyle = {
    fontSize: '20px',
    margin: '0 10px',
    cursor: 'pointer'
}

const disabledSocialIconStyle = {
    color: '#AAAAAA'
}