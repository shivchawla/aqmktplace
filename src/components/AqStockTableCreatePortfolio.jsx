import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import {getStockData} from '../utils';
import _ from 'lodash';
import {Table, Button, Input, DatePicker, Row, Col} from 'antd';
import {EditableCell} from './AqEditableCell';

const addInititalTransaction = () => {
    const transactions = [];
    for (let i=0 ; i< 3; i++) {
        transactions.push({
            key: i,
            symbol: '',
            date: moment().format("YYYY-MM-DD"),
            shares: 0,
            price: 0,
            tickerValidationStatus: "warning",
            commission: 0
        });
    }

    return transactions;
}

export class AqStockTableCreatePortfolio extends React.Component {

    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol',
                render: (text, record) => this.renderInput(text, record, 'symbol', 'text', record.tickerValidationStatus)
            },
            {
                title: 'DATE',
                dataIndex: 'date',
                key: 'date',
                render: (text, record) => this.renderDatePicker(text, record, 'date')
            },
            {
                title: 'SHARES',
                dataIndex: 'shares',
                key: 'shares',
                render: (text, record) => this.renderInput(text, record, 'shares', 'number')
            },
            {
                title: 'PRICE',
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => this.renderInput(text, record, 'price', 'number')
            },
            {
                title: 'COMMISSION',
                dataIndex: 'commission',
                key: 'commission',
                render: (text, record) => this.renderInput(text, record, 'commission')
            }
        ];
        this.state = {
            data: addInititalTransaction(),
            selectedRows: []
        } 
    }

    renderInput = (text, record, column, type, validationStatus) => {
        return (
            <EditableCell 
                    validationStatus={validationStatus}
                    type={type}
                    value={text}
                    onChange={value => this.handleRowChange(value, record, column)}
            />
        );
    }

    renderDatePicker = (text, record, column) => {
        return (
            <DatePicker 
                    onChange={(date) => this.handleRowChange(date, record, column)}
            />
        );
    }
    
    getRowSelection = () => {
        return {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState(prevState => {
                    return {
                        selectedRows
                    }
                });
            }
        };
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
        data.push({
            key: data.length + 1,
            symbol: '',
            date: moment().format("YYYY-MM-DD"),
            shares: 0,
            price: 0,
            commission: 0
        });
        this.setState({data}, () => {
            this.props.onChange(data);
        });
    }

    handleRowChange = (value, record, column) => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === record.key)[0];
        if (target) {
            if (column === 'date') {
                value = moment(value).format('YYYY-MM-DD');
            } else if (column === 'symbol') {
                target['tickerValidationStatus'] = value.length === 0 ? 'warning' : 'validating';
                this.asyncGetTarget(value)
                .then(response => {
                    target = Object.assign(target, response);
                    this.setState({data: newData});
                    this.props.onChange(newData);
                });
            }
            target[column] = value;
            this.setState({data: newData});
            this.props.onChange(newData);
            if (this.isValidRow(target)) {
                this.props.previewPortfolio();
            }
        }
    }

    isValidRow = (row) => {
        if (row['tickerValidationStatus'] === 'success' && row['date'] !== undefined && row['shares'] > 0) {
            return true;
        }

        return false;
    }

    asyncGetTarget = (ticker) => {
        let validationStatus = 'error';
        const target = {};
        return new Promise((resolve, reject) => {
            getStockData(ticker, 'latestDetail')
            .then(response => {
                const lastPrice = response.data.latestDetail.values.Close;
                target['price'] = lastPrice;
                target['tickerValidationStatus'] = 'success';
                target['ticker'] = ticker;
            })
            .catch(error => {
                target['tickerValidationStatus'] = 'error';
                target['price'] = 0;
            })
            .finally(() => {
                resolve(target);
            });
        });
    }

    render() {
        return (
            <Row>
                <Col span={24}>
                    <Row>
                        <Col span={4}>
                            <Button onClick={this.deleteItems}>Delete Selected</Button>
                        </Col>
                        <Col span={4} offset={16}>
                            <Button onClick={this.addItem}>Add Transaction</Button>
                        </Col>
                    </Row>
                </Col>
                <Col span={24} style={{marginTop: 20}}>
                    <Table 
                            size="small"
                            dataSource={this.state.data} 
                            columns={this.columns} 
                            pagination={false} 
                            rowSelection={this.getRowSelection()} 
                    />
                </Col>
            </Row>
        );
    }
}