import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Button, Checkbox, Row, Col, Icon, Slider, Divider} from 'antd';
import {IconHeader} from './IconHeader';
import {verticalLayout} from '../constants';
import '../css/buttons.css';

const {aimsquantToken, requestUrl, investorId} = require('../localConfig');
const CheckboxGroup = Checkbox.Group;
const filters = {
    rebalancingFrequency: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quartely'],
    approved: ['Approved', 'UnApproved'],
    owner: ['Personal', 'Others'],
    netValue: '0,',
    sharpe: '-10,10',
    return: '-100,100',
    volatility: '0,50',
    rating: '0,5'
};
const kvp = {
    rebalancingFrequency: 'selectRebalanceAllFilters',
    approved: 'selectApprovedllFilters',
    owner: 'selectOwnerAllFilters'
};

export class AdviceFilterSideComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultFilters: filters,
            selectedFilters: filters,
            selectMaxNotionalAllFilters: true,
            selectRebalanceAllFilters: true,
            selectApprovedllFilters: true,
            selectOwnerAllFilters: true
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({owner: nextProps.owner});
    }

    renderRebalancingFreqFilter = () => (
        <CheckboxGroup 
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "rebalancingFrequency")} 
                options={this.state.defaultFilters.rebalancingFrequency} 
                value={this.state.selectedFilters.rebalancingFrequency} 
        />
    )

    renderStatusFilter = () => (
        <CheckboxGroup 
                // style={verticalLayout}
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "approved")} 
                options={this.state.defaultFilters.approved} 
                value={this.state.selectedFilters.approved} 
        />
    )

    renderAdviceFilter = () => (
        <CheckboxGroup 
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "owner")} 
                options={this.state.defaultFilters.owner}
                value={this.state.selectedFilters.owner}
        />
    )

    handleFilterCheckboxChange = (checkedValues, type) => {
        this.setState({
            selectedFilters: {
                ...this.state.selectedFilters, 
                [type]: checkedValues,
            },
            [kvp[type]]: checkedValues.length === this.state.defaultFilters[type].length
        }, () => {
            this.props.updateAdviceUrl(this.processUrl());
        });
    }

    getAdvices = () => {
        axios.get(this.processUrl(), {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.props.updateAdvices(response.data);
        })
        .catch(error => {
            console.log(error);
        });
    }

    processUrl = (type = 'all') => {
        const {selectedFilters, defaultFilters} = this.state;
        let approved = selectedFilters.approved.map(item => item === 'Approved' ? 1 : 0);
        let personal = selectedFilters.owner.map(item => item === 'Personal' ? 1 : 0);
        const limit = 10;
        const rebalancingFrequency = selectedFilters.rebalancingFrequency.length > 0 ? _.join(selectedFilters.rebalancingFrequency, ',') : _.join(defaultFilters.rebalancingFrequency, ',');
        const {netValue, sharpe, volatility, rating} = selectedFilters;
        approved = _.join(approved, ',');
        personal = _.join(personal, ',');
        const url = `${requestUrl}/advice?all=true&rebalance=${rebalancingFrequency}&return=${selectedFilters.return/100}&rating=${rating}&volatility=${volatility/100}&sharpe=${sharpe}&netValue=${netValue}&approved=${approved}&personal=${personal}&limit=${limit}&orderParam=${this.props.orderParam}&order=-1`;
        this.props.updateAdviceUrl(url);
        return url;
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
            this.props.updateAdviceUrl(this.processUrl());
        });
    }

    handleSliderChange = (value, type) => {
        const selectedFilters = [...this.state.selectedFilters];
        const selectedRange = value.join(',');
        this.setState({
            selectedFilters: {
                ...this.state.selectedFilters,
                [type]: selectedRange
            }
        }, () => {
            this.props.updateAdviceUrl(this.processUrl());
        });

    }

    renderSliderFilters = (filterArray) => {
        return filterArray.map((filter, index) => {
            return (
                <Col span={24} key={index} style={{marginBottom: 20}}>
                    <IconHeader 
                            icon={filter.icon} 
                            label={filter.label}
                    />
                    <Row>
                        <Col span={24}>
                            <Slider 
                                    onChange={value => this.handleSliderChange(value, filter.type)} 
                                    range 
                                    defaultValue={filter.range.split(',').map(item => Number(item.trim()))} 
                                    min={filter.min}
                                    max={filter.max}
                                    marks={filter.marks ? filter.marks : {}}
                                    step={filter.step ? filter.step : 1}
                            />
                        </Col>
                    </Row>
                    {/* <Divider /> */}
                </Col>
            );
        })
    }

    render() {
        const {defaultFilters} = this.state;
        const filterArray = [
            {type: 'rating', label: 'Rating', range: defaultFilters.rating, min: 0, max: 5, step:0.1},
            {type: 'sharpe', label: 'Sharpe Ratio', range: defaultFilters.sharpe, min: -10, max:10, step: 0.5},
            {type: 'netValue', label: 'Net Value', range: defaultFilters.netValue, min: 0, max: 600000, step: 1000},
            {type: 'volatility', label: 'Volatility', range: defaultFilters.volatility, min: 0, max: 50},
            {type: 'return', label: 'Annual Return', range: defaultFilters.return, min: -100, max: 100},
        ];

        return (
            <Col span={24} style={filterLayoutStyle}>
                <Row>
                    <Col span={24} style={{marginBottom: '20px'}}>
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
                    <Col span={24} style={{marginBottom: '20px'}}>
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
                    <Col span={24} style={{marginBottom: '20px'}}>
                        <IconHeader 
                                icon="check-circle" 
                                label="Ownership"
                                checked={this.state.selectOwnerAllFilters}
                                filterType="owner"
                                onChange={this.handleFilterGroupCheckboxChange}
                        />
                        <Row>
                            <Col span={24}>
                                {this.renderAdviceFilter()}
                            </Col>
                        </Row>
                    </Col>
                    {
                        this.renderSliderFilters(filterArray)
                    }
                </Row>
            </Col>
        );
    }
}

const filterHeader = {
    fontSize: '14px',
    color: '#444',
    fontWeight: 700,
    marginBottom: '10px'
};

const filterLayoutStyle = {
    padding: '15px', 
    overflow: 'hidden', 
    //overflowY: 'scroll', 
    //height: '600px',
    layout_weight: '1'
}