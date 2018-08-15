import * as React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Row, Col, Spin, AutoComplete, Input, Icon} from 'antd';
import {Button as MobileButton, InputItem} from 'antd-mobile';
import {fetchAjax, getStockData, Utils, openNotification} from '../../../../utils';
import {horizontalBox, primaryColor, verticalBox} from '../../../../constants';
import {handleSectorTargetTotalChange, processSectorStockData, updateSectorWeights} from '../utils';
import SliderInput from './Slider';
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

    handleTargetTotalChange = inputValue => {
        const value = Number(inputValue);
        const oldNav = _.get(this.state, 'stockData.targetTotal', 0);
        const newNav = Number(value) > this.getMaxSectorExposure() 
                ? this.getMaxSectorExposure() 
                : Number(value) < 0 
                    ? 0
                    : Number(value);
        const {sectorTotal, portfolioTotal} = this.calculateEffectiveTotal(Number(oldNav), newNav);
        const portfolioTotalValue = portfolioTotal === 0 ? 1 : portfolioTotal;
        this.setState({
            stockData: {
                ...this.state.stockData,
                targetTotal: newNav,
                total: sectorTotal,
                weight: Number(((sectorTotal / portfolioTotalValue) * 100).toFixed(2))
            }
        });
    }

    getMaxSectorExposure = () => {
        const nPositionsInSector = this.props.positions.filter(item => item.sector === this.state.stockData.sector).length;
        const maxSectorExposure = _.max([0, _.min([this.props.maxSectorTargetTotal, (nPositionsInSector * this.props.maxStockTargetTotal)])]);
        return maxSectorExposure;
    }

    calculateEffectiveTotal = (oldTargetTotal, currentTargetTotal) => {
        const positions = [...this.state.positions];
        const sector = _.get(this.state, 'stockData.sector', '');
        let stockData = [];
        try {
            stockData = handleSectorTargetTotalChange(currentTargetTotal, oldTargetTotal, sector, positions) || [];
        } catch(err) {
            console.log(err);
        }
        this.setState({positions: stockData});

        return {
            sectorTotal: _.sum(stockData.filter(position => position.sector === sector).map(position => position.totalValue)),
            portfolioTotal: _.sum(stockData.map(position => position.totalValue))
        };
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
        const nPositionsInSector = this.state.positions.filter(item => item.sector === sector).length;
        const maxSectorExposure = _.max([0, _.min([this.props.maxSectorTargetTotal, (nPositionsInSector * this.props.maxStockTargetTotal)])]);

        return (
            <Row style={{height: '100%', position: 'relative', padding: '0 10px'}}>
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
                <Col span={24} style={{marginTop: '20px', padding: '0 20px'}}>
                    <Row>
                        <Col span={24}>
                            <StockDetailComponent label="Sector" value={sector} />
                        </Col>
                        <Col span={24}>
                            <StockDetailComponent label="No. of Stocks" value={numStocks} valueStyle={{color: primaryColor}}/>
                        </Col>
                        <Col span={24}>
                            <Row type="flex" align="middle" style={{marginBottom: '20px'}}>
                                <Col span={11}>
                                    <h3 style={{fontSize: '16px', color: '#4A4A4A'}}>Target Total</h3>
                                    <div style={{...horizontalBox, justifyContent: 'space-between'}}>
                                        <h3 style={{fontSize: '12px'}}>Min: 0</h3>
                                        <h3 style={{fontSize: '12px'}}>Max: {this.getMaxSectorExposure()}</h3>
                                    </div>
                                </Col>
                                <Col offset={1} span={12} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                    <div style={horizontalBox}>
                                        <Icon style={{fontSize: '22px'}} type={"minus-circle-o"} onClick={() => this.handleTargetTotalChange(targetTotal - 5000)}/>
                                        <InputItem 
                                            type="number"
                                            value={targetTotal} 
                                            onChange={this.handleTargetTotalChange}
                                            style={{paddingLeft: '0px'}}
                                            ref={el => this.sharesTextInput = el}
                                        />
                                        <Icon style={{fontSize: '22px'}} type={"plus-circle-o"} onClick={() => this.handleTargetTotalChange(targetTotal + 5000)}/>
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
            <Col span={8} style={{...verticalBox, alignItems: 'flex=end'}}>
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