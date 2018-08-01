import * as React from 'react';
import axios from 'axios';
import windowSize from 'react-window-size';
import get from 'lodash/get';
import Link from 'react-router-dom/Link';
import {Row, Col, Modal, message, Form, Input, Button} from 'antd';
import {Utils} from '../utils';
import '../css/home.css';

const aimsquantUrl = 'https://www.aimsquant.com';
const FormItem = Form.Item;
const TextArea = Input.TextArea;
const {requestUrl} = require('../localConfig');

class FooterImpl extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            contactUsModalvisible: false,
            feedBackLoading: false
        };
    }

    toggleContactUsModal = () => {
        this.setState({contactUsModalvisible: !this.state.contactUsModalvisible});
    }

    submitContactUsForm = e => {
        e.preventDefault();
        const feedbackUrl = `${requestUrl}/user/sendFeedback`;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({feedBackLoading: true});

                axios({
                    url: feedbackUrl,
                    method: 'POST',
                    data: {
                        "feedback": values.emailDetail,
                        "subject": values.emailSubject,
                        "to": "connect@aimsquant.com",
                        "from": values.email
                    }
                })
                .then(response => {
                    message.success('Thanks for your message!');
                    this.setState({contactUsModalvisible: !this.state.contactUsModalvisible});
                    this.props.form.resetFields();
                })
                .catch(error => {
                    message.error('Sorry, Error occured while sending message');
                })
                .finally(() => {
                    this.setState({feedBackLoading: false});
                });
            }
        })
    }

    renderContactUsModal = () => {
        const {getFieldDecorator} = this.props.form;

        return (
            <Modal
                    title="Contact Us"
                    visible={this.state.contactUsModalvisible}
                    onCancel={this.toggleContactUsModal}
                    footer={[
                        <Button onClick={this.toggleContactUsModal}>CANCEL</Button>,
                        <Button 
                                type="primary" 
                                loading={this.state.feedBackLoading} 
                                onClick={this.submitContactUsForm}
                        >
                            SEND
                        </Button>
                    ]}
            >
                <Row>
                    <Form onSubmit={this.submitContactUsForm}>
                        
                        <Col span={24}>
                            <h3 style={contactUsInputStyle}>Subject</h3>
                            <FormItem>
                                {
                                    getFieldDecorator('emailSubject', {
                                        initialValue: 'Connect with AdviceQube',
                                        rules: [{required: true, message: 'Please provide a valid subject'}]
                                    })(
                                        <Input placeholder='Subject' disabled/>
                                    )
                                }
                            </FormItem>
                        </Col>

                        <Col span={24} style={{marginTop: '20px'}}>
                            <h3 style={contactUsInputStyle}>Email</h3>
                            <FormItem>
                                {
                                    getFieldDecorator('email', {
                                        initialValue: Utils.isLoggedIn() ? Utils.getLoggedInUserEmail() : '',
                                        rules: [
                                            {required: true, message: 'Please provide a valid email'},
                                            {type: 'email', message: 'Please provide a valid email'}
                                        ]
                                    })(
                                        <Input placeholder='Email'/>
                                    )
                                }
                            </FormItem>
                        </Col>
                        
                        <Col span={24} style={{marginTop: '20px'}}>
                            <h3 style={{...contactUsInputStyle}}>Message</h3>
                            <FormItem>
                                {
                                    getFieldDecorator('emailDetail', {
                                        rules: [{required: true, message: 'Please write a valid message'}]
                                    })(
                                        <TextArea style={{marginTop: '4px'}} placeholder="Write a message" rows={4}/>
                                    )
                                }
                            </FormItem>
                        </Col>
                    </Form>
                </Row>
            </Modal>
        );
    }

    render() {
        const token = get(Utils.getUserInfo(), 'token', '') || '';
    
        return (
            <Col span={24} style={{marginTop: '-5px'}}>
                <Row style={{height: '100px', backgroundColor: 'transparent'}}></Row>
                <Row className="footer" style={{marginTop: this.props.windowWidth ? '0px' : '100px', ...this.props.style}}>
                {this.renderContactUsModal()}
                <Col xl={4} lg={4} md={4} sm={9} xs={9} className="footer-container">
                    <h5 className="footer-group-header">Company</h5>
                    <div className="footer-list">
                        <Link className="footer-link" to="/aboutus">About Us</Link>
                        <Link className="footer-link" to="/aboutus/people">People</Link>
                        <Link className="footer-link" to="/aboutus/careers">Careers</Link>
                        <Link className="footer-link" to="/aboutus/connect">Connect</Link>
                    </div>
                </Col>
                <Col xl={4} lg={4} md={4} sm={9} xs={9} className="footer-container">
                    <h5 className="footer-group-header">Policies</h5>
                    <div className="footer-list">
                        <Link className="footer-link" to="/policies/tnc">Terms of use</Link>
                        <Link className="footer-link" to="/policies/privacy">Privacy Policy</Link>
                        <Link className="footer-link" to="/contest/rules">Contest Rules</Link>
                    </div>
                </Col>
                {/* <Col xl={4} lg={4} md={4} sm={9} xs={9} className="footer-container">
                    <h5 className="footer-group-header">AimsQuant</h5>
                    <div className="footer-list">
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/community`}>Community</a>
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/research`}>Research</a>
                    </div>
                </Col> */}
                <Col xl={4} lg={4} md={4} sm={9} xs={9} className="footer-container">
                    <h5 className="footer-group-header">Help</h5>
                    <div className="footer-list">
                        <a className="footer-link" href="/faq">FAQ</a>
                        <a style={{color: '#fff'}} onClick={this.toggleContactUsModal}>Contact Us</a>
                    </div>
                </Col>

                <Col xl={4} lg={4} md={4} sm={9} xs={9} className="footer-container">
                    <h5 className="footer-group-header">Other Products</h5>
                    <div className="footer-list">
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/home`}>Quant Research</a>
                    </div>
                </Col>
                
                <Col xl={24} style={aimsquantContainerStyle}>
                    <h3 style={{color: '#fff', fontSize: '12px'}}>
                        AimsQuant Private Limited
                    </h3>
                </Col>
            </Row>
            </Col>
        );
    }
}

export const Footer = Form.create()(windowSize(FooterImpl));

const aimsquantContainerStyle = {
    position: 'absolute',
    bottom: 0,
    textAlign: 'right',
    left: '-20px',
    paddingBottom: '20px'
};

const contactUsInputStyle = {
    fontSize: '14px',
    color: '#4C4C4C'
}