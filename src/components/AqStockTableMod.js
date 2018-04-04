import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {Table, Button, Row, Col} from 'antd';
import {AutoCompleteEditableCell} from './AutoCompleteEditableCell';
import {EditableCell} from './AqEditableCell';
import {getStockData} from '../utils';
import '../css/stockTableMod.css';

const {aimsquantToken, requestUrl} = require('../localConfig.js');

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
            priceHistory: [],
            weight: 0
        });
    }
    return data;
};

export class AqStockTableMod extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol',
                render: (text, record) => this.renderAutoCompleteColumn(text, record, 'symbol', 'text', record.tickerValidationStatus),
                width: 80,
                className: 'stock-table-col'
            },
            {
                title: 'SHARES',
                dataIndex: 'shares',
                key: 'shares',
                render: (text, record) => this.renderColumns(
                        text, 
                        record, 
                        'shares', 
                        'number', 
                        record.sharesValidationStatus,
                        record.sharesDisabledStatus
                    ),
                width: 60,
                className: 'stock-table-col'
            },
            {
                title: 'PRICE',
                dataIndex: 'lastPrice',
                key: 'lastPrice',
                width: 80,
                className: 'stock-table-col'
            },
            {
                title: 'TOTAL VALUE',
                dataIndex: 'totalValue',
                key: 'totalValue',
                width: 80,
                className: 'stock-table-col'
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                width: 80,
                className: 'stock-table-col'
            }
        ];
        this.state = {
            selectedRows: [],
            data: [],
            positions: [],
        };
    }

    renderAutoCompleteColumn = (text, record, column, type, validationStatus, disabled = false) => {
        return (
            <AutoCompleteEditableCell 
                    onSelect={value => {this.handlePressEnter(value, record.key, column)}}
                    handleAutoCompleteChange={value => this.handleAutoCompleteChange(value, record.key, column)}
            />
        );
    }

    renderColumns = (text, record, column, type, validationStatus, disabled = false) => {
        return (
            <EditableCell 
                    validationStatus={validationStatus}
                    type={type}
                    value={text}
                    onChange={value => {this.handleRowChange(value, record.key, column)}}
                    disabled={disabled}
            />
        );
    }

    handleRowChange = (value, key, column) => {
        const newData = [...this.state.data];
        console.log(newData);
        let target = newData.filter(item => item.key === key)[0];
        if (target) {
            target[column] = value;
            if (value.length > 0) {
                target['totalValue'] = Number((value * target['lastPrice']).toFixed(2));
                this.updateAllWeights(newData);
                target['weight'] = Number((target['totalValue'] / this.getTotalValueSummation(newData)).toFixed(2));
                this.setState({data: newData});
            }
            this.setState({data: newData});
            this.props.onChange(newData);
        }
    }

    updateAllWeights = (data) => {
        const totalSummation = Number(this.getTotalValueSummation(newData).toFixed(2));
        const newData = data.map((item, index) => {
            item['weight'] = Number((item['totalValue'] / totalSummation).toFixed(2));
            return item;
        });
    }

    handlePressEnter = (value, key, column) => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === key)[0];
        if (target) {
            target[column] = value;
            if(column === 'symbol') {
                // target['tickerValidationtarget['shares'] = 1;
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
                this.updateAllWeights(newData);
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
                target['ticker'] = ticker;
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
                console.log(selectedRows);
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
        this.setState({data, selectedRows: []}, () => {
            console.log(this.state.selectedRows);
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

    getTotalValueSummation = () => {
        const {data} = this.state;
        let totalValue = 0;
        data.map(item => {
            totalValue += item.totalValue;
        });

        return totalValue;
    }

    componentWillReceiveProps(nextProps) {
        let data = [];
        if (this.props.data !== nextProps.data) {
            data = nextProps.data;
            this.setState({data});
        }
    }

    componentWillMount() {
        if (!this.props.isUpdate) {
            const data = initialTransactions();
            this.setState({data});
        }
    }

    render() {
        return (
            <Col span={24}>
                <Row style={{marginBottom: '20px'}}>
                    <Col span={4}>
                        <Button onClick={this.deleteItems}>Delete Selected</Button>
                    </Col>
                    <Col span={4} offset={16} style={{display: 'flex', flexDirection: 'row', justifyContent: 'flex-end'}}>
                        <Button type="primary" onClick={this.addItem}>Add Position</Button>
                    </Col>
                </Row>
                <Table 
                        rowSelection={this.getRowSelection()} 
                        pagination={false} 
                        dataSource={this.state.data} 
                        columns={this.columns} 
                        size="small"
                />
            </Col>
        );
    }
}