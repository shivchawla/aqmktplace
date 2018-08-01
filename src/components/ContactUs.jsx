import React, { Component } from 'react';
import axios from 'axios';
import {Row, Col, Modal, message, Form, Input, Button} from 'antd';
import {Utils} from '../utils';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const {requestUrl} = require('../localConfig');

class ContactUs extends Component {
	constructor(props) {
		super(props);
		this.state = {
			requestProcessed: false,
			message: ''
		};
	}

  	submitContactUsForm = e => {
      	e.preventDefault();
      	const feedbackUrl = `${requestUrl}/user/sendFeedback`;
      	this.props.form.validateFields((err, values) => {
    	  	if (!err) {
              	axios({
                  	url: feedbackUrl,
                  	method: 'POST',
                  	data: {
                      	"feedback": values.emailDetail,
                      	"subject": values.emailSubject,
                      	"to": "support@adviceqube.com",
                      	"from": values.email
                  	}
              	})
              	.then(response => {
					// message.success('Thanks for your message!');
					this.setState({requestProcessed: true, message: 'Thanks for your message. We will get back to you shortly'});  
              		this.props.form.resetFields();
              	})
              	.catch(error => {
					this.setState({requestProcessed: true, message: 'Sorry, Error occured while sending message'});
              		// message.error('Sorry, Error occured while sending message');
              	})
              	// .finally(() => {
              	// 	this.props.onClose();
              	// })
          	}
      	})
  	}

	renderProcessFinished = (message = this.state.message) => {
		return (
			<Row>
				<Col span={24}>
					<h3>{message}</h3>
				</Col>
			</Row>
		);
	}

	renderForm = () => {
		const {getFieldDecorator, getFieldsError} = this.props.form;
		const title = this.props.title ? this.props.title : 'Feedback or Suggestion';

		return (
			<Row>
				<Form onSubmit={this.submitContactUsForm}>
					
					<Col span={24}>
						<h3 style={contactUsInputStyle}>Subject</h3>
						<FormItem>
							{
								getFieldDecorator('emailSubject', {
									initialValue: title,
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
		);
	}

  	toggleContactUsModal = () => {
		this.props.onClose();
		this.setState({requestProcessed: false, message: ''});
	}
	  
	render() {
		const title = this.props.title ? this.props.title : 'Feedback or Suggestion';
		
	    return (
	    	<Modal
		        title={title}
		        visible={this.props.visible}
				style={{
					top: '10px'
				}}
				onCancel={this.toggleContactUsModal}
		        footer={[
					<Button onClick={this.toggleContactUsModal}>
						CANCEL
					</Button>,
					!this.state.requestProcessed 
					? 	<Button 
								type="primary" 
								onClick={this.submitContactUsForm}
						>
							SEND
						</Button>
					:	null
                ]}
      		>
	            {
					this.state.requestProcessed
					?	this.renderProcessFinished()
					:	this.renderForm()
				}
            </Modal>
	    );
  	}
}

const contactUsInputStyle = {
  fontSize: '14px',
  color: '#4C4C4C'
};

export default Form.create()(ContactUs);