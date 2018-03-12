import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {Row, Col, Input, Icon, Button, Spin, Select, Tabs, Collapse, Checkbox} from 'antd';
import {AdviceListItem, AdviceFilterComponent} from '../components';
import {layoutStyle} from '../constants';

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

export class ScreenAdvices extends React.Component {
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
            sortBy: 'rating'
        }
    }

    handleSelectChange = value => {
        console.log(value);
    }
    
    renderMenu = () => {
        const options = ['name', 'rating', 'followers', 'subscribers'];

        return (
            <Select defaultValue={options[0]} style={{width: 120}} onChange={this.handleSelectChange}>
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
    }

    getAdvices = (adviceUrl) => {
        const url = adviceUrl === undefined ? this.processUrl(this.state.selectedTab) : adviceUrl;
        console.log(url);
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({
                advices: this.processAdvices(response.data)
            });
        })
        .catch(error => {
            console.log(error);
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
        return `${requestUrl}/advice?search=${this.state.searchValue}&${type}=true&maxNotional=${maxNotional}&rebalance=${rebalancingFrequency}&approved=${approved}&personal=${personal}&limit=${limit}`;
    }

    processAdvices = (responseAdvices) => {
        const advices = [];
        responseAdvices.map((advice, index) => {
            console.log(advice);
            advices.push({
                id: advice._id,
                name: advice.name,
                advisor: advice.advisor,
                createdDate: advice.createdDate,
                heading: advice.heading,
                subscribers: advice.numSubscribers,
                rating: advice.latestAnalytics !== undefined ? advice.latestAnalytics.rating : 0,
                latestPerformance: advice.latestPerformance
            })
        });

        return advices;
    }

    renderAdvices = () => {
        const {advices} = this.state;
        return advices.map((advice, index) => {
            return (
                <AdviceListItem key={index} advice={advice}/>
            );
        })
    }

    renderFilter = () => {
        return (
            <Collapse defaultActiveKey={['1']}>
                <Panel header="Add Filters" key="1">
                    <AdviceFilterComponent 
                            updateAdvices={this.updateAdvices}
                            updateAdviceUrl={this.updateAdviceUrl}
                            toggleModal = {this.toggleFilterModal}
                            orderParam={this.state.sortBy}
                    />
                </Panel>
            </Collapse>
        );
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
            <Select defaultValue={this.state.sortBy} style={{width: 200}} onChange={this.handleSortingMenuChange}>
                <Option value="rating">Rating</Option>
                <Option value="return">Return</Option>
                <Option value="name">Name</Option>
                <Option value="volatility">Volatility</Option>
                <Option value="sharpe">Sharpe</Option>
                <Option value="maxloss">Max Loss</Option>
                <Option value="numFollowers">Number of Followers</Option>
                <Option value="numSubscribers">Number of Subscribers</Option>
                <Option value="createdDate">Created Date</Option>
            </Select>
        );
    }

    render() {
        return (
            <Row>
                <Col span={18} style={layoutStyle}>
                    <Row>
                        <Col span={24}>
                            <Input
                                    suffix={(
                                        <div>
                                            <Spin 
                                                    style={{marginRight: '20px'}} 
                                                    indicator={antIcon} 
                                                    spinning={this.state.spinning}
                                            />
                                            <Button className="search-btn" size="large" type="primary" onClick={() => this.getAdvices()}>
                                                <Icon type="search" />
                                            </Button>
                                        </div>
                                    )}
                                    value={this.state.searchValue}
                                    onChange={this.handleInputChange}
                                    onPressEnter={() => this.getAdvices()}
                            />
                        </Col>
                        <Col span={24}>
                            {this.renderSortingMenu()}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24} style={{marginTop: 20, marginBottom: 20}}>
                            {this.renderFilter()}
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tabs defaultActiveKey="all" onChange={this.handleTabChange}>
                                <TabPane tab="All" key="all">
                                    {this.renderAdvices()}
                                </TabPane>
                                <TabPane tab="Trending" key="trending">
                                    {this.renderAdvices()}
                                </TabPane>
                                <TabPane tab="Subscribed" key="subscribed">
                                    {this.renderAdvices()}
                                </TabPane>
                                <TabPane tab="Wishlist" key="following">
                                    {this.renderAdvices()}
                                </TabPane>
                            </Tabs>
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
}