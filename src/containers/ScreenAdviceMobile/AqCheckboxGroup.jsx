import * as React from 'react';
import _ from 'lodash';
import {List, Checkbox} from 'antd-mobile';
import {generateRandomString} from '../../utils';

const CheckboxItem = Checkbox.CheckboxItem;

export class AqCheckboxGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: this.processValues()
        }
    }

    processValues = (props = this.props) => {
        const {options = [], value = []} = props;
        return options.map(item => {
            return typeof(item) === 'string' 
            ?   {
                    label: item,
                    value: item,
                    checked: _.indexOf(value, item) !== -1
                }
            :   {
                    label: item.label,
                    value: item.value,
                    checked: value.filter(valueItem => valueItem === item.value)[0] !== undefined
                }
        });
    }

    componentWillReceiveProps(nextProps) {
        // if (!this.props.singleSelect) {
            this.setState({items: this.processValues(nextProps)});
        // }
    }

    onChange = (e, value) => {
        let items = [...this.state.items];
        if (this.props.singleSelect) {
            items = items.map(item => {
                return {
                    ...item,
                    checked: false
                }
            })
        }
        const targetItem = items.filter(item => item.value === value)[0];
        if (targetItem) {
            if (!(this.props.singleSelect && this.getCheckedItems().length === 1)) {
                targetItem.checked = e.target.checked;
            } else {
                targetItem.checked = true;
            }
        }
        this.setState({items}, () => {
            this.props.onChange(this.getCheckedItems());
        });
    }

    getCheckedItems = () => {
        const checkedItems = this.state.items.filter(item => item.checked === true);
        return checkedItems.map(item => item.value);
    }

    render() {
        const options = this.state.items;

        return (
            <List>
            {
                options.map((item, index) => (
                    <CheckboxItem 
                            key={generateRandomString()} 
                            onChange={(e) => this.onChange(e, item.value)} 
                            checked={item.checked}
                    >
                        <h3 style={{fontSize: '14px'}}>{item.label}</h3>
                    </CheckboxItem>
                ))
            }
            </List>
        )
    }
}