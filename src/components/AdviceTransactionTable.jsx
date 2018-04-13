import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import {withRouter} from 'react-router';
import {Checkbox, Collapse, Row, Col, Table, Input, DatePicker, Icon, Tooltip} from 'antd';
import {MetricItem} from '../components';
import {metricsValueStyle, metricsLabelStyle, nameEllipsisStyle, metricColor} from '../constants';
import {EditableCell} from './AqEditableCell';
import {getStockData, Utils} from '../utils';
import '../css/adviceTransactionTable.css';

const Panel = Collapse.Panel;
const dateFormat ='YYYY-MM-DD';

const {requestUrl, aimsquantToken} = require('../localConfig');

class AdviceTransactionTableImpl extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            advices: props.advices,
            subscribedAdvices: props.subscribedAdvices,
        }
        this.detailedColumns = [
            {
                title: this.renderTableHeader('NAME'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => <a onClick={() => this.props.toggleStockResearchModal && this.props.toggleStockResearchModal(record)}style={nameEllipsisStyle}>{text}</a>,
                width: 100
            },
            {
                title: this.renderTableHeader('SYMBOL'),
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: this.renderTableHeader('OLD SHARES'),
                dataIndex: 'modifiedShares',
                key: 'shares'
            },
            {
                title: this.renderTableHeader('NEW SHARES'),
                dataIndex: 'newShares',
                key: 'newShares'
            },
            {
                title: this.renderTableHeader('LAST PRICE'),
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => this.renderInput(text, record, 'price', 'text'),
                width: 100
            },
            {
                title: this.renderTableHeader('SECTOR'),
                dataIndex: 'sector',
                key: 'sector'
            },
            {
                title: this.renderTableHeader('TRANSACTIONAL QTY.'),
                dataIndex: 'transactionalQuantity',
                key: 'transactionalQuantity',
                render: text => <span style={{color: Number(text) >= 0 ? metricColor.positive : metricColor.negative}}>{text}</span>
            }
        ]
        this.summaryColumns = [
            {
                title: this.renderTableHeader('NAME'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => <a onClick={() => this.props.toggleStockResearchModal && this.props.toggleStockResearchModal(record)}style={nameEllipsisStyle}>{text}</a>,
                width: 100
            },
            {
                title: this.renderTableHeader('SYMBOL'),
                dataIndex: 'symbol',
                key: 'symbol'
            },
            {
                title: this.renderTableHeader('SHARES'),
                dataIndex: 'modifiedShares',
                key: 'shares'
            },
            {
                title: this.renderTableHeader('LAST PRICE'),
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => this.renderInput(text, record, 'price', 'text'),
                width: 100
            },
            {
                title: this.renderTableHeader('SECTOR'),
                dataIndex: 'sector',
                key: 'sector'
            }
        ]
    }

    renderTableHeader = text => <span style={tableHeaderStyle}>{text}</span>

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
                    columns={this.props.hideTransactionalDetails ? this.summaryColumns : this.detailedColumns} 
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
        target['newUnits'] = e.target.value; 
        target.composition = target.composition.map((item, index) => {
            console.log(e.target.value);
            if (e.target.value.length > 0) {
                item.transactionalQuantity = item.newShares * Number(e.target.value) - item.shares;
                // item.modifiedShares = item.shares * Number(e.target.value);
                // netAssetValue += (item.newShares * Number(e.target.value)) * item.price;
            } else {
                console.log('Empty Units');
                item.transactionalQuantity = item.newShares - item.shares;
            }
            return item;
        });
        // target['netAssetValue'] = netAssetValue;
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
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
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
            Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
        });
    }

    handleCheckBoxchange = (e, advice) => {
        const advices = [...this.state.advices];
        const targetAdvice = advices.filter(item => item.key === advice.key)[0];
        targetAdvice.checked = e.target.checked;
        this.setState({advices});
    }

    renderHeaderItem = (advice) => {
        const profitOrLossColor = advice.profitLosse < 0 ? '#F44336' : '#4CAF50';
        const adviceChangeIconSrc = advice.hasChanged ? 'exclamation-circle' : 'check-circle';
        const adviceChangeIconColor = advice.hasChanged ? metricColor.neutral : metricColor.positive;
        const tooltipText = advice.hasChanged ? 'Advice needs to be updated' : 'Advice up to date';
        if (!this.props.header) {
            return (
                <Row type="flex" justify={this.props.preview ? "space-between" : null}>
                    {
                        !this.props.preview &&  
                        <Col span={2}>
                            <Checkbox onChange={(e) => this.handleCheckBoxchange(e, advice)} checked={advice.checked} />
                        </Col>
                    }
                    <Col span={4}>
                        <MetricItem 
                                value={advice.name} 
                                label="Advice" 
                                valueStyle={metricsValueStyle}
                                labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    {
                        !this.props.preview &&
                        <Col span={2} offset={1}>
                            <Input 
                                    disabled={true}
                                    onClick={this.handleInputClick}
                                    value={advice.oldUnits} 
                                    type="number" 
                                    placeholder="Old Units" 
                                    onChange={(e) => {this.handleInputChange(e, advice)}}
                            />
                            <h3 style={{...metricsLabelStyle, textAlign: 'center'}}>Old Units</h3>
                        </Col>
                    }
                    {
                        !this.props.preview &&
                        <Col span={2} offset={1}>
                            <Input 
                                    onClick={this.handleInputClick}
                                    value={advice.newUnits} 
                                    type="number" 
                                    placeholder="Target Units" 
                                    onChange={(e) => {this.handleInputChange(e, advice)}}
                            />
                            <h3 style={{...metricsLabelStyle, textAlign: 'center'}}>Target Units</h3>
                        </Col>
                    }
                    {
                        !this.props.preview &&
                        <Col span={3} offset={1}>
                            <DatePicker
                                onChange={date => this.handleDateChange(date, advice)}
                                value={moment()}
                                format={dateFormat}
                                disabledDate={(current) => this.props.disabledDate(current, advice)}
                            />
                            <h3 style={{...metricsLabelStyle, textAlign: 'center'}}>Date</h3>
                        </Col>
                    }
                    {/* {
                        this.props.preview &&
                        <Col span={8}></Col>
                    } */}
                    <Col span={4} offset={this.props.preview ? 0 : 2}>
                        <MetricItem 
                                value={advice.netAssetValue} 
                                label="Net Asset Value" 
                                valueStyle={metricsValueStyle}
                                labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    {/* {
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
                        <Col span={4} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <MetricItem 
                                    value={`${advice.profitLoss} %`} 
                                    label="Profit/Loss" 
                                    valueStyle={{...metricsValueStyle, color: profitOrLossColor}}
                                    labelStyle={metricsLabelStyle}
                            />
                            <Tooltip title={tooltipText}>
                                <Icon 
                                        type={adviceChangeIconSrc} 
                                        style={{fontSize: '20px', marginRight: '15px', color: adviceChangeIconColor}}
                                />
                            </Tooltip>
                        </Col>
                    } */}
                </Row>
            );
        } else {
            return this.props.header;
        }
    }

    render() {
        return (
            <Collapse bordered={false} defaultActiveKey={'0'}>
                {this.renderAdvices()}
            </Collapse>
        );
    }
}

export const AdviceTransactionTable = withRouter(AdviceTransactionTableImpl);

const customPanelStyle = {
    border: '1px solid #eaeaea',
};

const adviceNameStyle = {
    fontFamily: 'Lato, sans-serif',
    fontSize: '16px'
};

const tableHeaderStyle = {
    fontSize: '12px',
    color: '#787878'
};