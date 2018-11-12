import React from 'react';
import moment from 'moment';
import enUS from 'antd-mobile/lib/locale-provider/en_US';
import {Row, Col, Icon} from 'antd';
import {LocaleProvider, DatePicker} from 'antd-mobile';
import {horizontalBox} from '../../../constants';

const dateFormat = 'Do MMM YY';

export default class DateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: props.date || moment().format(dateFormat)
        }
    }

    navigateToPreviousDate = () => {
        const date = moment(this.state.selectedDate, dateFormat).subtract(1, 'days');
        this.setState({selectedDate: date.format(dateFormat)});
        this.props.onDateChange && this.props.onDateChange(date);
    }

    navigateToNexDate = () => {
        const date = moment(this.state.selectedDate, dateFormat).add(1, 'days');
        console.log(date.format(dateFormat));
        this.setState({selectedDate: date.format(dateFormat)});
        this.props.onDateChange && this.props.onDateChange(date);
    }

    handleDatePickerChange = date => {
        const selectedDate = moment(date).format(dateFormat);
        console.log(selectedDate);
        this.setState({selectedDate});
        this.props.onDateChange && this.props.onDateChange(moment(date, dateFormat));
    }

    render() {
        const {color = '#fff'} = this.props;
        const iconStyle = {color, fontSize: '20px'}

        return (
            <LocaleProvider locale={enUS}>
                <Row style={{width: '100%', position: 'absolute', top: 10, width: '100%', ...this.props.style, padding: '0 30px'}}>
                    <Col span={4} style={{...horizontalBox, justifyContent: 'flex-start'}} onClick={this.navigateToPreviousDate}>
                        <Icon type="left" theme="outlined" style={iconStyle}/>
                    </Col>
                    <Col span={16} style={{...horizontalBox, justifyContent: 'center'}}>
                        <DatePicker
                                mode="date"
                                // value={this.state.selectedDate}
                                onChange={this.handleDatePickerChange}
                                // extra="click to choose"
                        >
                            <h3 style={{fontSize: '14px', color}}>{this.state.selectedDate}</h3>
                        </DatePicker>                        
                    </Col>
                    <Col span={4} style={{...horizontalBox, justifyContent: 'flex-end'}} onClick={this.navigateToNexDate}> 
                        <Icon type="right" theme="outlined" style={iconStyle}/>
                    </Col>
                </Row>
            </LocaleProvider>
        );
    }
}
