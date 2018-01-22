import * as React from 'react';
import {Table} from 'antd';
import {EditableCell} from '../components';
import {getStockData} from '../utils';

export class AqTableMod extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [{
            title: 'Ticker',
            dataIndex: 'ticker',
            render: (text, record) => this.renderColumns(text, record, 'ticker')
        }];
    }
    handleRowChange = (value, key, column) => {
        const newData = [...this.props.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target[column] = value;
            target['validationStatus'] = 'validating';
            getStockData(value)
            .then((response) => {
                const priceHistoryObj = response.data.priceHistory.values;
                if(priceHistoryObj) {
                    target['validationStatus'] = 'success';
                    console.log('Valid Ticker');
                } else {
                    target['validationStatus'] = 'error';
                }
            })
            .catch((error) => {
                target['validationStatus'] = 'error';
            })
            .finally(() => {
                this.props.onChange(newData);
            });
            this.props.onChange(newData);
        }
    }
    renderColumns = (text, record, column) => {
        return (
            <EditableCell
                    value={text}
                    onChange={value => this.handleRowChange(value, record.key, column)}
                    validationStatus={record.validationStatus}
            />
        );
    }
    render() {
        return (
            <Table dataSource={this.props.data} columns={this.columns} />
        );
    }
}