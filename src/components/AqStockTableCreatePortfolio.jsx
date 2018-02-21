import * as React from 'react';
import moment from 'moment';
import {Table, Button, Input, DatePicker} from 'antd';
import {EditableCell} from './AqEditableCell';

const addInititalTransaction = () => {
    const transactions = [];
    for (let i=0 ; i< 3; i++) {
        transactions.push({
            key: i,
            symbol: '',
            date: '',
            shares: 0,
            price: 0,
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
                render: (text, record) => this.renderInput(text, record, 'symbol', 'text')
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
            data: addInititalTransaction()
        } 
    }

    renderInput = (text, record, column, type) => {
        return (
            <EditableCell 
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



    handleRowChange = (value, record, column) => {
        const newData = [...this.state.data];
        const target = newData.filter(item => item.key === record.key)[0];
        if (target) {
            if (column === 'date') {
                value = moment(value).format('YYYY-MM-DD');
            }
            target[column] = value;
            this.setState({data: newData});
            this.props.onChange(newData);
        }
    }

    render() {
        return (
            <Table dataSource={this.state.data} columns={this.columns} pagination={false}/>
        );
    }
}