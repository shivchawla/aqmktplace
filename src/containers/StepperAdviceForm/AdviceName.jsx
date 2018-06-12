import * as React from 'react';
import {Row, Col, Form, Input} from 'antd';
import {horizontalBox, inputHeaderStyle} from '../../constants';
import {getStepIndex} from './steps';

const FormItem = Form.Item;

export class AdviceName extends React.Component {
    render() {
        const {getFieldDecorator} = this.props.form;
        const adviceNameStep = getStepIndex('adviceName');
        
        return (
            <Row style={{display: this.props.step === adviceNameStep ? 'block': 'none'}}>
                <Col span={24} style={horizontalBox}>
                    <h3 style={inputHeaderStyle}>
                        Advice Name
                    </h3>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('adviceName', {
                            rules: [{required: true, message: 'Please enter Advice Name'}]
                        })(
                            <Input />
                        )}
                    </FormItem>
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    <h3>Name of your advice. Please provide a valid name for your Advice</h3>
                </Col>
            </Row>
        );
    }
}