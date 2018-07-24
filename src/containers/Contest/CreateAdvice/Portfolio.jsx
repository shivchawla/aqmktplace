import * as React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {Row, Col, Button, Modal, Spin, Select, Tooltip, Badge} from 'antd';
import {metricColor, horizontalBox, primaryColor, verticalBox} from '../../../constants';
import {generateColorData} from '../../../utils';
import {AqStockTableMod} from '../../../components/AqStockTableMod';
import PortfolioList from './Mobile/PortfolioList';
import {benchmarks} from '../../../constants/benchmarks';
import MyChartNew from '../../MyChartNew';
import {HighChartNew} from '../../../components/HighChartNew';

const Option = Select.Option;
const screenSize = {mobile: '600px', desktop: '601px'};
export class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: {
                performance: false,
                composition: false
            },
            loadingPortfolioPerformance: false,
            benchmarks,
            selectedBenchmark: benchmarks[0],
            highStockSeries: [],
            pieChartSeries: [],
            metrics: {}
        };
    }

    loadPerformance = benchmark => {
        this.setState({loadingPortfolioPerformance: true});
        this.props.getAdvicePerformance(benchmark)
        .then(data => {
            const {highStockSeries, portfolioPerformanceMetrics} = data;
            this.setState({highStockSeries, metrics: portfolioPerformanceMetrics});
        })
        .catch(error => error)
        .finally(() => {
            this.setState({loadingPortfolioPerformance: false});
        })
    }

    renderMetrics = () => {
        const style = {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '20px',
            textAlign: 'center'
        };
        const labelStyle = {color: '#4a4a4a', fontSize: '14px', fontWeight: 400};
        const textStyle = {color: '#4a4a4a', fontSize: '20px'}
        const annualReturn = (_.get(this.state, 'metrics.returns.totalreturn') * 100).toFixed(2);
        const volatility = (_.get(this.state, 'metrics.deviation.annualstandarddeviation', 0) * 100).toFixed(2);
        const maxLoss = (_.get(this.state, 'metrics.drawdown.maxdrawdown', 0) * 100).toFixed(2);

        return (
            <Row gutter={16}>
                <Col span={8} style={style}>
                    <h3 
                            style={{
                                ...textStyle, 
                                color: annualReturn < 0 ? metricColor.negative : metricColor.positive
                            }}
                    >
                        {annualReturn} %
                    </h3>
                    <h3 style={labelStyle}>Annual Return</h3>
                </Col>
                <Col span={8} style={style}>
                    <h3 style={textStyle}>{volatility} %</h3>
                    <h3 style={labelStyle}>Volatility</h3>
                </Col>
                <Col span={8} style={style}>
                    <h3 style={{...textStyle, color: metricColor.negative}}>- {maxLoss} %</h3>
                    <h3 style={labelStyle}>Max Loss</h3>
                </Col>
            </Row>
        );
    }

    togglePerformanceModal = () => {
        if (!this.state.modal.performance) {
            this.loadPerformance(this.state.selectedBenchmark);
        }
        this.setState({modal: {
            ...this.state.modal,
            performance: !this.state.modal.performance
        }});
    }
    
    renderPerformanceModal = () => {
        return (
            <Modal
                    title="Portfolio Overview"
                    visible={this.state.modal.performance}
                    onOk={this.togglePerformanceModal}
                    onCancel={this.togglePerformanceModal}
                    width={980}
                    bodyStyle={{overflow: 'hidden', overflowY: 'scroll', height: '540px'}}
                    style={{top: 20}}
                    footer={null}
                    destroyOnClose={true}
            >
                <Spin spinning={this.state.loadingPortfolioPerformance}>
                    <Row type="flex" align="middle">
                        <Col span={24}>
                            <Row>
                                <Col span={24} style={{marginTop: '5px'}}>
                                    {this.renderMetrics()}
                                </Col>
                                <Col span={24}>
                                    <MyChartNew 
                                            series={this.state.highStockSeries} 
                                            chartId="advice-preview-performance-chart"
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || (!_.isEqual(nextState, this.state))) {
            return true;
        }

        return false;
    }

    renderPortfolioTable = () => {
        return (
            <Col span={24} style={{marginTop: '20px'}}>
                <AqStockTableMod 
                    onChange = {this.props.onChange}
                    data={this.props.data}
                    isUpdate={this.props.isUpdate}
                    benchmark={this.props.benchmark}
                    stockSearchFilters={this.props.stockSearchFilters}
                />
            </Col>
        );
    }

    renderPortfolioList = () => {
        return (
            <PortfolioList 
                onChange={this.props.onChange}
                positions={this.props.data}
                isUpdate={this.props.isUpdate}
                togglePerformanceModal={this.togglePerformanceModal}
                toggleBottomSheet={this.props.toggleBottomSheet}
                updateSelectedPosition={this.props.updateIndividualPosition}
            />
        );
    }

    renderPortfolio = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => this.renderPortfolioList()}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => this.renderPortfolioTable()}
                />
            </React.Fragment>
        );
    }

    renderActionButtonsDesktop = () => {
        return (
            <div style={{
                    position: 'absolute', 
                    right: '0px', 
                    top: '25px',
                    zIndex: 20
                }}
            >
                <Button
                        style={{
                            marginLeft: '20px'
                        }} 
                        onClick={this.togglePerformanceModal} 
                        type="secondary"
                        // disabled={this.props.verifiedPositions.length < 1}
                        disabled={this.props.data.length < 1}
                        icon="area-chart"
                >
                    PERFORMANCE
                </Button>
                {
                    this.props.data.length > 0 &&
                    <Tooltip title="Search Stocks" placement="top">
                        <Button 
                                style={{marginLeft: '20px'}} 
                                type="primary" 
                                icon="plus-circle-o"
                                onClick={this.props.toggleBottomSheet}
                                disabled={this.props.benchmark === null}
                        >
                            ADD STOCKS
                        </Button>
                    </Tooltip>
                }
            </div>  
        );
    }

    renderBenchmarkDropdownDesktop = () => {
        return (
            <Col>
                {
                    this.props.benchmark === null &&
                    <h3 style={{color: metricColor.negative}}>
                        Please choose a benchmark for your Portfolio
                    </h3>
                }
            </Col>
        );
    }

    render() {
        return (
            <Row style={{display: 'block'}} type="flex">
                {this.renderPerformanceModal()}
                {this.renderBenchmarkDropdownDesktop()}
                <Media 
                    query={`(min-width: ${screenSize.desktop})`}
                    render={() => this.renderActionButtonsDesktop()}
                />
                {this.renderPortfolio()}
                {
                    this.props.data.length === 0 &&
                    <Col span={24} style={{...verticalBox, marginTop: '40px'}}>
                        <h3>Please Add Stocks to your Portfolio</h3>
                        <Button 
                                style={{marginTop: '20px', fontSize: '18px', height: '45px'}} 
                                type="primary" 
                                icon="plus-circle-o"
                                onClick={this.props.toggleBottomSheet}
                        >
                            ADD STOCKS
                        </Button>
                    </Col>
                }
            </Row>
        );
    }
}