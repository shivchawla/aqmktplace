import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import {getStockData} from '../utils';
import _ from 'lodash';
import {Table, Button, Input, DatePicker, Row, Col} from 'antd';
import {EditableCell} from './AqEditableCell';
import {AutoCompleteEditableCell} from './AutoCompleteEditableCell';

const addInititalTransaction = () => {
    const transactions = [];
    for (let i=0 ; i< 3; i++) {
        transactions.push({
            key: Math.random().toString(36),
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
                render: (text, record) => this.renderAutoCompleteColumn(text, record, 'symbol', 'text', record.tickerValidationStatus),
                width: 150
            },
            {
                title: 'DATE',
                dataIndex: 'date',
                key: 'date',
                render: (text, record) => this.renderDatePicker(text, record, 'date'),
                width: 150
            },
            {
                title: 'SHARES',
                dataIndex: 'shares',
                key: 'shares',
                render: (text, record) => this.renderInput(text, record, 'shares', 'number'),
                width: 100
            },
            {
                title: 'PRICE',
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => this.renderInput(text, record, 'price', 'number'),
                width: 100
            },
            {
                title: 'COMMISSION',
                dataIndex: 'commission',
                key: 'commission',
                render: (text, record) => this.renderInput(text, record, 'commission'),
                width: 100
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

    renderAutoCompleteColumn = (text, record, column, type, validationStatus, disabled = false) => {
        return (
            <AutoCompleteEditableCell 
                    onSelect={value => {this.handlePressEnter(value, record.key, column)}}
                    handleAutoCompleteChange={value => this.handleAutoCompleteChange(value, record.key, column)}
            />
        );
    }

    handlePressEnter = (value, key, column) => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === key)[0];
        if (target) {
            target[column] = value;
            if(column === 'symbol') {
                this.asyncGetTarget(value)
                .then(response => {
                    target = Object.assign(target, response);
                    this.setState({data: newData});
                    this.props.onChange(newData);
                });
            }
        }
    }
    
    handleAutoCompleteChange = (value, key, column) => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === key)[0];
        if (target) {
            if (value.length < 1) {
                target[column] = value;
                target['shares'] = 0;
                target['lastPrice'] = 0;
                target['totalValue'] = 0;
                target['weight'] = 0;
            }
            this.setState({data: newData});
            this.props.onChange(newData);
        }
    }

    disabledDate = current => {
        return current > moment().endOf('day');
    }

    renderDatePicker = (text, record, column) => {
        return (
            <DatePicker 
                    onChange={(date) => this.handleRowChange(date, record, column)}
                    disabledDate={this.disabledDate}
            />
        );
    }
    
    getRowSelection = () => {
        return {
            onChange: (selectedRowKeys, selectedRows) => {
                console.log(selectedRows);
                console.log(selectedRowKeys);
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
        this.setState({data, selectedRows: []}, () => {
            this.props.onChange(data);
        });
    }

    addItem = () => {
        const data = [...this.state.data];
        data.push({
            key: Math.random().toString(36),
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
                this.asyncGetTarget(value.toUpperCase())
                .then(response => {
                    target = Object.assign(target, response);
                    this.setState({data: newData});
                    this.props.onChange(newData);
                });
            }
            target[column] = column === 'symbol' ? value.toUpperCase() : value; 
            this.setState({data: newData});
            this.props.onChange(newData);
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
                            <Button 
                                    onClick={this.deleteItems} 
                                    style={{left: '20px'}} 
                                    disabled={this.state.selectedRows.length > 0 ? false : true}
                            >
                                Delete Selected
                            </Button>
                        </Col>
                        <Col span={4} offset={16}>
                            <Button onClick={this.addItem} style={{right: '20px', position: 'absolute'}}>Add Transaction</Button>
                        </Col>
                    </Row>
                </Col>
                <Col span={24} style={{marginTop: 20, padding: '0 20px'}}>
                    <Table 
                            size="small"
                            dataSource={this.state.data} 
                            columns={this.columns} 
                            pagination={false} 
                            rowSelection={this.getRowSelection()} 
                            scroll={{y: 250, x: true}}
                    />
                </Col>
            </Row>
        );
    }
}