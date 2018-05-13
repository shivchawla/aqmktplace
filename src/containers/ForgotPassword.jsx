import React, { Component } from 'react';
import Utils from '../utils';
import {requestUrl} from '../localConfig';
import { Spin, Form, Icon, Input, Button } from 'antd';
import {Link, withRouter} from 'react-router-dom';
import axios from 'axios';
import logo from "../assets/logo-advq-new.png";

class ForgotPasswordImpl extends Component {

  _mounted = false;
  cancelForgotPasswordCall = undefined;

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


  render() {

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
      }else{
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
	    <div style={{'height': 'calc(100vh - 64px)', 'width': '100%', 'background': '#fafafaf',
        'minHeight': '500px', 'display': 'flex', 'alignItems': 'center', 'justifyContent': 'center'}}>
        <div className="card" style={{'padding': '20px', 'background': 'white',
          'borderRadius': '2px', 'textAlign': 'center', 'minWidth': '340px'}}>
          <img alt="" style={{'height': '60px', 'width': 'auto'}} src={logo}/>
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
            <FormItem className="signup-form-item">
              {getFieldDecorator('email', {
                rules: [{
                  type: 'email', message: 'The input is not valid E-mail!',
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
}

export const ForgotPassword =  Form.create()(withRouter(ForgotPasswordImpl));
