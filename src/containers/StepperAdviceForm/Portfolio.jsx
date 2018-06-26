import * as React from 'react';
import {Row, Col, Button, Modal, Spin, Select, Tooltip} from 'antd';
import {metricColor} from '../../constants';
import {AqStockTableMod} from '../../components/AqStockTableMod';
import {benchmarks} from '../../constants/benchmarks';
import {getStepIndex} from './steps';
import MyChartNew from '../MyChartNew';

const Option = Select.Option;

export class Portfolio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modal: {
                performance: false
            },
            loadingPortfolioPerformance: false,
            benchmarks,
            selectedBenchmark: benchmarks[0],
            highStockSeries: []
        };
    }

    loadPerformance = benchmark => {
        this.setState({loadingPortfolioPerformance: true});
        this.props.getAdvicePerformance(benchmark)
        .then(performanceData => {
            this.setState({highStockSeries: performanceData});
        })
        .catch(error => error)
        .finally(() => {
            this.setState({loadingPortfolioPerformance: false});
        })
    }

    renderBenchmarkDropdown = () => (
        <Select 
                defaultValue={this.state.selectedBenchmark} 
                style={{width: '150px'}}
                onChange={value => this.loadPerformance(value)}
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

    renderPerformanceModal = () => {
        return (
            <Modal
                    title="Performance View"
                    visible={this.state.modal.performance}
                    onOk={this.togglePerformanceModal}
                    onCancel={this.togglePerformanceModal}
                    width={980}
                    bodyStyle={{overflow: 'hidden', overflowY: 'scroll', height: '500px'}}
                    style={{top: 20}}
                    footer={null}
            >
                <Spin spinning={this.state.loadingPortfolioPerformance}>
                    <Row>
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
                </Spin>
            </Modal>
        );
    }

    shouldComponentUpdate(nextProps) {
        const portfolioStep = getStepIndex('portfolio');
        if (nextProps.step === portfolioStep) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <Row style={{display: 'block'}} type="flex">
                {this.renderPerformanceModal()}
                <div style={{
                            position: 'absolute', 
                            right: '0px', 
                            top: '25px',
                            zIndex: 20
                        }}>
                    <Tooltip title="View Portfolio Performance" placement="top">
                        <Button style={{
                                    width: '150px'}}
                                onClick={this.togglePerformanceModal} 
                                type="secondary"
                                disabled={this.props.verifiedPositions.length < 1}
                        >
                            View Performance
                        </Button>
                    </Tooltip>
                    <Tooltip title="To Other Settings" placement="top">
                        <Button style={{
                                    marginLeft: '20px',
                                    width: '75px'}} 
                                onClick={this.props.onNext} 
                                type="primary"
                        >
                            NEXT
                        </Button>
                    </Tooltip>
                </div>
                <Col span={24} style={{marginTop: '20px'}}>
                    {
                        this.props.error.show &&
                        <h3 
                                style={{
                                    color: metricColor.negative, 
                                    fontSize: '14px',
                                    marginBottom: '10px'
                                }}
                        >
                            * {this.props.error.detail}
                        </h3>
                    }
                    <AqStockTableMod 
                        style={{display: this.props.step >= 3 ? 'block': 'none'}}
                        onChange = {this.props.onChange}
                        data={this.props.data}
                        isUpdate={this.props.isUpdate}
                    />
                </Col>
            </Row>
        );
    }
}