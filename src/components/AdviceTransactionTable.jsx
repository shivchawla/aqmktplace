import * as React from 'react';
import {Collapse, Row, Col, Table, Input, DatePicker} from 'antd';
import {EditableCell} from './AqEditableCell';

const Panel = Collapse.Panel;

export class AdviceTransactionTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            advices: props.advices
        }
        this.columns = [
            {
                title: 'SYMBOL',
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: 'SHARES',
                dataIndex: 'modifiedShares',
                key: 'shares'
            },
            {
                title: 'PRICE',
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => this.renderInput(text, record, 'price', 'text')
            },
            {
                title: 'COST BASIC',
                dataIndex: 'costBasic',
                key: 'costBasic'
            }
        ]
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            advices: nextProps.advices
        });
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

    handleRowChange = (value, record, column) => {
        const newData = [...this.state.data];
        const target = newData.filter(item => item.key === record.key)[0];
        if (target) {
            target[column] = value;
            this.setState({data: newData});
        }
    }

    renderAdvices = () => {
        const {advices} = this.state;

        return advices.map((advice, index) => {
            return (
                <Panel 
                        header={this.renderHeaderItem(advice)} 
                        key={index}
                        style={customPanelStyle}
                >
                    <Row>
                        <Col span={24}>
                            {this.renderComposition(advice.composition)}
                        </Col>
                    </Row>
                </Panel>
            );
        })
    }

    renderComposition = (tickers) => {
        return (
            <Table dataSource={tickers} columns={this.columns} pagination={false} size="small" />
        );
    }

    handleInputChange = (e, advice) => {
        const advices = [...this.state.advices];
        let target = advices.filter(item => item.key === advice.key)[0];
        target['units'] = e.target.value;
        target = target.composition.map((item, index) => {
            if (e.target.value.length > 0 && Number(e.target.value) > 0) {
                item.modifiedShares = item.shares * Number(e.target.value);
            } else {
                item.modifiedShares = item.shares;
            }
        });
        this.setState({advices});
    }

    handleInputClick = (e) => {
        e.stopPropagation();
    }

    handleDateChange = (date) => {
        console.log(date);
    }

    handleDateClick = (e) => {
        alert("Date Clicked");
        console.log(e);
    }

    renderHeaderItem = (advice) => {
        if (!this.props.header) {
            return (
                <Row type="flex" justify="end">
                    <Col span={4}>
                        <h5>{advice.name}</h5>
                    </Col>
                    <Col span={4} offset={1}>
                        {
                            !this.props.preview &&
                            <Input 
                                onClick={this.handleInputClick}
                                value={advice.units} 
                                type="number" 
                                placeholder="Units" 
                                onChange={(e) => {this.handleInputChange(e, advice)}}
                            />
                        }
                    </Col>
                    <Col span={4} offset={1}>
                        <DatePicker
                            onChange={this.handleDateChange}
                        />
                    </Col>
                    <Col span={4} offset={2}>
                        <MetricItem value={advice.netAssetValue} label="Net Cost Value" />
                    </Col>
                </Row>
            );
        } else {
            return this.props.header;
        }
    }

    render() {
        return (
            <Collapse bordered={false} accordion>
                {this.renderAdvices()}
            </Collapse>
        );
    }
}

const MetricItem = (props) => {
    return (
        <Row>
            <Col span={24}><h5>{props.value}</h5></Col>
            <Col><h5>{props.label}</h5></Col>
        </Row>
    );
};

const customPanelStyle = {
    background: '#f7f7f7',
    borderRadius: 4,
    marginBottom: 24,
    border: 0,
    overflow: 'hidden',
};
