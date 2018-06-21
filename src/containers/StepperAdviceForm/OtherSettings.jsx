import * as React from 'react';
import moment from 'moment';
import {Row, Col, Form, DatePicker, Select, Icon, Tooltip} from 'antd';
import {benchmarks} from '../../constants/benchmarks';
import {tooltips} from './constants';
import {getStepIndex} from './steps';
import {getFirstMonday, compareDates, getDate} from '../../utils';

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
                        <Select style={{width: 150}} disabled={this.props.disabled}>
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
        let offset;
        switch(this.props.form.getFieldValue('rebalancingFrequency') || "Daily") {
            case "Daily": offset = '1d'; break;
            case "Weekly": offset = '1w'; break;
            case "Bi-Weekly": offset = '2w'; break;
            case "Monthly": offset = '1m'; break;
            case "Quartely": offset = '1q'; break;
        }

        return (
            this.props.isUpdate && this.props.isPublic 
                ? this.props.form.getFieldValue('rebalancingFrequency') || "Daily" === "Daily" 
                    ? current && (current < moment().endOf('day') || [0, 6].indexOf(current.weekday()) !== -1) 
                    : current && (current < moment().endOf('day') || [0, 6].indexOf(current.weekday()) !== -1 || compareDates(getDate(current.toDate()), getFirstMonday(offset)) != 0)  
                : current && (current < moment().startOf('day') || [0, 6].indexOf(current.weekday()) !== -1)
        );
    }

    renderHeader = (header, tooltip) => {
        return (
            <Tooltip title={tooltip} placement='top'>
                <h4 style={labelStyle}>{header}</h4>
            </Tooltip>
        );
    }

    shouldComponentUpdate(nextProps) {
        const otherSettingsStep = getStepIndex('otherSettings');
        if (nextProps.step === otherSettingsStep) {
            return true;
        }

        return false;
    }

    render = () => {
        const {getFieldDecorator} = this.props.form;
        console.log('Rendering Other Settings');

        return (
            <Row
                    style={{display: 'block'}} 
                    align="middle"
            >
                <Col span={24} style={{marginTop: '40px'}}>
                    <Row type = "flex" justify="space-between">
                        <div>
                            {this.renderHeader('Rebalancing Frequency', tooltips['rebalancingFrequency'])}
                            {
                                this.renderMenu(
                                    'rebalancingFrequency', 
                                    rebalancingFrequency,
                                    'Please select a valid Rebalancing Frequency'
                                )
                            }
                        </div>
                        <div>
                            {this.renderHeader('Start Date', tooltips['startDate'])}
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
                                        disabled={this.props.approvalRequested}
                                    /> 
                                )}
                            </FormItem>
                        </div>
                        <div>
                            {this.renderHeader('Benchmark', tooltips['benchmark'])}
                            {
                                this.renderMenu(
                                    'benchmark', 
                                    benchmarks,
                                    'Please select a valid Benchmark'
                                )
                            }
                        </div>
                    </Row>
                </Col>
            </Row>
        );
    }
}

const labelColor = '#898989';
const labelStyle = {
    color: labelColor,
};