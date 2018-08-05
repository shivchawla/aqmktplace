import React, { Component } from 'react';
import {Button} from 'antd';
import {withRouter, Link} from 'react-router-dom';
const URLSearchParamsPoly = require('url-search-params');

class AuthMessageImpl extends Component {

  params = {};

  constructor(props){
  	super();
  	this.state = {

  	};
    if(props.location.search){
      this.params = new URLSearchParamsPoly(props.location.search);
    } 
  }

  componentDidMount(){
  	if (this.props.pageChange){
  		this.props.pageChange('authMessage');
  	}
  }

  render() {

    const getBody = () =>{
      if (this.params.get('mode') === 'activationPending'){
        return (
          <React.Fragment>
            <h2 style={{'fontSize': '24px', 'color': 'teal'}}>
              You are just one step away from finding great investment ideas!!
            </h2>
            <p style={{'fontSize': '18px', 'marginTop': '20px'}}>We've sent an email to
              <span style={{'fontWeight': '700'}}> {this.params.get('email')}</span>.
            </p>
            <p style={{'fontSize': '18px', 'marginTop': '10px'}}>
              Please follow the instructions in the email to activate your account.
              If you can't find the activation email check your spam folder
            </p>
            <Link to='/login'>
              <Button type="primary" style={{'marginTop': '20px'}}>GO BACK</Button>
            </Link>
          </React.Fragment>
        );
      } else if (this.params.get('mode') === 'activationComplete') {
          return (
            <React.Fragment>
              <h2 style={{'fontSize': '24px', 'color': 'teal'}}>
                You have successfully activated your account!!
              </h2>
              <Button type="primary" onClick={() => this.props.history.push('/login')} style={{'marginTop': '20px'}}>LOGIN</Button>
            </React.Fragment>
          );
      } 
      else if (this.params.get('mode') === 'forgotpassword'){
        return (
          <React.Fragment>
            <h2 style={{'fontSize': '24px', 'color': 'teal'}}>
              We are here to help you!!
            </h2>
            <p style={{'fontSize': '18px', 'marginTop': '20px'}}>We've sent an email to
              <span style={{'fontWeight': '700'}}> {this.params.get('email')}</span>.
            </p>
            <p style={{'fontSize': '18px', 'marginTop': '10px'}}>Please follow the instructions in the email to reset your password.</p>
            <Link to='/login'>
              <Button type="primary" style={{'marginTop': '20px'}}>GO BACK</Button>
            </Link>
          </React.Fragment>
        );
      }
      else if (this.params.get('mode') === 'resetPassword'){
        return (
          <React.Fragment>
            <h2 style={{'fontSize': '24px', 'color': 'teal'}}>
              You have successfully updated your password !!
            </h2>
            <Link to='/login'>
              <Button type="primary" style={{'marginTop': '20px'}}>GO BACK</Button>
            </Link>
          </React.Fragment>
        );
      }
      else if (this.params.get('mode') === 'unsubscribe'){
        const emailType = this.params.get('type') == "daily_performance_digest" ?
            "Daily performance emails" : "Weekly performance emails"
        return (
          <React.Fragment>
            <h2 style={{'fontSize': '24px', 'color': 'teal'}}>
              You have successfully unsubscribed from {emailType}!!
            </h2>
            <Link to='/contest'>
              <Button type="primary" style={{'marginTop': '20px'}}>GO BACK</Button>
            </Link>
          </React.Fragment>
        );
      }
    }


    return (
	    <div className="policy-div" style={{'padding': '1% 3% 1% 3%', 'width': '100%', 'minHeight': 'calc(100vh - 70px)'}}>
        <div style={{'width': '100%', 'textAlign': 'center',
          'padding': '40px 5% 40px 5%'}}>
          {getBody()}
        </div>
      </div>
    );
  }
}

export default withRouter(AuthMessageImpl);
