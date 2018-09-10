import React from 'react';
import moment from 'moment';
import {Row, Col, Icon} from 'antd';
import { horizontalBox } from '../../../constants';

const dateFormat = 'Do MMM YY';

export default class DateComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedDate: moment().format(dateFormat)
        }
    }

    navigateToPreviousDate = () => {
        const date = moment(this.state.selectedDate, dateFormat).subtract(1, 'days');
        this.setState({selectedDate: date.format(dateFormat)});
    }

    navigateToNexDate = () => {
        const date = moment(this.state.selectedDate, dateFormat).add(1, 'days');
        this.setState({selectedDate: date.format(dateFormat)});
    }

    render() {
        const {color = '#fff'} = this.props;
        const iconStyle = {color, fontSize: '20px'}

        return (
            <Row style={{width: '100%', position: 'absolute', top: 10, width: '100%', paddingRight: '20px', ...this.props.style}}>
                <Col span={16} style={{...horizontalBox, alignItems: 'flex-start'}}>
                    <h3 style={{fontSize: '14px', color}}>{this.state.selectedDate}</h3>
                </Col>
                <Col span={8} style={{...horizontalBox, justifyContent: 'space-between'}}>
                    <Row style={{width: '100%'}}>
                        <Col span={12} style={{...horizontalBox, justifyContent: 'flex-start'}} onClick={this.navigateToPreviousDate}>
                            <Icon type="left" theme="outlined" style={iconStyle}/>
                        </Col>
                        <Col span={12} style={{...horizontalBox, justifyContent: 'flex-end'}} onClick={this.navigateToNexDate}>
                            <Icon type="right" theme="outlined" style={iconStyle}/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}
