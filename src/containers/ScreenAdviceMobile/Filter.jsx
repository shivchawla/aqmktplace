import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Icon, Collapse} from 'antd';
import {Accordion, Radio, List} from 'antd-mobile';
import {AqCheckboxGroup} from './AqCheckboxGroup';
import {FilterSliderComponent} from './FilterSliderComponent';
import {adviceFilters as filters} from '../../constants/filters';
import {primaryColor, horizontalBox} from '../../constants';
import {Utils} from '../../utils';
import './filter.css';
import '../../css/buttons.css';

const Panel = Collapse.Panel;
const RadioItem = Radio.RadioItem;
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
            type: Utils.getFromLocalStorage('selectedTab') || 'all',
            limit: 3,
            sortBy: Utils.getFromLocalStorage('sortBy') || 'rating',
        };
        this.sliderFilters = [];
    }

    componentWillReceiveProps(nextProps) {
        const selectedFilters = {...filters, ...Utils.getObjectFromLocalStorage('adviceFilter')};
        this.setState({
            selectedFilters,
            owner: nextProps.owner,
        });
    }

    handleRadioChange = (key, value) => {
        this.setState({[key]: value[0]});
    }

    renderAdviceTypeFilter = () => {
        const data = [
            {label: 'All', value: 'all'},
            {label: 'Trending', value: 'trending'},
            {label: 'Subscribed', value: 'subscribed'},
            {label: 'Followimg', value: 'following'},
        ];

        return (
            <AqCheckboxGroup 
                singleSelect={true}
                options={data}
                value={[this.state.type]} 
                onChange={checkedValues => this.handleRadioChange('type', checkedValues)}
            />
        );
    }

    renderSortingOptions = () => {
        const data = [
            {label: 'Rating', value: 'rating'},
            {label: 'Return', value: 'return'},
            {label: 'Name', value: 'name'},
            {label: 'Volatility', value: 'volatility'},
            {label: 'Sharpe', value: 'sharpe'},
            {label: 'Max Loss', value: 'maxLoss'},
            {label: 'Num. Followers', value: 'numFollowers'},
            {label: 'Num. Subscribers', value: 'numSubscribers'},
            {label: 'Created Date', value: 'createdDate'},
        ];

        return (
            <AqCheckboxGroup 
                singleSelect={true}
                options={data}
                value={[this.state.sortBy]} 
                onChange={checkedValues => this.handleRadioChange('sortBy', checkedValues)}
            />
        );
    }

    renderRebalancingFreqFilter = () => {
        return (
            <AqCheckboxGroup 
                options={this.state.defaultFilters.rebalancingFrequency} 
                value={this.state.selectedFilters.rebalancingFrequency} 
                onChange={checkedValues => this.handleFilterCheckboxChange(checkedValues, "rebalancingFrequency")}
            />
        );
    }

    renderStatusFilter = () => (
        <AqCheckboxGroup 
                onChange={(checkedValues) => this.handleFilterCheckboxChange(checkedValues, "approved")} 
                options={this.state.defaultFilters.approved} 
                value={this.state.selectedFilters.approved} 
        />
    )

    renderAdviceFilter = () => (
        <AqCheckboxGroup 
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
                <Panel 
                        // header={filter.label}
                        header={this.renderHeaderForSliderPanel(filter.label, filter.type)} 
                        key={5 + index}
                >
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
        this.props.toggleFilterMenu();
        this.props.updateSelectedFilters(this.state.selectedFilters, this.state.sortBy, this.state.type);
        Utils.localStorageSaveObject('adviceFilter', this.state.selectedFilters);
        Utils.localStorageSave('sortBy', this.state.sortBy || 'rating');
        Utils.localStorageSave('selectedTab', this.state.type || 'all');
    }

    clearAllFilters = () => {
        this.sliderFilters.map(el => {
            el.clearFilter();
        });
        this.setState({selectedFilters: this.state.defaultFilters}, () => {
            this.applyFilters();
        });
    }

    renderHeaderForPanel = (header, key) => {
        const filters = _.get(this.state, `selectedFilters[${key}]`, []);
        return (
            <Row className='panel-header'>
                <Col span={24}>
                    <h3>{header}</h3>
                </Col>
                <Col span={24}>
                    <h5 style={{fontSize: '12px'}}>{_.join(filters, ',')}</h5>
                </Col>
            </Row>
        );
    }

    renderHeaderForRadioPanel = (header, key) => {
        return (
            <Row className='panel-header'>
                <Col span={24}>
                    <h3>{header}</h3>
                </Col>
                <Col span={24}>
                    <h5 style={{fontSize: '12px'}}>{this.state[key]}</h5>
                </Col>
            </Row>
        );
    }

    renderHeaderForSliderPanel = (header, key) => {
        return (
            <Row className='panel-header'>
                <Col span={24}>
                    <h3>{header}</h3>
                </Col>
                <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                    <h5 style={{fontSize: '12px'}}>Min: {this.state.selectedFilters[key].split(',')[0]}</h5>
                    <h5 style={{marginRight: '20px', fontSize: '12px'}}>Max: {this.state.selectedFilters[key].split(',')[1]}</h5>
                </Col>
            </Row>
        );
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
                <Col span={24}>
                    <Row>
                        <Row className='header-container' style={{padding: '10px 20px', width: '100%'}}>
                            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                                <h3 style={{fontSize: '26px', fontWeight: '700'}}>{'Sort & Filters'}</h3>
                                <Icon 
                                        type="close-circle-o" 
                                        style={{fontSize: '26px', fontWeight: '700'}}
                                        onClick={this.props.toggleFilterMenu}
                                />
                            </Col>
                            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between', marginTop: '10px'}}>
                                <h3 
                                        onClick={this.applyFilters} 
                                        style={{color: primaryColor, fontSize: '18px'}}
                                >
                                    Apply
                                </h3>
                                <h3 
                                        onClick={this.clearAllFilters}
                                        style={{color: primaryColor, fontSize: '18px'}}
                                >
                                    Clear All
                                </h3>
                            </Col>
                        </Row>
                        <Row style={{padding: '0 20px', marginTop: '94px'}}>
                            <Col span={24} >
                                <Collapse 
                                        bordered={false} 
                                        className="my-accordion"
                                >
                                    <Panel 
                                            header={this.renderHeaderForRadioPanel('Sort By', 'sortBy')}
                                    >
                                        <Row>
                                            <Col span={24}>
                                                {this.renderSortingOptions()}
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel 
                                            header={this.renderHeaderForRadioPanel('Advice Type', 'type')}
                                    >
                                        <Row>
                                            <Col span={24}>
                                                {this.renderAdviceTypeFilter()}
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel 
                                            header={this.renderHeaderForPanel('Rebalancing Frequency', 'rebalancingFrequency')}
                                    >
                                        <Row>
                                            <Col span={24}>
                                                {this.renderRebalancingFreqFilter()}
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel 
                                            header={this.renderHeaderForPanel('Status', 'approved')}
                                    >
                                        <Row>
                                            <Col span={24}>
                                                {this.renderStatusFilter()}
                                            </Col>
                                        </Row>
                                    </Panel>
                                    <Panel 
                                            header={this.renderHeaderForPanel('Ownership', 'owner')}
                                    >
                                        <Row>
                                            <Col span={24}>
                                                {this.renderAdviceFilter()}
                                            </Col>
                                        </Row>
                                    </Panel>
                                    {this.renderSliderFilters(filterArray)}
                                </Collapse>
                            </Col>
                            <Col span={24} style={{height: '50px'}}></Col>
                        </Row>
                    </Row>
                </Col>
            </Row>
        );
    }
}

