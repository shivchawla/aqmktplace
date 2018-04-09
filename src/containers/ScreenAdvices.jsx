import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {Row, Col, Input, Icon, Button, Spin, Select, Tabs, Collapse, Checkbox, Popover, Modal} from 'antd';
import {AdviceListItemMod, AdviceFilterComponent, AdviceFilterSideComponent} from '../components';
import {newLayoutStyle} from '../constants';
import '../css/screenAdvices.css';

const {aimsquantToken, requestUrl, investorId} = require('../localConfig');
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
        this.getAdvices();
        this.toggleFilter();
    }

    getAdvices = (adviceUrl) => {
        this.setState({loading: true});
        const url = adviceUrl === undefined ? this.processUrl(this.state.selectedTab) : adviceUrl;
        console.log(url);
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(response.data);
            this.setState({
                advices: this.processAdvices(response.data)
            });
        })
        .catch(error => {
            console.log(error);
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
                isFollowing: advice.isFollowing,
                id: advice._id,
                name: advice.name,
                advisor: advice.advisor,
                createdDate: advice.createdDate,
                heading: advice.heading,
                subscribers: advice.numSubscribers,
                followers: advice.numFollowers,
                rating: advice.rating !== undefined ? Number(advice.rating.current.toFixed(2)) : 0,
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

        return (
            <Row style={{paddingBottom: '20px'}}>
                {this.renderFilter()}
                <Col xl={17} md={24} style={{...newLayoutStyle, padding: 0}}>
                    <Row className="row-container">
                        <Col span={24}>
                            <Input
                                    suffix={(
                                        <Icon 
                                                type="search" 
                                                style={{fontSize: '16px', marginRight: '10px', fontWeight: '600'}}
                                        />
                                    )}
                                    placeholder="Enter advice here"
                                    value={this.state.searchValue}
                                    onChange={this.handleInputChange}
                                    onPressEnter={() => this.getAdvices()}
                            />
                        </Col>
                        <Col span={24} style={filterSortContainerStyle}>
                            <Row type="flex" align="middle" justify="end">
                                <Col xs={6} md={6} xl={0} style={{}}>
                                {/* <Col span={6}> */}
                                    <Row type="flex" align="middle">
                                        <Col span={4}>
                                            <Icon 
                                                    type="bars" 
                                                    onClick={this.toggleFilter} 
                                                    style={{ fontSize: 20, cursor: 'pointer'}}
                                            />
                                        </Col>
                                        <Col span={14}>
                                            <h5 onClick={this.toggleFilterModal} style={{cursor: 'pointer'}}>Apply Filters</h5>  
                                        </Col>
                                    </Row>
                                </Col>
                                <Col span={6} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    <Row type="flex" align="middle">
                                        <Col span={8}>
                                            <h5 
                                                    style={{fontSize: '14px', color: '#6C6C6C', textAlign: 'right', marginRight: '10px'}}
                                            >
                                                Sort By
                                            </h5>
                                        </Col>
                                        <Col span={6}>
                                            {this.renderSortingMenu()}
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                            
                        </Col>
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
