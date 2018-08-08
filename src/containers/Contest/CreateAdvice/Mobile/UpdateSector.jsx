import * as React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Row, Col, Spin, AutoComplete, Input, Icon} from 'antd';
import {Button as MobileButton, InputItem} from 'antd-mobile';
import {fetchAjax, getStockData, Utils, openNotification} from '../../../../utils';
import {horizontalBox, primaryColor} from '../../../../constants';
import { Item } from '../../../../../node_modules/antd-mobile/lib/tab-bar';

const {requestUrl} = require('../../../../localConfig');
const AutocompleteOption = AutoComplete.Option;
const spinIcon = <Icon type="loading" style={{ fontSize: 16, marginRight: '5px' }} spin />;
const defaultStockData = {
    sector: '-',
    numStocks: '-',
    targetTotal: 0,
    total: 0,
    weight: 0,
};

class UpdateSectorMobileImpl extends React.Component {
    constructor(props) {
        super(props);
        this.autoCompleteElemet = null
        this.sharesTextInput = null;
        this.state = {
            dataSource: [],
            spinning: false,
            stockData: defaultStockData,   
            toggleEdit: true,
            searchInputValue: '',
            loadingStockDetails: false,
            positions: this.props.positions
        }
    }

    componentWillReceiveProps(nextProps) {
        this.setState({
            stockData: nextProps.selectedSector,
            positions: nextProps.positions
        });
    }

    handleTargetTotalChange = value => {
        const oldTotal = _.get(this.state, 'stockData.targetTotal', 0);
        const totalPortfolioNetValue = _.sum(this.state.positions.map(position => position.totalValue));
        this.calculateEffectiveTotal(Number(oldTotal), Number(value))
        .then(({sectorTotal, portfolioTotal}) => {
            const portfolioTotalValue = portfolioTotal === 0 ? 1 : portfolioTotal;
            this.setState({
                stockData: {
                    ...this.state.stockData,
                    targetTotal: value,
                    total: sectorTotal,
                    weight: Number(((sectorTotal / portfolioTotalValue) * 100).toFixed(2))
                }
            })
        });
    }

    calculateEffectiveTotal = (oldTargetTotal, currentTargetTotal) => {
        const {positions = []} = this.state;
        const sector = _.get(this.state, 'stockData.sector', '');
        // Positions that belongs to the required sector
        const requiredPositions = positions.filter(position => position.sector === sector);
        return Promise.map(positions, position => {
            if (position.sector === sector) {
                const effTotal = oldTargetTotal > 0 && position.effTotal > 0
                    ? position.effTotal * (currentTargetTotal / oldTargetTotal)
                    : currentTargetTotal / requiredPositions.length;

                return this.modifyPositionFromTargetTotal(position, effTotal);
            } else {
                return position;
            }            
        })
        .then(positions => this.updateStockWeights(positions))
        .then(positions => {
            this.setState({positions});
            return {
                sectorTotal: _.sum(positions.filter(position => position.sector === sector).map(position => position.totalValue)),
                portfolioTotal: _.sum(positions.map(position => position.totalValue))
            };
        })
        .catch(err => console.log(err))
    }

    updateStockWeights = (data) => new Promise((resolve, reject) => {
        let totalPortfolioValue = _.sum(data.map(item => item.totalValue));
        totalPortfolioValue = totalPortfolioValue === 0 ? 1 : totalPortfolioValue;

        resolve (data.map(item => {
            return {
                ...item,
                weight: Number(((item.totalValue / totalPortfolioValue * 100)).toFixed(2))
            }
        }));
    })

    modifyPositionFromTargetTotal = (item, effTotal) => {
        const shares = Math.floor(effTotal / item.lastPrice);
        const totalValue = shares * item.lastPrice;

        return {
            ...item,
            effTotal: Number(effTotal.toFixed(2)),
            shares,
            totalValue
        }
    }

    clearPageDetails = callback => {
        this.setState({
            stockData: defaultStockData,
            searchInputValue: '',
            dataSource: []
        }, () => {
            callback && callback();
        });
    }

    addPosition = () => {
        this.props.addPosition({...this.state.stockData, key: Math.random().toString(36)});
        this.clearPageDetails();
    }

    updatePosition = () => {
        const stockData = {...this.state.stockData};
        this.props.onChange(this.state.positions);
        this.clearPageDetails(this.props.toggleBottomSheet);
    }

    cancelAction = () => {
        this.clearPageDetails(this.props.toggleBottomSheet);
    }

    render() {
        const {sector, numStocks, targetTotal, total, weight} = this.state.stockData;

        return (
            <Row style={{height: '100%', position: 'relative'}}>
                <div 
                        span={24} 
                        style={{
                            ...horizontalBox, 
                            justifyContent: 'center', 
                            position: 'relative',
                            backgroundColor: '#fff',
                            height: '64px',
                            alignItems: 'center',
                            WebkitAlignItems: 'center',
                            width: '100%',
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
                        onClick={this.cancelAction}
                    />
                    <h3 style={{fontSize: '18px', color: primaryColor}}>
                        Update Sector
                    </h3>
                </div>
                <Col span={24} style={{marginTop: '20px', padding: '0 10px'}}>
                    <Row>
                        <Col span={24}>
                            <StockDetailComponent label="Sector" value={sector} />
                        </Col>
                        <Col span={24}>
                            <StockDetailComponent label="No. of Stocks" value={numStocks} valueStyle={{color: primaryColor}}/>
                        </Col>
                        <Col span={24}>
                            <Row type="flex" align="middle" style={{marginBottom: '20px'}}>
                                <Col span={8}>
                                    <h3 style={{fontSize: '16px', color: '#4A4A4A'}}>Target Total</h3>
                                </Col>
                                <Col span={16} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                    <div style={horizontalBox}>
                                        <InputItem 
                                            type="number"
                                            value={targetTotal} 
                                            onChange={this.handleTargetTotalChange}
                                            style={{paddingLeft: '0px'}}
                                            ref={el => this.sharesTextInput = el}
                                        />
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                        <Col span={24}>
                            <StockDetailComponent 
                                label="Effective Total" 
                                value={`₹ ${Utils.formatMoneyValueMaxTwoDecimals(total)}`} 
                            />
                        </Col>
                        <Col span={24}>
                            <StockDetailComponent 
                                label="Weight" 
                                value={`${Utils.formatMoneyValueMaxTwoDecimals(weight)} %`} 
                            />
                        </Col>
                    </Row>
                </Col>
                <Col 
                        span={24} 
                        style={{position: 'relative', top: 20, padding: '0 20px'}}
                >
                    <Row gutter={24}>
                        <Col span={24}>
                            <MobileButton 
                                    onClick={this.updatePosition} 
                                    type="primary" 
                            >
                                DONE
                            </MobileButton>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const UpdateSector = withRouter(UpdateSectorMobileImpl);

const StockDetailComponent = ({label, value, valueStyle, labelStyle}) => {
    return (
        <Row type="flex" align="middle" style={{marginBottom: '20px'}}>
            <Col span={8}>
                <h3 style={{fontSize: '16px', color: '#4A4A4A', ...labelStyle}}>{label}</h3>
            </Col>
            <Col span={16} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                <h3 style={{fontSize: '16px', color: '#4A4A4A', ...valueStyle, textAlign: 'right'}}>{value}</h3>
            </Col>
        </Row>
    );
}

const searchIconStyle = {
    fontSize: '18px'
};