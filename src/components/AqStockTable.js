import * as React from 'react';
import {Table} from 'antd';
import moment from 'moment';
import {EditableCell} from './AqEditableCell';
import {connect} from 'react-redux';
import {store} from '../store';
import {getUnixTimeSeries, getStockData, addTimeSeries, calculateRemainingCash} from '../utils';

export class AqStockTableImpl extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'Symbol',
                dataIndex: 'symbol',
                key: 'symbol',
                render: (text, record) => this.renderColumns(text, record, 'symbol', 'text', record.tickerValidationStatus)
            },
            {
                title: 'Shares',
                dataIndex: 'shares',
                key: 'shares',
                render: (text, record) => this.renderColumns(
                        text, 
                        record, 
                        'shares', 
                        'number', 
                        record.sharesValidationStatus,
                        record.sharesDisabledStatus
                    )
            },
            {
                title: 'Last Price',
                dataIndex: 'lastPrice',
                key: 'lastPrice'
            },
            {
                title: 'Total Value',
                dataIndex: 'totalValue',
                key: 'totalValue'
            }
        ];
        this.state = {
            count:0
        };
    }

    componentWillMount() {
        console.log(this.props);
    }

    renderColumns = (text, record, column, type, validationStatus, disabled = false) => {
        return (
            <EditableCell 
                    validationStatus={validationStatus}
                    type={type}
                    value={text}
                    onChange={value => this.handleRowChange(value, record.key, column)}
                    disabled={disabled}
            />
        );
    }

    // dummy function, this will be removed when the time-series is obtained from the backend
    modifyTimeSeries = (data) => {
        let {count} = this.state;
        const modifiedTimeSeries = data.map((item, index) => {
            const price = item[1] + (10 * count);
            return [item[0], price];
        });
        count++;
        this.setState({count});

        return modifiedTimeSeries;
    }

    handleRowChange = (value, key, column) => {
        const newData = this.props.transactions;
        const target = newData.filter(item => key === item.key)[0];
        if(target) {
            target[column] = value;
            if(column === 'symbol') {
                if (value.length === 0) {
                    target['tickerValidationStatus'] = 'warning';
                } else {
                    target['tickerValidationStatus'] = 'validating';
                    getStockData(value)
                    .then((response) => {
                        const priceHistoryObj = response.data.priceHistory.values;
                        if(priceHistoryObj) {
                            // ticker search successful
                            const priceHistoryArray = Object.keys(priceHistoryObj);
                            const lastDate = priceHistoryArray[priceHistoryArray.length - 1];
                            const lastPrice = priceHistoryObj[lastDate];
                            target['lastPrice'] = lastPrice;
                            target['tickerValidationStatus'] = 'success';
                            target['sharesDisabledStatus'] = false;
                            // adding stock timeseries to HighStock
                            getUnixTimeSeries(response.data.priceHistory.values)
                            .then((modifiedData) => {
                                this.props.addTimeSeries(
                                    `${target['symbol'].toUpperCase()} - ${key + 1}`, 
                                    this.modifyTimeSeries(modifiedData) // data
                                );
                            });
                        } else {
                            target['lastPrice'] = 0;
                            target['tickerValidationStatus'] = 'error';
                        }
                        store.dispatch({
                            type: 'UPDATE_TRANSACTION',
                            payload: target
                        });
                    }).catch((error) => {
                        console.log(error);
                    });
                }
            } else if(column === 'shares') {
                target['totalValue'] = value * target['lastPrice'];
                const remainingCash = calculateRemainingCash(this.props.transactions, 100000);
                store.dispatch({
                    type: 'UPDATE_REMAINING_CASH',
                    payload: remainingCash
                });
                if(value.length === 0) {
                    target['sharesValidationStatus'] = 'warning';
                } 
                else if(value < 0) {
                    target['sharesValidationStatus'] = 'error';
                } else {
                    target['sharesValidationStatus'] = 'success';
                }
            }
            store.dispatch({
                type: 'UPDATE_TRANSACTION',
                payload: target
            });
        }
    }

    render() {
        return(
            <Table pagination={false} columns={this.columns} dataSource={this.props.transactions} />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        transactions: state.transactions.get('transactionData').toJS()
    }
};

export const AqStockTable = connect(mapStateToProps)(AqStockTableImpl);