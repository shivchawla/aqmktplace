import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Button, Checkbox, Row, Col, Icon } from 'antd';
import {IconHeader} from './IconHeader';

const {aimsquantToken, requestUrl, investorId} = require('../localConfig');
const CheckboxGroup = Checkbox.Group;
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
        const personal = '1';
        const limit = 10;
        const maxNotional = selectedFilters.maxNotional.length > 0 ? _.join(selectedFilters.maxNotional, ',') : _.join(defaultFilters.maxNotional, ',');
        const rebalancingFrequency = selectedFilters.rebalancingFrequency.length > 0 ? _.join(selectedFilters.rebalancingFrequency, ',') : _.join(defaultFilters.rebalancingFrequency, ',');
        approved = _.join(approved, ',');
        const url = `${requestUrl}/advice?all=true&maxNotional=${maxNotional}&rebalance=${rebalancingFrequency}&approved=${approved}&personal=${personal}&limit=${limit}`;
        this.props.updateAdviceUrl(url);
        return url;
    }

    handleClick = () => {
        this.props.toggleModal();
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

    render() {
        return (
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
                <Col span={24}>
                    <Button onClick={this.handleClick}>Ok</Button>
                </Col>
            </Row>
        );
    }
}