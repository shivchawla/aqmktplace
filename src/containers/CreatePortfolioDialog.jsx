import * as React from 'react';
import {Form, Modal, Button, Row, Col, Input, Menu, Dropdown, Icon, message} from 'antd';
import axios from 'axios';

const FormItem = Form.Item;
const {aimsquantToken, requestUrl, investorId} = require('../localConfig.json');

class CreatePortfolioDialogImpl extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedBenchmark: 'TCS'
        }
    }

    renderMenu = () => {
        const benchmarkArray = ['TCS', 'NIFTY_50', 'WIPRO', 'LT'];

        return (
            <Menu>
                {
                    benchmarkArray.map(item => {
                        return (
                            <Menu.Item key={item}>
                                <a onClick={() => this.handleBenchmarkClick(item)}>{item}</a>
                            </Menu.Item>
                        );
                    })
                }
            </Menu>
        );
    }

    handleBenchmarkClick = (item) => {
        this.setState({selectedBenchmark: item});
    }

    handleSubmit = (e) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                const requestData = {
                    name: values.name,
                    detail: {
                        positions: [],
                        cash: parseInt(values.initialCash),
                    },
                    benchmark: {
                        ticker: this.state.selectedBenchmark,
                        securityType: "EQ",
                        country: "IN",
                        exchange: "NSE"
                    }
                };
                axios({
                    url: `${requestUrl}/investor/${investorId}/portfolio`,
                    headers: {'aimsquant-token': aimsquantToken},
                    method: 'POST',
                    data: requestData
                })
                .then(response => {
                    message.success("Portfolio Created successfully");
                })
                .catch(error => {
                    message.error(error.message);
                })
                .finally(() => {
                    this.props.toggleDialog();
                });
            }
        })
    }

    render() {
        const { getFieldDecorator } = this.props.form;

        return (
            <Modal
                    title="Create Portfolio"    
                    onOk={this.props.onOk}
                    onCancel={this.props.onCancel}
                    visible={this.props.visible}
                    footer={null}
            >
                <Form  onSubmit={this.handleSubmit}>
                    <FormItem>
                        {getFieldDecorator('name', {
                            rules: [{required: true, message: 'Please insert a valid portfolio name'}]
                        })(
                            <Input placeholder="Enter portfolio name" />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('initialCash', {
                            rules: [{required: true, message: 'Please insert valid Initial Cash'}]
                        })(
                            <Input style={{marginTop: 20, marginBottom: 20}} placeholder="Enter initial cash" type="number"/>
                        )}
                    </FormItem>
                    <Row>
                        <Col span={17}>
                            <Dropdown overlay={this.renderMenu()} trigger={['click']}>
                                <a className="ant-dropdown-link" href="#">
                                    Select Benchmark - {this.state.selectedBenchmark} <Icon type="down" />
                                </a>
                            </Dropdown>
                        </Col>
                        <Col span={6}>
                            <FormItem>
                                <Button type="primary" htmlType="submit">Create Portfolio</Button>
                            </FormItem>
                        </Col>
                    </Row>
                </Form>
            </Modal>
        );
    }
}

export const CreatePortfolioDialog = Form.create()(CreatePortfolioDialogImpl);