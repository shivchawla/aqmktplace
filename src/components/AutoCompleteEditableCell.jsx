import * as React from 'react';
import axios from 'axios';
import {Input, InputNumber, Form, AutoComplete, Icon, Spin, Row, Col} from 'antd';

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
                symbol: item.ticker,
                name: item.detail !== undefined ? item.detail.Nse_Name : item.ticker
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
    
    renderOption = item => {
        return (
            <Option key={item.id} text={item.symbol} value={item.symbol}>
                <div>
                    <span>{item.symbol}</span><br></br>
                    <span style={{fontSize: '10px'}}>{item.name}</span>
                </div>
            </Option>
        );
    }

    render() {
        const {value = 'TCS', onChange, type, validationStatus, disabled = false, onEnter} = this.props;
        const {dataSource} = this.state;

        return (
            <AutoComplete
                    dataSource={dataSource.map(this.renderOption)}
                    onSelect={this.onCompareSelect}
                    onSearch={this.handleSearch}
                    placeholder="Search Stocks"
                    onChange={this.handleChange}
                    defaultValue={value}
                    optionLabelProp="value"
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