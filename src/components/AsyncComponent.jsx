import React, { Component } from "react";
import Loading from 'react-loading-bar';
import {Spin, Col} from 'antd';
import {loadingColor} from '../constants';

export default function asyncComponent(importComponent) {
    class AsyncComponent extends Component {
      constructor(props) {
        super(props);
  
        this.state = {
          component: null
        };
      }
  
      async componentDidMount() {
        const { default: component } = await importComponent();
        
        this.setState({
          component: component
        });
      }

      getLoadingComponent = () => {
        console.log('Loading');
        return (
          <Col span={24} className='loader'>
            <Spin spinning={true} style={{marginTop: '100px'}}>Loading</Spin>
          </Col>
        );
      }
  
      render() {
        const C = this.state.component;
        console.log(C);
  
        return C ? <C {...this.props} /> : this.getLoadingComponent();
      }
    }
  
    return AsyncComponent;
}