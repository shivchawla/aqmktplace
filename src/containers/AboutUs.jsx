import React, { Component } from 'react';
import axios from 'axios';
import {Row, Col, Modal, message, Form, Input, Button} from 'antd';
import ReactDOM from 'react-dom';
import AppLayout from './AppLayout';
import {aboutUsText} from '../constants';
import {Utils} from '../utils';

const FormItem = Form.Item;
const TextArea = Input.TextArea;
const {requestUrl} = require('../localConfig');
class AboutUsItem extends React.Component {
    render() {
      const {reference, item, connect = false, readMoreClick=undefined, careerOnClick=undefined} = this.props;

      return (
          <Col span={24} className="full-screen-container" 
            style={{'background': 'white', 'padding': '0% 10% 14% 10%'}}>

            <h1 style={{'fontSize': 'calc(12px + 1.5vw)', 'fontWeight': 'bolder', 'marginTop': '10%'}}>{item.header}</h1>
            <p style={{'fontSize':'calc(10px + 1.5vw)', 'color': 'teal', marginBottom:'0px'}}>
              {item.tagline}
            </p>
            <div style={{'display': 'inline-flex', 'alignItems': 'center'}}>
                <div className="link-text" style={{'padding': '0px'}}>
                  <h4 style={{fontSize: '17px', width: '80%', marginTop:'5px'}}>{item.main}</h4>
                  <div style={{'paddingTop': '25px'}}> 
                      {
                        connect &&
                        <Button 
                            type="primary" 
                            className="register-button" 
                            onClick={this.props.toggleConnectModal}
                        >
                          CONTACT US
                        </Button>
                      }
                      {
                        readMoreClick !== undefined &&
                        <Button 
                            type="primary" 
                            className="register-button" 
                            onClick={readMoreClick}
                        >
                          READ MORE
                        </Button>
                      }
                      {
                        careerOnClick !== undefined &&
                        <Button 
                            type="primary" 
                            className="register-button" 
                            onClick={careerOnClick}
                        >
                          APPLY
                        </Button>
                      }
                  </div>
                </div>
            </div>
          </Col>
      );
    }
}

class AboutUs extends Component {
  constructor(props){
  	super();
  	this.state = {
      contactUsModalvisible: false,
      feedBackLoading: false
  	};
  }

  handleScrollToElement = (key) =>{
    const tesNode = ReactDOM.findDOMNode(this.refs[key]);
    if (tesNode){
      window.scrollTo(0, tesNode.offsetTop);
    }
  }

  componentWillReceiveProps(nextProps){
    console.log(nextProps.location);

  	if (nextProps.pageChange){
  		nextProps.pageChange('aboutUs');
  	}

    if (nextProps.location){
      if (nextProps.location.pathname === '/aboutus/people'){
        setTimeout(() =>{
          this.handleScrollToElement('whoWeAre');
        }, 100);
      }else if (nextProps.location.pathname === '/aboutus/careers'){
        setTimeout(() =>{
          this.handleScrollToElement('careers');
        }, 100);
      }else if (nextProps.location.pathname === '/aboutus/connect'){
        setTimeout(() =>{
          this.handleScrollToElement('connectWithUs');
        }, 100);
      }else{
        setTimeout(() =>{
          this.handleScrollToElement('aboutUs');
        }, 100);
      }
    }

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
                                    initialValue: 'Connect with AimsQuant',
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

  renderPageContent() {

    const {introduction, whatWeBuild, whoWeAre, careers, connect} = aboutUsText;

    return (
	    <Row>
        {this.renderContactUsModal()}
        <AboutUsItem 
          ref="aboutUs"
          item={introduction} 
          readMoreClick={() => this.handleScrollToElement('whatWeBuild')}
        />
        <AboutUsItem 
          ref="whatWeBuild"
          item={whatWeBuild} 
          scrollButton
          readMoreClick={() => this.handleScrollToElement('whoWeAre')}
        />
        <AboutUsItem
          ref="whoWeAre" 
          item={whoWeAre} 
          scrollButton
          readMoreClick={() => this.handleScrollToElement('careers')}
        />
        <AboutUsItem
          ref="careers" 
          item={careers} 
          scrollButton
          careerOnClick={() => {document.location.href = 'mailto:connect@aimsquant.com'}}
          // readMoreClick={() => this.handleScrollToElement('whatWeBuild')}
        />
        <AboutUsItem
          ref="connectWithUs" 
          item={connect} 
          connect 
          toggleConnectModal={this.toggleContactUsModal}
        />
	    </Row>
    );
  }

  render() {
      return (
        <AppLayout content = {this.renderPageContent()}/>
      );
  }
}

export default Form.create()(AboutUs);

const contactUsInputStyle = {
  fontSize: '14px',
  color: '#4C4C4C'
};