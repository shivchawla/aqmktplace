import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import {Checkbox, Collapse, Row, Col, Table, Input, DatePicker } from 'antd';
import {EditableCell} from './AqEditableCell';
import {getStockData} from '../utils';

const Panel = Collapse.Panel;
const dateFormat ='YYYY-MM-DD';

const {requestUrl, aimsquantToken} = require('../localConfig');

export class AdviceTransactionTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            advices: props.advices,
            subscribedAdvices: props.subscribedAdvices
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
        const advices = [...this.state.advices];
        const targetAdvice = advices.filter(item => item.key === record.adviceKey)[0];
        const newData = targetAdvice.composition;
        const target = newData.filter(item => item.key === record.key)[0];
        if (target) {
            target[column] = value;
            target['costBasic'] = value * target['shares'];
            targetAdvice.composition = newData;
            this.setState({advices});
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
        let netAssetValue = 0;
        let target = advices.filter(item => item.key === advice.key)[0];
        target['units'] = e.target.value; 
        target.composition = target.composition.map((item, index) => {
            if (e.target.value.length > 0 && Number(e.target.value) > 0) {
                item.modifiedShares = item.shares * Number(e.target.value);
                netAssetValue += item.modifiedShares * item.price;
            } else {
                item.modifiedShares = item.shares;
            }
            return item;
        });
        target['netAssetValue'] = netAssetValue;
        this.setState({advices});
    }

    handleInputClick = (e) => {
        e.stopPropagation();
    }

    // improvement needed - this should be a common method
    handleDateChange = (date, advice) => {
        const adviceId = advice.adviceId;
        const subscribedAdvices = [...this.state.subscribedAdvices];
        const advices = [...this.state.advices];

        const targetSubscribedAdvice = subscribedAdvices.filter(advice => advice.id === adviceId)[0];
        let targetAdvice = advices.filter(item => item.key === advice.key)[0];
        
        targetSubscribedAdvice.date = date.format(dateFormat);
        targetAdvice.date = date.format(dateFormat);

        const selectedDate = moment(date).format(dateFormat);
        const url = `${requestUrl}/advice/${adviceId}/portfolio?date=${selectedDate}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response =>{
            const portfolio = response.data.detail;
            if (portfolio) {
                targetSubscribedAdvice.portfolio.detail = portfolio;
                targetSubscribedAdvice.disabled = false;
            } else {
                targetSubscribedAdvice.portfolio.detail = null;
                targetSubscribedAdvice.disabled = true;
            }
            targetAdvice.composition = this.props.processAdvice(targetSubscribedAdvice).composition;
            this.setState({
                subscribedAdvices,
                advices
            });
        })
        .catch(error => {
            console.log(error);
        });
    }

    handleCheckBoxchange = (e, advice) => {
        const advices = [...this.state.advices];
        const targetAdvice = advices.filter(item => item.key === advice.key)[0];
        targetAdvice.checked = e.target.checked;
        this.setState({advices});
    }

    renderHeaderItem = (advice) => {
        if (!this.props.header) {
            return (
                <Row type="flex" justify="end">
                    {
                        !this.props.preview
                        &&  <Col span={4}>
                                <Checkbox onChange={(e) => this.handleCheckBoxchange(e, advice)} checked={advice.checked} />
                            </Col>
                    }
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
                        {
                            !this.props.preview &&
                            <DatePicker
                                onChange={date => this.handleDateChange(date, advice)}
                                value={moment(advice.date, dateFormat)}
                                format={dateFormat}
                                disabledDate={(current) => this.props.disabledDate(current, advice)}
                            />
                        }
                    </Col>
                    <Col span={4} offset={2}>
                        <MetricItem value={advice.netAssetValue} label="Net Asset Value" />
                    </Col>
                </Row>
            );
        } else {
            return this.props.header;
        }
    }

    render() {
        return (
            <Collapse bordered={false}>
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
