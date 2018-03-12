import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {Row, Col, Select} from 'antd';
import {AdvisorComponent} from '../components';
import {layoutStyle} from '../constants';

const {requestUrl, aimsquantToken} = require('../localConfig');
const Option = Select.Option;

export class ScreenAdvisors extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            advisors: [],
            sortBy: 'rating'
        };
    }

    getAdvisors = () => {
        const url = `${requestUrl}/advisor?&orderParam=${this.state.sortBy}&order=-1`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(response.data);
            this.setState({advisors: response.data});
        })
    }
    
    renderAdvisors = () => {
        return this.state.advisors.map((advisor, index) => {
            const metrics = {
                name: `${advisor.user.firstName} ${advisor.user.lastName}`,
                numAdvices: advisor.latestAnalytics.numAdvices,
                numFollowers: advisor.latestAnalytics.numFollowers,
                rating: advisor.latestAnalytics.rating
            };

            return <AdvisorComponent key={index} metrics={metrics} advisorId={advisor._id}/>
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
                            <Option value={item.value}>{item.name}</Option>
                        );
                    })
                }
            </Select>
        );
    }

    componentWillMount() {
        this.getAdvisors();
    }

    render(){
        return (
            <Row>
                <Col span={18} style={layoutStyle}>
                    <Row>
                        <Col span={24}>
                            {this.renderSortingMenu()}
                        </Col>
                        <Col span={24}>
                            {this.renderAdvisors()}
                        </Col>
                    </Row>
                </Col>
            </Row>
            
        );
    }
}