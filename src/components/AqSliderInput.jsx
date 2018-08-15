import * as React from 'react';
import {Row, Col, Slider, InputNumber, Input, Icon} from 'antd'; 
import {primaryColor, horizontalBox} from '../constants';
import NumericInput from 'react-numeric-input';
import _ from 'lodash';

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

    handleValueChange = _.debounce(value => {  
        const nValue = value > this.props.max
            ? this.props.max
            : value < 0
                ? 0
                : value
        if (typeof value === 'number') {
            console.log(nValue);
            this.props.onChange(nValue);
            
        }
    }, 200);

    render() {
        const {
            min = 0, 
            max = 50000, 
            inputWidth = '25px', 
            sliderSpan = 16, 
            inputSpan = 8, 
            disabled=false,
            stepSize = 1000
    } = this.props;

        return (
            <Row style={this.props.style}>
                {/* <Col span={sliderSpan}>
                    <Slider 
                        disabled = {disabled}
                        min={min} 
                        max={max} 
                        onChange={this.onSliderChange} 
                        onAfterChange={() => this.props.onChange(this.state.sliderValue)}
                        value={this.state.sliderValue} 
                        step={500}
                    />
                </Col> */}
                <Col span={24} style={{...horizontalBox, textAlign: 'right', paddingRight: '10px'}}>
                    {/*<Icon 
                        style={{fontSize: '16px', cursor: 'pointer'}} 
                        type={"minus-circle-o"} 
                        onClick={() => {
                            const value = this.props.value - stepSize;
                            const nValue = value > max
                                ? max
                                : value < 0
                                    ? 0
                                    : value
                            this.props.onChange(nValue)
                        }}
                    />*/}
                    <NumericInput
                        min={min}
                        max={max}
                        style={{
                            input: {height:'28px', width: '100px', fontFamily:'Lato'}
                        }}
                        value={this.props.value}
                        step={stepSize}
                        onChange={this.handleValueChange} 
                    />
                    {/*<Icon 
                        style={{fontSize: '16px', cursor: 'pointer'}} 
                        type={"plus-circle-o"} 
                        onClick={() => {
                            const value = this.props.value + stepSize
                            const nValue = value > max
                                ? max
                                : value < 0
                                    ? 0
                                    : value
                            this.props.onChange(nValue)
                        }}
                    />*/}
                    {
                        !this.props.hideValue &&
                        <h3>{Math.round(this.props.value)}</h3>
                    }
                </Col>
                <Col span={24} style={{...horizontalBox, marginRight: '10px'}}>
                    {/*<h3 style={{fontSize: '14px', fontWeight: 700}}>Min: {min}</h3>*/}
                    <h3 style={{fontSize: '10px', fontWeight: 700}}>Max: {max.toFixed(2)}</h3>
                </Col>
            </Row>
        );
    }
}   