//THIS IS 80% redundant code. Please IMPROVE THIS!!

import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Button, Checkbox, Row, Col, Icon, Slider, Divider} from 'antd';
import {IconHeader} from './IconHeader';
import {verticalLayout} from '../constants';

const {aimsquantToken, requestUrl, investorId} = require('../localConfig');
const CheckboxGroup = Checkbox.Group;
const filters = {
    maxNotional: ['100000', '200000', '300000', '500000', '750000', '1000000'],
    rebalancingFrequency: ['Daily', 'Weekly', 'Bi-Weekly', 'Monthly', 'Quartely'],
    approved: ['Approved', 'UnApproved'],
    netValue: '0,600000',
    sharpe: '-10,10',
    return: '-100,100',
    volatility: '0,5',
    rating: '0,5'
};
const kvp = {
    maxNotional: 'selectMaxNotionalAllFilters',
    rebalancingFrequency: 'selectRebalanceAllFilters',
    approved: 'selectApprovedllFilters'
};

export class AdviceFilterComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            defaultFilters: filters,
            selectedFilters: filters,
            selectMaxNotionalAllFilters: true,
            selectRebalanceAllFilters: true,
            selectApprovedllFilters: true,
        };
    }

    componentWillReceiveProps(nextProps) {
        this.setState({advices: nextProps.advices});
    }

    renderMaxNotionalFilter = () => (
        <CheckboxGroup 
                // style={verticalLayout}
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "maxNotional")} 
                options={this.state.defaultFilters.maxNotional}  
                value={this.state.selectedFilters.maxNotional} 
        />
    )

    renderRebalancingFreqFilter = () => (
        <CheckboxGroup 
                style={verticalLayout}
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "rebalancingFrequency")} 
                options={this.state.defaultFilters.rebalancingFrequency} 
                value={this.state.selectedFilters.rebalancingFrequency} 
        />
    )

    renderStatusFilter = () => {
        return <CheckboxGroup 
                        style={verticalLayout}
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
        const personal = this.props.personal;
        const limit = 10;
        const maxNotional = selectedFilters.maxNotional.length > 0 ? _.join(selectedFilters.maxNotional, ',') : _.join(defaultFilters.maxNotional, ',');
        const rebalancingFrequency = selectedFilters.rebalancingFrequency.length > 0 ? _.join(selectedFilters.rebalancingFrequency, ',') : _.join(defaultFilters.rebalancingFrequency, ',');
        const {netValue, sharpe, volatility, rating} = selectedFilters;
        approved = _.join(approved, ',');
        const url = `${requestUrl}/advice?all=true&rebalance=${rebalancingFrequency}&return=${selectedFilters.return/100}&rating=${rating}&volatility=${volatility/100}&sharpe=${sharpe}&netValue=${netValue}&approved=${approved}&personal=${personal}&limit=${limit}&orderParam=${this.props.orderParam}&order=-1`;
        this.props.updateAdviceUrl(url);
        return url;
    }

    handleClick = () => {
        if (this.props.toggleModal) {
            this.props.toggleModal();
        }
        this.getAdvices();
    }

    handleFilterGroupCheckboxChange = (e, filterType) => {
        let arrray = [];
        if (e.target.checked) {
            arrray = filters[filterType];
        }
        this.setState({
            selectedFilters: {...this.state.selectedFilters, [filterType]: arrray},
            [kvp[filterType]]: e.target.checked
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
                <Col span={10} key={index} offset={index % 2 == 0 ? 0 : 2} style={{marginBottom: 40}}>
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
            {type: 'rating', label: 'Rating', range: defaultFilters.rating, min: 0, max: 5, step: 0.1},
            {type: 'sharpe', label: 'Sharpe Ratio', range: defaultFilters.sharpe, min: -10, max: 10, marks: {0: '0'}, step: 0.5},
            {type: 'netValue', label: 'Net Value', range: defaultFilters.netValue, min: 0, max: 600000},
            {type: 'volatility', label: 'Volatility', range: defaultFilters.volatility, min: 0, max: 50},
            {type: 'return', label: 'Return', range: defaultFilters.return, min: -100, max: 100, marks: {0: '0'}},
        ];

        return (
            <Row style={{marginTop: 30}}>
                <Col span={24}>
                    <Row>
                        <Col span={8}>
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
                        <Col span={8}>
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
                </Col>
                <Col span={24}>
                    <Row>
                        {this.renderSliderFilters(filterArray)}
                    </Row>
                </Col>
                <Col span={24}>
                    <Button onClick={this.handleClick}>Ok</Button>
                </Col>
            </Row>
        );
    }
}