import * as React from 'react';
import axios from 'axios';
import {Input, InputNumber, Form, AutoComplete, Icon, Spin} from 'antd';

const Option = AutoComplete.Option;
const FormItem = Form.Item;
const spinIcon = <Icon type="loading" style={{ fontSize: 16, marginRight: '5px' }} spin />;

const {requestUrl, aimsquantToken} = require('../localConfig');

export class AutoCompleteEditableCell extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            inputValue: 'TCS',
            spinning: false
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
        this.setState({spinning: true});
        const url = `${requestUrl}/stock?search=${query}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)});
        })
        .finally(() => {
            this.setState({spinning: false});
        });
    }

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                name: item.ticker,
            }
        })
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
            >
                <Input
                        suffix={(
                            <Spin indicator={spinIcon} spinning={this.state.spinning}/>
                        )}
                />
            </AutoComplete>
        );
    }
}

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};