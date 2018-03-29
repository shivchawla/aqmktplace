import * as React from 'react';
import axios from 'axios';
import {Input, InputNumber, Form, AutoComplete, Icon} from 'antd';

const Option = AutoComplete.Option;
const FormItem = Form.Item;

export class AutoCompleteEditableCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            inputValue: 'TCS'
        };
    }

    renderOption = item => {
        return (
            <Option key={item.name} text={item.name}>
              {item.name}
            </Option>
        );
    }

    handleSearch = query => {
        // this.setState({spinning: true});
        axios.get(`http://localhost:3001/tickers?q=${query}`)
        .then(response => {
            this.setState({dataSource: response.data})
        })
        .finally(() => {
            // this.setState({spinning: false});
        });
    }

    onCompareSelect = tickerName => {
        this.props.onSelect(tickerName);
    }

    handleChange = value => {
        if (this.props.handleAutoCompleteChange) {
            this.props.handleAutoCompleteChange(value);
        }
    }

    render() {
        const {value, onChange, type, validationStatus, disabled = false, onEnter} = this.props;
        const {dataSource} = this.state;

        return (
            <AutoComplete
                    style={{ width: 120 }}
                    dataSource={dataSource.map(this.renderOption)}
                    onSelect={this.onCompareSelect}
                    onSearch={this.handleSearch}
                    placeholder="Search Stocks"
                    onChange={this.handleChange}
            />
        );
    }
}

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};