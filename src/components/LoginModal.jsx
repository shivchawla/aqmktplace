import * as React from 'react';
import axios from 'axios';
import {Modal, Input, Row, Col, Button} from 'antd';
import {Utils} from '../utils';
const {requestUrl} = require('../localConfig');

export class LoginModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
            password: ''
        };
    }

    handleChange = e => {
        this.setState({
            [e.target.id]: e.target.value
        });
    }

    componentWillMount() {
        
    }

    handleLogin = () => {
        const {email, password} = this.state;
        axios({
            method: 'POST',
            url: `${requestUrl}/user/login`,
            data: {...this.state}
        })
        .then(response => {
            Utils.localStorageSaveObject(Utils.userInfoString, response.data);
            Utils.setLoggedInUserInfo(response.data);
            const redirectUrl = Utils.getRedirectAfterLoginUrl();
            if (redirectUrl){
                this.props.history.push(redirectUrl);
              }else{
                this.props.history.push('/');
              }
        })
        .catch(err => {
            console.log(err);
        });
    }

    render() {
        return (
            <Row>
                <Col span={24}>
                    <Input id="email" type="text" onChange={this.handleChange} placeholder="username"/>
                </Col>
                <Col span={24}>
                    <Input id="password" type="password" onChange={this.handleChange} placeholder="password"/>
                </Col>
                <Col span={24}>
                    <Button onClick={this.handleLogin}>Login</Button>
                </Col>
            </Row>
        );
    }
}