import * as React from 'react';
import {Row, Col, Form, Input} from 'antd';
import {getStepIndex} from './steps';
import {getOthersWarning} from './utils';
import {stepHeaderStyle, headerContainerStyle} from './constants';
import {WarningIcon} from '../../components';

const FormItem = Form.Item;

export class AdviceName extends React.Component {
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
                <Col span={24} style={{...headerContainerStyle}}>
                    {/*<h3 style={stepHeaderStyle}>
                        Step {adviceNameStep + 1}: Advice Name
                    </h3>*/}
                    {
                        this.props.isUpdate &&
                        this.props.isPublic &&
                        !getOthersWarning(this.props.approvalStatusData, 'name').valid &&
                        <WarningIcon reason={getOthersWarning(this.props.approvalStatusData, 'name').reason} />
                    }
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('adviceName', {
                            rules: [{required: true, message: 'Please enter Advice Name'}]
                        })(
                            <Input 
                                    placeholder='Type Advice Name' 
                                    style={{fontSize: '18px', height: '60px', marginTop: '20px'}}
                                    disabled={this.props.disabled}
                            />
                        )}
                    </FormItem>
                </Col>
            </Row>
        );
    }
}