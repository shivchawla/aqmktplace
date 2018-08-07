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
                render: (text, record) => <span>{text.toFixed(2)}</span>,
                width: 200
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                render: (text, record) => <span>{text}</span>,
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
        const updateSector = _.debounce((sector, differenceRatio, positive) => {
            this.props.onChange(this.updateStockPositions(sector, differenceRatio, positive));
        }, 200);

        let target = newData.filter(item => item.key === key)[0];
        if (target !== undefined) {
            const targetTotal = value.length > 0 ? Number(value) : 0;
            const oldTotal = target.targetTotal > 0 ? target.targetTotal : 1;
            const difference = oldTotal > targetTotal ? oldTotal - targetTotal : targetTotal - oldTotal;
            const differenceRatio = difference / oldTotal;
            const stockData = this.updateStockPositions(target.sector, differenceRatio, targetTotal > oldTotal);
            this.setState({
                data: this.updateSectorWeights(this.processData(stockData)),    
                stockData: stockData
            });
            this.props.onChange(stockData);
        }
    }

    updateStockPositions = (sector, differenceRatio, positive = true) => {
        let stockData = [...this.state.stockData];
        // filter all stocks based on the selected sector
        stockData = stockData.map(item => {
            if (item.sector === sector) {
                let effTotal = Number(item.effTotal);
                const actualDiffernce = effTotal * differenceRatio;
                effTotal = positive ? effTotal + actualDiffernce : effTotal - actualDiffernce;
                return this.modifyPositionFromTargetTotal(item, effTotal);
            } else {
                return item;
            }
        })
        
        return this.updateStockWeights(stockData);
    }

    updateStockWeights = (data) => {
        return data.map(item => {
            return {
                ...item,
                weight: Number(((item.totalValue / this.getPortfolioTotalValue(data) * 100)).toFixed(2))
            }
        });
    }

    getStockDataTotalValue = data => {
        return _.sum(data.map(item => item.totalValue));
    }

    modifyPositionFromTargetTotal = (item, effTotal) => {
        const shares = Math.floor(effTotal / item.lastPrice);
        const totalValue = shares * item.lastPrice;

        return {
            ...item,
            effTotal,
            shares,
            totalValue
        }
    }

    updateSectorWeights = data => {
        const totalPortfolioValue = _.sum(data.map(item => item.total));
        return data.map(item => {
            return {
                ...item,
                weight: Number(((item.total / totalPortfolioValue) * 100).toFixed(2))
            }
        })
    }

    processData = data => {
        const uniqueSectors = _.uniqBy(data, 'sector').map(item => item.sector);
        return uniqueSectors.map(sector => {
            const totalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.totalValue));
            const targetTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => Number(item.effTotal)));
            const individualTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.lastPrice))
            return {
                sector,
                targetTotal: targetTotalValue,
                total: totalValue,
                weight: Number(((totalValue / this.getPortfolioTotalValue(data)) * 100).toFixed(2)),
                key: Math.random().toString(36),
                individualTotalValue
            }
        })
    }

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