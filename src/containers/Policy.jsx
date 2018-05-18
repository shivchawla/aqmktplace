import React, { Component } from 'react';
import ReactQuill from 'react-quill';
import {Utils} from '../utils';
import { Spin, Icon } from 'antd';
import axios from 'axios';
import { withRouter } from 'react-router-dom';
import Loading from 'react-loading-bar'
import {Footer} from '../components';
import 'react-loading-bar/dist/index.css'
import 'react-quill/dist/quill.snow.css';
import '../css/quillContainer.css';

const {requestUrl} = require('../localConfig');

class Policy extends Component {

  _mounted = false;
  cancelGetPolicy = undefined;

  constructor(props){
  	super();
  	this.state = {
      'privacyPolicy': undefined,
      'loading': true
  	};
    this.updateState = (data) => {
      if (this._mounted){
        this.setState(data);
      }
    }
    this.getPolicy = () =>{
      axios(Utils.getPolicyTxtUrl(), {
        cancelToken: new axios.CancelToken( (c) => {
          // An executor function receives a cancel function as a parameter
          this.cancelGetPolicy = c;
        })
      })
        .then((response) => {
            this.updateState({
              'privacyPolicy': response.data,
              'loading': false
            });
            this.cancelGetPolicy = undefined;
          })
          .catch((error) => {
            this.updateState({
              'privacyPolicy': error,
              'loading': false
            });
            this.cancelGetPolicy = undefined;
          });
    }
  }

  componentDidMount(){
    this._mounted = true;
    this.getPolicy();
  }

  componentWillUnmount() {
    this._mounted = false;
    if (this.cancelGetPolicy){
      this.cancelGetPolicy();
    }
  }

  render() {

    const antIconLoading = <Icon type="loading" style={{ fontSize: 34 }} spin />;

    const getPolicyDiv = () => {
      const modules = {
        toolbar: false
      };
      if (this.state.loading){
        return (
          <div style={{'display': 'flex',
            'alignItems': 'center', 'justifyContent': 'center',
            'minHeight': '300px'}}>
            <Spin indicator={antIconLoading} />
          </div>
        );
      }else if (this.state.privacyPolicy){
        return (
          // <div dangerouslySetInnerHTML={{__html: this.state.privacyPolicy}}></div>
          <ReactQuill style={{fontSize: '16px', border: 'none', fontFamily:'Lato, sans-serif'}} value={this.state.privacyPolicy} toolbar={false} modules={modules} readOnly/>
        );
      }else{
        return (
          <div></div>
        );
      }
    }

    const getTotalDiv = () => {
      if (!this.state.loading){
        return (
          <div className="policy-div" style={{'padding': '1% 3% 1% 3%', 'width': '100%', 'minHeight': 'calc(100vh - 70px)'}}>
            <div style={{'display': 'flex', 'marginBottom': '10px'}}>
              <h2 style={{'color': '#3c3c3c', 'fontWeight': 'normal'}}>Privacy Policy</h2>
            </div>
            <div className="card" style={{'width': '100%', 'background': 'white',
              'padding': '40px 5% 40px 5%'}}>
              {getPolicyDiv()}
            </div>
          </div>
        );
      }
    }

    return (
      <React.Fragment>
        <div className="main-loader">
          <Loading
            show={this.state.loading}
            color="teal"
            showSpinner={false}
          />
        </div>
        {getTotalDiv()}
        {
          !this.state.loading &&
          <Footer />
        }
      </React.Fragment>
    );
  }
}


export default withRouter(Policy);
