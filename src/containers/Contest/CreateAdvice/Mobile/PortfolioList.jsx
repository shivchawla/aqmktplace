import * as React from 'react';
import _ from 'lodash';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {withRouter} from 'react-router';
import {Row, Col, Modal, Spin, Select, Icon, Checkbox} from 'antd';
import {UpdatePosition} from './UpdatePosition';
import {SegmentedControl} from 'antd-mobile';
import {metricColor, primaryColor, horizontalBox, verticalBox} from '../../../../constants';
import {benchmarks} from '../../../../constants/benchmarks';
import MyChartNew from '../../../../containers/MyChartNew';
import {MetricItem} from '../../../../components/MetricItem';
import {HighChartNew} from '../../../../components/HighChartNew';
import {generateColorData} from '../../../../utils';
import { Utils } from '../../../../utils';

const Option = Select.Option;
// const CheckboxItem = Checkbox.CheckboxItem;

class PortfolioListImpl extends React.Component {
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

    shouldComponentUpdate(nextProps) {
        return true;
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

    addPosition = position => {
        this.props.addPosition(position);
        this.toggleBottomSheet();
    }

    toggleBottomSheet = () => {
        this.setState({addPositionBottomSheetOpen: !this.state.addPositionBottomSheetOpen});
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

    renderUpdatePositionBottomSheet = () => {
        return (
            <SwipeableBottomSheet 
                    fullScreen 
                    style={{zIndex: '10'}}
                    open={this.state.addPositionBottomSheetOpen}
                    onChange={this.toggleBottomSheet}
            >
                <UpdatePosition
                    addPosition={this.addPosition} 
                    updatePortfolioPosition={this.props.updatePosition}
                    updatePosition={this.state.updatePosition}
                    selectedPosition={this.state.selectedPosition}
                    toggleBottomSheet={this.toggleBottomSheet}
                    updateSelectedPosition={this.props.updateSelectedPosition}
                />
            </SwipeableBottomSheet>
        );
    }

    render() {
        const {positions = []} = this.props;

        return (
            <Col style={{display: 'block'}}>
                {this.renderUpdatePositionBottomSheet()}
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
                            {/* <Icon 
                                onClick={this.props.toggleBottomSheet} 
                                type="plus-circle" 
                                style={{fontSize: '22px', fontWeight: '700', marginRight: '20px', color: primaryColor}} 
                            /> */}
                            <Icon 
                                onClick={() => this.props.positions.length >= 1 && this.props.togglePerformanceModal()} 
                                type="line-chart" 
                                style={{
                                    fontSize: '22px', 
                                    color: this.props.positions.length >= 1 ? '#4a4a4a' : '#CECECE'
                                }}
                            />
                        </div>
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
                <Col span={24} style={{height: '60px'}}></Col>
            </Col>
        );
    }
}

export default withRouter(PortfolioListImpl);

const PositionItem = ({position, onClick, takeDeleteAction, checked, bottomBorder, topBorder}) => {
    const {name = '', shares = 0, lastPrice = 0, weight = 0, totalValue = 0, key = 0, symbol, effTotal = 0} = position;

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
                    <Col span={8}>
                        <MetricItem 
                            label="Num. of Shares"
                            value={shares}
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                            noNumeric={true}
                        />
                    </Col>
                    <Col span={8}>
                        <MetricItem 
                            label="Total"
                            value={Number(totalValue.toFixed(2))}
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                            money
                        />
                    </Col>
                    <Col span={8}>
                        <MetricItem 
                            label="Target Total"
                            value={effTotal}
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                            money
                        />  
                    </Col>
                    <Col span={8}>
                        <MetricItem 
                            label="Weight"
                            value={`${weight} %`}
                            // percentage
                            noNumeric
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                        />
                    </Col>
                </Row>
            </Col>
            {/* <Col span={24} style={{...verticalBox, padding: '0 20px'}}>
                <MetricItem 
                    label="Target Total"
                    value={effTotal}
                    labelStyle={metricLabelStyle}
                    valueStyle={metricValueStyle}
                    money
                />  
            </Col> */}
            <Col span={24} style={{marginTop: '12px'}}>
                <div style={{height: '7px', backgroundColor: '#efeff4', marginTop: '5px'}}></div>
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