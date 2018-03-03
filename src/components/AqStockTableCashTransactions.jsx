import * as React from 'react';
import moment from 'moment';
import _ from 'lodash';
import {Table, DatePicker, Menu, Dropdown, Icon, Row, Col, Button} from 'antd';
import {EditableCell} from './AqEditableCell';

const addInitialTransactions = () => {
    const data = [];
    for (let i=0; i < 3; i++) {
        data.push({
            cash: 0,
            date: undefined,
            type: 'deposit',
            notes: '',
            key: i
        });
    }

    return data;
}

export class AqStockTableCashTransaction extends React.Component {

    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'Cash',
                dataIndex: 'cash',
                key: 'cash',
                render: (text, record) => this.renderInput(text, record, 'cash', 'text')
            },
            {
                title: 'Date',
                dataIndex: 'date',
                key: 'date',
                render: (text, record) => this.renderDatePicker(text, record, 'date')
            },
            {
                title: 'Type',
                dataIndex: 'type',
                key: 'type',
                render: (text, record) => this.renderDropDown(record, 'type')
            },
            {
                title: 'Notes',
                dataIndex: 'notes',
                key: 'notes',
                render: (text, record) => this.renderInput(text, record, 'notes', 'text')
            }
        ];
        this.state = {
            data: addInitialTransactions(),
            selectedRows: []
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
            <DatePicker onChange={date => this.handleRowChange(date, record, column)} size="small"/>
        );
    }

    renderDropDown = (record, column) => {
        return (
            <Dropdown overlay={this.renderMenu(record, column)} trigger={['click']}>
                <a className="ant-dropdown-link" href="#">
                    {record.type}<Icon type="down" />
                </a>
            </Dropdown>
        );
    }

    renderMenu = (record, column) => {
        return (
            <Menu>
                <Menu.Item key="deposit">
                    <a onClick={() => this.handleRowChange('deposit', record, column)} >Deposit</a>
                </Menu.Item>
                <Menu.Item key="withdraw">
                    <a onClick={() => this.handleRowChange('withdraw', record, column)} >Withdraw</a>
                </Menu.Item>
            </Menu>
        );
    }

    handleRowChange = (value, record, column) => {
        const newData = [...this.state.data];
        const target = newData.filter(item => item.key === record.key)[0];
        if (target) {
            if (column === 'date') {
                target[column] = moment(value).format('YYYY-MM-DD');
            } else {
                target[column] = value;
            }
            this.setState({data: newData});
            this.props.onChange(newData);
            if (this.isValid(target) && this.props.previewPortfolio) {
                this.props.previewPortfolio();
            }
        }
    }

    isValid = (row) => {
        if (row['date'] !== undefined && row['cash'] > 0) {
            return true;
        }

        return false;
    }

    getRowSelection = () => {
        return {
            onChange: (selectedRowKeys, selectedRows) => {
                this.setState(prevState => {
                    return {selectedRows}
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
        let data = [...this.state.data];
        data.push({
            cash: 0,
            date: '2018-02-21',
            type: 'deposit',
            notes: '',
            key: data.length + 1
        });
        this.setState({data}, () => {
            this.props.onChange(data);
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