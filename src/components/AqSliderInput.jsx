import * as React from 'react';
import {Row, Col, Slider, InputNumber, Input} from 'antd'; 
import {primaryColor, horizontalBox} from '../constants';

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

    render() {
        const {min = 0, max = 50000, inputWidth = '65px', sliderSpan = 16, inputSpan = 8, disabled=false} = this.props;

        return (
            <Row style={this.props.style}>
                <Col span={sliderSpan}>
                    <Slider 
                        disabled = {disabled}
                        min={min} 
                        max={max} 
                        onChange={this.onSliderChange} 
                        onAfterChange={() => this.props.onChange(this.state.sliderValue)}
                        value={this.state.sliderValue} 
                        step={500}
                    />
                </Col>
                <Col span={inputSpan} style={{textAlign: 'right', paddingRight: '10px'}}>
                    {/* <InputNumber
                        min={min}
                        max={max}
                        style={{width: inputWidth, marginLeft: '5px', color: primaryColor}}
                        value={this.props.value}
                        step={500}
                        onChange={value => { 
                            console.log(typeof value);
                            if (typeof value === 'number') {
                                this.props.onChange(value);
                            }
                        }}
                    /> */}
                    {
                        !this.props.hideValue &&
                        <h3>{Math.round(this.props.value)}</h3>
                    }
                </Col>
                <Col span={24} style={{...horizontalBox, justifyContent: 'space-between', marginRight: '10px'}}>
                    <h3 style={{fontSize: '14px', fontWeight: 700}}>Min: {min}</h3>
                    <h3 style={{fontSize: '14px', fontWeight: 700}}>Max: {max.toFixed(2)}</h3>
                </Col>
            </Row>
        );
    }
}   