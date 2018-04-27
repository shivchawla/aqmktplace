import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router';
import {Icon, Button, Input, AutoComplete, Spin, Row, Col, Card, Tabs, Radio, Modal, message} from 'antd';
import {List} from 'immutable';
import {AqLink, DashboardCard, AqPageHeader, WatchList, CreateWatchList} from '../components';
import {pageTitleStyle, newLayoutStyle, shadowBoxStyle, loadingColor} from '../constants';
import {getStockData, Utils, getBreadCrumbArray} from '../utils';
import {MyChartNew} from '../containers/MyChartNew';
import '../css/stockResearch.css';

const RadioButton = Radio.Button;
const {requestUrl} = require('../localConfig');
const RadioGroup = Radio.Group;
const Option = AutoComplete.Option;
const TabPane = Tabs.TabPane;

class StockResearchImpl extends React.Component {
    socketOpenConnectionTimeout = 1000;
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;
    reconnecting = false;
    constructor(props) {
        super(props);
        this.state = {
            tickers: [
                // {name: 'TCS', show: true},
            ],
            tickerName: '',
            dataSource: [],
            spinning: false,
            loadingData: true,
            latestDetail: {
                latestPrice: 0,
                ticker: 'TCS',
                exchange: '',
                closePrice: 0,
                change: '',
                high: 0,
                low: 0,
                close: 0,
                open: 0,
                low_52w: 0,
                high_52w:0,
                name: ''
            },
            rollingPerformance: {},
            selectedPerformanceScreen: 'YTD',
            show: false,
            watchlists: [],
            watchlistModalVisible: false,
            createWatchlistSecurities: [],
            // appInitialized: false
            selectedWatchlistTab: '',
            isDeleteModalVisible: false
        }; 
    }

    addItem = (tickerName = this.state.tickerName) => {
        const tickers = [...this.state.tickers];
        tickers.push({name: tickerName, show: true, data: []});
        this.setState({tickers});
    }

    deleteItem = name => {
        const tickers = [...this.state.tickers];
        const index = _.findIndex(tickers, item => item.name === name);
        tickers.splice(index, 1);
        this.setState({tickers});
    }

    handleSearch = query => {
        this.setState({spinning: true});
        const url = `${requestUrl}/stock?search=${query}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)})
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
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

    onSelect = (value, initialCall = false) => {
        const {latestDetail} = this.state;
        let tickers = [];
        tickers.push({name: value, destroy: true});
        this.setState({tickers, show: true});
        console.log('Initial Call' , initialCall);
        if (initialCall === false) {
            //this.unSubscribeToStock(this.state.latestDetail.ticker);
        }
        getStockData(value, 'latestDetail')
        .then(response => {
            const {data} = response;
            latestDetail.ticker = data.security.ticker;
            latestDetail.exchange = data.security.exchange;
            latestDetail.close = data.latestDetail.values.Close;
            latestDetail.latestPrice = _.get(data, 'latestDetailRT.current', 0) || data.latestDetail.values.Close
            latestDetail.open = _.get(data, 'latestDetailRT.open', 0) || data.latestDetail.values.Open;
            latestDetail.low = _.get(data, 'latestDetailRT.low', 0) || data.latestDetail.values.Low;
            latestDetail.high = _.get(data, 'latestDetailRT.high', 0) || data.latestDetail.values.High;
            latestDetail.low_52w = Math.min(_.get(data, 'latestDetailRT.low', 0), data.latestDetail.values.Low_52w);
            latestDetail.high_52w = Math.max(_.get(data, 'latestDetailRT.high', 0), data.latestDetail.values.High_52w);
            latestDetail.change = _.get(data, 'latestDetailRT.current', 0) != 0.0 ?  Number(((_.get(data, 'latestDetailRT.changePct', 0) || data.latestDetail.values.ChangePct)*100).toFixed(2)) : "-";

            latestDetail.name = data.security.detail !== undefined ? data.security.detail.Nse_Name : ' ';
            
            this.setState({latestDetail}, () => {
                // Subscribing to real-time data
                if (!this.props.openAsDialog) {
                    this.setUpSocketConnection();
                }
            });
            return getStockData(value, 'rollingPerformance');
        })
        .then(response => {
            this.setState({rollingPerformance: response.data.rollingPerformance.detail});
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loadingData: false, show: false});
        });
    }

    renderRollingPerformanceData = key => {
        const {rollingPerformance} = this.state;
        if(rollingPerformance[key]) {
            const ratios = rollingPerformance[key].ratios;
            const returns = rollingPerformance[key].returns;
            const deviation = rollingPerformance[key].deviation;
            const drawdown = rollingPerformance[key].drawdown;
            const metricsData = [
                {label: 'Ann. Return', value: `${(returns.annualreturn * 100).toFixed(2)} %`},
                {label: 'Volatility', value: `${(deviation.annualstandarddeviation * 100).toFixed(2)} %`},
                {label: 'Beta', value: ratios.beta},
                {label: 'Sharpe Ratio', value: ratios.sharperatio},
                {label: 'Alpha', value: `${(ratios.alpha * 100).toFixed(2)} %`},
                {label: 'Max Loss', value: `${(drawdown.currentdrawdown * 100).toFixed(2)} %`},
            ];

            return this.renderPerformanceMetricsItems(metricsData);
        }

        return <h3>No Data</h3>;
    }

    handlePerformanceScreenChange = e => {
        this.setState({selectedPerformanceScreen: e.target.value});
    }

    componentWillReceiveProps(nextProps) {
        if ((this.props.openAsDialog) && this.props.ticker !== nextProps.ticker) {
            this.onSelect(nextProps.ticker);
        }
    }

    componentWillMount() {
        this.mounted = true;
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            // this.setUpSocketConnection();
            if (!this.props.openAsDialog) {
                this.getWatchlists();
                this.onSelect("TCS", true);
            } else {
                this.onSelect(this.props.ticker, true);
            }
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.unSubscribeToStock(this.state.latestDetail.ticker);
        this.unsubscribeToWatchlist(this.state.selectedWatchlistTab);
    }

    formatPriceMetrics = value => {
        return value ? Math.round(value) == value ? Utils.formatMoneyValueMaxTwoDecimals(value) : Utils.formatMoneyValueMaxTwoDecimals(Number(value.toFixed(2))) : '-';
    }

    renderPriceMetrics = metrics => {
        return metrics.map((item, index) => {
            return (
                <Row key={index} style={{marginBottom: '5px'}}>
                    <Col span={16}>{item.label}</Col>
                    <Col span={8} style={{color: '#3B3737'}}>{this.formatPriceMetrics(item.value)}</Col>
                </Row>
            );
        });
    }

    renderPerformanceMetricsItems = metrics => {
        return (
            <Row style={{marginTop: '10px'}}>
                {
                    metrics.map((item, index) => {
                        return (
                            <Col span={12} key={index} style={{marginBottom: '10px'}}>
                                <Row>
                                    <Col span={14}>{item.label}</Col>
                                    <Col span={10} style={{color: '#3B3737'}}>{item.value}</Col>
                                </Row>
                            </Col>
                        );
                    })
                }
            </Row>
        );
    }

    renderPriceMetricsTimeline = timelineArray => (
        <RadioGroup 
                onChange={this.handlePerformanceScreenChange} 
                defaultValue={timelineArray[0]}
                size="small"
                style={{fontSize: '12px', height: '22px'}}
        >
            {
                timelineArray.map((item, index) => (
                    <RadioButton key={index} value={item}>{item}</RadioButton>
                ))
            }
        </RadioGroup>
    )

    renderPerformanceMetrics = () => {
        const selectedScreen = this.state.selectedPerformanceScreen;
        
        return this.renderRollingPerformanceData(selectedScreen.toLowerCase());
    }

    renderOption = item => {
        return (
            <Option key={item.id} value={item.symbol}>
                <Row style={{marginBottom: '10px'}}>
                    <Col span={8}>
                        <span style={{textAlign: 'left', fontSize: '14px'}}>{item.symbol}</span>
                    </Col>
                    <Col span={8} offset={6}>
                        <span style={{textAlign: 'left', fontSize: '14px'}}>{item.name}</span>
                    </Col>
                </Row>
            </Option>
        );
    }

    setUpSocketConnection = () => {
        Utils.webSocket.onmessage = this.processRealtimeMessage;
        Utils.webSocket.onopen = () => {
            this.takeAction();
        };
        this.takeAction();
    }

    takeAction = () => {
        if (this.mounted) {
            this.subscribeToStock(this.state.latestDetail.ticker);
            this.subscribeToWatchList(this.state.selectedWatchlistTab);
        } else {
            this.unSubscribeToStock(this.state.latestDetail.ticker);
            this.state.watchlists.map(item => {
                this.unsubscribeToWatchlist(this.state.selectedWatchlistTab);
            });
        }
    }

    processRealtimeMessage = msg => {
        if (this.mounted) {
            try {
                const realtimeResponse = JSON.parse(msg.data);
                if (realtimeResponse.type === 'stock' && realtimeResponse.ticker === this.state.latestDetail.ticker) {
                    this.setState({
                        latestDetail: {
                            ...this.state.latestDetail,
                            latestPrice: _.get(realtimeResponse, 'output.current', 0),
                            change: _.get(realtimeResponse, 'output.current', 0) != 0.0 ? (_.get(realtimeResponse, 'output.changePct', 0) * 100).toFixed(2) : "-"
                        }
                    });
                } else {
                    const watchlists = [...this.state.watchlists];
                    // Getting the required wathclist
                    const targetWatchlist = watchlists.filter(item => item.id === realtimeResponse.watchlistId)[0];
                    if (targetWatchlist) {
                        // Getiing the required security to update
                        const targetSecurity = targetWatchlist.positions.filter(item => item.name === realtimeResponse.ticker)[0];
                        if (targetSecurity) {
                            targetSecurity.change = (_.get(realtimeResponse, 'output.changePct', 0) * 100).toFixed(2)
                            targetSecurity.price = _.get(realtimeResponse, 'output.current', 0),
                            this.setState({watchlists});
                        }
                    }
                }
            } catch(error) {

            }
        } else {
            this.unSubscribeToStock(this.state.latestDetail.ticker);
        }
    }

    subscribeToStock = ticker => {
        console.log('Subscription Started');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    unSubscribeToStock = ticker => {
        console.log('Unsubscription Started');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'stock',
            'ticker': ticker
        };
        Utils.sendWSMessage(msg);
    }

    subscribeToWatchList = watchListId => {
        console.log('Subscription Started to Watchlist');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'subscribe-mktplace',
            'type': 'watchlist',
            'watchlistId': watchListId
        };
        Utils.sendWSMessage(msg); 
    }

    unsubscribeToWatchlist = watchListId => {
        console.log('Un Subscription Started');
        const msg = {
            'aimsquant-token': Utils.getAuthToken(),
            'action': 'unsubscribe-mktplace',
            'type': 'watchlist',
            'watchlistId': watchListId
        };
        Utils.sendWSMessage(msg);
    }

    toggleWatchListModal = () => {
        this.setState({watchlistModalVisible: !this.state.watchlistModalVisible});
    }

    getWatchlists = () => {
        const url = `${requestUrl}/watchlist`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            const watchlists = this.processWatchlistData(response.data);
            this.setState({watchlists, selectedWatchlistTab: watchlists[0].id});
        })
        .catch(error => {
            console.log(error);
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    }

    getWatchlist = id => {
        const url = `${requestUrl}/watchlist/${id}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.subscribeToWatchList(id);
            const watchlists = [...this.state.watchlists];
            const targetWatchlist = watchlists.filter(item => item.id === id)[0];
            targetWatchlist.positions = response.data.securities.map(item => {
                return {
                    name: item.ticker,
                    change: Number(((_.get(item, 'realtime.changePct', 0.0) || _.get(item, 'eod.ChangePct', 0.0))*100).toFixed(2)) ,
                    price: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0)
                }
            });
            this.setState({watchlists});
        })
        .catch(error => {
            console.log(error);
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
    }

    processWatchlistData = watchlistResponse => {
        return watchlistResponse.map(item => {
            return {
                name: item.name,
                positions: item.securities.map(item => {
                    return {
                        name: item.ticker,
                        change: Number(((_.get(item, 'realtime.changePct', 0.0) || _.get(item, 'eod.ChangePct', 0.0))*100).toFixed(2)),
                        price: _.get(item, 'realtime.current', 0.0) || _.get(item, 'eod.Close', 0.0)
                    }
                }),
                id: item._id
            };
        });
    }

    renderCreateWatchListModal = () => {
        return (
            <CreateWatchList 
                    visible={this.state.watchlistModalVisible} 
                    toggleModal={this.toggleWatchListModal} 
                    getWatchlists={this.getWatchlists}
            />
        );
    }

    toggleDeleteModalVisible = () => {
        this.setState({isDeleteModalVisible: !this.state.isDeleteModalVisible});
    }

    renderDeleteModal = () => {
        return (
            <Modal
                    visible={this.state.isDeleteModalVisible}
                    onCancel={this.toggleDeleteModalVisible}
                    onOk={() => this.deleteWatchlist(this.state.selectedWatchlistTab)}
                    title='Delete Watchlist'
            >
                <h3>Are you sure you want to delete this watchlist</h3>
            </Modal>
        );
    }

    deleteWatchlist = id => {
        const url = `${requestUrl}/watchlist/${id}`;
        axios({
            url,
            headers: Utils.getAuthTokenHeader(),
            method: 'DELETE'
        })
        .then(response => {
            message.success('Watchlist successfully deleted');
            this.getWatchlists();
            if (this.state.watchlists.length > 0) {
                this.subscribeToWatchList(this.state.watchlists[0].id);
            }
            this.toggleDeleteModalVisible();
        })
        .catch(error => {
            console.log(error);
            message.error('Error occured while deleting watchlist. Please try again');
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
    }

    handleWatchlistTabChange = key => {
        const previousWatchListId = this.state.selectedWatchlistTab;
        const currentWatchListId = key;
        if (previousWatchListId.length > 0) {
            this.unsubscribeToWatchlist(previousWatchListId);
        }
        this.subscribeToWatchList(currentWatchListId);
        this.setState({selectedWatchlistTab: currentWatchListId});
    }

    renderWatchlistTabs = () => {
        const watchlists = this.state.watchlists;
        return watchlists.map(item => {
            const tickers = item.positions.map(it => {return {name: it.name, y: it.price, change:it.change, hideCheckbox: true}});
            return (
                <TabPane key={item.id} tab={item.name}>
                    <Col span={24}>
                        <WatchList 
                            tickers={tickers} 
                            id={item.id} 
                            name={item.name} 
                            getWatchlist={this.getWatchlist}
                        />
                    </Col>
                </TabPane>
            );
        })
    }

    watchlistTabBarExtraContent = () => {
        return (
            <div style={{display: 'flex', flexDirection: 'row', alignItems: 'middle'}}>
                <Icon 
                        onClick={() => this.toggleDeleteModalVisible(this.state.selectedWatchlistTab)} 
                        type="delete" 
                        style={{fontSize: '18px', color: '#F44336', cursor: 'pointer'}} 
                />
                <Icon 
                        onClick={this.toggleWatchListModal}
                        type="plus-circle-o" 
                        style={{fontSize: '18px', color: '#009688', cursor: 'pointer', marginLeft: '8px'}} 
                />
            </div>
        );
    }

    renderPageContent = () => {
        const {dataSource, latestDetail} = this.state;
        const breadCrumbs = getBreadCrumbArray([{name: 'Stock Research'}]);
        
        const priceMetrics = [
            {label: 'High', value: latestDetail.high},
            {label: 'Low', value: latestDetail.low},
            {label: 'Open', value: latestDetail.open},
            {label: 'Close', value: latestDetail.close},
            {label: '52W High', value: latestDetail.high_52w},
            {label: '52W Low', value: latestDetail.low_52w},
        ];
        const performanceMetricsTimeline = ['YTD', '1Y', '2Y', '5Y', '10Y'];
        const percentageColor = latestDetail.change < 0 ? '#FA4747' : '#3EBB72';
        const spinIcon = <Icon type="loading" style={{ fontSize: 16, marginRight: '5px' }} spin />;
        const deleteIcon = <Icon 
                        onClick={() => this.deleteWatchlist(this.state.selectedWatchlistTab)} 
                        type="delete" 
                        style={{fontSize: '18px', color: '#F44336', cursor: 'pointer'}} 
                />;
        // chartId is required so that we have the option to have multiple HighStock component in the same page with different Id
        const {xl=18, chartId='highchart-container'} = this.props; 

        return (
            <React.Fragment>
                {
                    !this.props.openAsDialog &&
                    <React.Fragment>
                        <AqPageHeader title="Stock Research" breadCrumbs = {breadCrumbs}/>
                    </React.Fragment>
                }
                <Row type="flex" justify="space-between">
                <Col xl={xl} md={24} style={{...shadowBoxStyle, ...this.props.style}}>
                    {this.renderDeleteModal()}
                    <Row style={metricStyle}>
                        {
                            !this.props.openAsDialog &&
                            <Col span={24}>
                                <AutoComplete
                                    size="large"
                                    style={{ width: '100%' }}
                                    dataSource={dataSource.map(this.renderOption)}
                                    onSelect={value => this.onSelect(value)}
                                    onSearch={this.handleSearch}
                                    placeholder="Search stocks"
                                    optionLabelProp="value"
                                >
                                    <Input 
                                        suffix={(
                                            <div>
                                                <Spin indicator={spinIcon} spinning={this.state.spinning}/>
                                                <Icon style={searchIconStyle} type="search" />
                                            </div>
                                        )} />
                                </AutoComplete>
                            </Col>
                        }
                    </Row>
                    <Row style={metricStyle} type="flex" justify="space-between">
                        <Col span={7} style={cardStyle}>
                            <h3 style={{fontSize: '14px'}}>{latestDetail.name}</h3>
                            <h1 style={{...tickerNameStyle, marginTop: '10px'}}>
                                <span>{latestDetail.exchange}:</span>
                                <span style={{fontSize: '20px'}}>{latestDetail.ticker}</span>
                            </h1>
                            <h3 style={lastPriceStyle}>
                                {Utils.formatMoneyValueMaxTwoDecimals(latestDetail.latestPrice)} 
                                <span style={{...changeStyle, color: percentageColor, marginLeft: '5px'}}>{latestDetail.change} %</span>
                            </h3>
                            <h5 
                                    style={{fontSize: '12px', fontWeight: 400, color: '#000', position: 'absolute', bottom: '10px', paddingRight: '10px'}}
                            >
                                * Data is delayed by 15 min
                            </h5>
                        </Col>
                        <Col span={6} style={cardStyle}>
                            <h3 style={cardHeaderStyle}>Price Metrics</h3>
                            {this.renderPriceMetrics(priceMetrics)}
                        </Col>
                        <Col span={10} style={cardStyle}>
                            <Row>
                                <Col span={24}>
                                    <h3 style={cardHeaderStyle}>Performance Metrics</h3>
                                </Col>
                                <Col span={24} style={{textAlign: 'right'}}>
                                    {this.renderPriceMetricsTimeline(performanceMetricsTimeline)}
                                </Col>
                                <Col span={24}>
                                    {this.renderPerformanceMetrics()}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row style={metricStyle}>  
                        <DashboardCard 
                                xl={24} 
                                title="Performance" 
                                headerStyle={{borderBottom: '1px solid #eaeaea'}}
                                contentStyle={{height: '405px', marginTop: '10px'}}
                        >
                            <MyChartNew 
                                    series = {this.state.tickers} 
                                    deleteItem = {this.deleteItem}
                                    addItem = {this.addItem}
                                    verticalLegend = {true}
                                    chartId={chartId}
                            /> 
                        </DashboardCard>
                    </Row>
                </Col>
                {
                    !this.props.openAsDialog &&
                    <Col span={6}>
                    <div style={{...shadowBoxStyle, width: '95%', height: '300px', padding:'0px 10px', marginLeft: 'auto'}}>
                        {/* <Button type="primary" onClick={this.toggleWatchListModal}>Create Watchlist</Button> */}
                        <Col 
                                span={24} 
                                style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', padding: '10px 5px'}}
                        >
                            <h3 style={{fontSize: '16px', display: 'inline-block'}}>Watchlist</h3>
                            {this.watchlistTabBarExtraContent()}
                        </Col>
                        <Col span={24}>
                            <Tabs 
                                    onChange={this.handleWatchlistTabChange} 
                                    // tabBarExtraContent={this.watchlistTabBarExtraContent()}
                                    tabBarStyle={{
                                        display: 'flex',
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        alignContent: 'center'
                                    }}
                            >
                                {this.renderWatchlistTabs()}
                            </Tabs>
                        </Col>
                    </div>
                    </Col>
                    
                }
                </Row>
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                {this.renderCreateWatchListModal()}
                <Loading
                    show={this.state.show}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                {
                    !this.state.show &&
                    this.renderPageContent()
                }
            </React.Fragment>
        );
    }
}

export const StockResearch = withRouter(StockResearchImpl);

const metricStyle = {
    // marginTop: '20px',
    padding: '15px 20px 0px 20px',
    //paddingBottom:'0px',
};

const tickerNameStyle = {
    fontSize: '16px',
    color: '#3B3737',
    fontWeight: 400
};

const lastPriceStyle = {
    fontSize: '40px',
    color: '#585858',
    fontWeight: 400
};

const changeStyle = {
    fontSize: '16px'
};

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};

const cardStyle = {
    border: '1px solid #eaeaea',
    padding: '10px',
    borderRadius: '4px',
};

const cardHeaderStyle = {
    marginBottom: '5px'
};