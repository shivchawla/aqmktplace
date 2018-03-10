import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {Row, Col, Radio, Table, Icon, Button, Tabs, Select, Modal} from 'antd';
import {AqHighChartMod, AdviceFilterComponent, AdviceListItem} from '../components';
import {layoutStyle} from '../constants';

const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;
const Option = Select.Option;
const TabPane = Tabs.TabPane;
const ReactHighcharts = require('react-highcharts');
const {requestUrl, aimsquantToken, advisorId} = require('../localConfig');

export class AdvisorDashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            radioValue: 'all',
            advices: [],
            adviceUrl: `${requestUrl}/advice?all=true&trending=false&subscribed=false&following=false&order=-1`,
            rawAdvices: [],
            subsPerAdviceConfig: {
                chart: {
                    type: 'pie',
                    options3d: {
                        enabled: true,
                        alpha: 45
                    }
                },
                plotOptions: {
                    pie: {
                        innerSize: 100,
                        depth: 45
                    }
                },
                series: [],
                colors: ["#e91e63", "#444", "#90ed7d", "#f7a35c", "#8085e9"],
            },
            subsTotalConfig: {
                chart: {
                    type: 'line'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    title: {
                        text: 'Subscribers'
                    }
                },
                series: []
            },
            ratingsConfig: {
                chart: {
                    type: 'line'
                },
                title: {
                    text: ''
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    title: {
                        text: 'Subscribers'
                    }
                },
                series: []
            },
            selectedAdvice: '',
            subscribeScreen: 'total',
            tickers: [],
            filterModalVisible: false,
            sortBy: 'rating'
        };
        this.adviceColumns = [
            {
                title: 'Name',
                dataIndex: 'name',
                key: 'name'
            },
            {
                title: 'Rating',
                dataIndex: 'rating',
                key: 'rating'
            },
            {
                title: ' ',
                dataIndex: 'id',
                render: (text, record) => (
                    <Button icon="edit" onClick={() => this.props.history.push(`/advice/${record.id}`)}/>
                )
            }
        ];
    }

    handleRadioGroupChange = (e) => {
        this.setState({radioValue: e.target.value});
    }

    getUserDashboardData = () => {
        const url = `${requestUrl}/advisor/${advisorId}?dashboard=1`;
        const subsPerAdviceSeries = [];
        const subsTotalSeries = [];
        const ratingSeries = [];
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            subsPerAdviceSeries.push({name: 'Subscribers Per Advice', data: this.processSubsPerAdvice(response.data.advices)});
            subsTotalSeries.push({name: 'Total Subscribers', data: this.processTotalSubscribers(response.data.analytics)});
            ratingSeries.push({name: response.data.advices[0].name, data: this.processRatingByAdvice(response.data.advices[0])});
            this.getAdvicePerformance(response.data.advices[0]);
            this.setState({
                selectedAdvice: response.data.advices[0].name,
                rawAdvices: response.data.advices,
                advices: this.processAdvices(this.sortAdvices(response.data.advices)),
                subsPerAdviceConfig: {...this.state.subsPerAdviceConfig, series: subsPerAdviceSeries},
                subsTotalConfig: {...this.state.subsTotalConfig, series: subsTotalSeries},
                ratingsConfig: {...this.state.ratingsConfig, series: ratingSeries}
            });
        })
        .catch(error => {
            console.log(error);
        })
    }

    processAdviceData = advices => {
        console.log(advices);
        return advices.map((advice, index) => {
            return {
                name: advice.name,
                rating: advice.latestAnalytics.rating,
                key: index,
                id: advice._id
            }
        });
    }

    processAdvices = (responseAdvices) => {
        const advices = [];
        responseAdvices.map((advice, index) => {
            advices.push({
                id: advice._id,
                name: advice.name,
                advisor: advice.advisor,
                createdDate: advice.createdDate,
                heading: advice.heading,
                subscribers: advice.numSubscribers,
                rating: advice.latestAnalytics !== undefined ? advice.latestAnalytics.rating : 0,
                latestPerformance: advice.latestPerformance
            })
        });

        return advices;
    }

    sortAdvices = (advices) => {
        return _.sortBy(advices, advice => advice.latestAnalytics.rating);
    }

    calculateRating = advice => {
        let rating = 0;
        advice.analytics.map(item => {
            rating += item.rating;
        });

        return (rating/advice.analytics.length);
    }

    processSubsPerAdvice = advices => {
        const responseArray = advices.map(advice => {
            if (advice.analytics.length > 0) {
                return [advice.name, advice.analytics[advice.analytics.length - 1].numSubscribers];
            }
        });
        
        return responseArray;
    }

    processTotalSubscribers = advisorAnalytics => {
        if (advisorAnalytics.length > 0) {
            // Initializing month's data to null
            const monthData = [];
            for (let i=0; i < 12; i++) {
                monthData.push(null);
            };
            advisorAnalytics.map((item, index) => {
                const month = moment(item.date).format('M');
                monthData[month - 1] = item.numFollowers;
            });

            return monthData;
        } else {
            return [];
        }
        
    }

    processRatingByAdvice = advice => {
        const monthData = [];
         // Initializing month's data to null
        for (let i=0; i < 12; i++) {
            monthData.push(null);
        };
        advice.analytics.map((item, index) => {
            const month = moment(item.date).format('M');
            monthData[month - 1] = item.rating;
        });

        return monthData;
    }

    renderSubscriberStatsView = () => {
        const {subscribeScreen} = this.state;
        switch(subscribeScreen) {
            case "total":
                return <ReactHighcharts config = {this.state.subsTotalConfig} />;
            case "change":
                return <h1>Change in Subscribers</h1>
            case "subs/advice":
                return <ReactHighcharts config = {this.state.subsPerAdviceConfig} />;
            default:
                return null;
        }
    }

    renderAdviceStatsView = () => {
        return (
            <Row>
                <Col span={24}>
                    {this.renderAdvicesMenu(this.handleSelectAdvice)}
                </Col>
                <Col span={24}>
                    <ReactHighcharts config = {this.state.ratingsConfig} />;
                </Col>
            </Row>
        );
    }
    
    renderAdvicesMenu = (handleSelect) => {
        const advices = this.state.rawAdvices;

        if(advices.length > 0) {
            return (
                <Select 
                        defaultValue={advices[0].name} 
                        style={{width: 200}}
                        onChange={handleSelect}
                >
                    {
                        advices.map((advice, index) => {
                            return (
                                <Option key={index} value={advice._id}>{advice.name}</Option>
                            );
                        })
                    }
                </Select>
            );
        } else {
            return null;
        }
    }

    handleSubsciberViewChange = (e) => {
        this.setState({subscribeScreen: e.target.value})
    }

    handleSelectAdvice = value => {
        const advices = this.state.rawAdvices;
        const series = this.state.ratingsConfig.series;
        const advice = advices.filter(item => item._id === value)[0];
        series[0] = {name: advice.name, data: this.processRatingByAdvice(advice)};
        this.setState({ratingsConfig: {...this.state.ratingsConfig, series}});
    }

    handleSelectAdvicePerformance = value => {
        const newTickers = [];
        const advice = this.state.rawAdvices.filter(item => item._id === value)[0];
        const url = `${requestUrl}/performance/advice/${advice._id}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const data = response.data.simulated.portfolioValues.map(item => [moment(item.date).valueOf(), item.netValue]);
            newTickers.push({
                name: advice.name,
                data,
                show: true,
                disabled: true
            });
            this.setState({tickers: newTickers});
        })
        .catch(error => {
            console.log(error);
        });
    }

    getAdvicePerformance = advice => {
        const newTickers = [];
        const url = `${requestUrl}/performance/advice/${advice._id}`;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const data = response.data.simulated.portfolioValues.map(item => [moment(item.date).valueOf(), item.netValue]);
            newTickers.push({
                name: advice.name,
                data,
                show: true,
                disabled: true
            });
            this.setState({tickers: newTickers});
        })
        .catch(error => {
            console.log(error);
        });
    }

    renderFilterModal = () => {
        return (
            <Modal
                    title="Apply Filters"
                    visible={this.state.filterModalVisible}
                    footer={null}
                    onCancel={this.toggleFilterModal}
            >
                <AdviceFilterComponent 
                        updateAdvices={this.updateAdvices}
                        updateAdviceUrl={this.updateAdviceUrl}
                        toggleModal = {this.toggleFilterModal}
                />
            </Modal>
        );
    }

    toggleFilterModal = () => {
        this.setState({filterModalVisible: !this.state.filterModalVisible});
    }

    updateAdvices = (advices) => {
        this.setState({advices: this.processAdvices(advices)});
    }

    updateAdviceUrl = (url) => {
        this.setState({adviceUrl: url});
    }

    handleSortingMenuChange = (value) => {
        console.log(value);
        this.setState({sortBy: value}, () => {
            const url = `${this.state.adviceUrl}&orderParam=${this.state.sortBy}`;
            this.getAdvices(url);
        });
    }

    getAdvices = (url) => {
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            console.log(response.data);
            this.setState({advices: response.data});
        })
        .catch(error => {
            console.log(error);
        });
    }

    renderSortingMenu = () => {
        return (
            <Select defaultValue={this.state.sortBy} style={{width: 200}} onChange={this.handleSortingMenuChange}>
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

    componentWillMount() {
        this.getUserDashboardData();
    }

    renderAdvices = () => {
        const {advices} = this.state;
        return advices.map((advice, index) => {
            return (
                <AdviceListItem key={index} advice={advice}/>
            );
        });
    }

    render() {
        const {radioValue} = this.state;

        return(
            <Row>
                {this.renderFilterModal()}
                <Col span={24}>
                    <Row>
                        <Col span={10} style={layoutStyle}>
                            <Row>
                                <Col span={4}>
                                    <h3>Advices</h3>
                                </Col>
                                <Col span={4}>
                                    <Icon type="filter" onClick={this.toggleFilterModal}/>
                                </Col>
                                <Col span={6}>
                                    {this.renderSortingMenu()}
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    {/* <Table columns={this.adviceColumns} dataSource={this.state.advices} pagination={false}/> */}
                                    {this.renderAdvices()}
                                </Col>
                            </Row>
                        </Col>
                        <Col span={10} offset={1} style={layoutStyle}>
                            <Row>
                                <Col span={24}>
                                    {this.renderAdvicesMenu(this.handleSelectAdvicePerformance)}
                                </Col>
                                <Col span={24}></Col>
                            </Row>
                            <AqHighChartMod tickers={this.state.tickers} />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={10} style={{...layoutStyle}}>
                            <Tabs defaultActiveKey="1">
                                <TabPane tab="Subscribers" key="1">
                                    <Row>
                                        <Col span={14} offset={10}>
                                            <RadioGroup 
                                                    size="small" 
                                                    onChange={this.handleSubsciberViewChange} 
                                                    defaultValue={this.state.subscribeScreen}
                                            >
                                                <RadioButton value="total">Total</RadioButton>
                                                <RadioButton value="subs/advice">Subs/Advice</RadioButton>
                                            </RadioGroup>
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col span={24}>
                                            {this.renderSubscriberStatsView()}
                                        </Col>
                                    </Row>
                                </TabPane>
                                <TabPane tab="Rating" key="2">
                                    <Row>
                                        <Col span={24}>
                                            {this.renderAdviceStatsView()}
                                        </Col>
                                    </Row>
                                </TabPane>
                            </Tabs>
                        </Col>
                    </Row>
                </Col>
            </Row>
            
        );
    }
}