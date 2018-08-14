import * as React from 'react';
import _ from 'lodash';
import {Table, Button, Row, Col, Tooltip} from 'antd';
import SliderInput from '../components/AqSliderInput';
import {Utils} from '../utils';
import {handleSectorTargetTotalChange} from '../containers/Contest/CreateAdvice/utils';

const maxStockTargetTotal = 50000;
const maxSectorTargetTotal = 180000;

export default class AqSectorTable extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'SECTOR',
                dataIndex: 'sector',
                key: 'sector',
                render: (text, record) => <span>{text}</span>,
                width: 130
            },
            {
                title: 'TARGET TOTAL',
                dataIndex: 'targetTotal',
                key: 'targetTotal',
                render: (text, record) => this.renderSliderColumns(text, record, 'targetTotal', 'number'),
                width: 300
            },
            {
                title: 'TOTAL',
                dataIndex: 'total',
                key: 'total',
                render: (text, record) => <span>{Utils.formatMoneyValueMaxTwoDecimals(text)}</span>,
                width: 150
            },
            {
                title: 'STOCKS #',
                dataIndex: 'numStocks',
                key: 'numStocks',
                render: (text, record) => <span>{text}</span>,
                width: 80
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                render: (text, record) => <span>{text} %</span>,
                width: 80
            },
        ];
        this.state = {
            selectedRows: [],
            data: this.processData(this.props.data),
            stockData: this.props.data
        };
    }

    renderSliderColumns = (text, record, column, type, disabled = false) => {
        const nPositionsInSector = this.state.stockData.filter(item => item.sector === record.sector).length;
        const maxSectorExposure = _.max([0, _.min([maxSectorTargetTotal, (nPositionsInSector * maxStockTargetTotal)])]);
        
        return (
            <SliderInput 
                value={text}
                onChange={value => {this.handleTargetTotalChange(value, record.key, column, type)}}
                min={0}
                max={maxSectorExposure}
                inputWidth='70px'
            />
        );
    }

    handleTargetTotalChange = (value, key, column) => {
        const newData = [...this.state.data];
        let positions = [...this.state.stockData];
        let count = 0;
        let target = newData.filter(item => item.key === key)[0];
        if (target !== undefined) {
            const newNav = Number(value);
            const oldNav = target.targetTotal;
            target[column] = newNav;
            this.setState({data: newData});
            let stockData = handleSectorTargetTotalChange(this.state.data, newNav, oldNav, key, this.state.stockData);
            // let stockData = [...this.state.stockData];
            // const newNav = Number(value);
            // const oldNav = target.targetTotal;
            // let cNav = newNav - oldNav;
            // while(Math.abs(cNav) > 5) {
            //     const positionsToChange = positions.filter(item => item.sector === key).filter(position => {
            //         if (cNav > 0) { return  position.effTotal < 50000}
            //         else { return position.effTotal >= 0 }
            //     });
            //     if (count > 5) {return};
            //     const nStocks = positionsToChange.length;
            //     const sNav = cNav / nStocks;
            //     target[column] = newNav;
            //     this.setState({data: newData});
            //     stockData = this.updateStockPositions(positions, positionsToChange, sNav);
            //     cNav = newNav - _.sum(stockData.filter(item => item.sector === key).map(item => item.effTotal));
            //     count++;
            // }
            this.asyncProcessData(stockData, true)
            .then(data => this.updateSectorWeights(data))
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

    updateStockPositions = (positions, positionsToChange, sNav) => {
        let nPositions =  positions.map(position => {
            const shouldModifyPosition = _.findIndex(positionsToChange, item => item.symbol === position.symbol) > -1;
            const targetTotal = _.max([0, _.min([50000, (position.effTotal + sNav)])]);
            const lastPrice = _.get(position, 'lastPrice', 1);
            const nShares = Math.floor(targetTotal / lastPrice);
            const totalValue = Number((lastPrice * nShares).toFixed(2));
            if (shouldModifyPosition) {
                position.effTotal = targetTotal;
                position.shares = nShares;
                position.totalValue = totalValue;
            }

            return position;
        });
        return this.updateStockWeights(nPositions);
    }

    updateStockWeights = (data) =>  {
        const totalPortfolioValue = this.getPortfolioTotalValue(data) === 0 ? 1 : this.getPortfolioTotalValue(data);
        return data.map(item => {
            return {
                ...item,
                weight: Number(((item.totalValue / totalPortfolioValue * 100)).toFixed(2))
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