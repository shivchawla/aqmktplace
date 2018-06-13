import * as React from 'react';
import _ from 'lodash';
import {Table, Tooltip} from 'antd';
import {nameEllipsisStyle, metricColor} from '../constants';
import {Utils} from '../utils';

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
                                        // color: props.updateTicker ? '#0091EA' : '#000000a6',
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
                title: this.renderHeaderText('UNREALIZED PNL(\u20B9)'),
                dataIndex: 'unrealizedPnL',
                key: 'unrealizedPnL',
                render: (text, record) => {
                    console.log(Number(text), typeof Number(text));
                    const color = Number(text) >= 0 ? metricColor.positive : metricColor.negative;

                    return (
                        <h3 style={{fontSize: '14px', color}}>{Utils.formatMoneyValueMaxTwoDecimals(text)}&nbsp;&nbsp;({`${record.unrealizedPnlPct} %` || '-'})</h3>
                    );
                }
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

    getUpdatedPositions = portfolio => {
        let portfolioArray = [];
        portfolio.positions.map((position, index) => {
            portfolioArray.push({
                key: index,
                name: _.get(position, 'security.detail.Nse_Name', '-'),
                weight: (_.get(position, 'weightInPortfolio', 0.0) * 100).toFixed(2)+'%',
                sector: _.get(position, 'security.detail.Sector', '-'),
                price: Utils.formatMoneyValueMaxTwoDecimals(_.get(position, 'lastPrice', 0)),
                shares: position.quantity || 0,
                symbol: _.get(position, 'security.detail.NSE_ID', null) || _.get(position, 'security.ticker', '-'),
                avgPrice: Utils.formatMoneyValueMaxTwoDecimals(_.get(position, 'avgPrice', 0)),
                unrealizedPnL: Number(_.get(position, 'unrealizedPnL', 0)),
                // unrealizedPnL: Utils.formatMoneyValueMaxTwoDecimals(_.get(position, 'unrealizedPnL', 0)),
                unrealizedPnlPct: this.getUnrealizedPnlPct(_.get(position, 'unrealizedPnL', 0), _.get(position, 'avgPrice', 0), position.quantity || 0)
            });
        });

        return portfolioArray;
    }

    updateWeights = portfolio => {
        const cash = portfolio.cash ? portfolio.cash : 0.0
        return portfolio.positions.map(item => {
            const price = Number(item.price);
            const avgPrice = Number(item.avgPrice);
            const shares = Number(item.shares);
            return {
                ...item,
                weight: `${((price * shares) / (this.getTotalWeight(portfolio.positions) + cash) * 100).toFixed(2)} %`,
                price: Utils.formatMoneyValueMaxTwoDecimals(price),
                avgPrice: Utils.formatMoneyValueMaxTwoDecimals(avgPrice)
            }
        });
    }

    getUnrealizedPnlPct = (unrealizedPnl, avgPrice, shares) => {
        let avgPriceMod = avgPrice > 0 ? avgPrice : 1;
        return Number((unrealizedPnl / (shares * avgPriceMod) * 100).toFixed(2))
    }

    //NOT USED
    getTotalWeight = portfolioArray => {
        let totalWeight = 0;
        portfolioArray.map(item => {
            totalWeight += Number(item.price) * Number(item.shares);
        });

        return totalWeight;
    }

    renderHeaderText = title => <span style={{fontSize: '12px', fontWeight: '700'}}>{title}</span>

    getColumns = () => {
        if (this.props.columns && this.props.columns.length > 0) {
            const columns = this.columns.map(item => {
                const columnIndex = this.props.columns.indexOf(item.key);
                if (columnIndex !== -1) {
                    return item;
                }
            });
            return _.compact(columns);
        }

        return this.columns;
    }

    render() {
        return (
            <Table 
                    size={this.props.size || 'small'}
                    pagination={false} 
                    columns={this.getColumns()}
                    style={this.props.style}
                    scroll={this.props.scroll}
                    // processedPosition true means that the positions provided as props are processed into
                    // a certain format required by this table as seen in the columns
                    dataSource={this.props.processedPositions ?
                        this.updateWeights(this.props.portfolio) : 
                        this.getUpdatedPositions(this.props.portfolio)}
            />
        );
    }
}