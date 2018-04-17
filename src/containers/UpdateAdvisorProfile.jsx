import * as React from 'react';
import axios from 'axios';
import {Input, Button, Form, Icon, Popover, Row, Col, Avatar, Radio, Checkbox} from 'antd';
import {Utils} from '../utils';

const {TextArea} = Input;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

const {aimsquantToken, requestUrl} = require('../localConfig');

class UpdateAdvisorProfileImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            picUrl: '',
            value: 1,
            isRegistered: false
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
        console.log(this.props.advisor);
        if (!Utils.isLoggedIn()){
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            const {advisor} = this.props;
            let value = 1;
            const {webUrl, linkedIn, phone, isCompany, companyName, registrationNumber, facebook, twitter, isRegistered} = advisor.profile;
            const {line1, line2, line3, city, country, pincode, state} = advisor.profile.address;
            if (!isCompany) {
                value = 2;
            }
            // url, photoUrl, userId
            this.setState({value, isRegistered});

            this.props.form.setFieldsValue({
                webUrl,
                line1,
                line2,
                line3,
                city,
                state,
                pincode,
                phone,
                linkedIn,
                companyName,
                registrationNumber,
                facebook,
                twitter
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
        console.log(response);
        this.props.form.setFieldsValue({linkedIn: response.values[0].publicProfileUrl});
        this.setState({picUrl: response.values[0].pictureUrl})
    }

    updateUserProfile = () => {
        const url = `${requestUrl}/advisor/${this.props.advisorId}/profile`;
        axios({
            method: 'PUT',
            url,
            headers: {'aimsquant-token': aimsquantToken},
            data: this.processData()
        })
        .then(response => {
            this.props.toggleModal();
        })
        .catch(error => {
            console.log(error);
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
            isCompany: this.state.value === 1 ? true: false,
            isRegistered: this.state.isRegistered,
            registrationNumber:  values.registrationNumber,
            phone: values.phone,
            linkedIn: values.linkedIn,
            companyName: values.companyName,
            facebook: values.facebook,
            twitter: values.twitter
        };

        return data;
    }

    renderRadioGroup = () => {
        return (
            <RadioGroup value={this.state.value} onChange={this.handleRadioChange}>
                <Radio value={1}>Is Company</Radio>
                <Radio value={2}>Is Individual</Radio>
            </RadioGroup>
        );
    }

    handleRadioChange = (e) => {
        this.setState({value: e.target.value});
    }

    handleIsRegisteredChange = (e) => {
        this.setState({isRegistered: e.target.checked});
    }

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <Form onSubmit={this.handleSubmit}>
                <Row>
                    <Col span={24}>
                        {this.renderRadioGroup()}
                    </Col>
                </Row>
                <Row>
                    <Col span={24}>
                        <Checkbox
                                onChange={this.handleIsRegisteredChange}
                                checked={this.state.isRegistered}
                        >
                            Is Registered
                        </Checkbox>
                    </Col>
                </Row>
                <FormItem>
                    {getFieldDecorator('registrationNumber')(
                            <Input 
                                    type="number" 
                                    placeholder="Registration Number" 
                                    disabled={!this.state.isRegistered}
                            />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('companyName')(<Input placeholder="Company Name" />)}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('webUrl')(<Input placeholder="Web Url" />)}
                </FormItem>
                <h3>Address</h3>
                <FormItem>
                    {getFieldDecorator('line1')(<Input  placeholder="Line 1" />)}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('line2')(<Input  placeholder="Line 2" />)}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('line3')(<Input  placeholder="Line 3" />)}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('city')(<Input  placeholder="City" />)}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('state')(<Input  placeholder="State" />)}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('pincode')(<Input  placeholder="Pincode" />)}
                </FormItem>
                <h3>Others</h3>
                <FormItem>
                    {getFieldDecorator('phone')(<Input type="number"  placeholder="Phone" />)}
                </FormItem>
                <FormItem>
                    <Row>
                        <Col span={2}>
                            <Avatar
                                    size="large" icon="user"
                                    src={this.state.picUrl}
                            />
                        </Col>
                    </Row>
                    {getFieldDecorator('linkedIn')(
                            <Input placeholder="LinkedIn Public Profile Url" addonBefore={
                                    <Popover content={this.renderPopoverContent("LinkedIn")} title="Yo">
                                        <Icon type="linkedin" onClick={this.handleIconClick}/>
                                    </Popover>
                            } />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('twitter')(
                        <Input placeholder="Twitter Public Profile Url" addonBefore={
                            <Popover content={this.renderPopoverContent("Twitter")} title="Yo">
                                <Icon type="twitter" onClick={this.handleIconClick}/>
                            </Popover>
                        } />
                    )}
                </FormItem>
                <FormItem>
                    {getFieldDecorator('facebook')(
                        <Input placeholder="Facebook Public Profile Url" addonBefore={
                            <Popover content={this.renderPopoverContent("Facebook")} title="Yo">
                                <Icon type="facebook" onClick={this.handleIconClick}/>
                            </Popover>
                        } />
                    )}
                </FormItem>
                <FormItem>
                    <Row>
                        <Col span={4} offset={20}>
                            <Button type="primary" htmlType="submit" onClick={this.updateUserProfile}>Update</Button>
                        </Col>
                    </Row>
                </FormItem>
            </Form>
        );
    }
}

export const UpdateAdvisorProfile = Form.create()(UpdateAdvisorProfileImpl);
