import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import {Checkbox, Collapse, Row, Col, Table, Input, DatePicker } from 'antd';
import {MetricItem} from '../components';
import {metricsValueStyle, metricsLabelStyle, nameEllipsisStyle} from '../constants';
import {EditableCell} from './AqEditableCell';
import {getStockData} from '../utils';
import '../css/adviceTransactionTable.css';

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
                title: 'NAME',
                dataIndex: 'name',
                key: 'name',
                render: text => <h3 style={nameEllipsisStyle}>{text}</h3>
            },
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
                title: 'LAST PRICE',
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => this.renderInput(text, record, 'price', 'text')
            },
            {
                title: 'AVG. PRICE',
                dataIndex: 'costBasic',
                key: 'costBasic'
            }, 
            {
                title: 'SECTOR',
                dataIndex: 'sector',
                key: 'sector'
            }
        ]
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            advices: nextProps.advices
        });
    }

    renderInput = (text, record, column, type) => {
        if (this.props.preview) {
            return (
                <span>{text}</span>
            );
        }   
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
            <Table 
                    dataSource={tickers} 
                    columns={this.columns} 
                    pagination={false} 
                    size="small"
                    style={{margin: '20px 20px'}} 
            />
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
            // console.log(error);
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
                <Row type="flex">
                    {
                        !this.props.preview &&  
                        <Col span={2}>
                            <Checkbox onChange={(e) => this.handleCheckBoxchange(e, advice)} checked={advice.checked} />
                        </Col>
                    }
                    <Col span={4}>
                        <MetricItem 
                                value={advice.name} 
                                label="Portfolio" 
                                valueStyle={metricsValueStyle}
                                labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    {
                        !this.props.preview &&
                        <Col span={4} offset={1}>
                            <Input 
                                onClick={this.handleInputClick}
                                value={advice.units} 
                                type="number" 
                                placeholder="Units" 
                                onChange={(e) => {this.handleInputChange(e, advice)}}
                            />
                            <h3 style={{...metricsLabelStyle, textAlign: 'center'}}>Units</h3>
                        </Col>
                    }
                    {
                        !this.props.preview &&
                        <Col span={4} offset={1}>
                            <DatePicker
                                onChange={date => this.handleDateChange(date, advice)}
                                value={moment(advice.date, dateFormat)}
                                format={dateFormat}
                                disabledDate={(current) => this.props.disabledDate(current, advice)}
                            />
                            <h3 style={{...metricsLabelStyle, textAlign: 'center'}}>Date</h3>
                        </Col>
                    }
                    {
                        this.props.preview &&
                        <Col span={8}></Col>
                    }
                    <Col span={4} offset={this.props.preview ? 0 : 2}>
                        <MetricItem 
                                value={advice.netAssetValue} 
                                label="Net Asset Value" 
                                valueStyle={metricsValueStyle}
                                labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    {
                        this.props.preview &&
                        <Col span={4}>
                            <MetricItem 
                                    value={advice.weight} 
                                    label="Weight" 
                                    valueStyle={metricsValueStyle}
                                    labelStyle={metricsLabelStyle}
                            />
                        </Col>
                    }
                    {
                        this.props.preview &&
                        <Col span={4}>
                            <MetricItem 
                                    value={advice.profitLoss} 
                                    label="Profit/Loss" 
                                    valueStyle={metricsValueStyle}
                                    labelStyle={metricsLabelStyle}
                            />
                        </Col>
                    }
                </Row>
            );
        } else {
            return this.props.header;
        }
    }

    render() {
        return (
            <Collapse accordion bordered={false}>
                {this.renderAdvices()}
            </Collapse>
        );
    }
}

const customPanelStyle = {
    border: '1px solid #eaeaea',
};

const adviceNameStyle = {
    fontFamily: 'Lato, sans-serif',
    fontSize: '16px'
};
