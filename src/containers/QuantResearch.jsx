import * as React from 'react';
import {debounce} from 'throttle-debounce';
import {Input} from 'antd';
import {AqLink} from '../components';

export class QuantResearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this.changeState = debounce(500, this.changeState);
    }

    onChange = (e) => {
        this.changeState(e.target.value);
    }
    
    changeState = (value) => {
        this.setState({value})
    }

    render() {
        return (
            <div>
                <h4>{this.state.value}</h4>
                <AqLink to="/quantresearch/research" pageTitle='Research Platform' />
                <Input type="text" value={this.state.value} onChange={this.onChange} />
            </div>
        );
    }
}