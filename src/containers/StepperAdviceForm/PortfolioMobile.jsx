import * as React from 'react';
import _ from 'lodash';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {withRouter} from 'react-router';
import {Row, Col, Modal, Spin, Select, Icon, Checkbox} from 'antd';
import {SegmentedControl} from 'antd-mobile';
import {AddPositionMobile} from './AddPositionMobile';
import {metricColor, primaryColor, horizontalBox} from '../../constants';
import {benchmarks} from '../../constants/benchmarks';
import {getStepIndex} from './steps';
import MyChartNew from '../MyChartNew';
import {MetricItem} from '../../components/MetricItem';
import {HighChartNew} from '../../components/HighChartNew';
import {generateColorData} from '../../utils';
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
            addPositionBottomSheetOpen: false,
            performanceBottomSheetOpen: false,
            selectedPosition: {},
            updatePosition: false,
            toBeDeletedPositions: [],
            performanceSheetView: 'Performance',
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

    handlePerformanceBottomSheetChange = value => {
        console.log(value);
        this.setState({
            performanceSheetView: value
        })
    }

    renderComposition = () => {
        return (
            <HighChartNew 
                series={[{name: 'Portfolio Composition', data: this.processDataForPieChart()}]}
            />
        );
    }

    renderMetrics = () => {
        const style = {
            display: 'flex',
            flexDirection: 'column',
            marginBottom: '20px',
            textAlign: 'center'
        };
        const labelStyle = {color: '#4a4a4a', fontSize: '14px'};
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

    renderCompositionList = () => {
        const data = this.processDataForPieChart();
        return (
            <Row type="flex" align="middle" justify="center">
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
                                <h3 style={{color: '#4a4a4a', fontSize: '16px'}}>{position.y} %</h3>
                                <h3 style={{color: position.color, fontSize: '14px'}}>{position.name}</h3>
                            </Col>
                        );
                    })
                }
            </Row>
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
        let data = this.props.positions || [];
        data = data.filter(item => item.shares > 0);
        const tickers = data.map(item => item.symbol);
        const colorData = generateColorData(tickers);
        let nData = data.map((item, index) => {
            const duplicateData = this.checkTickerForDuplications(data, item.symbol);
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
                duplicateTotal += item.weight;
            } else {
                duplicateTotal = item.weight;
            }
            
            return {
                name: _.get(item, 'symbol', null),
                y: Number((duplicateTotal * 100).toFixed(2)),
                color: colorData[_.get(item, 'symbol', null)]
            }
        });

        return _.uniqBy(nData, 'name');
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
                                    backgroundColor: '#fff',
                                    height: '64px',
                                    borderBottom: '1px solid #eaeaea'
                                }}
                        >
                            <Icon 
                                type="close" 
                                style={{
                                    fontSize: '22px', 
                                    position: 'absolute', 
                                    left: 0, 
                                    zIndex: '20', 
                                    color: primaryColor,
                                    marginLeft: '10px'
                                }}
                                onClick={this.togglePerformanceBottomSheet}
                            />

                            <SegmentedControl 
                                onValueChange={this.handlePerformanceBottomSheetChange} 
                                values={['Performance', 'Composition']} 
                            />

                        </Col>
                        {/*<Col span={24} style={{padding: '0 10px', marginBottom: '20px'}}>
                            
                        </Col>*/}
                        
                        {
                            this.state.performanceSheetView === 'Performance' &&
                            <Col span={24} style={{marginTop: '5px'}}>
                                {this.renderMetrics()}
                            </Col>
                        }

                        {
                            this.state.performanceSheetView === 'Performance' &&
                            <Col span={24} style={{display: 'flex', justifyContent: 'flex-end', padding: '0 10px'}}>
                                {this.renderBenchmarkDropdown()}
                            </Col>
                        }

                        <Col span={24} style={{padding: '0 10px'}}>
                            {
                                this.state.performanceSheetView === 'Performance'
                                ?   <MyChartNew 
                                            series={this.state.highStockSeries} 
                                            chartId="advice-preview-performance-chart"
                                    />
                                :   <Row>
                                        <Col span={24}>
                                            {this.renderComposition()}
                                        </Col>
                                        <Col span={24}>
                                            {this.renderCompositionList()}
                                        </Col>
                                    </Row>
                            }
                            
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
        } else {
            this.setState({performanceSheetView: 'Performance'})
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
                <Col 
                        span={24} 
                        style={{
                            ...horizontalBox,
                            justifyContent: 'center',
                            background: '#fff',
                            borderBottom: '1px solid #DFDFDF',
                            height: '50px',
                            marginTop: '-11px',
                        }}
                >
                    <div
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between', 
                                margin: '10px',
                                background: '#f5f5f5',
                                borderRadius: '4px',
                                height: '35px',
                                padding: '0 10px',
                                width: '100%'
                            }}
                    >
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
                    </div>
                </Col>
                {/* <Col 
                        span={24} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'space-between', 
                            padding: '0 20px',
                            height: '40px',
                            background: '#efeff4',
                            marginTop: '-11px',
                            borderBottom: '1px solid #DFDFDF'
                        }}
                >
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
                </Col> */}
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
                <Col span={24} style={{padding: '0 20px'}}>
                    {
                        this.props.error.show &&
                        <h3 
                                style={{
                                    color: metricColor.negative, 
                                    fontSize: '14px',
                                    marginBottom: '10px',
                                    textAlign: 'center',
                                    marginTop: '20px'
                                }}
                        >
                            * {this.props.error.detail}
                        </h3>
                    }
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