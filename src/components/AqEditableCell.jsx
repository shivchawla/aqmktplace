import * as React from 'react';
import {Input} from 'antd';

export class AqEditableCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value
        };
    }

    handleChange = (e) => {
        this.setState({value: e.target.value});
    }

    render() {
        return(
            <Input 
                    value={this.state.value}
                    onChange={this.handleChange}
            />
        );
    }
}