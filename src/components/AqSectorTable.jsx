import * as React from 'react';
import _ from 'lodash';
import {Table, Button, Row, Col, Tooltip} from 'antd';
import {EditableCell} from './AqEditableCell';
import {Utils} from '../utils';

export default class AqSectorTable extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'SECTOR',
                dataIndex: 'sector',
                key: 'sector',
                render: (text, record) => <span>{text}</span>,
                width: 200
            },
            {
                title: 'TARGET TOTAL',
                dataIndex: 'targetTotal',
                key: 'targetTotal',
                render: (text, record) => this.renderColumns(text, record, 'targetTotal', 'number'),
                width: 200
            },
            {
                title: 'TOTAL',
                dataIndex: 'total',
                key: 'total',
                render: (text, record) => <span>{Utils.formatMoneyValueMaxTwoDecimals(text)}</span>,
                width: 200
            },
            {
                title: 'STOCKS #',
                dataIndex: 'numStocks',
                key: 'numStocks',
                render: (text, record) => <span>{text}</span>,
                width: 200
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                render: (text, record) => <span>{text} %</span>,
                width: 200
            },
        ];
        this.state = {
            selectedRows: [],
            data: this.processData(this.props.data),
            stockData: this.props.data
        };
    }

    renderColumns = (text, record, column, type, disabled = false) => {
        return (
            <EditableCell 
                    type={type}
                    value={text}
                    onChange={value => {this.handleTargetTotalChange(value, record.key, column, type)}}
                    disabled={disabled}
                    width={120}
            />
        );
    }

    handleTargetTotalChange = (value, key, column, type = 'text') => {
        const newData = [...this.state.data];

        let target = newData.filter(item => item.key === key)[0];
        if (target !== undefined) {
            const targetTotal = value.length > 0 ? Number(value) : 0;
            const oldTargetTotal = target.targetTotal > 0 ? target.targetTotal : 1;
            let stockData = [];
            target[column] = value;
            this.setState({data: newData});
            this.updateStockPositions(target.sector, targetTotal, oldTargetTotal)
            .then(data => {
                stockData = data;
                return this.asyncProcessData(stockData, true);
            })
            .then(data => {
                // const nData = data.map(item => {
                //     if (item.sector === target.sector) {
                //         item.targetTotal = value;
                //     }
                //     return item;
                // })
                return this.updateSectorWeights(data)
            })
            .then(data => {
                this.setState({
                    data: data,    
                    stockData: stockData
                });
                this.props.onChange(stockData);
            })
            .catch(err => console.log(err))
        }
    }

    updateStockPositions = (sector, targetTotal, oldTargetTotal) => {
        let stockData = [...this.state.stockData];
        var numPositionsInSector = stockData.filter(item => item.sector === sector).length;
        // filter all stocks based on the selected sector
        return Promise.map(stockData, item => {
            if (item.sector === sector) {
                let effTotal = Number(item.effTotal);
                effTotal = oldTargetTotal > 0 && effTotal > 0 ? effTotal * (targetTotal / oldTargetTotal) : targetTotal / numPositionsInSector;
                return this.modifyPositionFromTargetTotal(item, effTotal);
            } else {
                return item;
            }
        })
        .then(data => this.updateStockWeights(data))
        .catch(err => console.log(err))
    }

    updateStockWeights = (data) => new Promise((resolve, reject) => {
        const totalPortfolioValue = this.getPortfolioTotalValue(data) === 0 ? 1 : this.getPortfolioTotalValue(data);
        resolve (data.map(item => {
            return {
                ...item,
                weight: Number(((item.totalValue / totalPortfolioValue * 100)).toFixed(2))
            }
        }));
    })

    getStockDataTotalValue = data => {
        return _.sum(data.map(item => item.totalValue));
    }

    modifyPositionFromTargetTotal = (item, effTotal) => {
        const shares = Math.floor(effTotal / item.lastPrice);
        const totalValue = shares * item.lastPrice;

        return {
            ...item,
            effTotal: Number(effTotal.toFixed(2)),
            shares,
            totalValue
        }
    }

    updateSectorWeights = data => new Promise((resolve, reject) => {
        let totalPortfolioValue = _.sum(data.map(item => item.total));
        totalPortfolioValue = totalPortfolioValue === 0 ? 1 : totalPortfolioValue;
        resolve (data.map(item => {
            return {
                ...item,
                weight: Number(((item.total / totalPortfolioValue) * 100).toFixed(2))
            }
        }));
    })

    processData = (data, disableTargetTotalUpdate = false) => {
        const sectorData = disableTargetTotalUpdate ? [...this.state.data] : [];
        const uniqueSectors = _.uniqBy(data, 'sector').map(item => item.sector);
        return uniqueSectors.map((sector, index) => {
            const numStocks = data.filter(item => item.sector === sector).length;
            const totalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.totalValue));            
            const targetTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => Number(item.effTotal)));
            const individualTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.lastPrice))
            if (disableTargetTotalUpdate) {
                return {
                    targetTotal: sectorData.filter(item => item.sector === sector)[0].targetTotal,
                    sector,
                    total: totalValue,
                    weight: Number(((totalValue / this.getPortfolioTotalValue(data)) * 100).toFixed(2)),
                    key: sector,
                    numStocks,
                    individualTotalValue
                }
            } else {
                return {
                    sector,
                    targetTotal: Number(targetTotalValue.toFixed(2)),
                    total: totalValue,
                    weight: Number(((totalValue / this.getPortfolioTotalValue(data)) * 100).toFixed(2)),
                    key: sector,
                    numStocks,
                    individualTotalValue
                }
            }
        })
    }

    asyncProcessData = (data, disableTargetTotalUpdate = false) => new Promise((resolve, reject) => {
        resolve (this.processData(data, disableTargetTotalUpdate));
    })

    getPortfolioTotalValue = data => {
        return _.sum(data.map(item => item.totalValue));
    }

    render() {
        return (
            <Col span={24} style={{marginTop: '55px'}}>
                <Table 
                    columns={this.columns} 
                    dataSource={this.state.data} 
                    pagination={false}
                    size="small"
                    rowClassName="stock-table-col"
                />
            </Col>
        );
    }
}