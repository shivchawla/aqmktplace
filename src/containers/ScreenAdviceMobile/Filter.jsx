import * as React from 'react';
import _ from 'lodash';
import {Checkbox, Row, Col, Collapse, Icon} from 'antd';
import {FilterSliderComponent} from './FilterSliderComponent';
import {adviceFilters as filters} from '../../constants/filters';
import {primaryColor, horizontalBox} from '../../constants';
import {Utils} from '../../utils';
import '../../css/buttons.css';

const CheckboxGroup = Checkbox.Group;
const Panel = Collapse.Panel;
const kvp = {
    rebalancingFrequency: 'selectRebalanceAllFilters',
    approved: 'selectApprovedllFilters',
    owner: 'selectOwnerAllFilters'
};

export class FilterMobileComponent extends React.Component {
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
        this.sliderFilters = [];
    }

    componentWillReceiveProps(nextProps) {
        const selectedFilters = {...filters, ...Utils.getObjectFromLocalStorage('adviceFilter')};
        this.setState({
            selectedFilters,
            owner: nextProps.owner
        });
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
            this.props.updateSelectedFilters(this.state.selectedFilters);
            Utils.localStorageSaveObject('adviceFilter', this.state.selectedFilters);
        });
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
        });
    }

    handleSliderChange = (value, type) => {
        const selectedRange = value.join(',');
        this.setState({
            selectedFilters: {
                ...this.state.selectedFilters,
                [type]: selectedRange
            }
        });

    }

    setSliderInputRef = el => {
        const sliderType = _.get(el, 'props.type', null);
        if (sliderType !== null) {
            const indexOfSlider = this.sliderFilters.filter(item => item.props.type === sliderType)[0];
            if (indexOfSlider === undefined) {
                this.sliderFilters.push(el);
            }
        }
    }

    renderSliderFilters = filterArray => {
        return filterArray.map((filter, index) => {
            return (
                <Panel header={filter.label} key={3 + index}>
                    <Row>
                        <Col span={24}>
                            <FilterSliderComponent 
                                min={filter.min}
                                max={filter.max}
                                defaultValue={filter.range.split(',').map(item => Number(item.trim()))}
                                type={filter.type}
                                handleSliderChange={this.handleSliderChange}
                                ref={this.setSliderInputRef}
                            />
                        </Col>
                    </Row>
                </Panel>
            );
        })
    }

    applyFilters = () => {
        this.props.updateSelectedFilters(this.state.selectedFilters);
        Utils.localStorageSaveObject('adviceFilter', this.state.selectedFilters);
    }

    clearAllFilters = () => {
        this.sliderFilters.map(el => {
            el.clearFilter();
        });
        this.setState({selectedFilters: this.state.defaultFilters}, () => {
            this.applyFilters();
        });
    }

    render() {
        const {selectedFilters} = this.state;
        const filterArray = [
            {type: 'return', label: 'Annual Return', range: selectedFilters.return, min: -100, max: 100},
            {type: 'rating', label: 'Rating', range: selectedFilters.rating, min: 0, max: 5, step:0.1},
            {type: 'netValue', label: 'Net Value', range: selectedFilters.netValue, min: 0, max: 200000, step: 10000},
            {type: 'volatility', label: 'Volatility', range: selectedFilters.volatility, min: 0, max: 50},
            {type: 'sharpe', label: 'Sharpe Ratio', range: selectedFilters.sharpe, min: -5, max:5, step: 0.5},
        ];

        return (
            <Row>
                <Col span={24} style={filterLayoutStyle}>
                    <Row gutter={16}>
                        <Col span={24} style={horizontalBox} onClick={this.props.toggleFilterMenu}>
                            <Icon type="left" />
                            <h3>Go Back</h3>
                        </Col>
                        <Col span={24}>
                            <h3 style={{fontSize: '14px', fontWeight: '700'}}>{'Sort & Filters'}</h3>
                        </Col>
                        <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                            <h3 
                                    onClick={this.applyFilters} 
                                    style={{color: primaryColor, fontSize: '14px'}}
                            >
                                Apply Filters
                            </h3>
                            <h3 
                                    onClick={this.clearAllFilters}
                                    style={{color: primaryColor, fontSize: '14px'}}
                            >
                                Clear All
                            </h3>
                        </Col>
                        <Col 
                                span={24} 
                                style={{
                                    marginTop: '10px',
                                    overflow: 'hidden',
                                    overflowY: 'scroll',
                                    maxHeight: '700px'
                                }}
                        >
                            <Collapse 
                                    bordered={false} 
                                    defaultActiveKey={['0']}
                            >
                                <Panel header="Rebalancing Frequency">
                                    <Row>
                                        <Col span={24}>
                                            {this.renderRebalancingFreqFilter()}
                                        </Col>
                                    </Row>
                                </Panel>
                                <Panel header="Status">
                                    <Row>
                                        <Col span={24}>
                                            {this.renderStatusFilter()}
                                        </Col>
                                    </Row>
                                </Panel>
                                <Panel header="Ownership">
                                    <Row>
                                        <Col span={24}>
                                            {this.renderAdviceFilter()}
                                        </Col>
                                    </Row>
                                </Panel>
                                {this.renderSliderFilters(filterArray)}
                            </Collapse>
                        </Col>
                    </Row>
                </Col>
            </Row>
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