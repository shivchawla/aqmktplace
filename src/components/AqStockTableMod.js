import * as React from 'react';
import _ from 'lodash';
import {Table, Button, Row, Col, Tooltip} from 'antd';
import SliderInput from '../components/AqSliderInput';
import RadioActionButtons from './selections/RadioActionButtons';
import {verticalBox, nameEllipsisStyle, primaryColor, metricColor, horizontalBox} from '../constants';
import {Utils} from '../utils';

export class AqStockTableMod extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol',
                render: (text, record) => (
                    <div 
                        style={{...verticalBox, alignItems: 'flex-start'}}
                    >
                        <h3 
                                style={{
                                    ...nameEllipsisStyle,
                                    fontSize: '14px', 
                                    fontWeight: 700, 
                                    color: primaryColor,
                                    width: '275px',
                                    cursor: 'auto',
                                }}
                        >
                            {text} 
                            <span 
                                    style={{
                                        fontSize: '12px', 
                                        fontWeight: '400',
                                        color: '#444'
                                    }}
                            >
                                &nbsp;- {_.get(record, 'sector', '')} | {_.get(record, 'industry', '')}
                            </span>
                        </h3>
                        <span 
                                style={{
                                    ...nameEllipsisStyle, 
                                    fontSize: '12px', 
                                    color: '#444', 
                                    width: '200px',
                                    cursor: 'auto'
                                }}
                        >
                            {_.get(record, 'name', '')}
                        </span>
                    </div>
                ),
                width: 200
            },
            {
                title: '  TARGET TOTAL',
                dataIndex: 'effTotal',
                key: 'effTotal',
                render: (text, record) => this.renderSliderColumns(
                        text, 
                        record, 
                        'effTotal', 
                        'number', 
                        record.sharesValidationStatus,
                        record.sharesDisabledStatus
                    ),
                width: 200,
            },
            {
                title: 'SHARES',
                dataIndex: 'shares',
                key: 'shares',
                render: (val, record) => <span>{(record.buy ? 1 : -1) * val}</span>,
                width: 170,
            },
            {
                title: 'PRICE',
                dataIndex: 'lastPrice',
                key: 'lastPrice',
                width: 150,
                render: val => <span>{Utils.formatMoneyValueMaxTwoDecimals(val)}</span>
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                width: 120,
                render: (val, record) => <span>{(record.buy ? 1 : -1) * Utils.formatMoneyValueMaxTwoDecimals(val)}%</span>
            },
            {
                title: 'ACTION',
                dataIndex: 'buy',
                key: 'buy',
                render: (text, record) => (
                    <RadioActionButtons 
                        onChange={value => this.handleActionButtonChange(value, record, text)} 
                        defaultValue={text}
                    />
                ),
                width: 170
            }
        ];
        this.state = {
            selectedRows: [],
            data: this.props.data,
        };
    }

    handleActionButtonChange = (type, record, text) => {
        const buyStatus = type === 'buy';
        const clonedData = _.map(this.state.data, _.cloneDeep);
        const key = _.get(record, 'key', null);
        const targetIndex = _.findIndex(clonedData, item => item.key === key);
        const targetPosition = clonedData[targetIndex];
        if (targetPosition !== undefined) {
            targetPosition.buy = buyStatus;
            clonedData[targetIndex] = targetPosition ;
            this.setState({data: clonedData});
            this.props.onChange(clonedData, false)
        }
    }

    renderSliderColumns = (text, record, column, type) => {
        const targetTotal = Number(text);
        const positionsInSector = this.state.data.filter(item => item.sector === record.sector);
        const nPositionsInSector = positionsInSector.length;
        let maxSectorExposure = _.max([0, _.min([this.props.maxSectorTargetTotal, (nPositionsInSector * this.props.maxStockTargetTotal)])]);
        const sectorExposure = _.sum(positionsInSector.map(item => item.effTotal));
        const sectorMaxDifference = _.get(this.props, 'maxSectorTargetTotalHard', 0) - _.get(this.props, 'maxSectorTargetTotal', 0);
        const maxSectorExposureSoft = maxSectorExposure;
        const maxSectorExposureHard = maxSectorExposure + sectorMaxDifference;
        if (this.props.isUpdate) {
            if (sectorExposure > maxSectorExposureSoft && sectorExposure < maxSectorExposureHard) {
                maxSectorExposure = sectorExposure;
            }
        }
        const maxAllowance = maxSectorExposure - sectorExposure;
        let maxAllowedStockExposure = _.min([this.props.maxStockTargetTotal, (record.effTotal + maxAllowance)]);
        if (this.props.isUpdate) {
            if (targetTotal > this.props.maxStockTargetTotal && targetTotal < this.props.maxStockTargetTotalHard) {
                maxAllowedStockExposure = targetTotal;
            } 
        }
        return (
            <SliderInput 
                value={targetTotal}
                onChange={value => {this.handleRowChange(value, record.key, column, type)}}
                inputWidth='80%'
                max={maxAllowedStockExposure}
                hideValue
                stepSize={1000}
            />
        );
    }

    handleRowChange = (value, key, column, type='text') => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === key)[0];
        if (target) {
            const lastPrice = target['lastPrice'];
            target[column] = value;
            const shares = this.calculateSharesFromTotalReturn(value, lastPrice);
            target['shares'] = shares;
            target['totalValue'] = Number((shares * lastPrice).toFixed(2));
            this.updateAllWeights(newData)
            this.setState({newData}, () => this.props.onChange(newData));
        }
    }

    calculateSharesFromTotalReturn = (effTotalReturn = 0, lastPrice = 0) => {
        return Math.floor(effTotalReturn / lastPrice);
    }

    updateAllWeights = data => new Promise((resolve, reject) => {
        const totalSummation = Number(this.getTotalValueSummation(data).toFixed(2));
        resolve (data.map((item, index) => {
            const weight = totalSummation === 0 ? 0 : Number(((item['totalValue'] / totalSummation * 100)).toFixed(2));
            item['weight'] = weight;
            return item;
        }));
    })

    getRowSelection = () => {
        return {
            onChange: (selectedRowKeys, selectedRows) => {
                // console.log(selectedRows);
                this.setState((prevState) => {
                    return {
                        selectedRows
                    }
                });
            }
        }
    }

    deleteItems = () => {
        let data = [...this.state.data];
        data = _.pull(data, ...this.state.selectedRows);
        this.updateAllWeights(data);
        this.setState({data, selectedRows: []}, () => {
            this.props.onChange(data);
        });
    }

    addItem = () => {
        const data = [...this.state.data];
        data.push({
            symbol: '',
            name: '',
            sector: '',
            key: Math.random().toString(36),
            shares: 0,
            lastPrice: 0,
            totalValue: 0,
            tickerValidationStatus: "warning",
            sharesValidationStatus: "success",
            sharesDisabledStatus: true,
            priceHistory: [],
            weight: 0
        });
        this.setState({data}, () => {
            this.props.onChange(data);
        });
    }

    getTotalValueSummation = data => {
        let totalValue = 0;
        data.map(item => {
            totalValue += item.totalValue;
        });
        
        return totalValue;
    }

    componentWillReceiveProps(nextProps) {
        let data = [];
        if (nextProps.shouldUpdate) {
            data = nextProps.data;
            this.setState({data});
        } 
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        } 
        return false;
    }

    render() {
        return (
            <Col span={24}>
                <Row style={{marginBottom: '20px'}}>
                    <Tooltip
                            title="Delete Positions"
                            placement="top"
                    >
                        <Button
                                style={{width: '40px'}}
                                icon="delete" size="large" 
                                disabled={this.state.selectedRows.length > 0 ? false : true} 
                                onClick={this.deleteItems}
                        />
                    </Tooltip>
                </Row>
                <Table 
                        rowSelection={this.getRowSelection()} 
                        pagination={false} 
                        dataSource={this.state.data} 
                        columns={this.columns} 
                        size="small"
                        rowClassName="stock-table-col"
                />
            </Col>
        );
    }
}
