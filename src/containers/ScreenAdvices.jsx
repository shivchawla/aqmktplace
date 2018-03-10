import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {Row, Col, Input, Icon, Button, Spin, Select, Tabs, Collapse, Checkbox} from 'antd';
import {AdviceListItem} from '../components';
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
            advices: [],
            defaultFilters: filters,
            selectedFilters: filters,
            selectAllFilters: true,
            selectedTab: 'all',
            selectMaxNotionalAllFilters: true,
            selectRebalanceAllFilters: true,
            selectApprovedllFilters: true,
            searchValue: ''
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

    getAdvices = () => {
        axios.get(this.processUrl(this.state.selectedTab), {headers: {'aimsquant-token': aimsquantToken}})
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
                    <Row style={{marginTop: 30}}>
                        <Col span={6}>
                            <IconHeader 
                                    icon="area-chart" 
                                    label="Max Notional" 
                                    checked={this.state.selectMaxNotionalAllFilters}
                                    filterType="maxNotional"
                                    onChange={this.handleFilterGroupCheckboxChange}
                            />
                            <Row>
                                <Col span={24}>
                                    {this.renderMaxNotionalFilter()}
                                </Col>
                            </Row>
                        </Col>
                        <Col span={6}>
                            <IconHeader 
                                    icon="clock-circle-o" 
                                    label="Rebalancing Frequency"
                                    checked={this.state.selectRebalanceAllFilters}
                                    filterType="rebalancingFrequency"
                                    onChange={this.handleFilterGroupCheckboxChange}
                            />
                            <Row>
                                <Col span={24}>
                                    {this.renderRebalancingFreqFilter()}
                                </Col>
                            </Row>
                        </Col>
                        <Col span={6}>
                            <IconHeader 
                                    icon="check-circle" 
                                    label="Status"
                                    checked={this.state.selectApprovedllFilters}
                                    filterType="approved"
                                    onChange={this.handleFilterGroupCheckboxChange}
                            />
                            <Row>
                                <Col span={24}>
                                    {this.renderStatusFilter()}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Panel>
            </Collapse>
        );
    }

    renderMaxNotionalFilter = () => (
        <CheckboxGroup 
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "maxNotional")} 
                options={this.state.defaultFilters.maxNotional}  
                value={this.state.selectedFilters.maxNotional} 
        />
    )

    renderRebalancingFreqFilter = () => (
        <CheckboxGroup 
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "rebalancingFrequency")} 
                options={this.state.defaultFilters.rebalancingFrequency} 
                value={this.state.selectedFilters.rebalancingFrequency} 
        />
    )

    renderStatusFilter = () => {
        return <CheckboxGroup 
                        onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "approved")} 
                        options={this.state.defaultFilters.approved} 
                        value={this.state.selectedFilters.approved} 
                />
    }

    handleFilterCheckboxChange = (checkedValues, type) => {
        this.setState({
            selectedFilters: {
                ...this.state.selectedFilters, 
                [type]: checkedValues,
            },
            [kvp[type]]: checkedValues.length === this.state.defaultFilters[type].length
        }, () => {
            this.getAdvices();
            console.log(checkedValues.length);
        });
    }

    handleFilterGroupCheckboxChange = (e, filterType) => {
        let arrray = [];
        if (e.target.checked) {
            arrray = filters[filterType];
        }
        this.setState({
            selectedFilters: {...this.state.selectedFilters, [filterType]: arrray},
            [kvp[filterType]]: e.target.checked
        }, () => {
            this.getAdvices();
        });
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
                                            <Button className="search-btn" size="large" type="primary" onClick={this.getAdvices}>
                                                <Icon type="search" />
                                            </Button>
                                        </div>
                                    )}
                                    value={this.state.searchValue}
                                    onChange={this.handleInputChange}
                                    onPressEnter={this.getAdvices}
                            />
                            <h5>{this.state.searchValue}</h5>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={6} offset={18} style={{marginTop: 20}}>
                            {/* {this.renderMenu()} */}
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