import * as React from 'react';
import _ from 'lodash';
import {Table, Tooltip} from 'antd';
import {nameEllipsisStyle} from '../constants';

export class AqStockPortfolioTable extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: this.renderHeaderText('NAME'),
                dataIndex: 'name',
                key: 'name',
                fixed: true,
                width: 250,
                render: (text, record) => {
                    return (
                        <Tooltip title={text}>
                            <h3 
                                    onClick={() => props.updateTicker && props.updateTicker(record)} 
                                    style={{
                                        ...nameEllipsisStyle, 
                                        color: props.updateTicker ? '#0091EA' : '#000000a6',
                                        cursor: props.updateTicker ? 'pointer' : 'auto'
                                    }}
                            >
                                {text}
                            </h3>
                        </Tooltip>
                    );
                }
            },
            {
                title: this.renderHeaderText('SYMBOL'),
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: this.renderHeaderText('SHARES'),
                dataIndex: 'shares',
                key: 'shares'
            },
            {
                title: this.renderHeaderText('LAST PRICE(\u20B9)'),
                dataIndex: 'price',
                key: 'price'
            },
            {
                title: this.renderHeaderText('AVG. PRICE(\u20B9)'),
                dataIndex: 'avgPrice',
                key: 'avgPrice'
            },
            {
                title: this.renderHeaderText('SECTOR'),
                dataIndex: 'sector',
                key: 'sector'
            }, 
            {
                title: this.renderHeaderText('WEIGHT'),
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
                symbol: _.get(position, 'security.ticker', '-'),
                avgPrice: _.get(position, 'avgPrice', 0).toFixed(2)
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

    renderHeaderText = title => <span style={{fontSize: '12px', fontWeight: '700'}}>{title}</span>

    render() {
        console.log('Positions', this.props.positions);

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