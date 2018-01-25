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
        this.state ={
            data: [
                {
                    ticker: '',
                    validationStatus: 'warning',
                    key: 0
                },
                {
                    ticker: '',
                    validationStatus: 'warning',
                    key: 1
                },
                {
                    ticker: '',
                    validationStatus: 'warning',
                    key: 2
                }
            ]
        }
    }
    handleRowChange = (value, key, column) => {
        const newData = [...this.state.data];
        const target = newData.filter(item => key === item.key)[0];
        if (target) {
            target[column] = value;
            target['validationStatus'] = 'validating';
            this.asyncGetTickerValidationStatus(value)
            .then(response => {
                target['validationStatus'] = response;
                this.setState({data: newData});
                this.props.onChange({data: newData});
            });
            this.setState({data: newData});
        }
    }

    asyncGetTickerValidationStatus = (ticker) => {
        let validationStatus = 'error';
        return new Promise((resolve, reject) => {
            getStockData(ticker)
            .then(response => {
                const priceHistoryObj = response.data.priceHistory.values;
                validationStatus = priceHistoryObj !== null ? 'success' : 'error';
            })
            .catch(error => {
                validationStatus = 'error';
            })
            .finally(() => {
                resolve(validationStatus);
            });
        });
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

    addItem = () => {
        this.setState((prevState) => {
            return prevState.data.push({
                ticker: '',
                validationStatus: 'warning',
                key: this.state.data.length
            })
        });
    }

    render() {
        return (
            <div>
                <Table dataSource={this.state.data} columns={this.columns} />
                <button onClick={this.addItem}>Add Item</button>
            </div>
        );
    }
}