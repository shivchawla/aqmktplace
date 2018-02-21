import * as React from 'react';
import axios from 'axios';
import {Tabs, Row, Col, Button, Modal, Input, message} from 'antd';
import _ from 'lodash';
import {AqStockTableTransaction} from '../components';

const TabPane = Tabs.TabPane;
const {aimsquantToken, investorId, requestUrl} = require('../localConfig.json');

export class PortfolioDetail extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            transactionDialogVisible: false,
            subscribedAdvices: []
        };
    }

    toggleAddTransactionDialog = () => {
        this.setState({transactionDialogVisible: !this.state.transactionDialogVisible});
    }

    renderAddTransactionDialog = () => {
        return (
            <Modal
                    title="Add Transactions"
                    visible={this.state.transactionDialogVisible}
                    onOk={this.toggleAddTransactionDialog}
                    onCancel={this.toggleAddTransactionDialog}
                    width={800}
            >
                <Row>
                    <Col span={24}>
                        <Input type="text" placeholder="Search Advices"/>
                    </Col>
                    <Col span={24}>
                        <Row>
                            {this.renderSubscribedAdvices()}
                        </Row>
                    </Col>
                </Row>
            </Modal>
        );
    }

    getSubscribedAdvices = () => {
        let subscribedAdvices = [...this.state.subscribedAdvices];
        const url = `${requestUrl}/investor/${investorId}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            subscribedAdvices = response.data.subscribedAdvices;
            this.setState({subscribedAdvices});
        })
        .catch(error => {
            message.error(error.message);
        });
    }

    renderSubscribedAdvices = () => {
        const {subscribedAdvices} = this.state;
        return subscribedAdvices.map((advice, index) => {
            return (
                <Col key={index} span={24}>
                    <h3>{advice.advice}</h3>
                    <h3>{advice.updatedDate}</h3>
                </Col>
            );
        });
    }

    componentWillMount() {
        this.getSubscribedAdvices();
    }
    
    
    render() {
        return (
            <Row>
                {this.renderAddTransactionDialog()}
                <Col span={18}>
                    <Row>
                        <Col span={24}>
                            <Tabs>
                                <TabPane tab="Performance Graph" key="1"></TabPane>
                                <TabPane tab="Performance Metrics" key="2"></TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <Tabs>
                                <TabPane tab="Stock Transaction" key="1">
                                    <AqStockTableTransaction />
                                </TabPane>
                                <TabPane tab="Advice Transaction" key="2">
                                    <Row>
                                        <Col span={4} offset={20}>
                                            <Button onClick={this.toggleAddTransactionDialog} type="primary">Add Transaction</Button>
                                        </Col>
                                    </Row>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}