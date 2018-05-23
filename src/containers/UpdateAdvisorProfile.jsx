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

    updateUserProfile = e => {
        e.preventDefault();
        const url = `${requestUrl}/advisor/${this.props.advisorId}/profile`;
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if (!this.checkSebiValidation()) {
                    message.error('Please provide your SEBI registration number');
                    return;
                }
                if (!this.checkCompanyValidation()) {
                    message.error('Please provide a Company name and Company registration number');
                    return;
                }
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
                    if (error.response) {
                        Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                    }
                });
            } else {
                // console.log('Error ', err);
            }
        });
    }

    checkSebiValidation = () => {
        if (this.state.isSebiRegistered) {
            return this.props.form.getFieldValue('sebiRegistrationNum').length > 0;
        } 
        return true;
    }

    checkCompanyValidation = () => {
        const companyRegistrationNum = this.props.form.getFieldValue('companyRegistrationNum') || '';
        const companyName = this.props.form.getFieldValue('companyName') || '';
        // console.log(companyRegistrationNum);
        // console.log(companyName);
        if (this.state.isCompany) {
            return companyRegistrationNum.length > 0 && companyName.length > 0;
        }
        return true;
    }

    processData = () => {
        const values = this.props.form.getFieldsValue();
        const data = {
            webUrl: values.webUrl,
            // address: {
            //     line1: values.line1,
            //     line2: values.line2,
            //     line3: values.line3,
            //     city: values.city,
            //     state: values.state,
            //     pincode: Number(values.pincode),
            //     country: "IN"
            // },
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

    renderInput = (name, label, required = false, disabled = false) => {
        const {getFieldDecorator} = this.props.form;

        return (
            <FormItem>
                {getFieldDecorator(name, {
                    rules: [{ required, message: 'This is a required field' }],
                })(
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
            <Form onSubmit={this.updateUserProfile} style={{height: '520px'}}>
                <Row type="flex" justify="start" style={{...sectionContainerStyle, marginTop: '0px'}}>
                    <Col span={24}>
                        <h3 style={sectionHeaderStyle}>Personal Details</h3>
                    </Col>
                    <Col span={11}>
                        {this.renderInput('firstName', 'First Name', false, true)}
                    </Col>
                    <Col span={11} style={{marginLeft: '10px'}}>
                        {this.renderInput('lastName', 'Last Name', false, true)}
                    </Col>
                </Row>

                <Row style={{marginTop: '10px'}} type="flex" align="middle">
                    <Col span={11}>
                        <h3 style={{display: 'inline-block', marginRight: '20px', fontSize: '14px'}}>Are you a company ?</h3>
                        {this.renderRadioGroup()}
                    </Col>
                </Row>

                {this.state.isCompany &&
                    <Row style={sectionContainerStyle}>
                        <Col span={24}>
                            <h3 style={sectionHeaderStyle}>Company Details</h3>
                        </Col>
                        <Col span={24}>
                            <Row style={{display: this.state.isCompany ? 'block' : 'none'}} gutter={8}>
                                <Col span={12}>
                                    {this.renderInput('companyName', 'Company Name')}
                                </Col>
                                <Col span={12}>
                                    {this.renderInput('companyRegistrationNum', 'Company Reg. #')}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                }
                <Row style={{height: '45px'}} type="flex" align="middle" gutter={16}>
                    <Col span={12}>
                        <h3 style={{display: 'inline-block', fontSize: '14px', marginRight:'10px'}}>
                            Are you a SEBI Registered Investment Advisor?
                        </h3>
                        {this.renderSebiRegisteredGroup()}
                    </Col>
                    <Col span={12} 
                        style={{display: this.state.isSebiRegistered ? 'block' : 'none'}}>
                        {this.renderInput('sebiRegistrationNum', 'Sebi Reg. #')}
                    </Col>
                </Row>

                {/*<Row style={sectionContainerStyle}>
                    <Col span={24}>
                        <h3 style={sectionHeaderStyle}>Address</h3>
                    </Col>
                    <Col span={24}>
                        <Row>
                            <Col span={11}>
                                {this.renderInput('line1', 'Line 1')}
                            </Col>
                            <Col span={11} style={{marginLeft: '10px'}}>
                                {this.renderInput('line2', 'Line 2')}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                {this.renderInput('city', 'City')}
                            </Col>
                            <Col span={11} style={{marginLeft: '10px'}}>
                                {this.renderInput('state', 'State')}
                            </Col>
                        </Row>
                        <Row>
                            <Col span={11}>
                                {this.renderInput('pincode', 'Pincode')}
                            </Col>
                            <Col span={11} style={{marginLeft: '10px'}}>
                                {this.renderInput('phone', 'Phone')}
                            </Col>
                        </Row>
                    </Col>
                </Row>
                */}

                <Row style={sectionContainerStyle}>
                    <Col span={24}>
                        <h3 style={sectionHeaderStyle}>Social</h3>
                    </Col>
                    <Col span={24}>
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
                            <Col span={11} style={{marginLeft: '10px'}}>
                                <FormItem>
                                    {getFieldDecorator('webUrl')(
                                        <Input placeholder="Web Url" addonBefore={
                                            <Icon type="global" onClick={this.handleIconClick}/>
                                        } />
                                    )}
                                </FormItem>
                            </Col>
                        </Row>       
                    </Col>
                </Row>
                <Row type="flex" justify="end" align="bottom" style={{marginTop: '10px'}}>
                    <Col span={4} style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Button type="primary" htmlType="submit">Update</Button>
                    </Col>
                </Row>
            </Form>
        );
    }
}

export const UpdateAdvisorProfile = Form.create()(withRouter(UpdateAdvisorProfileImpl));

const sectionContainerStyle = {
    padding: '10px', 
    marginTop: '10px', 
    border: '1px solid #eaeaea',
    borderRadius: '4px',
    transition: 'all 0.4s ease-in-out'
};

const sectionHeaderStyle = {
    fontSize: '14px',
    color: '#323C5A',
    fontWeight: 700,
    marginBottom: '10px'
}