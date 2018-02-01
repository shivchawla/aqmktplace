import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Tabs, Row, Col, Input, Form, message, Button} from 'antd';
import {labelStyle, inputStyle} from '../constants';
import {AqStockTableTransaction, AqHighChartMod} from '../components';

const {TabPane} = Tabs; 
const FormItem = Form.Item;
const {localConfig, requestUrl} = require('../localConfig.json');

class CreatePortfolioImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            tickers: [
                // {name: TCS, show: false}
            ],
            initialCash: 100000,
            transactionError: '',
            investorId: ''
        }
    }

    tabChange = (key) => {
        console.log(key);
    }

    onChange = (data) => {
        this.setState({data});
        const tickers = [];
        data.map((transaction, index) => {
            const tickerIndex = _.findIndex(tickers, transaction.symbol);
            if (tickerIndex === -1) {
                if (transaction.tickerValidationStatus === 'success') {
                    tickers.push({name: transaction.symbol.toUpperCase()});
                }
            } else {
                message.error('Ticker already added');
            }
            
        });
        this.setState({tickers: [...tickers]});
    }

    getRemainingCash = () => {
        const {data} = this.state;
        let totalCash = 0;
        data.map((item, index) => {
            if (item.cashLink) {
                totalCash += item.totalValue;
            }
        });

        return this.state.initialCash - totalCash;
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const verifiedTransactions = this.getVerifiedTransactions();
        let transactionError = '';
        
        this.props.form.validateFields((err, values) => {
            if (!err && verifiedTransactions.length > 0) {
                transactionError = '';
            } else {
                transactionError = 'Valid Transactions must be added';
            }
            this.setState({transactionError});
        });
    }

    getVerifiedTransactions = () => {
        const {data} = this.state;
        const verifiedTransactions = data.filter((item, index) => {
            return item.tickerValidationStatus === 'success'; 
        });

        return verifiedTransactions;
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        return(
            <Row>
                <Col span={18}>
                    <Form onSubmit={this.handleSubmit}>
                        <Row>
                            <Col span={8}>
                                <FormItem>
                                    {getFieldDecorator('name', {
                                        rules: [{required: true, message: 'Please enter Portfolio Name'}]
                                    })(
                                        <Input style={inputStyle} placeholder="Portfolio Name"/>
                                    )}
                                </FormItem>
                            </Col>
                    </Row>
                        <Row type="flex" justify="start">
                            <Col span={6}>
                                <h4 style={labelStyle}>Initial Cash</h4>
                                <h3>{this.state.initialCash}</h3>
                            </Col>
                            <Col span={6}>
                                <h4 style={labelStyle}>Remaining Cash</h4>
                                {
                                    this.getRemainingCash() <= 0
                                        ? <h3 style={{color: 'red'}}>{this.getRemainingCash()}</h3>
                                        : <h3>{this.getRemainingCash()}</h3>
                                }
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <h4 style={{color: 'red'}}>{this.state.transactionError}</h4>
                            </Col>
                            <Col span={24}>
                                <Tabs onChange={this.tabChange}>
                                    <TabPane tab="tab1" key="1">
                                        <Row>
                                            <Col span={24}>
                                                <AqStockTableTransaction onChange={this.onChange}/>
                                            </Col>
                                        </Row>
                                    </TabPane>
                                    <TabPane tab="tab1" key="2">Advice Transaction</TabPane>
                                </Tabs>
                            </Col>
                        </Row>
                        <Row>
                            <Col span={24}>
                                <FormItem>
                                    <Button style={{borderRadius: '0'}} type="primary" htmlType="submit">Create Portfolio</Button>
                                </FormItem>
                            </Col>
                        </Row>
                    </Form>
                    <Row>
                        <Col span={24}>
                            <AqHighChartMod tickers={this.state.tickers}/> 
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const CreatePortfolio = Form.create()(CreatePortfolioImpl);