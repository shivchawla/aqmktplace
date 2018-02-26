import * as React from 'react';
import moment from 'moment';
import {Collapse, Row, Col, Table, Input, DatePicker} from 'antd';
import {EditableCell} from './AqEditableCell';
import {getStockData} from '../utils';

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

    handleDateChange = (date, advice) => {
        const advices = [...this.state.advices];
        const targetAdvice = advices.filter(item => item.key === advice.key)[0];
        targetAdvice.date = date.format('YYYY-MM-DD');
        const tickers = targetAdvice.composition.map(item => item.symbol); // Get the symbols from advice
        this.fetchLastPrice(tickers)
        .then(priceHistory => {
            priceHistory.map((tickerItem, index) => {
                const  compositionItem = targetAdvice.composition.filter(item => item.symbol === tickerItem.ticker)[0];
                const selectedPrice = tickerItem.priceHistory.filter(item => {
                    const newDate = moment(item.date * 1000).format('YYYY-MM-DD');
                    const selectedDate = date.format('YYYY-MM-DD');
                    return newDate === selectedDate;
                })[0];
                compositionItem.price = selectedPrice !== undefined ? selectedPrice.price.toFixed(2) : 15;
                this.setState({advices});
            });
        });
    }

    fetchLastPrice = (tickers) => { // fetch last price by tickers
        const priceData = [];
        return new Promise((resolve, reject) => {
            tickers.map(ticker => {
                getStockData(ticker)
                .then(response => {
                    priceData.push({
                        ticker,
                        priceHistory: response.data.priceHistory.values
                    });
                    if (priceData.length === tickers.length) {
                        resolve(priceData);
                    }
                })
                .catch(error => {
                    console.log(error.message);
                });
            });   
        });
    }

    handleDateClick = (e) => {
        alert("Date Clicked");
        console.log(e);
    }

    renderHeaderItem = (advice) => {
        let netAssetValue = 0;
        advice.composition.map((item) => {
            netAssetValue += item.price * item.shares;
        });
        
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
                        {
                            !this.props.preview &&
                            <DatePicker
                                onChange={date => this.handleDateChange(date, advice)}
                            />
                        }
                    </Col>
                    <Col span={4} offset={2}>
                        <MetricItem value={netAssetValue} label="Net Asset Value" />
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
