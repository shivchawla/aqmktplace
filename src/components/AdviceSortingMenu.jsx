import * as React from 'react';
import axios from 'axios';
import {Row, Col, Select} from 'antd';

const Option = Select.Option;
const {aimsquantToken} = require('../localConfig');

export class AdviceSortingMenu extends React.Component {
    handleSortingMenuChange = value => {
        this.props.updateSortBy(value);
        this.getAdvices(value);
    }

    getAdvices = sortBy => {
        const url = `${this.props.adviceUrl}&orderParam=${sortBy}`
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({advices: response.data});
            this.props.updateAdvices(response.data);
        })
        .catch(error => {
            // console.log(error);
        });
    }

    render() {
        return (
            <Select defaultValue={this.props.sortBy} style={{width: 200}} onChange={this.handleSortingMenuChange}>
                <Option value="rating">Rating</Option>
                <Option value="return">Return</Option>
                <Option value="name">Name</Option>
                <Option value="volatility">Volatility</Option>
                <Option value="sharpe">Sharpe</Option>
                <Option value="maxloss">Max Loss</Option>
                <Option value="numFollowers">Number of Followers</Option>
                <Option value="numSubscribers">Number of Subscribers</Option>
                <Option value="createdDate">Created Date</Option>
            </Select>
        );
    }
}