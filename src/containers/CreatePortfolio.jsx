import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Tabs, Row, Col, Input, Form, message, Button} from 'antd';
import {labelStyle, inputStyle} from '../constants';
import {AqStockTableTransaction, AqHighChartMod} from '../components';

const {TabPane} = Tabs; 
const FormItem = Form.Item;

class CreatePortfolioImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [],
            tickers: [
                // {name: TCS, show: false}
            ],
            initialCash: 100000,
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

    render() {
        const {getFieldDecorator} = this.props.form;
        return(
            <Row>
                <Col span={18}>
                    <Form>
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