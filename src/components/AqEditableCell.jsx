import * as React from 'react';
import {Input, Form} from 'antd';

const FormItem = Form.Item;

export class EditableCell extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {value, onChange, type, validationStatus} = this.props;

        return (
            <FormItem
                hasFeedback
                validateStatus={validationStatus}
            >
                <Input 
                        type={type} 
                        value={value} 
                        onChange={e => onChange(e.target.value)} 
                />
            </FormItem>
        );
    }
}