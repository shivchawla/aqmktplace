import * as React from 'react';
import {Table, Button} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import {EditableCell} from './AqEditableCell';
import {getUnixStockData, getStockData} from '../utils';

const initialTransactions = () => {
    const data = [];
    for(let i=0; i < 5; i++) {
        data.push({
            symbol: '',
            key: i,
            shares: 0,
            lastPrice: 0,
            totalValue: 0,
            tickerValidationStatus: "warning",
            sharesValidationStatus: "success",
            sharesDisabledStatus: true,
            priceHistory: []
        });
    }
    return data;
};

export class AqStockTableMod extends React.Component {
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
            data: initialTransactions(),
            selectedRows: []
        };
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

    handleRowChange = (value, key, column) => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === key)[0];
        if(target) {
            target[column] = value;
            if(column === 'symbol') {
                target['tickerValidationStatus'] = value.length === 0 ? 'warning' : 'validating';
                _.throttle(() => {
                    return this.asyncGetTarget(value)
                    .then(response => {
                        target = Object.assign(target, response);
                        this.setState({data: newData});
                        this.props.onChange(newData);
                    });
                }, 5000)();
            } else {
                target['totalValue'] = value * target['lastPrice'];
            }
            this.setState({data: newData});
            this.props.onChange(newData);
        }
    }

    asyncGetTarget = (ticker) => {
        let validationStatus = 'error';
        const target = {};
        return new Promise((resolve, reject) => {
            getStockData(ticker, 'latestDetail')
            .then(response => {
                const lastPrice = response.data.latestDetail.values.Close;
                target['lastPrice'] = lastPrice;
                target['tickerValidationStatus'] = 'success';
                target['sharesDisabledStatus'] = false;
            })
            .catch(error => {
                target['tickerValidationStatus'] = 'error';
            })
            .finally(() => {
                resolve(target);
            });
        });
    }

    getRowSelection = () => {
        return {
            onChange: (selectedRowKeys, selectedRows) => {
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
        this.setState({data}, () => {
            this.props.onChange(data);
        });
    }

    addItem = () => {
        const data = [...this.state.data];
        console.log(data);
        data.push({
            symbol: '',
            key: data.length,
            shares: 0,
            lastPrice: 0,
            totalValue: 0,
            tickerValidationStatus: "warning",
            sharesValidationStatus: "success",
            sharesDisabledStatus: true,
            priceHistory: []
        });
        this.setState({data}, () => {
            this.props.onChange(data);
        });
    }

    render() {
        return (
            <div>
                <Table rowSelection={this.getRowSelection()} pagination={false} dataSource={this.state.data} columns={this.columns} />
                <Button onClick={this.deleteItems}>Delete Selected</Button>
                <Button onClick={this.addItem}>Add Position</Button>
            </div>
        );
    }
}