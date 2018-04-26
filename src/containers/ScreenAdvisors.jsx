import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import Loading from 'react-loading-bar';
import {Row, Col, Select, Input} from 'antd';
import {AdvisorComponent} from '../components';
import {layoutStyle, loadingColor} from '../constants';
import {Utils} from '../utils';

const {requestUrl, aimsquantToken} = require('../localConfig');
const Option = Select.Option;
const Search = Input.Search;

export class ScreenAdvisors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advisors: [],
            sortBy: 'rating',
            loading: false
        };
    }

    getAdvisors = () => {
        const url = `${requestUrl}/advisor?&orderParam=${this.state.sortBy}&order=-1`;
        this.setState({loading: true});
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            console.log('Advisor List', response.data);
            this.setState({advisors: response.data});
        })
        .catch(error => {
            console.log(error);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }
    
    renderAdvisors = () => {
        return this.state.advisors.map((advisor, index) => {
            const {firstName, lastName} = advisor.user ? advisor.user : {firstName: 'John', lastName: 'Doe'};
            const {numAdvices, numFollowers, rating} = advisor.latestAnalytics ? advisor.latestAnalytics : {numAdvices: 0, numFollowers: 0, rating: 0};
            const metrics = {
                name: `${firstName} ${lastName}`,
                numAdvices,
                numFollowers,
                rating
            };

            return <AdvisorComponent key={index} metrics={metrics} advisorId={advisor._id} advisor={advisor}/>
        });
    }

    handleChange = value => {
        this.setState({sortBy: value}, () => {
            this.getAdvisors();
        });
    }

    renderSortingMenu = () => {
        const menu = [
            {name: 'Rating', value:'rating'},
            {name: 'Subscribers', value: 'numSubscribers'},
            {name: 'Number of Advices', value: 'numAdvices'},
        ]
        
        return (
            <Select defaultValue={this.state.sortBy} style={{width: 200}} onChange={this.handleChange}>
                {
                    menu.map((item, index) => {
                        return (
                            <Option key={index} value={item.value}>{item.name}</Option>
                        );
                    })
                }
            </Select>
        );
    }

    handleSearch = value => {
        console.log(value);
    }

    componentWillMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            this.getAdvisors();
        }
    }

    render(){
        return (
            <Row style={{marginTop: '20px'}}>
                <Loading
                        show={this.state.loading}
                        color={loadingColor}
                        className="main-loader"
                        showSpinner={false}
                />
                {
                    !this.state.loading &&
                    <Col span={18}>
                        <Row type="flex" justify="space-between">
                            <Col span={18}>
                                <Search
                                        placeholder="Enter advisor name"
                                        onSearch={this.handleSearch}
                                />
                            </Col>
                            <Col span={4}>
                                {this.renderSortingMenu()}
                            </Col>
                            <Col span={24}>
                                {this.renderAdvisors()}
                            </Col>
                        </Row>
                    </Col>
                }
            </Row>
            
        );
    }
}