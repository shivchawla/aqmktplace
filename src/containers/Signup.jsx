import React, { Component } from 'react';
import Media from 'react-media';
import axios from 'axios';
import {Spin,  Form, Input, Icon, Checkbox, Button, Row, Col} from 'antd';
import {Link, withRouter} from 'react-router-dom';
import {primaryColor} from '../constants';
import {Utils} from '../utils';
import {SignupMeta} from '../metas';
import logo from "../assets/logo-advq-new.png";
import '../css/register.css';
import AppLayout from './AppLayout';
import {AqMobileLayout} from './AqMobileLayout/Layout';
import ContactUs from '../components/ContactUs';

const {requestUrl} = require('../localConfig');

class Signup extends Component {

  _mounted = false;
  cancelSignupCall = undefined;

  constructor(props){
    super();
    this.state = {
      'loading': false,
      'error': undefined,
      showContactUs: false
    };
    this.handleSubmit = (e) => {
      e.preventDefault();
      this.props.form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          this.updateState({
            'loading': true
          });
          axios({
              method: 'post',
              url: `${requestUrl}/user`,
              data: {
                "firstName": values.firstName,
                "lastName": values.lastName,
                "email": values.email,
                "password": values.password
              }
            }, {
            cancelToken: new axios.CancelToken( (c) => {
              // An executor function receives a cancel function as a parameter
              this.cancelSignupCall = c;
            })
          })
          .then((response) => {
              if(response.data.active){
                Utils.goToLoginPage(this.props.history);
              }else{
                const email = response.data.email;
                const name = response.data.firstName + " " + response.data.lastName;
                this.props.history.push('/authMessage?mode=activationPending&email='+email+'&name='+name);
              }
              this.cancelSignupCall = undefined;
          })
          .catch((error) => {
            this.cancelSignupCall = undefined;
            if (error.response && error.response.status === 401){
              this.updateState({
                'loading': false,
                'error': "Email address already registered!! Sign up with a different email."
              });
            }else{
              this.updateState({
                'loading': false,
                'error': error.response.data
              });
            }
          });
        }
      });
    }
    this.handleConfirmBlur = (e) => {
      const value = e.target.value;
      this.setState({ confirmDirty: this.state.confirmDirty || !!value });
    }
    this.compareToFirstPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && value !== form.getFieldValue('password')) {
        callback('Two passwords that you enter is inconsistent!');
      } else {
        callback();
      }
    }
    this.validateToNextPassword = (rule, value, callback) => {
      const form = this.props.form;
      if (value && this.state.confirmDirty) {
        form.validateFields(['confirm'], { force: true });
      }
      callback();
    }

    this.validateTnc =  (rule, value, callback) => {
      if (value !== true) {
        callback('Please read and agree to TnC!');
      } else {
        callback();
      }
    }

    this.updateState = (data) => {
      if (this._mounted){
        this.setState(data);
      }
    }
  }

  componentDidMount(){
    this._mounted = true;
    if (Utils.isLoggedIn()){
      this.props.history.push('/research');
    }else{
      if (this.props.pageChange){
        this.props.pageChange('signup');
      }
    }
  }

  componentWillUnMount(){
    this._mounted = false;
    if (this.cancelSignupCall){
      this.cancelSignupCall();
    }
  }

  getRegisterButtonDiv = (type='desktop') => {
	const FormItem = Form.Item;
    const { getFieldDecorator } = this.props.form;
    const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;
	if (this.state.loading){
        return (
          <div style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minHeight': '80px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      } else {
        return (
          <React.Fragment>
            <SignupMeta />
            <FormItem className="signup-form-item">
              {getFieldDecorator('agreement', {
                valuePropName: 'checked',
                rules:[{
                  validator: this.validateTnc
                }]
              })(
                <Checkbox style={{fontSize: '16px'}}>I agree to <Link to="/policies/tnc">Terms and Conditions</Link></Checkbox>
              )}
            </FormItem>
            <FormItem className="signup-form-item">
              <Button 
                  type="primary" 
                  htmlType="submit" 
                  style={{
                    width: '100%', 
                    height: type === 'desktop' ? '32px' : '40px',
                    fontSize: type === 'desktop' ? '14px' : '16px'
                  }}
              >
                REGISTER
              </Button>
              <h3 style={{fontSize: '16px'}}>
            	  Or <Link to="/login">Login Now!</Link>
              </h3>
            </FormItem>
            <p style={{'color':'#cc6666',
              'fontSize': '14px', 'marginTop': '15px'}}>{this.state.error}</p>
            <div style={{fontSize: '16px', fontWeight:type=='desktop' ? 300 : 400, marginTop:type=='desktop' ? '20px' : '0px', textAlign:'center', color: primaryColor, cursor:'pointer'}} onClick={this.toggleContactUsModal}>
              Can't create an AdviceQube account?
            </div>  
          </React.Fragment>
        );
      }
  }

  toggleContactUsModal = () => {
    this.setState({showContactUs: !this.state.showContactUs});
  }

  renderMobile = () => {
	const FormItem = Form.Item;
    const { getFieldDecorator } = this.props.form;

    return (
	  	<div 
	  		style={{
				//height: 'calc(100vh - 64px)', 
				width: '100%', 
				background: '#fafafaf',
				minHeight: '500px', 
				display: 'block'
			}}
		>
      <ContactUs title="Problem with sign-up" visible={this.state.showContactUs} onClose={this.toggleContactUsModal}/>
            <AqMobileLayout
                    style={{padding: '20px'}}
            >
				<Col span={24} style={{marginTop: '20px'}}>
					<h3 style={{fontSize: '32px', color: primaryColor}}>Register</h3>
				</Col>
				<Col span={24}>
					<Form onSubmit={this.handleSubmit} style={{width: '100%'}}>
						<FormItem className="signup-form-item" style={{marginBottom: '5px', marginTop: '20px'}}>
							{getFieldDecorator('firstName', {
							    rules: [{ required: true, message: 'Please input your firstName!', whitespace: true }],
							})(
							    <Input placeholder="First Name" style={{height: '40px'}} />
							)}
						</FormItem>
						<FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
							{getFieldDecorator('lastName', {
							    rules: [{ required: true, message: 'Please input your lastName!', whitespace: true }],
							})(
							    <Input placeholder="Last Name" style={{height: '40px', marginTop: '5px'}} />
							)}
						</FormItem>
						<FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
							{getFieldDecorator('email', {
                                rules: [{
                                    type: 'email', message: 'Please input a valid E-mail!',
                                }, {
                                    required: true, message: 'Please input your E-mail!',
                                }],
							})(
                                <Input 
                                            prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                            placeholder="E-Mail"
                                            style={{height: '40px', marginTop: '5px'}}
                                />
							)}
						</FormItem>
						<FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
							{getFieldDecorator('password', {
                                rules: [{
                                    required: true, message: 'Please input your password!',
                                },{
                                    min: 8, message: 'Password must be minimum 8 character long.',
                                }, {
                                    validator: this.validateToNextPassword,
                                }],
							})(
                                <Input 
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                    type="password" 
                                    placeholder="Password"
                                    style={{height: '40px', marginTop: '5px'}}
                                />
							)}
						</FormItem>
						<FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
							{getFieldDecorator('confirm', {
                                rules: [{
                                    required: true, message: 'Please confirm your password!',
                                }, {
                                    validator: this.compareToFirstPassword,
                                }],
							})(
                                <Input 
                                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                    type="password" onBlur={this.handleConfirmBlur} 
                                    placeholder="Confirm Password"
                                    style={{height: '40px', marginTop: '5px'}}
                                />
							)}
						</FormItem>
						{this.getRegisterButtonDiv('mobile')}
					</Form>
				</Col>
			</AqMobileLayout>        
      </div>
    );
  }

  renderDesktop = () => {
	const FormItem = Form.Item;
    const { getFieldDecorator } = this.props.form;

    return (
      <div>
      <div style={{height: 'calc(100vh - 64px)', 'width': '100%', 'background': '#fafafaf',
        'minHeight': '500px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
        
        <ContactUs title="Problem with sign-up" visible={this.state.showContactUs} onClose={this.toggleContactUsModal}/>

        <div className="card" style={{'padding': '20px', 'background': 'white',
          'borderRadius': '2px', 'textAlign': 'center', 'minWidth': '340px', width: '390px'}}>
          <img alt="" style={{'height': '60px', 'width': 'auto'}} src={logo}/>
          <p style={{'fontSize': '30px', 'fontWeight': '400', 'margin': '0px'}}>
            <span style={{'color': 'teal'}}>A</span>
            <span style={{'color': 'teal', fontSize: '18px'}}>DVICE</span>
            <span style={{'color': '#e06666'}}>Q</span>
            <span style={{'color': '#e06666',fontSize: '18px'}}>UBE</span>
          </p>
          <p style={{'color': '#37474F', 'fontStyle': 'italic',
            'fontSize': '15px', 'margin': '0px'}}>
            Crowd-Sourced Investment Portfolio
          </p>
          <Form onSubmit={this.handleSubmit}>
            <FormItem className="signup-form-item" style={{marginBottom: '5px', marginTop: '20px'}}>
              {getFieldDecorator('firstName', {
                rules: [{ required: true, message: 'Please input your firstName!', whitespace: true }],
              })(
                <Input placeholder="First Name"/>
              )}
            </FormItem>
            <FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
              {getFieldDecorator('lastName', {
                rules: [{ required: true, message: 'Please input your lastName!', whitespace: true }],
              })(
                <Input placeholder="Last Name"/>
              )}
            </FormItem>
            <FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
              {getFieldDecorator('email', {
                rules: [{
                  type: 'email', message: 'Please input a valid E-mail!',
                }, {
                  required: true, message: 'Please input your E-mail!',
                }],
              })(
                <Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="E-Mail"/>
              )}
            </FormItem>
            <FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
              {getFieldDecorator('password', {
                rules: [{
                  required: true, message: 'Please input your password!',
                },{
                  min: 8, message: 'Password must be minimum 8 character long.',
                }, {
                  validator: this.validateToNextPassword,
                }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password"/>
              )}
            </FormItem>
            <FormItem className="signup-form-item" style={{marginBottom: '5px'}}>
              {getFieldDecorator('confirm', {
                rules: [{
                  required: true, message: 'Please confirm your password!',
                }, {
                  validator: this.compareToFirstPassword,
                }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" onBlur={this.handleConfirmBlur} placeholder="Confirm Password"/>
              )}
            </FormItem>
            {this.getRegisterButtonDiv()}
          </Form>
        </div>
      </div>
      </div>
    );
  }

  render() {

    const FormItem = Form.Item;
    const { getFieldDecorator } = this.props.form;

    return (
        <AppLayout noFooter content = {
        		<React.Fragment>
        			<Media 
        				query="(max-width: 600px)"
        				render={() => this.renderMobile()}
        			/>
        			<Media 
        				query="(min-width: 601px)"
        				render={() => this.renderDesktop()}
        			/>
        		</React.Fragment>
        }>
        </AppLayout>
	);
  }
}

export default Form.create()(withRouter(Signup));


const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
};


const headerColor = {
    color: '#595959',
    fontSize: '16px'
};