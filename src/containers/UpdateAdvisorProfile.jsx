import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Input, Button, Form, Icon, Popover, Row, Col, Avatar, Radio, Checkbox, message} from 'antd';
import {Utils} from '../utils';
import {primaryColor} from '../constants';

const {TextArea} = Input;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const {aimsquantToken, requestUrl} = require('../localConfig');

class UpdateAdvisorProfileImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            picUrl: '',
            isCompany: false,
            isSebiRegistered: false,
            linkedInUserId: ''
        };
    }

    renderPopoverContent = name => {
        return (
            <div>
                <h4>Connect {name}</h4>
                <Row style={{marginTop: 20}}>
                    <Col span={4} offset={16}>
                        <Button type="primary" onClick={this.authenticateLN}>yes</Button>
                    </Col>
                </Row>
            </div>
        );
    }

    componentDidMount() {
        // console.log(this.props.advisor);
        if (!Utils.isLoggedIn()){
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            const {advisor} = this.props;
            let value = 1;
            const {
                webUrl = '', 
                linkedIn = '', 
                phone = '', 
                isCompany = false, 
                companyName = '', 
                companyRegistrationNum = '', 
                facebook = '', 
                twitter = '', 
                isSebiRegistered = false,
                sebiRegistrationNum = ''
            } = _.get(advisor, 'profile', {});
            const {
                firstName = '',
                lastName = ''
            } = _.get(advisor, 'user', {});
            const {
                line1 = '', 
                line2 = '', 
                line3 = '', 
                city = '', 
                country = '', 
                pincode = '', 
                state = ''
            } = _.get(advisor, 'profile.address', {});
            // url, photoUrl, userId
            this.setState({isCompany, isSebiRegistered});
            this.props.form.setFieldsValue({
                webUrl,
                line1,
                line2,
                line3,
                city,
                state,
                pincode,
                phone,
                linkedIn: _.get(linkedIn, 'url', ''),
                companyName,
                facebook: _.get(facebook, 'url', ''),
                twitter:  _.get(twitter, 'url', ''),
                companyRegistrationNum,
                sebiRegistrationNum,
                firstName, 
                lastName
            });
        }
    }

    callback = () => {
        window.IN.API.Profile("me").result(this.resultCallback);
    }

    authenticateLN = () => {
        if (!window.IN.User.isAuthorized()) {
            window.IN.User.authorize(this.callback, '');
        } else {
            window.IN.API.Profile("me")
            .fields("picture-url", "public-profile-url")
            .result(this.resultCallback);
        }
    }

    resultCallback = response => {
        // console.log(response);
        this.props.form.setFieldsValue({linkedIn: response.values[0].publicProfileUrl});
        // console.log(response);
        this.setState({picUrl: response.values[0].pictureUrl})
    }

    updateUserProfile = () => {
        const url = `${requestUrl}/advisor/${this.props.advisorId}/profile`;
        // console.log('Data', this.processData());
        axios({
            method: 'PUT',
            url,
            headers: Utils.getAuthTokenHeader(),
            data: this.processData()
        })
        .then(response => {
            message.success('Successfully updated profile');
            if (this.props.getAdvisorSummary) {
                this.props.getAdvisorSummary();
            }
            this.props.toggleModal();
        })
        .catch(error => {
            message.error('Error occured while updating profile');
            // console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    }

    processData = () => {
        const values = this.props.form.getFieldsValue();
        const data = {
            webUrl: values.webUrl,
            address: {
                line1: values.line1,
                line2: values.line2,
                line3: values.line3,
                city: values.city,
                state: values.state,
                pincode: Number(values.pincode),
                country: "IN"
            },
            isCompany: this.state.isCompany,
            isSebiRegistered: this.state.isSebiRegistered,
            sebiRegistrationNum:  values.sebiRegistrationNum,
            companyRegistrationNum: values.companyRegistrationNum,
            phone: values.phone,
            linkedIn: {
                url: values.linkedIn,
                photoUrl: _.get(this.state, 'picUrl', ''),
                id: ''
            },
            companyName: values.companyName,
            facebook: {
                url: values.facebook,
                photoUrl: '',
                id: ''
            },
            twitter: {
                url: values.twitter,
                photoUrl: '',
                id: ''
            }
        };

        return data;
    }

    renderRadioGroup = () => {
        return (
            <RadioGroup value={this.state.isCompany} onChange={this.handleRadioChange}>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
            </RadioGroup>
        );
    }

    renderSebiRegisteredGroup = () => {
        return (
            <RadioGroup value={this.state.isSebiRegistered} onChange={this.handleSebiRadioChange}>
                <Radio value={true}>Yes</Radio>
                <Radio value={false}>No</Radio>
            </RadioGroup>
        );
    }

    handleRadioChange = (e) => {
        this.setState({isCompany: e.target.value});
    }

    handleSebiRadioChange = e => {
        this.setState({isSebiRegistered: e.target.value});
    }

    handleIsRegisteredChange = (e) => {
        this.setState({isSebiRegistered: e.target.checked});
    }

    renderInput = (name, label, disabled = false) => {
        const {getFieldDecorator} = this.props.form;

        return (
            <FormItem>
                {getFieldDecorator(name)(
                    <Input 
                        type="text" 
                        disabled={disabled}
                        addonBefore={<h3 style={{fontSize: '12px', color: primaryColor}}>{label}</h3>}
                    />
                )}
            </FormItem>
        );
    }

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <Form onSubmit={this.handleSubmit}>
                <Row type="flex" justify="start">
                    <Col span={11}>
                        {this.renderInput('firstName', 'First Name', true)}
                    </Col>
                    <Col span={10} style={{marginLeft: '10px'}}>
                        {this.renderInput('lastName', 'Last Name', true)}
                    </Col>
                </Row>
                <Row style={{height: '45px'}} type="flex" align="middle">
                    <Col span={11}>
                        <h3 style={{display: 'inline-block', marginRight: '20px', fontSize: '14px'}}>Are you a company ?</h3>
                        {this.renderRadioGroup()}
                    </Col>
                    <Col span={11} style={{marginLeft: '10px', display: this.state.isCompany ? 'block' : 'none'}}>
                        {this.renderInput('companyRegistrationNum', 'Company Registration Number')}
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        {this.renderInput('companyName', 'Company Name')}
                    </Col>
                    <Col span={11} style={{marginLeft: '10px'}}>
                        {this.renderInput('webUrl', 'Web Url')}
                    </Col>
                </Row>
                <Row style={{height: '45px'}} type="flex" align="middle">
                    <Col span={11}>
                        <h3 style={{display: 'inline-block', marginRight: '20px', fontSize: '14px'}}>Are you SEBI registered ?</h3>
                        {this.renderSebiRegisteredGroup()}
                    </Col>
                    <Col span={11} style={{marginLeft: '10px', display: this.state.isSebiRegistered ? 'block' : 'none'}}>
                        {this.renderInput('sebiRegistrationNum', 'Sebi Registration Number')}
                    </Col>
                </Row>
                <h3>Address</h3>
                <Row>
                    <Col span={11}>
                        {this.renderInput('line1', 'Line 1')}
                    </Col>
                    <Col span={11} style={{marginLeft: '10px'}}>
                        {this.renderInput('line2', 'Line 2')}
                    </Col>
                </Row>
                <Row>
                    <Col span={7}>
                        {this.renderInput('city', 'City')}
                    </Col>
                    <Col span={7} style={{marginLeft: '10px'}}>
                        {this.renderInput('state', 'State')}
                    </Col>
                    <Col span={7} style={{marginLeft: '10px'}}>
                        {this.renderInput('pincode', 'Pincode')}
                    </Col>
                </Row>
                <h3>Others</h3>
                <Row>
                    <Col span={11}>
                        {this.renderInput('phone', 'Phone')}
                    </Col>
                </Row>
                <Row>
                    <Col span={11}>
                        <FormItem>
                            {getFieldDecorator('linkedIn')(
                                    <Input placeholder="LinkedIn Public Profile Url" addonBefore={
                                        <Icon type="linkedin" onClick={this.authenticateLN} />
                                    } />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={11} style={{marginLeft: '10px'}}>
                        <FormItem>
                            {getFieldDecorator('twitter')(
                                <Input placeholder="Twitter Public Profile Url" addonBefore={
                                    <Icon type="twitter" onClick={this.handleIconClick}/>
                                } />
                            )}
                        </FormItem>
                    </Col>
                    <Col span={11}>
                        <FormItem>
                            {getFieldDecorator('facebook')(
                                <Input placeholder="Facebook Public Profile Url" addonBefore={
                                    <Icon type="facebook" onClick={this.handleIconClick}/>
                                } />
                            )}
                        </FormItem>
                    </Col>
                </Row>                
                <FormItem>
                    <Row type="flex" justify="end" style={{marginTop: '20px'}}>
                        <Col span={4} style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button type="primary" htmlType="submit" onClick={this.updateUserProfile}>Update</Button>
                        </Col>
                    </Row>
                </FormItem>
            </Form>
        );
    }
}

export const UpdateAdvisorProfile = Form.create()(withRouter(UpdateAdvisorProfileImpl));
