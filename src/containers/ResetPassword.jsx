import React, { Component } from 'react';
import {Utils} from '../utils';
import { Spin, Form, Icon, Input, Button, Checkbox } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import axios from 'axios';
import logo from "../assets/logo-advq-new.png";
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
      const queryParams = new URLSearchParams(this.props.location.search);
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
              this.props.history.push('/login');
            //   if (response.data.token){
            //     if (values.remember){
            //       Utils.localStorageSaveObject(Utils.userInfoString, response.data);
            //     }
            //     Utils.setLoggedInUserInfo(response.data);
            //     Utils.localStorageSave('selectedPage', 1);
            //     const redirectUrl = Utils.getRedirectAfterLoginUrl();
            //     if (redirectUrl){
            //       this.props.history.push(redirectUrl);
            //     }else{
            //       this.props.history.push('/advice');
            //     }
            //   } else{
            //     this.updateState({
            //       'loading': false,
            //       'error': "Unexpected error occured! Pleas try again."
            //     });
            //   }
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
    }
    // }else{
    //     const queryParams = new URLSearchParams(this.props.location.search);
    //     console.log(queryParams.get('resetcode'));
    // }
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
            <Button type="primary" htmlType="submit" className="login-form-button" style={{marginTop: '20px'}}>
              Send Request
            </Button>
            <Link to="/login">Login here</Link>
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
            Expert-Sourced Investment Portfolio
          </p>
          <Form onSubmit={this.handleSubmit} className="login-form">
            <FormItem>
              {getFieldDecorator('password', {
                rules: [{ required: true, message: 'Please input your new password!' }],
              })(
                <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Password" />
              )}
            </FormItem>
            <FormItem>
              {getFieldDecorator('confirmPassword', {
                rules: [{ required: true, message: 'Please confirm your new Password!' }],
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
}

export default Form.create()(withRouter(ResetPassword));
