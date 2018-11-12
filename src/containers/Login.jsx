import React, { Component } from 'react';
import Media from 'react-media';
import {Row, Col} from 'antd';
import _ from 'lodash';
import GoogleLogin from 'react-google-login';
import windowSize from 'react-window-size';
import {Utils, sendErrorToBackend} from '../utils';
import {primaryColor} from '../constants';
import { Spin, Form, Icon, Input, Button, Modal } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import axios from 'axios';
import {LoginMeta} from '../metas';
import {horizontalBox, verticalBox} from '../constants';
import logo from "../assets/logo-advq-new.png";
import '../css/login.css';
import {AqMobileLayout} from './AqMobileLayout/Layout';
import AppLayout from './AppLayout';
import ContactUs from '../components/ContactUs';

const {requestUrl, sendErrorEmailsForLogin = false, googleClientId} = require('../localConfig');
const appLoginEmailSent = Utils.getFromLocalStorage('appLoginEmailSent') === undefined ? false : true;

class Login extends Component {

  _mounted = false;
  cancelLoginCall = undefined;

  constructor(props) {
  	super();
  	this.state = {
        'loading': false,
        'error': undefined,
        showContactUs: false
  	};

    this.handleSubmit = (e) => {
      e.preventDefault();
      let errorToSend = null;
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.updateState({
            'loading': true
          });
          axios({
              method: 'post',
              url: `${requestUrl}/user/login`,
              data: {
                "email": values.userName,
                "password": values.password
              }
            }, {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelLoginCall = c;
            })
          })
          .then((response) => {
              this.cancelLoginCall = undefined;
              if (response.data.token){
                // if (values.remember){
                Utils.localStorageSaveObject(Utils.userInfoString, response.data);
                // }
                Utils.setLoggedInUserInfo(response.data);
                Utils.localStorageSave('selectedPage', 1);
                const redirectUrl = Utils.getRedirectAfterLoginUrl();
                if (redirectUrl){
                  this.props.history.push(redirectUrl);
                } else{
                    window.location = '/dailycontest/home';
                }
              }else{
                this.updateState({
                  'loading': false,
                  'error': "Unexpected error occured! Please try again."
                });
              }
          })
          .catch((error) => {
            this.cancelLoginCall = undefined;
            errorToSend = _.get(error, 'response.data', error);
            this.updateState({
              'loading': false,
              'error': JSON.stringify(_.get(error, 'response.data', 'Error Occured'))
            });
          })
          .finally(() => {
            // !appLoginEmailSent
            sendErrorEmailsForLogin 
            && sendErrorToBackend(errorToSend, values.userName, 'Login Detail', null, null, () => {
                Utils.localStorageSave('appLoginEmailSent', true);
            });
          })
        }
        
      });
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
        window.location = '/dailycontest';
    }else{
      // if (this.props.pageChange){
      //   this.props.pageChange('login');
      // }
    }
  }

  componentWillUnMount(){
    this._mounted = false;
    if (this.cancelLoginCall){
      this.cancelLoginCall();
    }
  }

  toggleContactUsModal = () => {
      this.setState({showContactUs: !this.state.showContactUs});
  }

  responseGoogle =  (googleUser) => {
    const accessToken = googleUser.getAuthResponse().id_token;
    const googleLoginUrl = `${requestUrl}/user/login_google`;
    let errorToSend = null;
    this.updateState({
      loading: true
    });
    axios({
      method: 'POST',
      url: googleLoginUrl,
      data: {
        accessToken
      }
    })
    .then(response => {
        if (response.data.token) {
            // if (values.remember){
            Utils.localStorageSaveObject(Utils.userInfoString, response.data);
            // }
            Utils.setLoggedInUserInfo(response.data);
            Utils.localStorageSave('selectedPage', 1);
            const redirectUrl = Utils.getRedirectAfterLoginUrl();
            // if (redirectUrl) {
            //     this.props.history.push(redirectUrl);
            // } else {
                window.location = '/dailycontest';
            // }
        } else {
            this.updateState({
                'loading': false,
                'error': "Unexpected error occured! Please try again."
            });
        }
    })
    .catch((error) => {
        errorToSend = _.get(error, 'response.data', error);
        this.updateState({
            'loading': false,
            'error': JSON.stringify(_.get(error, 'response.data', 'Error Occured'))
        });
    })
    .finally(() => {
        // !appLoginEmailSent
        sendErrorEmailsForLogin 
        && sendErrorToBackend(errorToSend, 'admin@adviceqube.com', 'Login Detail', null, null, () => {
            Utils.localStorageSave('appLoginEmailSent', true);
        });
    })
  }

  renderMobile = () => {
	  const FormItem = Form.Item;
    const {getFieldDecorator} = this.props.form;

    const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;

    const getLoginButtonDiv = (type = 'desktop') => {
      if (this.state.loading){
        return (
          <div style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minHeight': '142px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      } else{
        return (
            <div style={{...verticalBox, marginTop: '10px'}}>
                <Button 
                    type="primary" 
                    className="login-form-button"
                    style={{
                    height: '40px',
                    fontSize: '16px'
                    }}
                    onClick={this.handleSubmit}
                >
                LOG IN
                </Button>
                <div style={{...horizontalBox, width: '100%', justifyContent: 'space-between', marginTop: '10px'}}>
                    <Link className="login-form-forgot" to="/forgotPassword" style={{fontSize: '16px'}}>Forgot password</Link>
                    <h3 style={{fontSize: '16px'}}>
                        <Link to="/signup">Create Account</Link>
                    </h3>
                </div>
            </div>
        );
      }
    }

  	return (
      <AqMobileLayout>
        <LoginMeta />
        <ContactUs 
            title="Issues with sign-in" 
            visible={this.state.showContactUs} 
            onClose={this.toggleContactUsModal}
        />
        <Row 
            className="card login-card" 
            style={{
            padding: '20px', 
            background: '#fff',
            borderRadius: '2px', 
            width: this.props.windowWidth > 450 ? '390px' : '100%', 
            display: 'flex', 
            flexDirection: 'column', 
            paddingTop: '20px',
                    boxShadow: 'none',
                    paddingBottom: 0
            }}
        >
            
            <Col 
                span={24} 
                style={{...verticalBox, marginTop: '15%'}}
            >
                <div style={{...horizontalBox, justifyContent: 'space-between', width: '100%'}}>
                    <h3 
                            style={{
                                fontSize: '32px', 
                                color: primaryColor,
                            }}
                    >
                        Login
                    </h3>
                    <Button 
                            icon='google' 
                            style={{color: '#e2402b', borderColor: '#e2402b'}} 
                            className='google-login-button-container'
                    >
                        <GoogleLogin
                            clientId={googleClientId}
                            buttonText="Login"
                            onSuccess={this.responseGoogle}
                            onFailure={this.responseGoogle}
                            buttonText="Login with Google"
                            className='google-login-button'
                            style={{fontSize: '16px'}}
                        >
                            Login with Google
                        </GoogleLogin>
                    </Button>
                </div>
                <p 
                    style={{
                    'color':'#cc6666',
                    'fontSize': '14px', 'marginTop': '5px', marginBottom: 0
                    }}
                >
                    {this.state.error}
                </p>
            </Col>
            <Col span={24}>
                <Form onSubmit={this.handleSubmit} className="login-form" style={{width: '100%'}}>
                    <FormItem>
                        {getFieldDecorator('userName', {
                        rules: [{ required: true, message: 'Please input your email!'},{type:'email', message:'Please input a valid email'}],
                        })(
                            <Input 
                                style={{height: '40px'}}
                                prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                                placeholder="E-mail"
                            />
                        )}
                    </FormItem>
                    <FormItem>
                        {getFieldDecorator('password', {
                        rules: [{ required: true, message: 'Please input your Password!'}],
                        })(
                        <Input
                            style={{height: '40px'}} 
                            prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                            type="password" 
                            placeholder="Password" 
                        />
                        )}
                    </FormItem>
                    {getLoginButtonDiv()}
                </Form>
            </Col>
            <Col 
                    span={24} 
                    style={{
                        fontSize: '16px', 
                        textAlign:'center', 
                        color: primaryColor, 
                        marginTop: '20px'
                    }} 
                    onClick={this.toggleContactUsModal}
            >
                Can't sign-in to your AdviceQube account?
            </Col>
        </Row>  	    
      </AqMobileLayout>
  	);
  }

  renderDesktop = () => {
	  const FormItem = Form.Item;
    const { getFieldDecorator } = this.props.form;

    const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;

    const getLoginButtonDiv = () =>{
      if (this.state.loading){
        return (
          <div style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minHeight': '142px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      }else{
        return (
          <FormItem>
            <div style={verticalBox}>
                <div style={{...verticalBox, justifyContent: 'center', width: '100%'}}>
                    <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="login-form-button"
                    >
                        LOG IN
                    </Button>
                </div>
                <div style={{...horizontalBox, justifyContent: 'space-between', width: '100%'}}>
                    <Link className="login-form-forgot" to="/forgotPassword">Forgot password</Link>
                    <Link to="/signup">Create Account</Link>
                </div>
                <p 
                        style={{
                            'color':'#cc6666',
                            'fontSize': '14px', 
                            margin: 0
                        }}
                >
                    {this.state.error}
                </p>
            </div>
          </FormItem>
        );
      }
    }
  	
    return (
      <div>
      <ContactUs title="Issues with sign-in" visible={this.state.showContactUs} onClose={this.toggleContactUsModal}/>
  		<div style={{'height': 'calc(100vh - 64px)', 'width': '100%', 'background': '#fafafaf',
          'minHeight': '500px', 'display': 'flex', flexDirection: 'column', 'alignItems': 'center', 'justifyContent': 'center'}}>
          <LoginMeta />
  			<div className="card login-card" style={{'padding': '20px', 'background': 'white',
  			'borderRadius': '2px', 'textAlign': 'center', 'width': '390px', display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '20px'}}>
  				<img style={{'height': '60px', 'width': 'auto'}} src={logo}/>
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
                <Button 
                        icon='google' 
                        style={{color: '#e2402b', marginTop: '10px'}} 
                        className='google-login-button-container'
                >
                    <GoogleLogin
                        clientId={googleClientId}
                        buttonText="Login"
                        onSuccess={this.responseGoogle}
                        onFailure={this.responseGoogle}
                        buttonText="Login with Google"
                        className='google-login-button'
                    />
                </Button>
  				<Form onSubmit={this.handleSubmit} className="login-form" style={{width: '100%'}}>
  					<FormItem>
  					{getFieldDecorator('userName', {
  						rules: [{ required: true, message: 'Please input your email!'},{type:'email', message:'Please input a valid email'}],
  					})(
  						<Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="E-mail"/>
  					)}
  					</FormItem>
  					<FormItem>
  					{getFieldDecorator('password', {
  						rules: [{ required: true, message: 'Please input your Password!'}],
  					})(
  						<Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
  					)}
  					</FormItem>
  					{getLoginButtonDiv()}
  				</Form>
  			</div>
        <div style={{fontSize: '16px', marginTop:'30px', textAlign:'center', fontWeight:300, color: primaryColor, cursor:'pointer'}} onClick={this.toggleContactUsModal}>
          Can't sign-in to your AdviceQube account?
        </div>
	    </div>
        
      </div>
  	);
  }

  render() {
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

export default Form.create()(withRouter(windowSize(Login)));

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
};


const headerColor = {
    color: '#595959',
    fontSize: '16px'
};