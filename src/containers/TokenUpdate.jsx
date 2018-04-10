import React, { Component } from 'react';
import {Utils} from '../utils';
import {Spin, Icon} from 'antd';
import {withRouter} from 'react-router-dom';
import axios from 'axios';

const {requestUrl} = require('../localConfig');


class TokenUpdateImpl extends Component {

  redirectUrl = '/';

  constructor(props){
  	super();
  	this.state = {
  	};
    if(props.location.search){
      const queryParams = new URLSearchParams(props.location.search);
      if (queryParams && queryParams.get('redirectUrl')){
        this.redirectUrl = decodeURIComponent(queryParams.get('redirectUrl'));
        if (!this.redirectUrl){
          this.redirectUrl = '/';
        }
      }
    } 
    this.updateToken = () => {
      axios({
              method: 'PUT',
              url: requestUrl + '/user/updateToken',
              data: {
                "email": Utils.getLoggedInUserEmail(),
                "token": Utils.getAuthToken()
              }
            })
          .then((response) => {
              Utils.setShouldUpdateToken(false);
              console.log(Utils.getShouldUpdateToken());
              if(response.data && response.data.token){
                Utils.updateUserToken(response.data.token);
                if (this.redirectUrl){
                  this.props.history.push(this.redirectUrl);
                }else{
                  this.props.history.push('/research');
                }
              }else{
                Utils.logoutUser();
                this.props.history.push('/login');
              }
          })
          .catch((error) => {
             Utils.setShouldUpdateToken(false);
             Utils.logoutUser();
             this.props.history.push('/login');
          });
    }
  }

  componentDidMount(){
    this._mounted = true;
    // console.log(Utils.getShouldUpdateToken());
    if (Utils.getShouldUpdateToken() === 'true' ||
      Utils.getShouldUpdateToken() === true){
      this.updateToken();
    }else{
      this.props.history.push('/');
    }
  }

  componentWillUnMount(){
    this._mounted = false;
  }


  render() {
    const antIconLoading = <Icon type="loading" style={{ fontSize: 34 }} spin />;
    return (
	    <div style={{'display': 'flex',
        'alignItems': 'center', 'justifyContent': 'center',
        'minHeight': '142px', 'backgroundColor': 'white'}}>
        <Spin indicator={antIconLoading} />
      </div>
    );
  }
}

export const TokenUpdate = withRouter(TokenUpdateImpl);
