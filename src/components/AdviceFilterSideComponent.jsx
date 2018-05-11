import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import $ from 'jquery';
import {Button, Checkbox, Row, Col, Icon, Slider, Divider} from 'antd';
import {IconHeader} from './IconHeader';
import {adviceFilters as filters} from '../constants/filters';
import {verticalLayout} from '../constants';
import {Utils} from '../utils';
import '../css/buttons.css';

const {aimsquantToken, requestUrl, investorId} = require('../localConfig');
const CheckboxGroup = Checkbox.Group;
const kvp = {
    rebalancingFrequency: 'selectRebalanceAllFilters',
    approved: 'selectApprovedllFilters',
    owner: 'selectOwnerAllFilters'
};

export class AdviceFilterSideComponent extends React.Component {
    constructor(props) {
        super(props);
        const selectedFilters = {...filters, ...Utils.getObjectFromLocalStorage('adviceFilter')};
        this.state = {
            defaultFilters: filters,
            selectedFilters,
            selectMaxNotionalAllFilters: true,
            selectRebalanceAllFilters: _.get(selectedFilters, 'rebalancingFrequency', []).length === filters.rebalancingFrequency.length,
            selectApprovedllFilters: _.get(selectedFilters, 'approved', []).length === filters.approved.length,
            selectOwnerAllFilters: _.get(selectedFilters, 'owner', []).length === filters.owner.length,
            limit: 3
        };
    }

    componentWillReceiveProps(nextProps) {
        const selectedFilters = {...filters, ...Utils.getObjectFromLocalStorage('adviceFilter')};
        // console.log(selectedFilters);
        this.setState({
            selectedFilters,
            owner: nextProps.owner
        });
        // this.setState({owner: nextProps.owner});
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
            // console.log(this.state.selectedFilters);
            this.props.updateSelectedFilters(this.state.selectedFilters);
            Utils.localStorageSaveObject('adviceFilter', this.state.selectedFilters);
            // this.props.updateAdviceUrl(this.processUrl());
        });
    }

    processUrl = (type = 'all') => {
        const {selectedFilters, defaultFilters} = this.state;
        let approved = selectedFilters.approved.map(item => item === 'Approved' ? 1 : 0);
        let personal = selectedFilters.owner.map(item => item === 'Personal' ? 1 : 0);
        const limit = this.state.limit;
        const rebalancingFrequency = selectedFilters.rebalancingFrequency.length > 0 ? _.join(selectedFilters.rebalancingFrequency, ',') : _.join(defaultFilters.rebalancingFrequency, ',');
        const {netValue, sharpe, volatility, rating} = selectedFilters;
        // console.log('Net Value', netValue);
        approved = _.join(approved, ',');
        personal = _.join(personal, ',');
        const url = `${requestUrl}/advice?&${this.props.selectedTab}=true&rebalance=${rebalancingFrequency}&return=${this.convertRangeToDecimal(selectedFilters.return)}&rating=${rating}&volatility=${this.convertRangeToDecimal(volatility)}&sharpe=${sharpe}&netValue=${netValue}&approved=${approved}&personal=${personal}&limit=${limit}&orderParam=${this.props.orderParam}&order=-1`;
        // this.props.updateAdviceUrl(url);
        return url;
    }

    convertRangeToDecimal = range => {
        const rangeArray = range.split(',');
        const min = Number(rangeArray[0]) / 100;
        const max = Number(rangeArray[1]) / 100;
        const modifiedRange = _.join([min, max], ',');
        return modifiedRange;
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
            this.props.updateSelectedFilters(this.state.selectedFilters);
            Utils.localStorageSaveObject('adviceFilter', this.state.selectedFilters);
            // this.props.updateAdviceUrl(this.processUrl());
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
            this.props.updateSelectedFilters(this.state.selectedFilters);
            Utils.localStorageSaveObject('adviceFilter', this.state.selectedFilters);
            // this.props.updateAdviceUrl(this.processUrl());
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
                                    value={filter.range.split(',').map(item => Number(item.trim()))} 
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
        const {selectedFilters} = this.state;
        // console.log(selectedFilters);
        const filterArray = [
            {type: 'rating', label: 'Rating', range: selectedFilters.rating, min: 0, max: 5, step:0.1},
            {type: 'sharpe', label: 'Sharpe Ratio', range: selectedFilters.sharpe, min: -5, max:5, step: 0.5},
            {type: 'netValue', label: 'Net Value', range: selectedFilters.netValue, min: 0, max: 200000, step: 10000},
            {type: 'volatility', label: 'Volatility', range: selectedFilters.volatility, min: 0, max: 50},
            {type: 'return', label: 'Annual Return', range: selectedFilters.return, min: -100, max: 100},
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