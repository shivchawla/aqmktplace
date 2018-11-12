import * as React from 'react';
import {Row, Col, Slider, InputNumber, Input, Icon} from 'antd'; 
import {primaryColor, horizontalBox} from '../constants';
import NumericInput from 'react-numeric-input';
import _ from 'lodash';

let timeout = null;

export default class SliderInput extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sliderValue: this.props.value
        };
    }

    onSliderChange = value => {
        this.setState({sliderValue: value});
    }

    componentWillReceiveProps(nextProps) {
        this.setState({sliderValue: nextProps.value});
    }

    // handleValueChange = _.debounce(value => {  
    //     const nValue = value > this.props.max
    //         ? this.props.max
    //         : value < 0
    //             ? 0
    //             : value
    //     if (typeof value === 'number') {
    //         // this.props.onChange(nValue);
            
    //     }
    // }, 200);

    handleValueChange = value => {  
        const nValue = value > this.props.max
            ? this.props.max
            : value < 0
                ? 0
                : value;
        clearTimeout(timeout);
        if (typeof value === 'number') {
            timeout = setTimeout(() => {
                this.props.onChange(nValue);
            }, 300);
        }
    }

    render() {
        const {min = 0, max = 50000, stepSize = 100, value = 0} = this.props;


        return (
            <Row style={this.props.style}>
                <Col span={24} style={{...horizontalBox, textAlign: 'right', paddingRight: '10px'}}>
                    <NumericInput
                        min={min}
                        max={max}
                        style={{
                            input: {height:'28px', width: '100px', fontFamily:'Lato'}
                        }}
                        value={value}
                        step={stepSize}
                        onChange={this.handleValueChange} 
                    />
                    {
                        !this.props.hideValue &&
                        <h3>{Math.round(value)}</h3>
                    }
                </Col>
                <Col span={24} style={{...horizontalBox, marginRight: '10px'}}>
                    <h3 style={{fontSize: '10px', fontWeight: 700}}>Max: {max.toFixed(2)}</h3>
                </Col>
            </Row>
        );
    }
}   