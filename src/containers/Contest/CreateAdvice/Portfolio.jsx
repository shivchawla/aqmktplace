import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Button, Modal, Spin, Select, Tooltip} from 'antd';
import {metricColor, horizontalBox} from '../../../constants';
import {generateColorData} from '../../../utils';
import {AqStockTableMod} from '../../../components/AqStockTableMod';
import {benchmarks} from '../../../constants/benchmarks';
import MyChartNew from '../../MyChartNew';
import {HighChartNew} from '../../../components/HighChartNew';

const Option = Select.Option;

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

    renderBenchmarkDropdown = () => (
        <Select 
                defaultValue={this.state.selectedBenchmark} 
                style={{width: '150px'}}
                onChange={value => this.loadPerformance(value)}
                disabled={true}
        >
            {
                this.state.benchmarks.map((benchmark, index) => (
                    <Option key={index} value={benchmark}>{benchmark}</Option>
                ))
            }
        </Select>
    )

    togglePerformanceModal = () => {
        if (!this.state.modal.performance) {
            this.loadPerformance(this.state.selectedBenchmark);
        }
        this.setState({modal: {
            ...this.state.modal,
            performance: !this.state.modal.performance
        }});
    }

    toggleCompositionModal = () => {
        this.setState({
            modal: {
                ...this.state.modal,
                composition: !this.state.modal.composition
            }
        });
    }

    renderPositions = () => {
        const data = this.processDataForPieChart();
        return (
            <Row type="flex" justify="space-around">
                {
                    data.map((position, index) => {
                        return (
                            <Col 
                                    key={index}
                                    span={8} 
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        marginBottom: '20px',
                                        textAlign: 'center'
                                    }}
                            >
                                <h3 style={{color: '#4a4a4a', fontSize: '16px', fontWeight: 300}}>{position.y} %</h3>
                                <h3 style={{color: position.color, fontSize: '14px', fontWeight: 400}}>{position.name}</h3>
                            </Col>
                        );
                    })
                }
            </Row>
        );
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
            >
                <Spin spinning={this.state.loadingPortfolioPerformance}>
                    <Row type="flex" align="middle">
                        <Col span={14}>
                            <Row>
                                <Col span={24} style={{marginTop: '5px'}}>
                                    {this.renderMetrics()}
                                </Col>

                                <Col span={24} style={{display: 'flex', justifyContent: 'flex-end'}}>
                                    {this.renderBenchmarkDropdown()}
                                </Col>

                                <Col span={24}>
                                    <MyChartNew 
                                            series={this.state.highStockSeries} 
                                            chartId="advice-preview-performance-chart"
                                    />
                                </Col>
                            </Row>
                        </Col>
                        <Col 
                                span={10} 
                                style={{
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    padding: '0 10px',
                                    overflow: 'hidden',
                                    overflowY: 'scroll',
                                    height: '100%'
                                }}
                        >
                            <Row>
                                <Col span={24}>
                                    <HighChartNew 
                                        series={[{name: 'Portfolio Composition', data: this.processDataForPieChart(this.props.data)}]}
                                    />
                                </Col>
                                <Col span={24}>
                                    {this.renderPositions()}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Spin>
            </Modal>
        );
    }

    renderCompositionModal = () => {
        const series = [];
        
        return (
            <Modal
                    title="Composition"
                    onOk={this.toggleCompositionModal}
                    onCancel={this.toggleCompositionModal}
                    visible={this.state.modal.composition}
            >
                <Row>
                    <Col span={24}>
                        <HighChartNew 
                            series={[{name: 'Portfolio Composition', data: this.processDataForPieChart(this.props.data)}]}
                        />
                    </Col>
                </Row>
            </Modal>
        );
    }

    checkTickerForDuplications = (data, ticker) => {
        const duplicationIndexes = [];
        const nData = data.filter((dataItem, index) => {
            if (dataItem.ticker === ticker) {
                duplicationIndexes.push(index);
            }
            return dataItem.ticker === ticker
        });

        return {indexes: duplicationIndexes, length: nData.length -1}
    }

    processDataForPieChart = () => {
        let {data = []} = this.props;
        data = data.filter(item => item.shares > 0);
        const tickers = data.map(item => item.symbol);
        const colorData = generateColorData(tickers);
        let nData = data.map((item, index) => {
            const duplicateData = this.checkTickerForDuplications(data, item.ticker);
            let duplicateIndexes = duplicateData.indexes; // [0, 1, 2]
            const duplicateLength = duplicateData.length;
            let duplicateTotal = 0;
            // Removing the current index from the duplicate index array
            duplicateIndexes = duplicateIndexes.filter(duplicateIndex => {
                return duplicateIndex !== index
            });
            if (duplicateLength > 0) {
                duplicateIndexes.map(duplicateIndex => {
                    duplicateTotal += data[duplicateIndex].weight;
                });
                duplicateTotal += item.weight || 0;
            } else {
                duplicateTotal = item.weight || 0;
            }
            
            return {
                name: _.get(item, 'ticker', null),
                y: Number(duplicateTotal.toFixed(2)),
                color: colorData[_.get(item, 'ticker', null)]
            }
        });

        return _.uniqBy(nData, 'name');
    }

    render() {
        return (
            <Row style={{display: 'block'}} type="flex">
                {this.renderPerformanceModal()}
                <Col>
                    {
                        this.props.benchmark === null &&
                        <h3 style={{color: metricColor.negative}}>
                            Please choose a benchmark for your Portfolio
                        </h3>
                    }
                </Col>
                <div style={{
                            position: 'absolute', 
                            right: '0px', 
                            top: '25px',
                            zIndex: 20
                        }}>
                    
                    <Button
                            style={{
                                marginLeft: '20px'
                            }} 
                            onClick={this.togglePerformanceModal} 
                            type="secondary"
                            // disabled={this.props.verifiedPositions.length < 1}
                            disabled={this.props.getValidationErrors().length}
                            icon="area-chart"
                    >
                        PORTFOLIO OVERVIEW
                    </Button>
                    <Tooltip title="Search Stocks" placement="top">
                        <Button 
                                style={{marginLeft: '20px'}} 
                                type="primary" 
                                icon="search"
                                onClick={this.props.toggleBottomSheet}
                                disabled={this.props.benchmark === null}
                        >
                            SEARCH STOCKS
                        </Button>
                    </Tooltip>
                </div>
                <Col span={24} style={{marginTop: '20px'}}>
                    <AqStockTableMod 
                        style={{display: this.props.step >= 3 ? 'block': 'none'}}
                        onChange = {this.props.onChange}
                        data={this.props.data}
                        isUpdate={this.props.isUpdate}
                        benchmark={this.props.benchmark}
                        stockSearchFilters={this.props.stockSearchFilters}
                    />
                </Col>
            </Row>
        );
    }
}