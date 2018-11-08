import * as React from 'react';
import _  from 'lodash';
import Media from 'react-media';
import windowSize from 'react-window-size';
import {Row, Col, Spin, Tabs} from 'antd';
import {Tabs as MobileTabs} from 'antd-mobile';
import HighStock from '../../../containers/MyChartNew';
import {AqPerformanceMetrics} from '../../../components/AqPerformanceMetrics';
import {MetricItem} from '../../../components/MetricItem';
import {getStockData, getStockPerformance, Utils} from '../../../utils';
import {horizontalBox, verticalBox} from '../../../constants';

class StockPerformanceImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            series: {name: 'Stock Performance', data: []},
            loading: false,
            rollingPerformance: {},
            latestDetail: {},
            showErrorScreen: false
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.stock.symbol !== this.props.stock.symbol) {
            this.fetchStockData(nextProps.stock.symbol);
        }
    }

    componentWillMount() {
        this.props.stock.symbol !== undefined && this.fetchStockData(this.props.stock.symbol);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(!_.isEqual(nextProps, this.props) || (!_.isEqual(nextState, this.state))) {
            return true;
        }

        return false;
    }

    fetchStockData = stock => {
        this.setState({loading: true});
        Promise.all([
            getStockData(stock, 'latestDetail'),
            getStockData(stock, 'rollingPerformance'),
            getStockPerformance(stock.toUpperCase())
        ])
        .then(([latestDetailResponse, rollingPerformanceResponse, stockPerformance]) => {
            const latestDetail = latestDetailResponse.data;
            this.setState({
                latestDetail: this.getPriceMetrics(latestDetail),
                series: {...this.state.series, data: stockPerformance},
                rollingPerformance: _.get(rollingPerformanceResponse, 'data.rollingPerformance.detail', {}),
                showErrorScreen: false
            });
        })
        .catch(error => {
            const errorStatus = _.get(error, 'response.status', null);
            if (errorStatus === 400 || errorStatus === 403) {
                this.setState({showErrorScreen: true});
            }
        })
        .finally(() => {
            this.setState({loading: false});
        });

    }

    getPriceMetrics = data => {
        const latestDetail = {};
        latestDetail.ticker = data.security.ticker;
        latestDetail.exchange = data.security.exchange;
        latestDetail.close = data.latestDetail.Close;
        latestDetail.latestPrice = _.get(data, 'latestDetailRT.current', 0) || data.latestDetail.Close
        latestDetail.open = _.get(data, 'latestDetailRT.open', 0) || data.latestDetail.Open;
        latestDetail.low = _.get(data, 'latestDetailRT.low', 0) || data.latestDetail.Low;
        latestDetail.high = _.get(data, 'latestDetailRT.high', 0) || data.latestDetail.High;
        latestDetail.low_52w = Math.min(_.get(data, 'latestDetailRT.low', 0), data.latestDetail.Low_52w);
        latestDetail.high_52w = Math.max(_.get(data, 'latestDetailRT.high', 0), data.latestDetail.High_52w);
        latestDetail.changePct = _.get(data, 'latestDetailRT.changePct', 0);
        latestDetail.change = _.get(data, 'latestDetailRT.change', 0);
        latestDetail.name = data.security.detail !== undefined ? data.security.detail.Nse_Name : ' ';

        return latestDetail;
    }

    formatPriceMetrics = value => {
        return value ? Math.round(value) == value ? Utils.formatMoneyValueMaxTwoDecimals(value) : Utils.formatMoneyValueMaxTwoDecimals(Number(value.toFixed(2))) : '-';
    }

    renderPriceMetrics = () => {
        const {latestDetail = {}} = this.state;
        const priceMetrics = [
            {label: 'High', value: _.get(latestDetail, 'high', 0)},
            {label: 'Low', value: _.get(latestDetail, 'low', 0)},
            {label: 'Open', value: _.get(latestDetail, 'open', 0)},
            {label: 'Prev. Close', value: _.get(latestDetail, 'close', 0)},
            {label: '52W High', value: _.get(latestDetail, 'high_52w', 0)},
            {label: '52W Low', value: _.get(latestDetail, 'low_52w', 0)},
        ];
        return (
            <Row style={{borderRadius: '4px', height: '100%', padding: '10px'}}>
                {
                    priceMetrics.map((item, index) => {
                        return (
                            <Col key={index} span={8} style={{marginTop: '20px', textAlign: 'center'}}>
                                <h3 style={{fontSize: '18px', color: '#3b3737', fontWeight: 300}}>{this.formatPriceMetrics(item.value)}</h3>
                                <h3 style={{fontSize: '13px', color: '#000000a6'}}>{item.label}</h3>
                            </Col>
                        );
                    })
                }
            </Row>
        );
    }

    renderLatestDetail = () => {
        const {latestDetail = {}} = this.state;
        const {latestPrice = 0} = latestDetail;
        const {open = 0} = latestDetail;
        const {close = 0} = latestDetail;
        const {high = 0} = latestDetail;
        const {low = 0} = latestDetail;
        const {changePct = 0} = latestDetail;
        const {change = 0} = latestDetail;

        return (
            <Row type="flex" justify="space-between">
                <Col span={4}><MetricItem money value={latestPrice} label="Price" style={{border: 'none'}} valueStyle={{fontWeight: 300}} /></Col>
                <Col span={4}><MetricItem money value={change} label="Change" style={{border: 'none'}} /></Col>
                <Col span={4}><MetricItem percentage value={changePct} label="Change %" style={{border: 'none'}} /></Col>
                <Col span={4}><MetricItem money value={open} label="Open" style={{border: 'none'}} /></Col>
                <Col span={4}><MetricItem money value={close} label="Close" style={{border: 'none'}} /></Col>
            </Row>
        );
    }

    renderNoDataView = () => {
        return (
            <Row type="flex" align="middle" style={{height: this.props.windowHeight - 200}}>
                <Col span={24} style={{textAlign: 'center'}}>
                    <h3 style={{fontSize: '18px', fontWeight: '700'}}>
                        Please select a stock to view the performance
                    </h3>
                </Col>
            </Row>
        );
    }

    renderDesktopTabs = () => {
        const TabPane = Tabs.TabPane;

        return (
            <Tabs defaultActiveKey="1" animated={false}>
                <TabPane tab="Price Chart" key="1">
                    <Col span={24} style={{marginTop: '0px'}}>
                        <HighStock series={[this.state.series]} />
                    </Col>
                </TabPane>
                
                <TabPane tab="Price Metrics" key="2">
                    <Col span={24} style={{marginTop: '20px'}}>
                        {this.renderPriceMetrics()}
                        {/*this.renderLatestDetail()*/}
                    </Col>
                </TabPane>

                <TabPane tab="Rolling Performance" key="3">
                    <Col span={24} style={{marginTop: '20px', height:'200px'}}>
                        <AqPerformanceMetrics 
                            type="new"
                            rollingPerformance={this.state.rollingPerformance} 
                            style={{height: '100%', border:'none'}}
                            noTitle
                            selectedTimeline={['ytd', '1y', '2y', '5y', '10y']}
                        />
                        {/*<Col span={12} style={{height: '200px'}}>
                            {this.renderPriceMetrics()}
                        </Col>*/}
                    </Col>
                </TabPane>
            </Tabs>
        );
    }

    renderMobileTabs = () => {
        const tabs = [
            {title: <span>Performance</span>},
            {title: <span>Price</span>},
            {title: <span>Rolling</span>}
        ];

        return (
            <MobileTabs tabs={tabs}>
                <Col span={24} style={{marginTop: '10px'}}>
                    <HighStock series={[this.state.series]} />
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    {this.renderPriceMetrics()}
                    {/*this.renderLatestDetail()*/}
                </Col>
                <Col span={24} style={{marginTop: '20px', height:'200px'}}>
                    <AqPerformanceMetrics 
                        type="new"
                        rollingPerformance={this.state.rollingPerformance} 
                        style={{height: '100%', border:'none'}}
                        noTitle
                        selectedTimeline={['ytd', '1y', '2y', '5y', '10y']}
                    />
                    {/*<Col span={12} style={{height: '200px'}}>
                        {this.renderPriceMetrics()}
                    </Col>*/}
                </Col>
            </MobileTabs>
        );
    }

    renderPageContent = () => {
        return (
            <Col style={{padding:'0px 20px', alignItems:'center'}}>
                <Row style={{margin: '10px 0 20px 0'}}>
                    <Col style={{textAlign: 'center'}}>
                        <h3 style={{fontSize: '16px', fontWeight: '700'}}>{this.props.stock.symbol}: {this.props.stock.name}</h3>
                    </Col>
                </Row>
                {
                    this.state.showErrorScreen 
                    ?   this.showErrorScreen()
                    :   <React.Fragment>
                            <Media 
                                query='(max-width: 600px)'
                                render={() => this.renderMobileTabs()}
                            />
                            <Media 
                                query='(min-width: 601px)'
                                render={() => this.renderDesktopTabs()}
                            />
                        </React.Fragment>
                }
            </Col>
        );
    }

    showErrorScreen = () => {
        return (
            <Row>
                <Col span={24} style={verticalBox}>
                    <h3 style={{fontSize: '14px'}}>Oops, No data found.</h3>
                </Col>
            </Row>
        );
    }

    render() {
       return (
            <Spin spinning={this.state.loading}>
                {
                    this.props.stock !== ''
                    ? this.renderPageContent()
                    : this.renderNoDataView()
                }
            </Spin>
        );
    }
}

export const StockPerformance = windowSize(StockPerformanceImpl);