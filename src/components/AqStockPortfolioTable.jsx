import * as React from 'react';
import {Table, Tooltip} from 'antd';
import {nameEllipsisStyle} from '../constants';

export class AqStockPortfolioTable extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'NAME',
                dataIndex: 'name',
                key: 'name',
                fixed: true,
                width: 250,
                render: (text, record) => {
                    return (
                        <Tooltip title={text}>
                            <h3 onClick={() => props.updateTicker && props.updateTicker(record)} style={nameEllipsisStyle}>{text}</h3>
                        </Tooltip>
                    );
                }
            },
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'SHARES',
                dataIndex: 'shares',
                key: 'shares'
            },
            {
                title: 'PRICE(\u20B9)',
                dataIndex: 'price',
                key: 'price'
            },
            {
                title: 'SECTOR',
                dataIndex: 'sector',
                key: 'sector'
            }, {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight'
            }
        ];
    }

    getPortfolioArray = positions => {
        let portfolioArray = [];
        positions.map((position, index) => {
            portfolioArray.push({
                key: index,
                name: position.security.detail.Nse_Name,
                weight: 0,
                sector: position.security.detail.Sector,
                price: position.lastPrice.toFixed(2),
                shares: position.quantity,
                symbol: position.security.ticker,
            });
        });
        portfolioArray = this.updateWeights(portfolioArray);

        return portfolioArray;
    }

    updateWeights = portfolioArray => {
        return portfolioArray.map(item => {
            const price = Number(item.price);
            const shares = Number(item.shares);
            return {
                ...item,
                weight: `${((price * shares) / this.getTotalWeight(portfolioArray) * 100).toFixed(2)} %`
            }
        });
    }

    getTotalWeight = portfolioArray => {
        let totalWeight = 0;
        portfolioArray.map(item => {
            totalWeight += Number(item.price) * Number(item.shares);
        });

        return totalWeight;
    }

    render() {
        return (
            <Table 
                    size="small"
                    pagination={false} 
                    columns={this.columns} 
                    style={this.props.style}
                    // processedPosition true means that the positions provided as props are processed into
                    // a certain format required by this table as seen in the columns
                    dataSource={
                            this.props.processedPositions 
                            ? this.updateWeights(this.props.positions)
                            : this.getPortfolioArray(this.props.positions)
                        }
            />
        );
    }
}