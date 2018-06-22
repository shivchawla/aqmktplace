import * as React from 'react';
import _ from 'lodash';
import {Slider, Row, Col} from 'antd';
import { horizontalBox } from '../../constants';

export class FilterSliderComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.defaultValue || [0, 100],
        };
    }

    handleSliderChange = value => {
        this.setState({value});
    }

    onAfterChange = value => {
        this.props.handleSliderChange && this.props.handleSliderChange(value, this.props.type);
    }

    shouldComponentUpdate(nextProps) {
        if (!_.isEqual(nextProps !== this.props)) {
            return true;
        }

        return false;
    }

    clearFilter = () => {
        this.setState({value: [this.props.min, this.props.max]});
    }

    showConsole = () => {
        console.log(`Hello ${this.props.type}`)
    }

    render() {
        const {min = 0, max = 0, type} = this.props;

        return (
            <Row>
                <Col span={24}>
                    <Slider
                        range
                        onChange={this.handleSliderChange}
                        onAfterChange={this.onAfterChange}
                        value={this.state.value}
                        min={min}
                        max={max}
                    />
                </Col>
                <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                    <h3 style={{fontSize: '14px'}}>Min: {this.state.value[0]}</h3>
                    <h3 style={{fontSize: '14px'}}>Max: {this.state.value[1]}</h3>
                </Col>
            </Row>
        );
    }
}