import * as React from 'react';
import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';
import {Row, Col, Radio, Table, Icon, Button, Tabs, Select, Modal, Rate} from 'antd';
import {AqHighChartMod, AdviceFilterComponent, AdviceListItem, ListMetricItem} from '../components';
import {newLayoutStyle, listMetricItemLabelStyle, listMetricItemValueStyle} from '../constants';
import {dateFormat} from '../utils';

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
                    height: 280,
                },
                title: {
                    text: '',
                    align: 'center',
                    verticalAlign: 'middle',
                    y: -5,
                    style: {
                        fontSize: '16px'
                    }
                },
                tooltip: {
                    enabled: false
                },
                plotOptions: {
                    pie: {
                        innerSize: 150,
                        cursor: 'pointer',
                        dataLabels: {
                            enabled: false,
                            format: '{point.name} {point.percentage:.1f}%',
                            distance: -15,
                            filter: {
                                property: 'percentage',
                                operator: '>',
                                value: 0
                            }
                        },
                        ...this.subsPerAdviceChart()
                    },
                },
                series: [],
                colors: ["#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"],
            },
            subsTotalConfig: {
                chart: {
                    type: 'spline',
                    height: 300,
                    width: 400
                },
                title: {
                    style: {
                        display: 'none'
                    }
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    title: {
                        text: 'Subscribers'
                    }
                },
                legend: {
                    enabled: false
                },
                series: []
            },
            ratingsConfig: {
                chart: {
                    type: 'spline',
                    height: 300,
                    width: 400
                },
                title: {
                    style: {display: 'none'}
                },
                xAxis: {
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                },
                yAxis: {
                    title: {
                        text: 'Subscribers'
                    }
                },
                legend: {
                    enabled: false
                },
                series: []
            },
            selectedAdvice: '',
            subscribeScreen: 'total',
            tickers: [],
            filterModalVisible: false,
            sortBy: 'rating',
            subscriberStats: {
                totalSubscribers: 0,
                selectedAdviceSubscribers: 0
            },
            ratingStats: {
                currentRating: 4.7,
                averageRating: 5
            },
            totalSubscriberStats: {
                totalSubscribers: 0,
                newSubscribers: 0
            }
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

    subsPerAdviceChart= () => ({
        events: {
            click: e => {
                this.setState({
                    subsPerAdviceConfig: this.setSubsPerAdviceTitle(e.point),
                    subscriberStats: {...this.state.subscriberStats, selectedAdviceSubscribers: e.point.y}
                });
            },
            load: () => {
                console.log('Successfully loaded');
            }
        }
    })

    setSubsPerAdviceTitle = data => {
        return {
                ...this.state.subsPerAdviceConfig, 
                title: {
                    ...this.state.subsPerAdviceConfig.title,
                    text: `${data.name} <br> ${Number(data.percentage).toFixed(2)}`
                }
            }
    }
    
    handleRadioGroupChange = (e) => {
        this.setState({radioValue: e.target.value});
    }

    getUserDashboardData = () => {
        const url = `${requestUrl}/advisor/${advisorId}?dashboard=1`;
        const subsPerAdviceSeries = [];
        const subsTotalSeries = [];
        const ratingSeries = [];
        let totalSubscribers = 0;
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            subsPerAdviceSeries.push({
                type: 'pie',
                name: 'Browser share',
                data: this.processSubsPerAdvice(response.data.advices)
            });
            subsTotalSeries.push({name: 'Total Subscribers', data: this.processTotalSubscribers(response.data.analytics)});
            ratingSeries.push({name: response.data.advices[0].name, data: this.processRatingByAdvice(response.data.advices[0])});
            subsPerAdviceSeries[0].data.map(obj => {
                totalSubscribers += obj.y;
            });
            this.getAdvicePerformance(response.data.advices[0]);
            this.setState({
                selectedAdvice: response.data.advices[0].name,
                rawAdvices: response.data.advices,
                advices: this.processAdvices(this.sortAdvices(response.data.advices)),
                subsPerAdviceConfig: {
                    ...this.state.subsPerAdviceConfig, 
                    series: subsPerAdviceSeries, 
                    title: this.setSubsPerAdviceTitle({
                        name: subsPerAdviceSeries[0].data[0].name, 
                        percentage: Number((subsPerAdviceSeries[0].data[0].y / totalSubscribers) * 100).toFixed(2)
                    }).title
                },
                subsTotalConfig: {...this.state.subsTotalConfig, series: subsTotalSeries},
                ratingsConfig: {...this.state.ratingsConfig, series: ratingSeries},
                subscriberStats: {
                    selectedAdviceSubscribers: subsPerAdviceSeries[0].data[0].y, 
                    totalSubscribers
                }
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
        const responseArray = advices.map((advice, index) => {
            if (advice.analytics.length > 0) {
                return {
                    name: advice.name,
                    y: advice.analytics[advice.analytics.length - 1].numSubscribers,
                }
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
        const {subscribeScreen, subscriberStats} = this.state;
        const {totalSubscribers, selectedAdviceSubscribers} = subscriberStats;

        return (
            <Row style={{height: '380px'}}>
                <Col span={24}>
                    <Tabs defaultActiveKey="1" size="small" animated={false}>
                        <TabPane tab="Total Subscribers" key="1" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <Col span={12}>
                                <ReactHighcharts config = {this.state.subsTotalConfig} />
                            </Col>
                            <Col span={10} style={{marginRight: '20px', marginTop: '-20px'}}>
                                <Row type="flex" align="middle">
                                    <StatsMetricItem label="Subscribers" value={this.state.totalSubscriberStats.totalSubscribers}/>
                                    <StatsMetricItem label="New" value={this.state.totalSubscriberStats.newSubscribers}/>
                                </Row>
                            </Col>
                        </TabPane>
                        <TabPane tab="Subscribers / Advice" key="2" style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <Col span={12}>
                                <ReactHighcharts config = {this.state.subsPerAdviceConfig} />
                            </Col>
                            <Col span={10} style={{marginRight: '20px', marginTop: '-20px'}}>
                                <Row type="flex" align="middle">
                                    <StatsMetricItem label="Subscribers" value={selectedAdviceSubscribers}/>
                                    <StatsMetricItem label="Total Subscribers" value={totalSubscribers}/>
                                </Row>
                            </Col>
                        </TabPane>
                    </Tabs>
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
                        style={{width: 120}}
                        onChange={handleSelect}
                        size="small"
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
                        orderParam={this.state.sortBy}
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
        this.setState({sortBy: value}, () => {
            const url = `${this.state.adviceUrl}&orderParam=${this.state.sortBy}`;
            this.getAdvices(url);
        });
    }

    getAdvices = (url) => {
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            this.setState({advices: response.data, rawAdvices: response.data});
        })
        .catch(error => {
            console.log(error);
        });
    }

    renderSortingMenu = () => {
        return (
            <Select 
                    defaultValue={this.state.sortBy} 
                    style={{width: 120}} 
                    size="small"
                    onChange={this.handleSortingMenuChange}
            >
                <Option value="rating">Rating</Option>
                <Option value="return">Return</Option>
                <Option value="name">Name</Option>
                <Option value="volatility">Volatility</Option>
                <Option value="sharpe">Sharpe</Option>
                <Option value="maxloss">Max Loss</Option>
                <Option value="numFollowers">Followers</Option>
                <Option value="numSubscribers">Subscribers</Option>
                <Option value="createdDate">Created Date</Option>
            </Select>
        );
    }

    componentWillMount() {
        this.getUserDashboardData();
    }

    renderAdvices = () => {
        const advices = this.state.rawAdvices;
        return advices.map((advice, index) => {
            const returnColor = advice.latestPerformance.return < 0 ? '#ED4D4D' : '#3DC66B';
            return (
                <Row 
                        key={index} 
                        style={{marginBottom: '10px', padding: '0 20px', cursor: 'pointer'}}
                        onClick={() => this.props.history.push(`/advice/${advice._id}`)}
                >
                    <Col span={7}>
                        <ListMetricItem label="Name" value={advice.name} />
                    </Col>
                    <Col span={5}>
                        <ListMetricItem value={advice.latestPerformance.netValue} label="Net Value" />
                    </Col>
                    <Col span={6}>
                        <ListMetricItem 
                                valueColor={returnColor} 
                                value={Number(advice.latestPerformance.return).toFixed(2)} 
                                label="Return" 
                        />
                    </Col>
                    <Col span={6}>
                        <Row>
                            <Col span={24}>
                                <Rate disabled value={advice.latestAnalytics.rating / 2} />
                            </Col>
                            <Col span={24}>
                                <h3 style={listMetricItemLabelStyle}>Rating</h3>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={24} style={{backgroundColor: '#eaeaea', marginTop: '10px'}}>
                    </Col>
                </Row>
            );
        });
    }

    render() {
        const {radioValue} = this.state;

        return(
            <Row style={{paddingBottom: '20px'}}>
                {this.renderFilterModal()}
                <Col span={24}>
                    <Row>
                        <Col span={11} style={newLayoutStyle}>
                            <Row>
                                <Col span={24}>
                                    {this.renderSubscriberStatsView()}
                                </Col>
                            </Row>
                        </Col>
                        <Col span={11} offset={1} style={{...newLayoutStyle, height: '380px'}}>
                            <Row type="flex" align="middle">
                                <Col span={8}>
                                    <h3 style={{...cardHeaderStyle, marginBottom: '20px'}}>Ratings</h3>
                                </Col>
                                <Col span={6} offset={10}>
                                    {this.renderAdvicesMenu(this.handleSelectAdvice)}
                                </Col>
                            </Row>
                            <Row style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <Col span={12}>
                                    <ReactHighcharts config = {this.state.ratingsConfig} />
                                </Col>
                                <Col span={10} style={{marginRight: '20px', marginTop: '-20px'}}>
                                    <Row type="flex" align="middle">
                                        <StatsMetricItem label="Rating" value={this.state.ratingStats.currentRating}/>
                                        <StatsMetricItem label="Average Rating" value={this.state.ratingStats.averageRating}/>
                                    </Row>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col span={11} style={{...newLayoutStyle, height: '380px'}}>
                            <Row>
                                <Col span={8}>
                                    <h3 style={{...cardHeaderStyle, marginLeft: '20px', marginTop: '20px'}}>Advices</h3>
                                </Col>
                                <Col span={6} offset={10} style={{marginTop: '15px'}}>
                                    {this.renderSortingMenu()}
                                </Col>
                                {/* <Col span={4}>
                                    <Icon type="filter" onClick={this.toggleFilterModal}/>
                                </Col> */}
                            </Row>
                            <Row>
                                <Col span={24} style={{height: '340px',overflow: 'hidden', overflowY: 'scroll', marginTop: '20px'}}>
                                    {this.renderAdvices()}
                                </Col>
                            </Row>
                        </Col>
                        <Col span={11} offset={1} style={{...newLayoutStyle, height: '380px'}}>
                            <Row type="flex" align="middle">
                                <Col span={8}>
                                    <h3 style={{...cardHeaderStyle,marginTop: '20px'}}>Advice Performance</h3>
                                </Col>
                                <Col span={6} offset={10} style={{marginTop: '15px'}}>
                                    {this.renderAdvicesMenu(this.handleSelectAdvicePerformance)}
                                </Col>
                            </Row>
                            <AqHighChartMod 
                                    tickers={this.state.tickers} 
                                    navigationEnabled={false}
                                    showLegend={false}
                            />
                        </Col>
                    </Row>
                </Col>
            </Row>  
        );
    }
}

const StatsMetricItem = ({label, value}) => {
    return (
        <Col span={14} offset={10} style={{textAlign: 'right', marginBottom: '10px'}}>
            <h3 style={metricValueStyle}>{value}</h3>
            <h3 style={metricLabelStyle}>{label}</h3>
        </Col>
    );
};

const cardHeaderStyle = {
    marginTop: '10px',
    marginLeft: '10px'
};

const metricValueStyle = {
    color: '#26BABC',
    fontSize: '35px',
    fontWeight: 700
};

const metricLabelStyle = {
    color: '#6C6C6C',
    fontSize: '19px'
};
