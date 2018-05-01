import React, { Component } from "react";
import Loading from 'react-loading-bar';
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
        return (
            <Loading
                    show={true}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
            />
        );
      }
  
      render() {
        const C = this.state.component;
  
        return C ? <C {...this.props} /> : this.getLoadingComponent();
      }
    }
  
    return AsyncComponent;
}