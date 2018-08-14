import * as React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Row, Col, Spin, AutoComplete, Input, Icon} from 'antd';
import {Button as MobileButton, InputItem} from 'antd-mobile';
import {fetchAjax, getStockData, Utils, openNotification} from '../../../../utils';
import {horizontalBox, primaryColor} from '../../../../constants';

const {requestUrl} = require('../../../../localConfig');
const AutocompleteOption = AutoComplete.Option;
const spinIcon = <Icon type="loading" style={{ fontSize: 16, marginRight: '5px' }} spin />;
const defaultStockData = {
    name: '-',
    symbol: '-',
    shares: 0,
    lastPrice: 0,
    totalValue: 0,
    sector: '',
    weight: 0,
    effTotal: 0
};

const maxStockTargetTotal = 50000;
const maxSectorTargetTotal = 180000;

class UpdatePositionMobileImpl extends React.Component {
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
            loadingStockDetails: false
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps, this.props) || nextProps.updatePosition) {
            if (nextProps.updatePosition) {
                this.setState({stockData: nextProps.selectedPosition});
            } else {
                this.setState({stockData: defaultStockData});
            }
        }
    }

    onSearchChange = value => {
        this.setState({searchInputValue: value});
    }

    onSelect = value => {
        this.setState({searchInputValue: value});
        this.setState({loadingStockDetails: true});
        this.autoCompleteElemet.blur();
        getStockData(value, 'latestDetail')
        .then(latestDetailResponse => {
            const {data} = latestDetailResponse;
            const name = _.get(data, 'security.detail.Nse_Name', '');
            const symbol = _.get(data, 'security.ticker', '');
            const lastPrice = _.get(data, 'latestDetail.values.Close', 0);
            const shares = this.state.stockData.shares;
            const totalValue = Number((lastPrice * shares).toFixed(2));
            const sector = _.get(data, 'security.detail.Sector', '');
            this.setState({
                stockData: {
                    ...this.state.stockData,
                    name,
                    symbol,
                    lastPrice,
                    totalValue,
                    sector
                }
            })
        })
        .catch(error => {
            Utils.checkForInternet(error, this.props.history);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            this.setState({loadingStockDetails: false, show: false});
        });
    }

    handleSearch = query => {
        const url = `${requestUrl}/stock?search=${query}`;
        this.setState({spinning: true});
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)})
        })
        .catch(error => error)
        .finally(() => {
            this.setState({spinning: false});
        });
    }

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                symbol: _.get(item, 'detail.NSE_ID', null) || _.get(item, 'ticker', ''),
                name: _.get(item, 'detail.Nse_Name', null) || _.get(item, 'ticker', '')
            }
        })
    }

    renderOption = item => {
        return (
            <AutocompleteOption key={item.id} value={item.symbol}>
                <Row style={{marginBottom: '10px'}}>
                    <Col span={24}>
                        <span style={{textAlign: 'left', fontSize: '16px'}}>{item.symbol}</span>
                    </Col>
                    <Col span={24}>
                        <span style={{textAlign: 'left', fontSize: '12px', color: '#4a4a4a'}}>{item.name}</span>
                    </Col>
                </Row>
            </AutocompleteOption>
        );
    }

    toggleSharesInput = () => {
        this.setState({toggleEdit: !this.state.toggleEdit});
    }

    handleTargetTotalChange = inputValue => {
        const value = Number(inputValue);
        const positionsInSector = this.props.positions.filter(item => item.sector === this.state.stockData.sector);
        const nPositionsInSector = positionsInSector.length;
        const maxSectorExposure = _.max([0, _.min([maxSectorTargetTotal, (nPositionsInSector * maxStockTargetTotal)])]);
        const maxAllowance = maxSectorExposure - _.sum(positionsInSector.map(item => item.effTotal));
        const maxValueAllowed = _.min([maxStockTargetTotal, (this.state.stockData.effTotal + maxAllowance)]);
        const totalValue = this.state.stockData.lastPrice * this.calculateSharesFromTargetTotal(value);
        const weight = Number(((totalValue / (this.getNetASsetValue() + totalValue)) * 100).toFixed(2));

        this.setState({
            stockData: {
                ...this.state.stockData,
                effTotal: value > maxValueAllowed 
                        ? maxValueAllowed 
                        : value < 0 
                            ? 0
                            : value,
                shares: this.calculateSharesFromTargetTotal(value),
                totalValue,
                weight
            }
        })
    }

    getNetASsetValue = () => {
        const otherPositions = this.props.positions.filter(position => position.symbol !== this.state.stockData.symbol);
        return _.sum(otherPositions.map(position => position.totalValue))
    }

    calculateSharesFromTargetTotal = targetTotal => {
        const lastPrice = _.get(this.props, 'selectedPosition.lastPrice', 0);
        return Math.floor(targetTotal / lastPrice);
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
        this.props.updateSelectedPosition(stockData);
        this.clearPageDetails(this.props.toggleBottomSheet);
    }

    checkForValidPosition = () => {
        const {name = 0, shares = 0, totalValue = 0, lastPrice} = this.state.stockData;
        return name.length > 0 && Number(shares) > 0 && Number(totalValue) > 0 && Number(lastPrice) > 0;
    }

    updateOrAddPosition = () => {
        if (this.checkForValidPosition()) {
            this.props.updatePosition ? this.updatePosition() :this.addPosition();
        } else {
            openNotification('warning', 'Invalid Position', 'Please provide a valid position with more than 1 shares');
        }
    }

    cancelAction = () => {
        this.clearPageDetails(this.props.toggleBottomSheet);
    }

    render() {
        const {symbol, name, shares, lastPrice, totalValue, targetTotal, weight} = this.state.stockData;

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
                        {this.props.updatePosition ? "Update Position" : "Add Position"}
                    </h3>
                </div>
                {
                    !this.props.updatePosition &&
                    <Col span={24} style={{textAlign: 'center', marginTop: '10px', padding: '0 10px'}}>
                        <AutoComplete
                            size="large"
                            style={{ width: '100%' }}
                            dataSource={this.state.dataSource.map(this.renderOption)}
                            onSelect={this.onSelect}
                            onSearch={this.handleSearch}
                            placeholder="Search stocks"
                            optionLabelProp="value"
                            value={this.state.searchInputValue}
                            onChange={this.onSearchChange}
                            disabled={this.state.loadingStockDetails}
                        >
                            <Input 
                                ref={el => this.autoCompleteElemet = el}
                                suffix={(
                                    <div>
                                        <Spin indicator={spinIcon} spinning={this.state.spinning}/>
                                        <Icon style={searchIconStyle} type="search" />
                                    </div>
                                )} 
                            />
                        </AutoComplete>
                    </Col>
                }
                <Spin spinning={this.state.loadingStockDetails}>
                    <Col span={24} style={{marginTop: '20px', padding: '0 20px'}}>
                        <Row>
                            <Col span={24}>
                                <StockDetailComponent label="Symbol" value={symbol} />
                            </Col>
                            <Col span={24}>
                                <StockDetailComponent label="Name" value={name} valueStyle={{color: primaryColor}}/>
                            </Col>
                            <Col span={24}>
                                <Row type="flex" align="middle" style={{marginBottom: '20px'}}>
                                    <Col span={8}>
                                        <h3 style={{fontSize: '16px', color: '#4A4A4A'}}>Target Total</h3>
                                    </Col>
                                    <Col offset={4} span={12} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                                        <div style={horizontalBox}>
                                            <Icon style={{fontSize: '22px'}} type={"minus-circle-o"} onClick={() => this.handleTargetTotalChange(this.state.stockData.effTotal - 1000)}/>
                                            <InputItem 
                                                type="number"
                                                value={this.state.stockData.effTotal} 
                                                onChange={this.handleTargetTotalChange}
                                                style={{paddingLeft: '0px'}}
                                                ref={el => this.sharesTextInput = el}
                                            />
                                            <Icon style={{fontSize: '22px'}} type={"plus-circle-o"} onClick={() => this.handleTargetTotalChange(this.state.stockData.effTotal + 1000)}/>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            <Col span={24}>
                                <StockDetailComponent 
                                    label="Last Price" 
                                    value={`₹ ${Utils.formatMoneyValueMaxTwoDecimals(lastPrice)}`} 
                                />
                            </Col>
                            <Col span={24}>
                                <StockDetailComponent 
                                    label="Total Value" 
                                    value={`₹ ${Utils.formatMoneyValueMaxTwoDecimals(totalValue)}`} 
                                />
                            </Col>
                            <Col span={24}>
                                <StockDetailComponent 
                                    label="Shares" 
                                    value={shares} 
                                />
                            </Col>
                            <Col span={24}>
                                <StockDetailComponent 
                                    label="Weight" 
                                    value={`${weight} %`} 
                                />
                            </Col>
                        </Row>
                    </Col>
                </Spin>
                <Col 
                        span={24} 
                        style={{position: 'relative', top: '20px', padding: '0 20px'}}
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

export const UpdatePosition = withRouter(UpdatePositionMobileImpl);

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