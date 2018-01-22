import * as React from 'react';
import {Input, InputNumber, Form} from 'antd';

const FormItem = Form.Item;

export class EditableCell extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {value, onChange, type, validationStatus, disabled = false} = this.props;

        return (
            <FormItem
                hasFeedback
                validateStatus={validationStatus}
            >
                <Input 
                        style={{borderRadius: '0'}}
                        type={type} 
                        value={value} 
                        onChange={e => onChange(e.target.value)} 
                        disabled={disabled}
                />
            </FormItem>
        );
    }
}