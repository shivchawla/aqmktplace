import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {Row, Col, Input, Icon, Button, Spin, Select, Tabs, Collapse, Checkbox, Popover, Modal} from 'antd';
import {AdviceListItemMod, AdviceFilterComponent, AdviceFilterSideComponent, BreadCrumb} from '../components';
import {newLayoutStyle, pageTitleStyle, shadowBoxStyle} from '../constants';
import {Utils, getBreadCrumbArray} from '../utils';
import '../css/screenAdvices.css';

const {aimsquantToken, requestUrl} = require('../localConfig');
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const antIcon = <Icon type="loading" style={{ fontSize: 18 }} spin />;

const filters = {
    maxNotional: ['100000', '200000', '300000', '500000', '750000', '1000000'],
    rebalancingFrequency: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quartely'],
    approved: ['Approved', 'UnApproved']
};

const kvp = {
    maxNotional: 'selectMaxNotionalAllFilters',
    rebalancingFrequency: 'selectRebalanceAllFilters',
    approved: 'selectApprovedllFilters'
};

const sortValues = ['name', 'updatedAt desc', 'subscribers', 'followers', 'rating'];

export class ScreenAdvices extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            spinning: false,
            adviceUrl: `${requestUrl}/advice?all=true&trending=false&subscribed=false&following=false&order=-1`,
            advices: [],
            defaultFilters: filters,
            selectedFilters: filters,
            selectAllFilters: true,
            selectedTab: 'all',
            selectMaxNotionalAllFilters: true,
            selectRebalanceAllFilters: true,
            selectApprovedllFilters: true,
            searchValue: '',
            sortBy: 'rating',
            activeFilterPanel: [],
            filterModalVisible: false,
            loading: true
        }
    }

    handleSelectChange = value => {
        console.log(value);
    }
    
    renderMenu = () => {
        const options = ['name', 'rating', 'followers', 'subscribers'];

        return (
            <Select size="small" defaultValue={options[0]} style={{width: 120}} onChange={this.handleSelectChange}>
                {
                    options.map((item, index) => {
                        return (
                            <Option key={index} value={item}>{item}</Option>
                        );
                    })
                }
            </Select>
        );
    }

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            this.getAdvices();
            this.toggleFilter();
        }
    }

    getAdvices = (adviceUrl) => {
        this.setState({loading: true});
        const url = adviceUrl === undefined ? this.processUrl(this.state.selectedTab) : adviceUrl;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            console.log(response.data);
            this.setState({
                advices: this.processAdvices(response.data)
            });
        })
        .catch(error => {
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        })
        .finally(() => {
            this.setState({loading: false});
        });
    }

    processUrl = (type) => {
        const {selectedFilters, defaultFilters} = this.state;
        let approved = selectedFilters.approved.map(item => item === 'Approved' ? 1 : 0);
        const personal = '0,1';
        const limit = 10;
        const maxNotional = selectedFilters.maxNotional.length > 0 ? _.join(selectedFilters.maxNotional, ',') : _.join(defaultFilters.maxNotional, ',');
        const rebalancingFrequency = selectedFilters.rebalancingFrequency.length > 0 ? _.join(selectedFilters.rebalancingFrequency, ',') : _.join(defaultFilters.rebalancingFrequency, ',');
        approved = _.join(approved, ',');
        return `${requestUrl}/advice?search=${this.state.searchValue}&${type}=true&rebalance=${rebalancingFrequency}&approved=${approved}&personal=${personal}&limit=${limit}`;
    }

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
                rating: _.get(advice, 'rating.current', 0).toFixed(2),
                performanceSummary: advice.performanceSummary
            })
        });

        return advices;
    }

    renderAdvices = () => {
        const {advices} = this.state;
        return advices.map((advice, index) => {
            console.log('Advice', advice);

            return (
                <AdviceListItemMod key={index} advice={advice}/>
            );
        })
    }

    renderFilter = () => {
        return (
            <Modal
                    title="Apply Filters"
                    visible={this.state.filterModalVisible}
                    onCancel={this.toggleFilterModal}
                    footer={null}
                    width={700}
            >
                <AdviceFilterComponent 
                        personal="0,1"
                        updateAdvices={this.updateAdvices}
                        updateAdviceUrl={this.updateAdviceUrl}
                        toggleModal = {this.toggleFilterModal}
                        orderParam={this.state.sortBy}
                        toggleFilter={this.toggleFilter}
                />
            </Modal>
        );
    }

    toggleFilterModal = () => {
        this.setState({filterModalVisible: !this.state.filterModalVisible});
    }

    updateAdvices = (advices) => {
        this.setState({advices: this.processAdvices(advices)});
    }

    updateAdviceUrl = (url) => {
        this.setState({adviceUrl: url});
    }

    handleTabChange = (key) => {
        this.setState({selectedTab: key}, () => {
            this.getAdvices();
        });
    }

    handleInputChange = (e) => {
        const value = e.target.value;
        this.setState({searchValue: value}, () => {
            if (value.length === 0) {
                this.getAdvices();
            }
        });
    }

    handleSortingMenuChange = (value) => {
        console.log(value);
        this.setState({sortBy: value}, () => {
            const url = `${this.state.adviceUrl}&orderParam=${this.state.sortBy}`;
            this.getAdvices(url);
        });
    }

    renderSortingMenu = () => {
        return (
            <Select 
                    defaultValue={this.state.sortBy} 
                    onChange={this.handleSortingMenuChange} 
                    style={{fontSize: '14px', width: '120px'}}
            >
                <Option value="rating">Rating</Option>
                <Option value="return">Return</Option>
                <Option value="name">Name</Option>
                <Option value="volatility">Volatility</Option>
                <Option value="sharpe">Sharpe</Option>
                <Option value="maxloss">Max Loss</Option>
                <Option value="numFollowers">Followers</Option>
                <Option value="numSubscribers">Subscribers</Option>
                <Option value="createdDate">Created Date</Option>
            </Select>
        );
    }

    toggleFilter = () => {
        let activeFilterPanel = [...this.state.activeFilterPanel];
        if (!activeFilterPanel.length) {
            activeFilterPanel.push("1");
        } else {
            activeFilterPanel = [];
        }
        this.setState({activeFilterPanel}, () => {
            this.state.activeFilterPanel;
        });
    }

    render() {
        const antIcon = <Icon type="loading" style={{ fontSize: 36 }} spin />;
        const breadCrumbs = getBreadCrumbArray([{name: 'Screen Advices'}]);

        return (

            <Row>
                <Row>
                    <Col xl={17} md={24}>
                        <h1 style={pageTitleStyle}>Screen Advices</h1>
                    </Col>
                    <Col xl={17} md={24}>
                        <BreadCrumb breadCrumbs={breadCrumbs} />
                    </Col>
                </Row>    
                <Row className="row-container" style={shadowBoxStyle}>
                    {this.renderFilter()}
                    
                    <Col xl={17} md={24} style={{paddingLeft:'20px'}}>
                        <Row style={{marginTop: '40px'}}>
                            
                            <Row style={{...shadowBoxStyle, border:'0', borderWidth:'0px'}}> 
                                <Input 
                                    suffix={(
                                        <Icon 
                                            type="search" 
                                            style={{fontSize: '16px', marginRight: '10px', fontWeight: '600'}}
                                        />
                                    )}
                                    placeholder="Search Advice"
                                    value={this.state.searchValue}
                                    onChange={this.handleInputChange}
                                    onPressEnter={() => this.getAdvices()}/>
                            </Row>

                            <Row type="flex" align="middle" justify="end" >
                                <Col span={10} style={{...filterSortContainerStyle, marginBottom: '-40px', zIndex:'4'}}>
                                    <Row type="flex" align="middle" justify="end">
                                        <Col xs={3} md={3} xl={0} style={{marginTop: '5px'}}>
                                            <Icon   onClick={this.toggleFilterModal} 
                                                    style={{cursor: 'pointer'}}
                                                    type="bars" 
                                                    //onClick={this.toggleFilter} 
                                                    style={{ fontSize: 20, cursor: 'pointer'}}
                                            />
                                        </Col>
                                        <Col span={4}>
                                            <h5 style={{fontSize: '14px', color: '#6C6C6C'}}>Sort By</h5>
                                        </Col>
                                        <Col span={9}>
                                            {this.renderSortingMenu()}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <Tabs 
                                        animated={false} 
                                        defaultActiveKey="all" 
                                        onChange={this.handleTabChange}
                                >
                                    <TabPane tab="All" key="all">
                                        <Spin size="large" spinning={this.state.loading}>
                                            {this.renderAdvices()}
                                        </Spin>
                                    </TabPane>
                                    <TabPane tab="Trending" key="trending">
                                        <Spin size="large" spinning={this.state.loading}>
                                            {this.renderAdvices()}
                                        </Spin>
                                    </TabPane>
                                    <TabPane tab="Subscribed" key="subscribed">
                                        <Spin size="large" spinning={this.state.loading}>
                                            {this.renderAdvices()}
                                        </Spin>
                                    </TabPane>
                                    <TabPane tab="Wishlist" key="following">
                                        <Spin size="large" spinning={this.state.loading}>
                                            {this.renderAdvices()}
                                        </Spin>
                                    </TabPane>
                                </Tabs>
                            </Col>
                        </Row>                  
                    </Col>
                    <Col xl={6} md={0} offset={1} style={{...newLayoutStyle, padding: '0'}}>
                        <Row>
                            <Col span={8}>
                                <h3 style={{...filterHeaderStyle, margin: '10px 0 0 10px'}}>Apply Filters</h3>
                            </Col>
                            <Col span={6} offset={9}>
                                <Button style={filterBtnStyle} onClick={() => this.getAdvices(this.state.adviceUrl)}>Update</Button>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <AdviceFilterSideComponent 
                                        personal="0,1"
                                        updateAdvices={this.updateAdvices}
                                        updateAdviceUrl={this.updateAdviceUrl}
                                        toggleModal = {this.toggleFilterModal}
                                        orderParam={this.state.sortBy}
                                        toggleFilter={this.toggleFilter}
                                />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Row>
        );
    }
}

const IconHeader = ({icon, label, checked, filterType, onChange}) => {
    return (
        <Row>
            <Col span={4}>
                <Checkbox checked={checked} onChange={(e) => onChange(e, filterType)}/>
            </Col>
            <Col span={4}>
                <Icon type={icon} />
            </Col>
            <Col span={12}>
                <h5>{label}</h5>
            </Col>
        </Row>
    );
};

const filterSortContainerStyle = {
    marginTop: '20px',
};

const searchInputStyle = {
    borderRadius: '2px'
};

const filterHeaderStyle = {
    fontSize: '14px'
};

const filterBtnStyle = {
    border: '1px solid #eaeaea',
    backgroundColor: '#23BEC3',
    fontSize: '12px',
    padding: '0 !important',
    height: '22px',
    marginTop: '8px',
    color: '#fff'
};
