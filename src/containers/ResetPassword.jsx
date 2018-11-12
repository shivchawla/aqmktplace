import React, { Component } from 'react';
import axios from 'axios';
import _ from 'lodash';
import Media from 'react-media';
import {Col} from 'antd';
import {Spin, Form, Icon, Input, Button} from 'antd';
import {Link, withRouter} from 'react-router-dom';
import {Utils} from '../utils';
import {primaryColor} from '../constants';
import logo from "../assets/logo-advq-new.png";
import '../css/resetPassword.css';
import AppLayout from './AppLayout';
const URLSearchParamsPoly = require('url-search-params');


const {requestUrl} = require('../localConfig');

class ResetPassword extends Component {

  _mounted = false;
  cancelLoginCall = undefined;

  constructor(props){
  	super();
  	this.state = {
      'loading': false,
      'error': undefined
  	};
    this.handleSubmit = (e) => {
      e.preventDefault();
      const queryParams = new URLSearchParamsPoly(this.props.location.search);
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.updateState({
            'loading': true
          });
          axios({
              method: 'post',
              url: `${requestUrl}/user/resetpasswordcall`,
              data: {
                "newpassword": values.password,
                "password": values.confirmPassword,
                "code": queryParams.get('resetcode')
              }
            }, {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelLoginCall = c;
            })
          })
          .then((response) => {
              this.cancelLoginCall = undefined;
              this.props.history.push('/authMessage?mode=resetPassword');
          })
          .catch((error) => {
            this.cancelLoginCall = undefined;
            // console.log('Error Occured');
            if (error.response) {
              this.updateState({
                'loading': false,
                'error': _.get(error, 'response.data.statusMessage', 'Error Occured')
              });
            } else {
              this.updateState({
                error: 'Error occured while updating password'
              })
            }
          })
          .finally(() => {
            this.updateState({
              'loading': false
            });
          }); 
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
      this.props.history.push('/dashboard');
    }
  }

  componentWillUnMount(){
    this._mounted = false;
    if (this.cancelLoginCall){
      this.cancelLoginCall();
    }
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback("Passwords don't match");
    } else {
      callback();
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && this.state.confirmDirty) {
      form.validateFields(['confirmPassword'], { force: true });
    }
    callback();
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
            <Button type="primary" htmlType="submit" className="login-form-button" style={{marginTop: '20px'}}>
              SEND REQUEST
            </Button>
            <Link to="/login">Login Here</Link>
            <p style={{'color':'#cc6666',
              'fontSize': '14px', 'marginTop': '15px'}}>{this.state.error}</p>
          </FormItem>
        );
      }
    }

    return (
	    <div style={{'height': 'calc(100vh - 64px)', 'width': '100%', 'background': '#fafafaf',
        'minHeight': '500px', 'display': 'flex', flexDirection: 'column', 'alignItems': 'center', 'justifyContent': 'center'}}>
        <div className="card" style={{'padding': '20px', 'background': 'white',
          'borderRadius': '2px', 'textAlign': 'center', 'minWidth': '340px'}}>
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
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              {getFieldDecorator('password', {
                rules: [
                  { required: true, message: 'Please input your new password!' },
                  {
                    validator: this.validateToNextPassword,
                  }
                ],
              })(
                <Input 
                    prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                    placeholder="Password" 
                    type="password" 
                />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('confirmPassword', {
                rules: [
                  { required: true, message: 'Please confirm your new Password!' },
                  {
                    validator: this.compareToFirstPassword,
                  }
                ],
              })(
                <Input 
                        prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
                        type="password" 
                        placeholder="Confirm Password" 
                />
              )}
            </FormItem>
            {getLoginButtonDiv()}
          </Form>
        </div>
	    </div>
    );
  }

  renderMobile = () => {
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
			<Button 
					type="primary" 
					htmlType="submit" 
					className="login-form-button" 
					style={{
						marginTop: '20px',
						fontSize: '16px',
						height: '40px'
					}}
			>
              SEND REQUEST
            </Button>
            <Link to="/login" style={{fontSize: '16px'}}>Login Here</Link>
            <p style={{'color':'#cc6666',
              'fontSize': '14px', 'marginTop': '15px'}}>{this.state.error}</p>
          </FormItem>
        );
      }
    }

    return (
      	<div 
        	style={{
				height: 'calc(100vh - 64px)', 
				width: '100%', 
				background: '#fafafaf',
				minHeight: '500px', 
				display: 'flex', 
				flexDirection: 'column', 
			}}
		>
			<div 
					className="card" 
					style={{
						padding: '20px', 
						background: 'white',
						borderRadius: '2px', 
						boxShadow: 'none',
					}}
			>
				<Col 
						span={24} 
						style={{
							display: 'flex', 
							flexDirection: 'row', 
						}}
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
						Crowd-Sourced Investment Portfolio
					</p>
				</Col>
				<Col span={24} style={{marginTop: '15%'}}>
					<h3 style={{fontSize: '32px', color: primaryColor}}>Reset Password</h3>
				</Col>
				<Col span={24}>
					<Form onSubmit={this.handleSubmit} className="login-form">
						<FormItem>
						{getFieldDecorator('password', {
							rules: [
							{ required: true, message: 'Please input your new password!' },
							{
								validator: this.validateToNextPassword,
							}
							],
						})(
							<Input 
								prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
								placeholder="Password" 
								type="password" 
								style={{marginTop: '5px', height: '40px'}}
							/>
						)}
						</FormItem>
						<FormItem>
						{getFieldDecorator('confirmPassword', {
							rules: [
							{ required: true, message: 'Please confirm your new Password!' },
							{
								validator: this.compareToFirstPassword,
							}
							],
						})(
							<Input 
									prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} 
									type="password" 
									placeholder="Confirm Password" 
									style={{marginTop: '5px', height: '40px'}}
							/>
						)}
						</FormItem>
						{getLoginButtonDiv()}
					</Form>
				</Col>
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

export default Form.create()(withRouter(ResetPassword));

const biggerFont = {
  fontSize: '24px',
  fontWeight: '400',
};

const headerColor = {
  color: '#595959',
  fontSize: '16px'
};