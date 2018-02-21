import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Row, Col, Checkbox, Tabs, Button, Modal} from 'antd';
import {adviceTransactions} from '../mockData/AdviceTransaction';
import {AdviceTransactionTable, AqStockTableTransaction} from '../components';
import {AdviceItem} from '../components/AdviceItem';
import {AqStockTableCreatePortfolio} from '../components/AqStockTableCreatePortfolio';
import {AqStockTableCashTransaction} from '../components/AqStockTableCashTransactions';
import {layoutStyle} from '../constants';

const TabPane = Tabs.TabPane;
const {investorId} = require('../localConfig.json');

export class CreatePortfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advices: [],
            isSubscibedAdviceModalVisible: false,
            stockTransactions: [],
            cashTransactions: []
        }
    }

    renderAdviceTransactions = () => {
        const {advices} = this.state;
        return (
            <Row>
                <Col span={4}>
                    <Button>Delete Selected</Button>
                </Col>
                <Col span={4} offset={16}>
                    <Button 
                            onClick={this.toggleSubscribedAdviceModal} 
                            style={{right: 0, position: 'absolute'}}
                    >
                        Browse Advice
                    </Button>
                </Col>
                <Col span={24} style={{marginTop: 20}}>
                    {
                        advices.length > 0 
                        ? <AdviceTransactionTable advices={advices} />
                        : <h5>Please add advices to your portfolio</h5>
                    }
                </Col>
            </Row>
        );
    }

    renderStockTransactions = () => {
        return (
            <AqStockTableCreatePortfolio onChange={this.onStockTransactionChange}/>
        );
    }

    renderCashTransactions = () => {
        return (
            <AqStockTableCashTransaction onChange={this.onCashTransactionChange}/>
        );
    }

    toggleSubscribedAdviceModal = () => {
        this.setState({isSubscibedAdviceModalVisible: !this.state.isSubscibedAdviceModalVisible});
    }

    renderSubscribedAdviceModal = () => {
        return (
            <Modal 
                    title="Add Advices"
                    visible={this.state.isSubscibedAdviceModalVisible}
                    onCancel={this.toggleSubscribedAdviceModal}
                    onOk={this.toggleSubscribedAdviceModal}
                    width="80%"
                    bodyStyle={{
                        height: '600px',
                        overflow: 'hidden',
                        overflowY: 'scroll'
                    }}
            >
                <AdviceItem 
                        investorId={investorId}
                        addAdvice={this.addAdvice}
                        deleteAdvice = {this.deleteAdvice}
                />
            </Modal>
        );
    }

    addAdvice = (advice) => {
        const advices = [...this.state.advices];
        advices.push(advice);
        this.setState({advices}, () => {
            console.log(this.state.advices);
        });
    }
    
    deleteAdvice = (advice) => {
        const advices = [...this.state.advices];
        const adviceIndex = _.findIndex(advices, item => item.key === advice.key);
        advices.splice(adviceIndex, 1);
        this.setState({advices}, () => {
            console.log(this.state.advices);
        });
    }

    onStockTransactionChange = (data) => {
        this.setState({stockTransactions: data});
    }

    onCashTransactionChange = (data) => {
        this.setState({cashTransactions: data});
    }

    handleSubmit = () => {
        console.log('Advice Transactions', this.state.advices);
        console.log('Stock Transactions', this.state.stockTransactions);
        console.log('Cash Transactions', this.state.cashTransactions);
    }

    render() {
        return (
            <Row>
                {this.renderSubscribedAdviceModal()}
                <Col span={18} style={layoutStyle}>
                    <Row type="flex" justify="end">
                        <Col span={5}>
                            <h5>Remaining Cash 10000</h5>
                        </Col>
                        <Col span={4}>
                            <Checkbox>Link Cash</Checkbox>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Stock Transaction" key="1">
                                    {this.renderStockTransactions()}
                                </TabPane> 
                                <TabPane tab="Advice Transaction" key="2">
                                    {this.renderAdviceTransactions()}
                                </TabPane> 
                                <TabPane tab="Cash Transaction" key="3">
                                    {this.renderCashTransactions()}
                                </TabPane> 
                            </Tabs>
                        </Col>
                    </Row>
                </Col>
                <Col span={5} offset={1}>
                    <Row type="flex">
                        <Col span={24}>
                            <Button type="primary" onClick={this.handleSubmit}>Save</Button>
                        </Col>
                        <Col span={24} style={{marginTop: 10}}>
                            <Button>Cancel</Button>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
