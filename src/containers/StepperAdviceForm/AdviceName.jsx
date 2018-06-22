import * as React from 'react';
import {Row, Col, Form, Input} from 'antd';
import {getStepIndex} from './steps';
import {getOthersWarning} from './utils';
import {inputStyle} from './style/adviceName';
import {WarningIcon} from '../../components';

const FormItem = Form.Item;

const labelStyle = {
    fontWeight: 300, 
    color: '#000000',
    fontSize: '17px'
};

export class AdviceName extends React.Component {
    showWarning = () => {
        return (
            this.props.isUpdate &&
            this.props.isPublic &&
            !getOthersWarning(this.props.approvalStatusData, 'name').valid &&
            this.props.isPublic &&
            <WarningIcon 
                reason={getOthersWarning(this.props.approvalStatusData, 'name').reason} 
                style={{marginRight: '10px'}}
            />
        );
    }

    shouldComponentUpdate(nextProps) {
        const {getFieldDecorator} = this.props.form;
        const adviceNameStep = 2; //getStepIndex('adviceName');
        if (nextProps.step === adviceNameStep) {
            return true;
        }

        return false;
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        console.log('Rendering Advice Name');
        
        return (
            <Row type="flex" align="middle"> 
                <Col span={6} style={labelStyle}>
                    Advice Name:
                </Col>
                <Col span={16}>
                    <FormItem>
                        {getFieldDecorator('adviceName', {
                            rules: [{required: true, message: 'Please enter Advice Name'}]
                        })(
                            <Input
                                    placeholder='Type Advice Name' 
                                    style={inputStyle}
                                    disabled={this.props.disabled}
                            />
                        )}
                    </FormItem>
                </Col>
            </Row>
        );
    }
}
