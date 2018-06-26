import * as React from 'react';
import _ from 'lodash';
import {Slider, Row, Col} from 'antd';
import {Range} from 'antd-mobile';
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
        const {min = 0, max = 0} = this.props;

        return (
            <Row>
                <Col span={24} style={{...horizontalBox, justifyContent: 'space-between', padding: '0 20px'}}>
                    <h3 style={{fontSize: '18px'}}>{this.state.value[0]} %</h3>
                    <h3 style={{fontSize: '18px'}}>{this.state.value[1]} %</h3>
                </Col>
                <Col span={24} style={{padding: '30px'}}>
                    <Range
                        onChange={this.handleSliderChange}
                        onAfterChange={this.onAfterChange}
                        value={this.state.value}
                        min={min}
                        max={max}
                    />
                </Col>
            </Row>
        );
    }
}