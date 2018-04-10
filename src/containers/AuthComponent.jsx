import * as React from 'react';
import {Utils} from '../utils';
import {message} from 'antd';
import _ from 'lodash';

export class AuthComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoggedIn: false
        }
    }

    componentWillMount() {
        this.setState({isLoggedIn: Utils.isLoggedIn()}, () => {
            if (!this.state.isLoggedIn) {
                this.props.history.push('/login');
            }
        });
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps,this.props.match)) {
            this.setState({isLoggedIn: Utils.isLoggedIn()}, () => {
                if (!this.state.isLoggedIn) {
                    this.props.history.push('/login');
                }
            });
        }
    }

    render() {
        if (this.state.isLoggedIn) {
            return this.props.children;
        } else {
            return null;
        }
    }
}