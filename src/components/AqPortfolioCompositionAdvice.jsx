import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Checkbox, Collapse, Row, Col, Table, Input, DatePicker, Icon, Tooltip} from 'antd';
import {MetricItem, AqStockPortfolioTable} from '../components';
import {metricsValueStyle, metricsLabelStyle, nameEllipsisStyle, metricColor} from '../constants';
import {EditableCell} from './AqEditableCell';
import {getStockData, Utils} from '../utils';
import '../css/adviceTransactionTable.css';

const Panel = Collapse.Panel;
const dateFormat ='YYYY-MM-DD';

const {requestUrl, aimsquantToken} = require('../localConfig');

class AqPortfolioCompositionAdviceImpl extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            advices: props.advices, // advices rendered here
            subscribedAdvices: props.subscribedAdvices, // subscribed advices that is shown in the subscribed
            selectedDate: moment()
        }
        this.detailedColumns = [
            {
                title: this.renderTableHeader('NAME'),
                dataIndex: 'name',
                key: 'name',
                render: (text, record) => <h3 onClick={() => this.props.toggleStockResearchModal && this.props.toggleStockResearchModal(record)}style={nameEllipsisStyle}>{text}</h3>,
                width: 220
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
                title: this.renderTableHeader('TRADE PRICE'),
                dataIndex: 'price',
                key: 'price',
                render: (text, record) => this.renderInput(text, record, 'price', 'text'),
                width: 100
            },
            /*{
                title: this.renderTableHeader('SECTOR'),
                dataIndex: 'sector',
                key: 'sector'
            },*/
            {
                title: this.renderTableHeader('TRADE QTY.'),
                dataIndex: 'transactionalQuantity',
                key: 'transactionalQuantity',
                render: text => <span style={{color: Number(text) >= 0 ? metricColor.positive : metricColor.negative}}>{text}</span>
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
                    <Row style={{overflow: 'hidden', overflowY: 'scroll', maxHeight: '320px'}}>
                        <Col span={24} >
                            {this.renderComposition(advice, advice.composition)}
                        </Col>
                    </Row>
                </Panel>
            );
        })
    }

    renderComposition = (advice, tickers) => {
        return (
            <Row type="flex">
                {!this.props.preview &&
                    <Col span={24}>
                        <Row type="flex" justify="end" align="middle" style={{paddingRight: '20px'}}>
                            <Col span={4}><h3 style={{fontSize: '14px', textAlign: 'right', marginRight:'10px'}}>Select Date:</h3></Col>   
                            <Col span={5}>
                                <DatePicker
                                    onChange={date => this.handleDateChange(date, advice)}
                                    value={this.state.selectedDate}
                                    format={dateFormat}
                                    disabledDate={(current) => this.props.disabledDate(current, advice)}
                                    allowClear={false}
                                />
                                
                            </Col>
                        </Row>
                    </Col>
                }
                <Col span={24}>
                    <AqStockPortfolioTable 
                            positions={tickers} 
                            processedPositions={true}
                            updateTicker={this.props.toggleStockResearchModal}
                            style={{margin: '5px 15px'}}
                    />
                </Col>
            </Row>
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

    handleDateChange = (date, advice) => {
        const adviceId = advice.id;
        const unmodifiedAdvices = [...this.state.advices];
        const advices = [...this.state.advices];
        let targetAdvice = advices.filter(item => item.key === advice.key)[0];
        let unModifiedTargetAdvice = unmodifiedAdvices.filter(item => item.key === advice.key)[0];
        targetAdvice.date = date.format(dateFormat);
        const selectedDate = moment(date).format(dateFormat);
        const url = `${requestUrl}/advice/${adviceId}/portfolio?date=${selectedDate}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response =>{
            const portfolio = response.data.detail;
            targetAdvice.composition = this.processComposition(portfolio, advice.key, targetAdvice);
            this.setState({
                advices,
                selectedDate: date
            });
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    }

    processComposition = (portfolio, key, advice) => {
        return portfolio.positions.map((item, index) => {
            const targetPosition = advice.composition.filter(advicePosition => advicePosition.symbol === item.security.ticker)[0];
            console.log('Item Position', item);
            return {
                key: index,
                adviceKey: key,
                symbol: _.get(item, 'security.ticker', ''),
                name: _.get(item, 'security.detail.Nse_Name', ''),
                sector: _.get(item, 'security.detail.Sector', ''),
                shares: targetPosition.modifiedShares,
                modifiedShares: targetPosition.modifiedShares,
                newShares: item.quantity || 0,
                price: item.lastPrice || 0,
                avgPrice: item.avgPrice || 0,
                costBasic: 12,
                unrealizedPL: 1231,
                weight: '12%',
                transactionalQuantity: item.quantity - targetPosition.modifiedShares
            };
        });
    }

    handleCheckBoxchange = (e, advice) => {
        const advices = [...this.state.advices];
        const targetAdvice = advices.filter(item => item.key === advice.key)[0];
        targetAdvice.checked = e.target.checked;
        this.setState({advices});
    }

    datePickerOpened = e => {
        console.log(e);
    }

    renderHeaderItem = (advice) => {
        const profitOrLossColor = advice.profitLoss < 0 ? '#F44336' : '#4CAF50';
        const adviceChangeIconSrc = advice.hasChanged ? 'exclamation-circle' : 'check-circle';
        const adviceChangeIconColor = advice.hasChanged ? metricColor.neutral : metricColor.positive;
        const tooltipText = advice.hasChanged ? 'Advice needs to be updated' : 'Advice up to date';
        const weight = advice.weight;
        if (!this.props.header) {
            return (
                <Row type="flex" gutter={40}>
                    <Col span={7}>
                        <MetricItem 
                            value={advice.name} 
                            label={(advice.id && advice.id.length > 0) ? "Advice":""} 
                            valueStyle={metricsValueStyle}
                            labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    <Col span={4}>
                        <MetricItem 
                            value={`${advice.weight} %`} 
                            label="Weight" 
                            valueStyle={metricsValueStyle}
                            labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    <Col span={4} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <MetricItem 
                            value={`${advice.profitLoss} %`} 
                            label="Profit/Loss" 
                            valueStyle={{...metricsValueStyle, color: profitOrLossColor}}
                            labelStyle={metricsLabelStyle}
                        />
                    </Col>
                    <Col span={7} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                        <MetricItem 
                            value={advice.netAssetValue} 
                            label="Net Asset Value" 
                            valueStyle={{...metricsValueStyle, textAlign:'center'}}
                            labelStyle={{...metricsLabelStyle, textAlign: 'center'}}
                        />
                        
                        {
                            advice.id && advice.hasChanged &&
                            <Tooltip title={tooltipText}>
                                <Icon 
                                    type={adviceChangeIconSrc} 
                                    style={{fontSize: '20px', marginRight: '15px', color: adviceChangeIconColor}}
                                />
                            </Tooltip>
                        }
                    </Col>
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

export const AqPortfolioCompositionAdvice = withRouter(AqPortfolioCompositionAdviceImpl);

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