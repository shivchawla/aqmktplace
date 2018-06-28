import * as React from 'react';
import moment from 'moment';
import {Row, Col, Form, DatePicker, Select, Icon, Tooltip} from 'antd';
import {Picker, List, DatePicker as DatePickerMobile} from 'antd-mobile';
import {benchmarks} from '../../constants/benchmarks';
import {tooltips} from './constants';
import {getStepIndex} from './steps';
import {getFirstMonday, compareDates, getDate} from '../../utils';
import {AdviceName} from './AdviceName';
import './css/otherSettingsMobile.css';

const FormItem = Form.Item;
const Option = Select.Option;
const dateFormat = 'YYYY-MM-DD';
const rebalancingFrequency = [ 'Monthly', 'Daily', 'Weekly', 'Bi-Weekly', 'Quartely'];

export class OtherSettings extends React.Component {
    renderMenu = (fieldName, options, message, label) => {
        const {getFieldDecorator, getFieldProps} = this.props.form;

        return (
            <Picker
                    data={options.map(item => {return {label: item, value: item}})}
                    cols={1}
                    okText="Select"
                    dismissText="Cancel"
                    // onChange={this.onPickerChange}
                    {...getFieldProps(fieldName, {
                        initialValue: [options[0]],
                        rules: [{
                            required: true,
                            message: message
                        }]
                    })}
            >
                <List.Item 
                        style={{paddingLeft: '0px', paddingRight: '0px'}} 
                        arrow="horizontal"
                        extra=""
                >
                    {this.props.form.getFieldValue(fieldName)}
                </List.Item>
            </Picker>
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
                <h4 style={labelStyle}>{header}:</h4>
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
        const {getFieldDecorator, getFieldProps} = this.props.form;
        // this.props.form.getFieldValue('fieldName');
        
        return (
            <Col>
                <AdviceName {...this.props} approvalStatusData={this.props.approvalStatusData} />

                <Row type = "flex" style={{marginTop: '30px'}} align="middle">
                    <Col span={24} >
                    <h4 style={labelStyle}>Rebalancing Frequency:</h4>
                    </Col>
                    <Col span={24}>
                        
                        {
                            this.renderMenu(
                                'rebalancingFrequency', 
                                rebalancingFrequency,
                                'Please select a valid Rebalancing Frequency',
                                'Rebalancing Frequency'
                            )
                        }
                    </Col>
                </Row>

                <Row type = "flex" style={{marginTop: '30px'}} align="middle">
                    <Col span={24} >
                        {this.renderHeader('Start Date', tooltips['startDate'])}
                    </Col>
                    <Col span={24}>
                        <FormItem>
                            {getFieldDecorator('startDate', {
                                initialValue: moment(),
                                rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                            })(
                                <DatePicker 
                                    allowClear={false}
                                    format={dateFormat}
                                    style={{...labelStyle, width: '100%', height: '40px'}}
                                    disabledDate={this.getDisabledStartDate}
                                    disabled={this.props.approvalRequested}
                                /> 
                            )}
                        </FormItem>
                    </Col>
                </Row>

                <Row type = "flex" style={{marginTop: '30px'}} align="middle">
                    <Col span={24} >
                        <h4 style={labelStyle}>Benchmark:</h4>
                    </Col>
                    <Col span={24}>
                        {
                            this.renderMenu(
                                'benchmark', 
                                benchmarks,
                                'Please select a valid Benchmark',
                                'Benchmark'
                            )
                        }
                    </Col>
                </Row>

            </Col>
        );
    }
}

const labelStyle = {
    fontWeight: 300, 
    color: '#000000',
    fontSize: '17px'
};
