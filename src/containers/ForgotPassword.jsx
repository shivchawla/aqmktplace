import React, { Component } from 'react';
import Media from 'react-media';
import {Utils} from '../utils';
import _ from 'lodash';
import {Row, Col} from 'antd';
import {requestUrl} from '../localConfig';
import { Spin, Form, Icon, Input, Button } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import {primaryColor} from '../constants';
import axios from 'axios';
import logo from "../assets/logo-advq-new.png";
import '../css/forgotPassword.css';
import AppLayout from './AppLayout';

class ForgotPasswordImpl extends Component {

  _mounted = false;
  cancelForgotPasswordCall = undefined;

  constructor(props){
  	super(props);
  	this.state = {
      'loading': false,
      'error': undefined
  	};
    this.handleSubmit = (e) => {
      e.preventDefault();
      this.props.form.validateFields((err, values) => {
        if (!err) {
          this.updateState({
            'loading': true
          });
          axios({
              method: 'get',
              url: `${requestUrl}/user/forgotpassword?email=${values.email}`,
            }, {
            cancelToken: new axios.CancelToken( (c) => {
              this.cancelForgotPasswordCall = c;
            })
          })
          .then((response) => {
              this.cancelForgotPasswordCall = undefined;
              if (response.data){
                this.props.history.push('/authMessage?mode=forgotpassword&email='+values.email);
              }else{
                this.updateState({
                  'loading': false,
                  'error': "Unexpected error occured! Please try again."
                });
              }
          })
          .catch((error) => {
            this.cancelForgotPasswordCall = undefined;
            this.updateState({
              'loading': false,
              'error': _.get(error, 'response.data', 'Unexpected Error')
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
      this.props.history.push('/research');
    }else{
      // if (this.props.pageChange){
      //   this.props.pageChange('login');
      // }
    }
  }

  componentWillUnMount(){
    this._mounted = false;
    if (this.cancelForgotPasswordCall){
      this.cancelForgotPasswordCall();
    }
  }

  renderMobile = () => {
	const FormItem = Form.Item;
    const { getFieldDecorator } = this.props.form;

    const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;

	const getForgotPassButtonDiv = () =>{
		if (this.state.loading){
			return (
			<div style={{'display': 'flex',
				'alignItems': 'center', 'justifyContent': 'center',
				'minHeight': '142px'}}>
				<Spin indicator={antIconLoading} />
			</div>
			);
		} else {
			return (
			<FormItem>
				<Button 
						type="primary" 
						htmlType="submit" 
						className="login-form-button"
						style={{
							fontSize: '16px',
							height: '40px'
						}}
				>
					SEND REQUEST
				</Button>
				<p style={{'color':'#cc6666',
				'fontSize': '14px', 'marginTop': '15px'}}>{this.state.error}</p>
				<div style={{'display': 'flex', 'justifyContent': 'center'}}>
				<span style={{fontSize: '16px'}}>
					<Link style={{fontSize: '16px'}} className="forgot-form-login" to="/login">Log in Here</Link>
				</span>
				</div>
			</FormItem>
			);
		}
	};

	return (
		<div 
				style={{
					height: 'calc(100vh - 64px)', 
					width: '100%', 
					background: '#fff',
					minHeight: '500px', 
					display: 'flex',
					flexDirection: 'column'
				}}
		>
			<div 
					className="card" 
					style={{
						padding: '20px', 
						background: 'white',
						borderRadius: '2px', 
						boxShadow: 'none',
						display: 'flex', 
						flexDirection: 'column'
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
				<div 
						style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}
						onClick={() => this.props.history.push('/')}
				>
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
				<h3 style={{fontSize: '32px', color: primaryColor}}>Forgot Password</h3>
			</Col>
			<Col span={24}>
				<Form onSubmit={this.handleSubmit} className="login-form">
					<FormItem className="signup-form-item">
					{getFieldDecorator('email', {
						rules: [{
						type: 'email', message: 'Please input a valid E-mail!',
						}, {
						required: true, message: 'Please input your E-mail!',
						}],
					})(
						<Input 
								prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} 
								placeholder="Account Email Address"
								style={{marginTop: '5px', height: '40px'}}
						/>
					)}
					</FormItem>
					{getForgotPassButtonDiv()}
				</Form>
			</Col>
			</div>
	    </div>
	);
  }

  renderDesktop = () => {
	const FormItem = Form.Item;
	const antIconLoading = <Icon type="loading" style={{ fontSize: 24 }} spin />;
	const { getFieldDecorator } = this.props.form;
	const getForgotPassButtonDiv = () =>{
		if (this.state.loading){
		  return (
			<div style={{'display': 'flex',
			  'alignItems': 'center', 'justifyContent': 'center',
			  'minHeight': '142px'}}>
			  <Spin indicator={antIconLoading} />
			</div>
		  );
		} else {
		  return (
			<FormItem>
			  <Button type="primary" htmlType="submit" className="login-form-button">
				SEND REQUEST
			  </Button>
			  <p style={{'color':'#cc6666',
				'fontSize': '14px', 'marginTop': '15px'}}>{this.state.error}</p>
			  <div style={{'display': 'flex', 'justifyContent': 'center'}}>
				<Link className="forgot-form-login" to="/login">Log in Here</Link>
			  </div>
			</FormItem>
		  );
		}
	}

	return (
		<div 
				style={{
					height: 'calc(100vh - 64px)', 
					width: '100%', 
					background: '#fff',
					minHeight: '500px', 
					display: 'flex',
					alignItems: 'center', 
					justifyContent: 'center'
				}}
		>
			<div 
					className="card" 
					style={{
						padding: '20px', 
						background: 'white',
						borderRadius: '2px', 
						textAlign: 'center', 
						minWidth: '340px',
						boxShadow: 'none',
					}}
			>
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
			<Form onSubmit={this.handleSubmit} className="login-form">
				<FormItem className="signup-form-item">
				{getFieldDecorator('email', {
					rules: [{
					type: 'email', message: 'Please input a valid E-mail!',
					}, {
					required: true, message: 'Please input your E-mail!',
					}],
				})(
					<Input prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Account Email Address"/>
				)}
				</FormItem>
				{getForgotPassButtonDiv()}
			</Form>
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

export default Form.create()(withRouter(ForgotPasswordImpl));

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
};

const headerColor = {
    color: '#595959',
    fontSize: '16px'
};