import * as React from 'react';
import moment from 'moment';
import {Row, Col, Form, DatePicker, Select} from 'antd';
import {benchmarks} from '../../constants/benchmarks';
import {getStepIndex} from './steps';

const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';
const rebalancingFrequency = [ 'Monthly', 'Daily', 'Weekly', 'Bi-Weekly', 'Quartely'];

export class OtherSettings extends React.Component {
    renderMenu = (fieldName, options, message) => {
        const {getFieldDecorator} = this.props.form;

        return (
            <FormItem>
                {
                    getFieldDecorator(fieldName, {
                        initialValue: options[0],
                        rules: [{required: true, message}]
                    })(
                        <Select style={{width: 150}}>
                            {
                                options.map((item, index) => <Option key={index} value={item}>{item}</Option>)
                            }
                        </Select>
                    )
                }
            </FormItem>
        );
    }

    getDisabledStartDate = current => {
        return current && (current < moment().startOf('day') || [0, 6].indexOf(current.weekday()) !== -1)
    }

    render = () => {
        const {getFieldDecorator} = this.props.form;
        const otherSettingsStep = getStepIndex('otherSettings');

        return (
            <Row
                    style={{display: this.props.step === otherSettingsStep ? 'block': 'none'}} 
                    type="flex" 
                    align="middle"
            >
                <Col span={8} >
                    <h4 style={labelStyle}>Rebalancing Freq.</h4>
                    {
                        this.renderMenu(
                            'rebalancingFrequency', 
                            rebalancingFrequency,
                            'Please select a valid Rebalancing Frequency'
                        )
                    }
                </Col>
                <Col span={8} >
                    <h4 style={labelStyle}>Start Date</h4>
                    <FormItem>
                        {getFieldDecorator('startDate', {
                            initialValue: moment(),
                            rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                        })(
                            <DatePicker 
                                allowClear={false}
                                format={dateFormat}
                                style={{width: 150}}
                                disabledDate={this.getDisabledStartDate}
                            /> 
                        )}
                    </FormItem>
                </Col>
                <Col span={8} >
                    <h4 style={labelStyle}>Benchmark</h4>
                    {
                        this.renderMenu(
                            'benchmark', 
                            benchmarks,
                            'Please select a valid Benchmark'
                        )
                    }
                </Col>
            </Row>
        );
    }
}

const labelColor = '#898989';
const labelStyle = {
    color: labelColor,
    marginBottom: '5px'
};