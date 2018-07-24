import * as React from 'react';
import _  from 'lodash';
import {Row, Col, Input, Icon, Badge, Button, Tag} from 'antd';
import {StockPerformance} from './StockPerformance';
import {horizontalBox, verticalBox, metricColor, primaryColor} from '../../../constants';
import {fetchAjax, Utils} from '../../../utils';
import '../css/searchStocks.css';

const {Search} = Input;
const {requestUrl} = require('../../../localConfig');
const textColor = '#757575';

export class SearchStocks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: [],
            searchInput: '',
            selectedStock: '',
            selectedStocks: [], // This will contain the symbols of all stocks that are selected
            selectedPage: 0,
            portfolioLoading: false,
            loadingStocks: false
        };
        this.localStocks = []; // Used to get the list of all stocks obtained from N/W calls
    }

    renderSearchStocksList = () => {
        return (
            <Row>
                <Col span={24}>
                    <Search placeholder="Search Stocks" onChange={this.handleSearchInputChange}/>
                </Col>
                {this.renderPagination()}
                <Col span={24} style={{marginTop: '20px'}}>
                    {
                        !this.state.loadingStocks &&
                        this.renderStockList()
                    }
                </Col>
            </Row>
        );
    }

    handleSearchInputChange = e => {
        const searchQuery = e.target.value;
        this.setState({searchInput: searchQuery, selectedPage: 0}, () => {
            this.fetchStocks();
        });
    }

    fetchStocks = (searchQuery = this.state.searchInput) => new Promise(resolve => {
        const limit = 10;
        const skip = this.state.selectedPage * limit;
        const populate = true;
        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', '');
        const industry = _.get(this.props, 'filters.industry', '');
        const url = `${requestUrl}/stock?search=${searchQuery}&populate=${populate}&universe=${universe}&sector=${sector}&industry=${industry}&skip=${skip}&limit=${limit}`;
        this.setState({loadingStocks: true});
        fetchAjax(url, this.props.history, this.props.pageUrl)
        .then(({data: stockResponseData}) => {
            const stocks = this.processStockList(stockResponseData);
            this.setState({stocks});
            this.pushStocksToLocalArray(stocks);
            resolve(true);
        })
        .finally(() => {
            this.setState({loadingStocks: false});
        })
    })

    resetSearchFilters = () => new Promise((resolve, reject) => {
        this.setState({selectedPage: 0}, () => this.fetchStocks('').then(() => resolve(true)));
    })

    pushStocksToLocalArray = (stocks = []) => {
        const localStocks = [...this.localStocks];
        stocks.map(stock => {
            const stockIndex = _.findIndex(localStocks, localStock => localStock.symbol === stock.symbol);
            if (stockIndex === -1) {
                localStocks.push(stock)
            }
        });
        this.localStocks = localStocks;
    }

    renderStockList = () => {
        const {stocks = []} = this.state;
        return stocks.map((stock, index) => 
            <StockListItem 
                key={index} 
                {...stock} 
                onClick={this.handleStockListItemClick} 
                onAddIconClick={this.conditionallyAddItemToSelectedArray}
                selected={stock.symbol === _.get(this.state, 'selectedStock.symbol', '')}
            />
        )
    }

    handleStockListItemClick = stock => {
        this.setState({selectedStock: stock});
    }

    /**
     * @description: processes the Stock array response obtained from the /stock?search N/W call into the appropriate
     * array to render in the stock list
     * @param: stocks - array of stocks obtained from the N/W call
     * @returns: {symbol, name, change, changePct, close, high, low, open}
     */
    processStockList = (stocks = []) => {
        const selectedStocks = [...this.state.selectedStocks];

        return stocks.map(stock => {
            const symbol = _.get(stock, 'security.ticker', null);

            return {
                symbol,
                name: _.get(stock, 'security.detail.Nse_Name', null),
                change: _.get(stock, 'latestDetailRT.change', null),
                changePct: _.get(stock, 'latestDetailRT.changePct', null),
                close: _.get(stock, 'latestDetailRT.close', null),
                high: _.get(stock, 'latestDetailRT.high', null),
                low: _.get(stock, 'latestDetailRT.low', null),
                open: _.get(stock, 'latestDetailRT.open', null),
                current: _.get(stock, 'latestDetailRT.current', null),
                checked: selectedStocks.indexOf(symbol) >= 0,
                sector: _.get(stock, 'security.detail.Sector', null)
            };
        }).filter(stock => stock.name !== null);
    }

    conditionallyAddItemToSelectedArray = (symbol, addToPortfolio = false) => {
        const selectedStocks = [...this.state.selectedStocks];
        const localStocks = [...this.localStocks];
        const stocks = [...this.state.stocks];
        const selectedStockIndex = selectedStocks.indexOf(symbol);
        const targetStock = stocks.filter(stock => stock.symbol === symbol)[0];
        const targetLocalStock = localStocks.filter(stock => stock.symbol === symbol)[0];
        if (targetStock !== undefined) {
            if (selectedStockIndex === -1) {
                selectedStocks.push(symbol);
                targetStock.checked = true;
                targetLocalStock.checked = true;
            } else {
                selectedStocks.splice(selectedStockIndex, 1);
                targetStock.checked = false;
                targetLocalStock.checked = false;
            }
            this.setState({selectedStocks, stocks});
            this.localStocks = localStocks;
        } else {
            if (selectedStockIndex === -1) {
                selectedStocks.push(symbol);
                targetLocalStock.checked = true;
            } else {
                selectedStocks.splice(selectedStockIndex, 1);
                targetLocalStock.checked = false;
            }
            this.setState({selectedStocks});
            this.localStocks = localStocks;
        }
        console.log(this.localStocks);
    }

    addSelectedStocksToPortfolio = () => {
        let localStocks = [...this.localStocks];
        localStocks = localStocks.filter(stock => stock.checked === true);
        const positions = localStocks.map(stock => {
            return {
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                name: _.get(stock, 'name', ''),
                sector: _.get(stock, 'sector', null),
                lastPrice: stock.current,
                shares: 1,
                symbol: stock.symbol,
                ticker: stock.symbol,
                totalValue: stock.current,
            };
        });
        // this.setState({portfolioLoading: true});
        this.props.addPositions(positions)
        // .then(() => {
        this.props.toggleBottomSheet();
            // this.setState({portfolioLoading: false});
        // })
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps, this.props)) {
            this.syncStockListWithPortfolio(nextProps.portfolioPositions);
        }
    }

    syncStockListWithPortfolio = positions => {
        const selectedStocks = positions.map(position => position.symbol);
        let stocks = [...this.state.stocks]; 
        let localStocks = [...this.localStocks];
        stocks = stocks.map(stock => {
            // If stock is present in the portfolio mark checked as true else false
            const stockIndex = _.findIndex(positions, position => position.symbol === stock.symbol);
            let checked = stockIndex !== -1 ? true : false;

            return {...stock, checked};
        });
        localStocks = localStocks.map(stock => {
            // If stock is present in the portfolio mark checked as true else false
            const stockIndex = _.findIndex(positions, position => position.symbol === stock.symbol);
            let checked = stockIndex !== -1 ? true : false;

            return {...stock, checked};
        })
        this.localStocks = localStocks;
        this.setState({selectedStocks, stocks});
        console.log('Local Stocks', this.localStocks);
    }

    initializeSelectedStocks = () => {
        const positions = [...this.props.portfolioPositions];
        const selectedStocks = positions.map(position => position.symbol);
        this.localStocks = positions.map(position => {
            return {
                change: 0,
                changePct: 0,
                checked: true,
                close: _.get(position, 'lastPrice', 0),
                current: _.get(position, 'lastPrice', 0),
                high: 0,
                low: 0,
                name: '',
                open: 0,
                sector: _.get(position, 'sector', ''),
                symbol: _.get(position, 'symbol', '')
            }
        });
        this.setState({selectedStocks});
    }

    componentWillMount() {
        this.fetchStocks('');
        if (this.props.isUpdate) {
            this.initializeSelectedStocks();
        }
        this.syncStockListWithPortfolio(this.props.portfolioPositions);
    }

    handlePagination = type => {
        let {selectedPage = 0} = this.state;
        selectedPage = type === 'next' ? selectedPage + 1 : selectedPage - 1;
        this.setState({
            selectedPage
        }, () => {
            this.fetchStocks();
        })
    }

    renderPagination = () => {
        return (
            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between', marginTop: '10px'}}>
                <Button 
                        onClick={() => this.handlePagination('previous')} 
                        disabled={this.state.selectedPage === 0}
                >
                    Previous
                </Button>
                {
                    this.state.loadingStocks &&
                    <Icon type="loading" style={{fontSize: '20px'}}/>
                }
                <Button
                        onClick={() => this.handlePagination('next')}  
                        disabled={this.state.stocks.length % 10 !== 0}
                >
                    Next
                </Button>
            </Col>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderSelectedStocks = () => {
        const selectedStocks = [...this.state.selectedStocks];

        return (
            <Row>
                {
                    selectedStocks.map((stock, index) => {
                        return (
                            <Tag 
                                    style={{marginBottom: '5px'}}
                                    color='blue'
                                    key={stock}
                                    closable
                                    onClose={() => {
                                        console.log(stock);
                                        this.conditionallyAddItemToSelectedArray(stock)
                                    }}
                            >
                                {stock}
                            </Tag>
                        );
                    })
                }
            </Row>
        );
    }

    render() { 
        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);
        const toggleIconColor = this.state.selectedStocks.length === 0 ? textColor : primaryColor;

        return (
            <Row>
                <Col span={24} style={{...topHeaderContainer, borderBottom: '1px solid #DFDFDF'}}>
                    <Row type="flex" align="middle" style={{padding: '10px 20px 5px 0px'}}>
                        <Icon 
                            style={{fontSize: '24px', cursor: 'pointer', color: toggleIconColor, marginRight: '20px'}} 
                            type="close-circle"
                            onClick={this.props.toggleBottomSheet}
                        />
                        <h3 
                                style={{
                                    fontSize: this.state.selectedStocks.length === 0 ? '24px' : '14px', 
                                    marginRight: '10px',
                                    transition: 'all 0.4s ease-in-out'
                                }}
                        >
                            Add Stocks to your Portfolio
                        </h3>
                            <span style={{fontSize: '14px', marginRight: '5px'}}> Allowed Universe: </span>
                            {industry && 
                                <Tag style={{fontSize: '14px'}}>{industry}</Tag>  
                            }

                            {sector && 
                                <Tag style={{fontSize: '14px'}}>{sector}</Tag>
                            }
                            
                            {universe && 
                                <Tag style={{fontSize: '14px', color: 'green'}}>{universe}</Tag>
                            }
                    </Row>
                    {
                        // this.state.selectedStocks.length > 0 &&
                        <Button 
                                onClick={this.addSelectedStocksToPortfolio} 
                                type="primary" 
                                loading={this.state.portfolioLoading}
                        >
                            SELECTED
                            <Badge 
                                style={{
                                    backgroundColor: '#fff', 
                                    color: primaryColor, 
                                    fontSize: '14px', 
                                    marginLeft: '5px'
                                }} 
                                count={this.state.selectedStocks.length}
                            />
                        </Button>
                    }
                </Col>

                <Col span={12} style={{padding: '20px'}}>
                    {this.renderSearchStocksList()}
                </Col>
                <Col span={12} style={{padding: '20px'}}>
                    {this.renderSelectedStocks()}
                    <StockPerformance stock={this.state.selectedStock}/>
                </Col>
            </Row>
        );
    }
}

const StockListItem = ({symbol, name, change, changePct, close, open, current, onClick, checked = false, onAddIconClick, selected = false}) => {
    const containerStyle = {
        borderBottom: '1px solid #eaeaea',
        color: textColor,
        // marginTop: '20px',
        cursor: 'pointer',
        backgroundColor: selected ? '#CFD8DC' : '#fff',
        padding: '10px',
        paddingRight: '0px'
    };

    const detailContainerStyle = {
        ...verticalBox,
        alignItems: 'flex-end',
        paddingRight: '10px'
    };

    const leftContainerStyle = {
        ...verticalBox,
        alignItems: 'flex-start'
    };

    const changeColor = change < 0 ? metricColor.negative : metricColor.positive;
    const changeIcon = change < 0 ? 'caret-down' : 'caret-up';
    const nChangePct = (changePct * 100).toFixed(2);

    return (
        <Row className='stock-row' style={containerStyle} type="flex" align="middle">
            <Col span={15} style={leftContainerStyle} onClick={() => onClick({symbol, name})}>
                <div style={horizontalBox}>
                    <h3 style={{fontSize: '16px', fontWeight: '700'}}>{symbol}</h3>
                    <Icon style={{color: changeColor, marginLeft: '10px'}} type={changeIcon} />
                </div>
                <h3 style={{fontSize: '12px'}}>{name}</h3>
            </Col>
            <Col span={8} style={detailContainerStyle} onClick={() => onClick({symbol, name})}>
                <div style={horizontalBox}>
                    <h3 style={{fontSize: '18px', fontWeight: '700'}}>{Utils.formatMoneyValueMaxTwoDecimals(current)}</h3>
                </div>
                <div style={horizontalBox}>
                    <h3 style={{color: changeColor, fontSize: '14px', marginLeft: '10px'}}>{change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(change)}</h3>
                    <h3 style={{color: changeColor, marginLeft: '5px', fontSize: '14px'}}>({change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(nChangePct)} %)</h3>
                </div>
            </Col>
            <Col span={1} onClick={() => onAddIconClick(symbol)}>
                <AddIcon checked={checked}/>
            </Col>
        </Row>
    );
}

const AddIcon = ({checked = false}) => {
    const type = checked ? "minus-circle-o" : "plus-circle";
    const color = checked ? metricColor.negative : primaryColor;

    return <Icon style={{fontSize: '20px', color}} type={type} />
}

const topHeaderContainer = {
    ...horizontalBox,
    justifyContent: 'space-between',
    borderBottom: '1px solid lightgrey',
    padding: '0 20px'
};