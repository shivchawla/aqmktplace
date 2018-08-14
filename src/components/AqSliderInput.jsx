import * as React from 'react';
import {Row, Col, Slider, InputNumber, Input} from 'antd'; 
import {primaryColor} from '../constants';

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
        const {min = 0, max = 50000, inputWidth = '65px', sliderSpan = 14, inputSpan = 10, disabled=false} = this.props;

        return (
            <Row>
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
                <Col span={inputSpan}>
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
                    <h3>{Math.round(this.props.value)}</h3>
                </Col>
            </Row>
        );
    }
}   