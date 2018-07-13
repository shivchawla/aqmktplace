import * as React from 'react';
import _  from 'lodash';
import windowSize from 'react-window-size';
import {Row, Col, Spin} from 'antd';
import HighStock from '../../../containers/MyChartNew';
import {AqPerformanceMetrics} from '../../../components/AqPerformanceMetrics';
import {MetricItem} from '../../../components/MetricItem';
import {getStockData, getStockPerformance, Utils} from '../../../utils';
import {horizontalBox} from '../../../constants';

class StockPerformanceImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            series: {name: 'Stock Performance', data: []},
            loading: false,
            rollingPerformance: {},
            latestDetail: {}
        };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps.stock !== this.props.stock) {
            this.fetchStockData(nextProps.stock)
        }
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
                rollingPerformance: _.get(rollingPerformanceResponse, 'data.rollingPerformance.detail', {})
            });
        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            this.setState({loading: false});
        });

    }

    getPriceMetrics = data => {
        const latestDetail = {};
        latestDetail.ticker = data.security.ticker;
        latestDetail.exchange = data.security.exchange;
        latestDetail.close = data.latestDetail.values.Close;
        latestDetail.latestPrice = _.get(data, 'latestDetailRT.current', 0) || data.latestDetail.values.Close
        latestDetail.open = _.get(data, 'latestDetailRT.open', 0) || data.latestDetail.values.Open;
        latestDetail.low = _.get(data, 'latestDetailRT.low', 0) || data.latestDetail.values.Low;
        latestDetail.high = _.get(data, 'latestDetailRT.high', 0) || data.latestDetail.values.High;
        latestDetail.low_52w = Math.min(_.get(data, 'latestDetailRT.low', 0), data.latestDetail.values.Low_52w);
        latestDetail.high_52w = Math.max(_.get(data, 'latestDetailRT.high', 0), data.latestDetail.values.High_52w);
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
            {label: 'Close', value: _.get(latestDetail, 'close', 0)},
            {label: '52W High', value: _.get(latestDetail, 'high_52w', 0)},
            {label: '52W Low', value: _.get(latestDetail, 'low_52w', 0)},
        ];
        return (
            <Row style={{borderRadius: '4px', border: '1px solid #eaeaea', height: '100%', padding: '10px'}}>
                <Col span={24} style={{marginBottom: '5px'}}>
                    <h3>Price Metrics</h3>
                </Col>
                <Col>
                    {
                        priceMetrics.map((item, index) => {
                            return (
                                <Row key={index} style={{marginBottom: '5px'}}>
                                    <Col span={16}>{item.label}</Col>
                                    <Col span={8} style={{color: '#3B3737'}}>{this.formatPriceMetrics(item.value)}</Col>
                                </Row>
                            );
                        })
                    }
                </Col>
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
                <Col span={4}><MetricItem money value={latestPrice} label="Price" style={{border: 'none'}} /></Col>
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

    renderPageContent = () => {
        return (
            <Row style={{padding: '0 20px'}}>
                <Col style={{textAlign: 'center'}}>
                    <h3 style={{fontSize: '16px', fontWeight: '700'}}>{this.props.stock}</h3>
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    {this.renderLatestDetail()}
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    <Row gutter={24}>
                        <Col span={12} style={{height: '200px'}}>
                            <AqPerformanceMetrics 
                                rollingPerformance={this.state.rollingPerformance} 
                                style={{height: '100%'}}
                                selectedTimeline={['ytd', '1y', '2y', '5y', '10y']}
                            />
                        </Col>
                        <Col span={12} style={{height: '200px'}}>
                            {this.renderPriceMetrics()}
                        </Col>
                    </Row>
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    <HighStock series={[this.state.series]} />
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