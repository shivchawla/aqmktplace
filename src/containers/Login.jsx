import React, { Component } from 'react';
import Media from 'react-media';
import {Row, Col} from 'antd';
import _ from 'lodash';
import Impression from 'impression.js';
import windowSize from 'react-window-size';
import {Utils, sendErrorToBackend} from '../utils';
import {primaryColor} from '../constants';
import { Spin, Form, Icon, Input, Button, Modal } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import axios from 'axios';
import {LoginMeta} from '../metas';
import logo from "../assets/logo-advq-new.png";
import '../css/login.css';
import AppLayout from './AppLayout';
import ContactUs from '../components/ContactUs';

const {requestUrl, sendErrorEmailsForLogin = false} = require('../localConfig');
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
                  this.props.history.push('/contest');
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
      this.props.history.push('/contest');
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
          <FormItem>
            <Link className="login-form-forgot" to="/forgotPassword" style={{fontSize: '16px'}}>Forgot password</Link>
            <Button 
                type="primary" 
                htmlType="submit" 
                className="login-form-button"
                style={{
                  height: '40px',
                  fontSize: '16px'
                }}
            >
              LOG IN
            </Button>
			<h3 style={{fontSize: '16px'}}>
            	Or <Link to="/signup">Register Now!</Link>
			</h3>
          </FormItem>
        );
      }
    }

  	return (
  		<div 
  			style={{
  				height: 'calc(100vh - 64px)', 
  				width: '100%', 
  				minHeight: '500px', 
  				display: 'flex', 
  				flexDirection: 'column', 
  			}}
  		> 
  			<LoginMeta />
        <ContactUs title="Issues with sign-in" visible={this.state.showContactUs} onClose={this.toggleContactUsModal}/>
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
  				}}
  			>
  				<Col 
  						span={24} 
  						style={{
  							display: 'flex', 
  							flexDirection: 'row', 
              }}
              onClick={() => this.props.history.push('/')}
  				>
  					<img src={logo} style={{height: '40px'}}/>
  					<div style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>
  						<span style={{...biggerFont, color:primaryColor}}>A</span>
  						<span style={{color: primaryColor}}>DVICE</span>
  						<span style={{...biggerFont, color: '#e06666'}}>Q</span>
  						<span style={{color: '#e06666'}}>UBE</span>
  					</div>
  				</Col>
  				<Col span={24}>
  					<p style={{'color': '#37474F', 'fontStyle': 'italic',
  						'fontSize': '15px', 'margin': '0px', marginTop: '10px'}}>
  						Expert-Sourced Investment Portfolio
  					</p>
  				</Col>
  				<Col span={24} style={{marginTop: '15%'}}>
  					<h3 style={{fontSize: '32px', color: primaryColor}}>Login</h3>
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
          <Col span={24} style={{fontSize: '16px', textAlign:'center', color: primaryColor}} onClick={this.toggleContactUsModal}>
            Can't sign-in to your AdviceQube account?
          </Col>
  			</Row>  	    
      </div>
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
            <Link className="login-form-forgot" to="/forgotPassword">Forgot password</Link>
            <Button type="primary" htmlType="submit" className="login-form-button">
              LOG IN
            </Button>
            Or <Link to="/signup">Register Now!</Link>
            <p style={{'color':'#cc6666',
              'fontSize': '14px', 'marginTop': '15px'}}>{this.state.error}</p>
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
  					Expert-Sourced Investment Portfolio
  				</p>
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