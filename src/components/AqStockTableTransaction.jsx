import * as React from 'react';
import {Table, Button, Checkbox, DatePicker} from 'antd';
import moment from 'moment';
import _ from 'lodash';
import {EditableCell} from './AqEditableCell';
import {getUnixStockData, getStockData} from '../utils';

const dateFormat = 'YYYY-MM-DD';

const initialTransactions = () => {
    const data = [];
    for(let i=0; i < 3; i++) {
        data.push({
            symbol: '',
            key: Math.random().toString(36),
            shares: 0,
            lastPrice: 0,
            totalValue: 0,
            tickerValidationStatus: "warning",
            sharesValidationStatus: "success",
            sharesDisabledStatus: true,
            cashLink: false,
            date: '1994-02-16'
        });
    }
    return data;
};

export class AqStockTableTransaction extends React.Component {
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
            },
            {
                title: 'Cash Link',
                dataIndex: 'cashLink',
                key: 'cashLink',
                render: (text, record) => (
                    <Checkbox 
                            onChange={() => {this.onCheckboxChange(text, record)}}
                            checked={record.cashLink}
                    >
                        Link Cash
                    </Checkbox>
                )
            },
            {
                title: 'Select Date',
                dataIndex: 'date',
                key: 'date',
                render: (text, record) => (
                    <DatePicker 
                            onChange={(date, dateString) => {this.onDateChange(date, record)}}
                    />
                )
            }
        ];
        this.state = {
            data: initialTransactions(),
            selectedRows: []
        };
    }

    onCheckboxChange = (text, record) => {
        const newData = [...this.state.data];
        const target = newData.filter((item) => item.key === record.key)[0];
        if (target) {
            target.cashLink = !target.cashLink;
        }
        this.setState({data: newData});
        this.props.onChange(newData);
    }

    onDateChange = (date, record) => {
        const newData = [...this.state.data];
        const target = newData.filter((item) => item.key === record.key)[0];
        if (target) {
            target.date = moment(date).format(dateFormat);
        }
        this.setState({data: newData});
        this.props.onChange(newData);
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
                this.asyncGetTarget(value)
                .then(response => {
                    target = Object.assign(target, response);
                    this.setState({data: newData});
                    this.props.onChange(newData);
                });
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
                const lastPrice = _.get(response.data, 'latestDetailRT.current', 0.0) || 
                                    _.get(response.data, 'latestDetail.Close', 0.0);
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
        let {data} = this.state;
        data = _.pull(data, ...this.state.selectedRows);
        this.setState({data}, () => {
            this.props.onChange(data);
        });
    }

    addItem = () => {
        const {data} = this.state;
        data.push({
            symbol: '',
            key: Math.random().toString(36),
            shares: 0,
            lastPrice: 0,
            totalValue: 0,
            tickerValidationStatus: "warning",
            sharesValidationStatus: "success",
            sharesDisabledStatus: true,
            priceHistory: []
        });
        this.setState({data: _.cloneDeep(data)});
    }

    render() {
        return (
            <div>
                <Table rowSelection={this.getRowSelection()} pagination={false} dataSource={this.state.data} columns={this.columns} />
                <Button onClick={this.deleteItems}>Delete Selected</Button>
                <Button onClick={this.addItem}>Add Transaction</Button>
            </div>
        );
    }
}