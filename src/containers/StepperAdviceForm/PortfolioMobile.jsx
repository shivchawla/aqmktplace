import * as React from 'react';
import _ from 'lodash';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {withRouter} from 'react-router';
import {Row, Col, Modal, Spin, Select, Icon, Checkbox} from 'antd';
import {Button as MobileButton, Icon as MobileIcon} from 'antd-mobile';
import {AddPositionMobile} from './AddPositionMobile';
import {metricColor, primaryColor, horizontalBox} from '../../constants';
import {benchmarks} from '../../constants/benchmarks';
import {getStepIndex} from './steps';
import MyChartNew from '../MyChartNew';
import {MetricItem} from '../../components/MetricItem';
import { Utils } from '../../utils';

const Option = Select.Option;
// const CheckboxItem = Checkbox.CheckboxItem;

export class PortfolioMobileImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            positions: [],
            modal: {
                performance: false
            },
            loadingPortfolioPerformance: false,
            benchmarks,
            selectedBenchmark: benchmarks[0],
            highStockSeries: [],
            addPositionBottomSheetOpen: true,
            performanceBottomSheetOpen: true,
            selectedPosition: {},
            updatePosition: false,
            toBeDeletedPositions: []
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

    renderAddPositionBottomSheet = () => {
        return (
            <SwipeableBottomSheet 
                    fullScreen 
                    style={{zIndex: '10'}}
                    open={this.state.addPositionBottomSheetOpen}
                    onChange={this.toggleBottomSheet}
            >
                <AddPositionMobile
                    addPosition={this.addPosition} 
                    updatePortfolioPosition={this.props.updatePosition}
                    updatePosition={this.state.updatePosition}
                    selectedPosition={this.state.selectedPosition}
                    toggleBottomSheet={this.toggleBottomSheet}
                />
            </SwipeableBottomSheet>
        );
    }

    renderAdvicePerformanceBottomSheet = () => {
        return (
            <SwipeableBottomSheet 
                    id="performance-bottom-sheet"
                    fullScreen 
                    style={{zIndex: '10'}}
                    open={this.state.performanceBottomSheetOpen}
                    onChange={this.togglePerformanceBottomSheet}
            >
                <Spin spinning={this.state.loadingPortfolioPerformance}>
                    <Row 
                            style={{
                                height: '-webkit-fill-available'
                            }}
                    >
                        <Col 
                                style={{
                                    ...horizontalBox, 
                                    justifyContent: 'center', 
                                    position: 'relative',
                                    marginBottom: '20px',
                                    backgroundColor: primaryColor,
                                    height: '64px'
                                }}
                        >
                            <Icon 
                                type="close" 
                                style={{
                                    fontSize: '22px', 
                                    position: 'absolute', 
                                    left: 0, 
                                    zIndex: '20', 
                                    color: '#fff',
                                    marginLeft: '10px'
                                }}
                                onClick={this.togglePerformanceBottomSheet}
                            />
                            <h3 style={{fontSize: '18px', color: '#fff'}}>Advice Performance</h3>
                        </Col>
                        <Col span={24} style={{display: 'flex', justifyContent: 'flex-end', padding: '0 10px'}}>
                            {this.renderBenchmarkDropdown()}
                        </Col>
                        <Col span={24} style={{padding: '0 10px'}}>
                            <MyChartNew 
                                    series={this.state.highStockSeries} 
                                    chartId="advice-preview-performance-chart"
                            />
                        </Col>
                        {/* <Col span={24}>
                            <MobileButton 
                                    type="primary" 
                                    onClick={this.togglePerformanceBottomSheet}
                            >
                                Close
                            </MobileButton>
                        </Col> */}
                    </Row>
                </Spin>
            </SwipeableBottomSheet>
        );
    }

    addPosition = position => {
        this.props.addPosition(position);
        this.toggleBottomSheet();
    }

    toggleBottomSheet = () => {
        this.setState({addPositionBottomSheetOpen: !this.state.addPositionBottomSheetOpen});
    }

    togglePerformanceBottomSheet = () => {
        if (!this.state.performanceBottomSheetOpen) {
            this.loadPerformance(this.state.selectedBenchmark);
        }
        this.setState({performanceBottomSheetOpen: !this.state.performanceBottomSheetOpen});
    }

    addPositionHandleClick = () => {
        this.setState({updatePosition: false}, () => {
            this.toggleBottomSheet();
        });
    }

    handlePositionClick = position => {
        this.setState({selectedPosition: position, updatePosition: true}, () => {
            this.toggleBottomSheet();
        });
    }

    renderPositions = () => {
        const {positions = []} = this.props;
        return positions.map((position, index) => {
            return  <PositionItem 
                        key={index} 
                        position={position} 
                        onClick={this.handlePositionClick}
                        takeDeleteAction={this.takeDeleteAction}
                        checked={this.state.toBeDeletedPositions.filter(toBeDeletePosition => 
                            toBeDeletePosition.key === position.key)[0] !== undefined
                        }
                        bottomBorder={index !== positions.length - 1}
                        topBorder={index == 0}
                    />
        })
    }

    getTotalPortfolioValuation = () => {
        const {positions = []} = this.props;
        let totalValue = 0;
        positions.map(position => {
            totalValue += position.totalValue;
        });

        return totalValue;
    }

    takeDeleteAction = toBeDeletePosition => {
        const toBeDeletedPositions = [...this.state.toBeDeletedPositions];
        const positionIndex = _.findIndex(toBeDeletedPositions, position => position.key === toBeDeletePosition.key);
        if (positionIndex > -1) {
            toBeDeletedPositions.splice(positionIndex, 1);
            this.setState({toBeDeletedPositions: toBeDeletedPositions});
        } else {
            this.setState({toBeDeletedPositions: [...toBeDeletedPositions, toBeDeletePosition]});
        }
    }

    deletePositions = () => {
        const toBeDeletedPositions = [...this.state.toBeDeletedPositions];
        this.props.deletePositions(toBeDeletedPositions);
        this.setState({toBeDeletedPositions: []});
    }

    render() {
        const {positions = []} = this.props;

        return (
            <Col style={{display: 'block'}}>
                {this.renderAddPositionBottomSheet()}
                {this.renderAdvicePerformanceBottomSheet()}
                {this.renderPerformanceModal()}
                <Col span={24} style={{padding: '0 20px'}}>
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
                </Col>
                <Col span={24} style={{...horizontalBox, justifyContent: 'space-between', padding: '0 20px'}}>
                    <Icon 
                        type="delete" 
                        onClick={() => this.state.toBeDeletedPositions.length > 0 && this.deletePositions()} 
                        style={{
                            fontSize: '20px', 
                            color: this.state.toBeDeletedPositions.length > 0 ? metricColor.negative : '#CECECE'
                        }} 
                    />
                    <h3 style={{fontSize: '16px', marginLeft: '35px'}}>Add Positions</h3>
                    <div style={horizontalBox}>
                        <Icon 
                            onClick={this.addPositionHandleClick} 
                            type="plus-circle" 
                            style={{fontSize: '22px', fontWeight: '700', marginRight: '20px', color: primaryColor}} 
                        />
                        {
                            <Icon 
                                onClick={() => this.props.verifiedPositions.length >= 1 && this.togglePerformanceBottomSheet()} 
                                type="line-chart" 
                                style={{
                                    fontSize: '22px', 
                                    color: this.props.verifiedPositions.length >= 1 ? '#4a4a4a' : '#CECECE'
                                }}
                            />
                        }
                    </div>
                </Col>
                <Col span={24} style={{...horizontalBox, justifyContent: 'space-between', marginTop: '20px', padding: '0 20px'}}>
                    <h3 style={{fontSize: '14px'}}>
                        Num. of Stocks: 
                        &nbsp;<span style={{fontWeight: '700', fontSize: '16px'}}>{positions.length}</span>
                    </h3>
                    <h3 style={{fontSize: '14px'}}>
                        Total Value (₹): 
                        &nbsp;
                        <span style={{fontWeight: '700', fontSize: '16px'}}>
                            {Utils.formatMoneyValueMaxTwoDecimals(this.getTotalPortfolioValuation())}
                        </span>
                    </h3>
                </Col>
                <Col span={24} style={{marginTop: '10px'}}>
                    {this.renderPositions()}
                </Col>
            </Col>
        );
    }
}

export const PortfolioMobile = withRouter(PortfolioMobileImpl);

const PositionItem = ({position, onClick, takeDeleteAction, checked, bottomBorder, topBorder}) => {
    const {name = '', shares = 0, lastPrice = 0, weight = 0, totalValue = 0, key = 0, symbol} = position;

    return (
        <Row 
                style={{
                    // marginBottom: '10px',
                    // marginTop: '20px',
                    borderRadius: '2px'
                }}
        >
            <Col span={24}>
                {
                    topBorder &&
                    <div style={{height: '7px', backgroundColor: '#efeff4'}}></div>
                }
            </Col>
            <Col span={24} style={{marginTop: '10px'}}>
                <Row type="flex" align="middle" style={{padding: '0 20px'}}>
                    <Col span={2}>
                        <Checkbox 
                            style={{paddingLeft: '0px'}}
                            onChange={() => takeDeleteAction(position)}
                            checked={checked}
                        />
                    </Col>
                    <Col span={20}>
                        <h3 style={{color: primaryColor, fontSize: '16px'}}>{symbol}</h3>
                    </Col>
                    <Col span={2}>
                        <Icon 
                                onClick={() => onClick(position)}
                                style={{fontSize: '20px'}} 
                                type="edit" 
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row type="flex" align="middle" justify="space-between" style={{padding: '0 20px'}}>
                    <Col span={6}>
                        <MetricItem 
                            label="Num. of Shares"
                            value={shares}
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                            noNumeric={true}
                        />
                    </Col>
                    {/* <Col span={6}>
                        <MetricItem 
                            label="Last Price"
                            value={Number(lastPrice)}
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                            money
                        />
                    </Col> */}
                    <Col span={6}>
                        <MetricItem 
                            label="Total"
                            value={Number(totalValue.toFixed(2))}
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                            money
                        />
                    </Col>
                    <Col span={6}>
                        <MetricItem 
                            label="Weight"
                            value={weight}
                            percentage
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24} style={{marginTop: '12px'}}>
                {
                    // bottomBorder &&
                    <div style={{height: '7px', backgroundColor: '#efeff4', marginTop: '5px'}}></div>
                }
            </Col>
        </Row>
    );
}

const metricValueStyle = {
    fontSize: '18px',
    fontWeight: '400'
};

const metricLabelStyle = {
    fontSize: '12px'
};