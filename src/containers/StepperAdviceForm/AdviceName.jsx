import * as React from 'react';
import {Row, Col, Form, Input} from 'antd';
import {getStepIndex} from './steps';
import {getOthersWarning} from './utils';
import {inputStyle} from './style/adviceName';
import {WarningIcon} from '../../components';

const FormItem = Form.Item;

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

    render() {
        const {getFieldDecorator} = this.props.form;
        const adviceNameStep = getStepIndex('adviceName');
        
        return (
            <Row 
                    style={{
                        display: this.props.step === adviceNameStep ? 'flex': 'none',
                        flexDirection: 'column',
                    }}
            >
                <Col span={24}>
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
