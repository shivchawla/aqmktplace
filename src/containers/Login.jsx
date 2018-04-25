import React, { Component } from 'react';
import {Utils} from '../utils';
import { Spin, Form, Icon, Input, Button, Checkbox } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import axios from 'axios';

const {requestUrl} = require('../localConfig');

class Login extends Component {

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
                if (values.remember){
                  Utils.localStorageSaveObject(Utils.userInfoString, response.data);
                }
                Utils.setLoggedInUserInfo(response.data);
                const redirectUrl = Utils.getRedirectAfterLoginUrl();
                if (redirectUrl){
                  this.props.history.push(redirectUrl);
                }else{
                  this.props.history.push('/home');
                }
              }else{
                this.updateState({
                  'loading': false,
                  'error': "Unexpected error occured! Pleas try again."
                });
              }
          })
          .catch((error) => {
            this.cancelLoginCall = undefined;
            this.updateState({
              'loading': false,
              'error': error.response.data
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
      this.props.history.push('/investordashboard');
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


  render() {

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
            {getFieldDecorator('remember', {
              valuePropName: 'checked',
              initialValue: true,
            })(
              <Checkbox>Remember me</Checkbox>
            )}
            <Link className="login-form-forgot" to="/forgotPassword">Forgot password</Link>
            <Button type="primary" htmlType="submit" className="login-form-button">
              Log in
            </Button>
            Or <Link to="/signup">register now!</Link>
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
          <img alt="" style={{'height': '60px', 'width': 'auto'}} src='./assets/images/Logo.png' />
          <p style={{'fontSize': '30px', 'fontWeight': '300', 'margin': '0px'}}>
            <span style={{'color': 'teal'}}>Advice</span>
            <span style={{'color': '#cc6666'}}>Qube</span>
          </p>
          <p style={{'color': '#37474F', 'fontStyle': 'italic',
            'fontSize': '15px', 'margin': '0px'}}>
            Invest in your Ideas
          </p>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              {getFieldDecorator('userName', {
                rules: [{ required: true, message: 'Please input your username!' }],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your Password!' }],
              })(
                <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
              )}
            </FormItem>
            {getLoginButtonDiv()}
          </Form>
        </div>
	    </div>
    );
  }
}

export default Form.create()(withRouter(Login));
