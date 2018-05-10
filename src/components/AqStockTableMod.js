import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {Table, Button, Row, Col} from 'antd';
import {AutoCompleteEditableCell} from './AutoCompleteEditableCell';
import {EditableCell} from './AqEditableCell';
import {getStockData} from '../utils';

const {aimsquantToken, requestUrl} = require('../localConfig.js');

const initialTransactions = (n) => {
    const data = [];
    const rows = n || 5;
    for(let i=0; i < rows; i++) {
        data.push({
            symbol: '',
            key: Math.random().toString(36),
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
                width: 200
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
                width: 150,
            },
            {
                title: 'PRICE',
                dataIndex: 'lastPrice',
                key: 'lastPrice',
                width: 150,
            },
            {
                title: 'TOTAL',
                dataIndex: 'totalValue',
                key: 'totalValue',
                width: 150,
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                width: 150,
                render: text => <span>{text} %</span>
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
                    value={text}
            />
        );
    }

    renderColumns = (text, record, column, type, validationStatus, disabled = false) => {
        return (
            <EditableCell 
                    validationStatus={validationStatus}
                    type={type}
                    value={text}
                    onChange={value => {this.handleRowChange(value, record.key, column, type)}}
                    disabled={disabled}
                    width={120}
            />
        );
    }

    handleRowChange = (value, key, column, type='text') => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === key)[0];
        if (target) {
            if (type === 'number') {
                target[column] = value >= 0 ? value : 0;
            } else {
                target[column] = value;
            }
            value = value.length > 0 ? value : "0";   
            target['totalValue'] = value >= 0 ? Number((value * target['lastPrice']).toFixed(2)) : 0;
            this.updateAllWeights(newData);
            this.setState({data: newData});
            this.props.onChange(newData);
        }
    }

    updateAllWeights = (data) => {
        const totalSummation = Number(this.getTotalValueSummation(data).toFixed(2));
        return data.map((item, index) => {
            const weight = totalSummation === 0 ? 0 : Number(((item['totalValue'] / totalSummation * 100)).toFixed(2));
            item['weight'] = weight;
            return item;
        });
    }

    handlePressEnter = (value, key, column) => {
        const newData = [...this.state.data];
        let target = newData.filter(item => item.key === key)[0];
        if (target) {
            target[column] = value;
            // console.log('Target', target);
            if(column === 'symbol') {
                // target['tickerValidationtarget['shares'] = 1;
                this.asyncGetTarget(value)
                .then(response => {
                    target = Object.assign(target, response);
                    target['totalValue'] = target['shares'] * response.lastPrice;
                    this.setState({data: newData});
                    if (target['shares'] > 0) {
                        this.props.onChange(newData);
                    }        
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
        }
    }

    asyncGetTarget = (ticker) => {
        let validationStatus = 'error';
        const target = {};
        return new Promise((resolve, reject) => {
            getStockData(ticker, 'latestDetail')
            .then(response => {
                // console.log(response.data);
                const name = _.get(response.data, 'security.detail.Nse_Name', '');
                const sector = _.get(response.data, 'security.detail.Sector', '');
                const lastPrice = response.data.latestDetail.values.Close;
                target['name'] = name;
                target['sector'] = sector;
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
                // console.log(selectedRows);
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
            this.props.onChange(data);
        });
    }

    addItem = () => {
        const data = [...this.state.data];
        data.push({
            symbol: '',
            name: '',
            sector: '',
            key: Math.random().toString(36),
            shares: 0,
            lastPrice: 0,
            totalValue: 0,
            tickerValidationStatus: "warning",
            sharesValidationStatus: "success",
            sharesDisabledStatus: true,
            priceHistory: [],
            weight: 0
        });
        this.setState({data}, () => {
            this.props.onChange(data);
        });
    }

    getTotalValueSummation = data => {
        let totalValue = 0;
        data.map(item => {
            totalValue += item.totalValue;
        });
        
        return totalValue;
    }

    // handleDoneClick = () => {
    //     this.props.onChange(this.state.data);
    //     this.props.toggleModal();
    // }

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
        } else {
            this.setState({data: initialTransactions(1).concat(this.props.data.map(item => {
                    item['weight'] = `${item['weight']} %`; return item; 
                }))
            });
        }
    }

    render() {
        return (
            <Col span={24}>
                <Row style={{marginBottom: '20px'}}>
                    <Button
                            shape="circle" icon="delete" size="large" 
                            disabled={this.state.selectedRows.length > 0 ? false : true} 
                            onClick={this.deleteItems}
                    />
                    <Button  
                            shape="circle" icon="plus" size="large" 
                            type="primary" 
                            onClick={this.addItem}
                            style={{marginLeft: '20px'}}
                    />
                </Row>
                <Table 
                        rowSelection={this.getRowSelection()} 
                        pagination={false} 
                        dataSource={this.state.data} 
                        columns={this.columns} 
                        scroll={{y: 300, x: true}}
                        size="middle"
                        rowClassName="stock-table-col"
                />
                {/* <Row style={{marginTop: '20px'}}>
                    <Col span={24} style={{textAlign: 'right'}}>
                        <Button style={{marginRight: '20px'}} onClick={this.props.toggleModal}>Cancel</Button>
                        <Button type="primary" onClick={this.handleDoneClick}>Done</Button>
                    </Col>
                </Row> */}
            </Col>
        );
    }
}