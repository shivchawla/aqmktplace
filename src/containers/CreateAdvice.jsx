import * as React from 'react';
import {Layout, Input, Row, Col, DatePicker} from 'antd';
import moment from 'moment';
import {inputStyle, inputHeaderStyle} from '../constants';

const {TextArea} = Input;
const {RangePicker} = DatePicker;
const dateFormat = 'DD/MM/YYYY';

export class CreateAdvice extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            startDate : '',
            endDate: ''
        }
    }

    onStartDateChange = (date) => {
        const startDate = moment(date).format(dateFormat);
        console.log(startDate);
        this.setState({startDate});
    }

    onEndDateChange = (date) => {
        const endDate = moment(date).format(dateFormat);
        this.setState({endDate})
    }

    disabledStartDate = (current) => {
        return current && current < moment().endOf('day');
    }

    disabledEndDate = (current) => {
        return current && moment(current).format(dateFormat) > this.state.startDate;
    }


    render() {
        return (
            <Row>
                <Col span={18} style={layoutStyle}>
                    <Row>
                        <Col span={24}>
                            <h3 style={inputHeaderStyle}>
                                Advice Name
                            </h3>
                        </Col>
                        <Col span={8}>
                            <Input style={inputStyle} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <h3 style={inputHeaderStyle}>
                                Headline
                            </h3>
                        </Col>
                        <Col span={24}>
                            <Input style={inputStyle} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <h3 style={inputHeaderStyle}>
                                Description
                            </h3>
                        </Col>
                        <Col span={24}>
                            <TextArea style={inputStyle} autosize={{minRows: 3, maxRows: 6}}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <h3 style={inputHeaderStyle}>Advice Portfolio</h3>
                        </Col>
                    </Row>
                    <Row type="flex" justify="space-between">
                        <Col span={6}>
                            <h4 style={labelStyle}>Initial Cash</h4>
                            <h3>100000</h3>
                        </Col>
                        <Col span={6}>
                            <h4 style={labelStyle}>Remaining Cash</h4>
                            <h3>50000</h3>
                        </Col>
                        <Col span={6}>
                            <h4 style={labelStyle}>Start Date</h4>
                            <DatePicker disabledDate={this.disabledStartDate} onChange={this.onStartDateChange} format={dateFormat} /> 
                        </Col>
                        <Col span={6}>
                            <h4 style={labelStyle}>End Date</h4>     
                            <DatePicker disabledDate={this.disabledEndDate} onChange={this.onEndDateChange} format={dateFormat} />
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

const layoutStyle = {
    backgroundColor: '#fff',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
    padding: '20px 30px',
    marginTop: '20px'
};

const labelStyle = {
    color: '#898989'
}

