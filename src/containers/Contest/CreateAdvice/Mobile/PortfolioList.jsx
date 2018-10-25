import * as React from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import {Motion, spring} from 'react-motion';
import {withRouter} from 'react-router';
import {Row, Col, Icon, Checkbox, Button} from 'antd';
import {UpdatePosition} from './UpdatePosition';
import {UpdateSector} from './UpdateSector';
import {metricColor, primaryColor, horizontalBox} from '../../../../constants';
import {benchmarks} from '../../../../constants/benchmarks';
import {MetricItem} from '../../../../components/MetricItem';
import {generateColorData} from '../../../../utils';
import { Utils } from '../../../../utils';


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
            selectedSector: {},
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

    handleSectorClick = sector => {
        this.setState({selectedSector: sector, updatePosition: true}, () => {
            this.toggleBottomSheet();
        })
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

    renderSectors = () => {
        const sectors = this.processDataForSectors(this.props.positions);

        return sectors.map((sector, index) => {
            return (
                <SectorItem 
                    key={index}
                    item={sector}
                    onClick={this.handleSectorClick}
                />
            );
        })
    }
    
    processDataForSectors = (data, disableTargetTotalUpdate = false) => {
        const uniqueSectors = _.uniqBy(data, 'sector').map(item => item.sector);
        return uniqueSectors.map((sector, index) => {
            const numStocks = data.filter(item => item.sector === sector).length;
            const totalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.totalValue));            
            const targetTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => Number(item.effTotal)));
            const individualTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.lastPrice))
            return {
                sector,
                targetTotal: Number(targetTotalValue.toFixed(2)),
                total: totalValue,
                weight: Number(((totalValue / this.getTotalPortfolioValuation()) * 100).toFixed(2)),
                key: sector,
                numStocks,
                individualTotalValue
            }
        })
    }

    getTotalPortfolioValuation = () => {
        const {positions = []} = this.props;
        let totalValue = 0;
        positions.map(position => {
            totalValue += position.effTotal;
        });

        return totalValue;
    }

    getPortfolioNetValue = () => {
        const {positions = []} = this.props;
        const buyNetValue = _.sum(positions.filter(position => position.buy === true).map(positon => positon.effTotal));
        const sellNetValue = _.sum(positions.filter(position => position.buy === false).map(positon => positon.effTotal));
        
        return buyNetValue - sellNetValue;
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
            <Motion style={{x: spring(this.state.addPositionBottomSheetOpen ? -162 : global.screen.height)}}>
                {
                    ({x}) => (
                        <div
                                style={{
                                    transform: `translate3d(0, ${x}px, 0)`,
                                    position: 'fixed',
                                    backgroundColor: '#fff',
                                    zIndex: '10000',
                                    height: global.screen.height
                                }}
                        >
                            {
                                this.props.portfolioStockViewMobile
                                ?   <UpdatePosition
                                        addPosition={this.addPosition} 
                                        updatePosition={this.state.updatePosition}
                                        selectedPosition={this.state.selectedPosition}
                                        toggleBottomSheet={this.toggleBottomSheet}
                                        updateSelectedPosition={this.props.updateSelectedPosition}
                                        positions={this.props.positions}
                                        maxSectorTargetTotal={this.props.maxSectorTargetTotal}
                                        maxStockTargetTotal={this.props.maxStockTargetTotal}
                                    />
                                :   <UpdateSector
                                        addPosition={this.addPosition} 
                                        selectedSector={this.state.selectedSector}
                                        toggleBottomSheet={this.toggleBottomSheet}
                                        updateSelectedPosition={this.props.updateSelectedPosition}
                                        positions={this.props.positions}
                                        onChange={this.props.onChange}
                                        maxSectorTargetTotal={this.props.maxSectorTargetTotal}
                                        maxStockTargetTotal={this.props.maxStockTargetTotal}
                                    />
                            }
                        </div>
                    )
                }
            </Motion>
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
                        <span style={{fontWeight: '700', fontSize: '16px'}}>{positions.length}</span><br></br>
                        Positions
                    </h3>
                    <h3 style={{fontSize: '14px'}}>
                        <span style={{fontWeight: '700', fontSize: '16px'}}>
                            {Utils.formatMoneyValueMaxTwoDecimals(this.getTotalPortfolioValuation())}
                        </span>
                        <br></br>
                        Gross Value (₹)
                    </h3>
                    <h3 style={{fontSize: '14px'}}>
                        <span style={{fontWeight: '700', fontSize: '16px'}}>
                            {Utils.formatMoneyValueMaxTwoDecimals(this.getPortfolioNetValue())}
                        </span>
                        <br></br>
                        Net Value (₹)
                    </h3>
                </Col>
                <Col span={24} style={{marginTop: '10px'}}>
                    {
                        this.props.portfolioStockViewMobile 
                        ?   this.renderPositions()
                        :   this.renderSectors()

                    }
                </Col>
                <Col span={24} style={{height: '60px'}}></Col>
            </Col>
        );
    }
}

export default withRouter(PortfolioListImpl);

const PositionItem = ({position, onClick, takeDeleteAction, checked, bottomBorder, topBorder}) => {
    let {
        name = '', 
        shares = 0, 
        lastPrice = 0, 
        weight = 0, 
        totalValue = 0, 
        key = 0, 
        symbol, 
        effTotal = 0,
        buy = false
    } = position;
    shares = (buy ? 1 : -1) * shares;
    weight = (buy ? 1 : -1) * weight;


    return (
        <Row 
                style={{
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
                    <Col span={24}>
                        <Tag buy={buy}/>
                    </Col>
                    <Col span={2} style={{marginTop: '4px'}}>
                        <Checkbox 
                            style={{paddingLeft: '0px'}}
                            onChange={() => takeDeleteAction(position)}
                            checked={checked}
                        />
                    </Col>
                    <Col span={19} style={{...horizontalBox, justifyContent: 'flex-start'}}>
                        <h3 style={{color: primaryColor, fontSize: '16px', marginRight: '10px'}}>{symbol}</h3>
                    </Col>
                    <Col span={3}>
                        <Button
                            size="small" 
                            onClick={() => onClick(position)}
                            style={{fontSize: '14px'}} 
                        >EDIT</Button>
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row type="flex" align="bottom" justify="space-between" style={{padding: '0 20px'}}>
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
                            label="Target Total"
                            value={effTotal}
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                            money
                        />
                    </Col>
                    <Col span={6}>
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
            <Col span={24}>
                <div style={{height: '7px', backgroundColor: '#efeff4', marginTop: '5px'}}></div>
            </Col>
        </Row>
    );
}

const SectorItem = ({item, onClick, takeDeleteAction, checked, bottomBorder, topBorder}) => {
    const {
        sector = '', 
        numStocks = 0, 
        lastPrice = 0,
        weight = 0, 
        total : totalValue = 0, 
        key = 0, 
        symbol, 
        targetTotal = 0
    } = item;

    return (
        <Row 
                style={{
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
                    <Col span={21}>
                        <h3 style={{color: primaryColor, fontSize: '16px'}}>{sector}</h3>
                    </Col>
                    <Col span={3}>
                        <Button
                            size="small" 
                            onClick={() => onClick(item)}
                            style={{fontSize: '14px'}} 
                        >
                            EDIT
                        </Button>
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <Row type="flex" align="bottom" justify="space-between" style={{padding: '0 20px'}}>
                    <Col span={6}>
                        <MetricItem 
                            label="Num. of Stocks"
                            value={numStocks}
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
                            value={`${weight} %`}
                            noNumeric
                            labelStyle={metricLabelStyle}
                            valueStyle={metricValueStyle}
                        />
                    </Col>
                </Row>
            </Col>
            <Col span={24}>
                <div style={{height: '7px', backgroundColor: '#efeff4', marginTop: '5px'}}></div>
            </Col>
        </Row>
    );
}

const Tag = ({buy = false}) => {
    return (
        <TagContainer buy={buy}>
            <TagText>{buy ? 'BUY' : 'SELL'}</TagText>
        </TagContainer>
    );
}

const TagContainer = styled.div`
    width: 45px;
    padding: 1px 10px;
    border-radius: 4px;
    background-color: ${props => props.buy ? metricColor.positive : '#ff747b'};
`;

const TagText = styled.h3`
    color: #fff;
    font-size: 12px;
`;

const metricValueStyle = {
    fontSize: '18px',
    fontWeight: '400'
};

const metricLabelStyle = {
    fontSize: '12px'
};