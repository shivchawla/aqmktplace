import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Link} from 'react-router-dom';
import {Row, Col, Modal, message, Form, Input, Button} from 'antd';
import {Utils} from '../utils';
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
                const subject = values.emailSubject;
                const feedback = values.emailDetail;
                const email = values.email;
                this.setState({feedBackLoading: true});
                axios({
                    url: feedbackUrl,
                    method: 'POST',
                    headers: Utils.getAuthTokenHeader(),
                    data: {
                        feedback,
                        subject,
                        email
                    }
                })
                .then(response => {
                    message.success('Thank you for your feedback')
                })
                .catch(error => {
                    message.error('Sorry, Error occured while submitting Feedback')
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
                            <h3 style={contactUsInputStyle}>Email</h3>
                            <FormItem>
                                {
                                    getFieldDecorator('email', {
                                        initialValue: Utils.isLoggedIn() ? Utils.getLoggedInUserEmail() : '',
                                        rules: [
                                            {required: true, message: 'Please provide a valid subject'},
                                            {type: 'email', message: 'Please provide a valid email'}
                                        ]
                                    })(
                                        <Input placeholder='Email'/>
                                    )
                                }
                            </FormItem>
                        </Col>
                        <Col span={24} style={{marginTop: '20px'}}>
                            <h3 style={contactUsInputStyle}>Subject</h3>
                            <FormItem>
                                {
                                    getFieldDecorator('emailSubject', {
                                        rules: [{required: true, message: 'Please provide a valid subject'}]
                                    })(
                                        <Input placeholder='Subject'/>
                                    )
                                }
                            </FormItem>
                        </Col>
                        <Col span={24} style={{marginTop: '20px'}}>
                            <h3 style={{...contactUsInputStyle}}>Detail</h3>
                            <FormItem>
                                {
                                    getFieldDecorator('emailDetail', {
                                        rules: [{required: true, message: 'Please provide the detail of your form'}]
                                    })(
                                        <TextArea style={{marginTop: '4px'}} placeholder="Detail" rows={4}/>
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
        const token = _.get(Utils.getUserInfo(), 'token', '') || '';
    
        return (
            <Row className="footer">
                {this.renderContactUsModal()}
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">Products</h5>
                    <div className="footer-list">
                        <Link className="footer-link" to="/home">MarketPlace</Link>
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/home?token=${token}`}>Research Platform</a>
                    </div>
                </Col>
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">Policies</h5>
                    <div className="footer-list">
                        <Link className="footer-link" to="/policies/tnc">Terms of use</Link>
                        <Link className="footer-link" to="/policies/privacy">Privacy Policy</Link>
                    </div>
                </Col>
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">AimsQuant</h5>
                    <div className="footer-list">
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/community?token=${token}`}>Community</a>
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/research?token=${token}`}>Research</a>
                    </div>
                </Col>
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">Help</h5>
                    <div className="footer-list">
                        <a className="footer-link" href="/faq">FAQ</a>
                        <a style={{color: '#fff'}} onClick={this.toggleContactUsModal}>Contact Us</a>
                    </div>
                </Col>
                <Col span={24} style={aimsquantContainerStyle}>
                    <h3 style={{color: '#fff', fontSize: '12px'}}>
                        AimsQuant Private Limited
                    </h3>
                </Col>
            </Row>
        );
    }
}

export const Footer = Form.create()(FooterImpl);

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