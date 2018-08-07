import * as React from 'react';
import _ from 'lodash';
import {Input, InputNumber, Form} from 'antd';

const FormItem = Form.Item;

export class EditableCell extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {value, onChange, type, disabled = false, onEnter, width = '60px'} = this.props;

        return (
            <FormItem>
                <Input 
                        type={type} 
                        value={value} 
                        onChange={e => onChange(e.target.value)} 
                        size="small"
                        disabled={disabled}
                />
            </FormItem>
        );
    }
}