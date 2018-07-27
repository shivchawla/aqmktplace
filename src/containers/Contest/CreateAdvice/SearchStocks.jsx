import * as React from 'react';
import Media from 'react-media';
import {Motion, spring} from 'react-motion';
import _  from 'lodash';
import {Row, Col, Input, Icon, Badge, Button, Tag} from 'antd';
import {SearchBar, Tag as TagMobile} from 'antd-mobile';
import {StockPerformance} from './StockPerformance';
import {screenSize} from './constants';
import SearchStockHeader from './Mobile/SearchStockHeader';
import SearchStockHeaderMobile from './Mobile/StockSearchHeaderMobile';
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
            loadingStocks: false,
            stockPerformanceOpen: false
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

    renderSearchStockListMobile = () => {
        return (
            <Row>
                <Col span={24}>
                    {/* <Search placeholder="Search Stocks" onChange={this.handleSearchInputChange}/> */}
                    <SearchBar 
                        placeholder="Search Stocks"
                        onChange={value => this.handleSearchInputChange(value, 'mobile')}
                    />
                </Col>
                {this.renderPaginationMobile()}
                <Col 
                        span={24} 
                        style={{
                            padding: '0 15px'
                        }}
                >
                    {
                        !this.state.loadingStocks &&
                        this.renderStockList()
                    }
                </Col>
                {
                    !this.state.loadingStocks 
                    && this.state.stocks.length >= 8 
                    && this.renderPaginationMobile()
                }
                <div style={{width: '100%', height: '80px'}}></div>
            </Row>
        );
    }

    handleSearchInputChange = (e, type = 'desktop') => {
        const searchQuery = type === 'desktop' ? e.target.value : e;
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
            <React.Fragment key={index}>
                <Media 
                    query={`(max-width: ${screenSize.mobile})`}
                    render={() => (
                        <StockListItemMobile 
                            key={index} 
                            {...stock} 
                            onClick={this.handleStockListItemClick} 
                            onAddIconClick={this.conditionallyAddItemToSelectedArray}
                            selected={stock.symbol === _.get(this.state, 'selectedStock.symbol', '')}
                        />
                    )}
                />
                <Media 
                    query={`(min-width: ${screenSize.desktop})`}
                    render={() => (
                        <StockListItem 
                            key={index} 
                            {...stock} 
                            onClick={this.handleStockListItemClick} 
                            onAddIconClick={this.conditionallyAddItemToSelectedArray}
                            selected={stock.symbol === _.get(this.state, 'selectedStock.symbol', '')}
                        />
                    )}
                />
            </React.Fragment>
        )
    }

    handleStockListItemClick = stock => {
        this.toggleStockPerformanceOpen();
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
            const close = _.get(stock, 'latestDetailRT.close', 0) !== 0 
                ?  _.get(stock, 'latestDetailRT.close', 0)
                :  _.get(stock, 'latestDetail.values.Close', 0);

            const change = _.get(stock, 'latestDetailRT.change', 0) !== 0 
                    ?  _.get(stock, 'latestDetailRT.change', 0)
                    :  _.get(stock, 'latestDetail.values.Change', 0);

            const changePct = _.get(stock, 'latestDetailRT.changePct', 0) !== 0 
                    ?  _.get(stock, 'latestDetailRT.changePct', 0)
                    :  _.get(stock, 'latestDetail.values.ChangePct', 0);

            const high = _.get(stock, 'latestDetailRT.high', 0) !== 0 
                    ?  _.get(stock, 'latestDetailRT.high', 0)
                    :  _.get(stock, 'latestDetail.values.High', 0);

            const low = _.get(stock, 'latestDetailRT.low', 0) !== 0 
                    ?  _.get(stock, 'latestDetailRT.low', 0)
                    :  _.get(stock, 'latestDetail.values.Low', 0);
            
            const open = _.get(stock, 'latestDetailRT.open', 0) !== 0 
                    ?  _.get(stock, 'latestDetailRT.open', 0)
                    :  _.get(stock, 'latestDetail.values.Open', 0);

            const current = _.get(stock, 'latestDetailRT.current', 0) !== 0 
                    ?  _.get(stock, 'latestDetailRT.current', 0)
                    :  _.get(stock, 'latestDetail.values.Close', 0);


            return {
                symbol,
                name: _.get(stock, 'security.detail.Nse_Name', null),
                change,
                changePct,
                close,
                high,
                low,
                open,
                current,
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
    }

    componentWillMount() {
        this.fetchStocks('');
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

    renderPaginationMobile = () => {
        return (
            <Col 
                    span={24} 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'space-between', 
                        marginTop: '10px',
                        padding: '0 15px'
                    }}
            >
                <Button 
                    onClick={() => this.handlePagination('previous')} 
                    disabled={this.state.selectedPage === 0}
                    shape="circle"
                    icon="left"
                />
                {
                    this.state.loadingStocks &&
                    <Icon type="loading" style={{fontSize: '20px'}}/>
                }
                <Button
                    onClick={() => this.handlePagination('next')}  
                    disabled={this.state.stocks.length % 10 !== 0}
                    shape="circle"
                    icon="right"
                />
            </Col>
        );
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    toggleStockPerformanceOpen = () => {
        this.setState({stockPerformanceOpen: !this.state.stockPerformanceOpen});
    }

    renderStockListDetails = () => {
        return (
            <React.Fragment>
                <Media 
                    query={`(max-width: ${screenSize.mobile})`}
                    render={() => (
                        <Motion
                                style={{
                                    detailX: spring(this.state.stockPerformanceOpen ? 0 : 600),
                                    listX: spring(this.state.stockPerformanceOpen ? -600 : 0)
                                }}>
                            {
                                ({detailX, listX}) => 
                                    <React.Fragment>
                                        <Col 
                                                span={24} 
                                                style={{
                                                    transform: `translate3d(${listX}px, 0, 0)`,
                                                    height: '100%',
                                                    overflowX: 'hidden',
                                                    overflowY: 'scroll',
                                                    paddingBottom: '80px'
                                                }}
                                        >
                                            {this.renderSearchStockListMobile()}
                                            <div style={{height: '100px'}}></div>
                                        </Col>
                                        <Col 
                                                span={24} 
                                                style={{
                                                    transform: `translate3d(${detailX}px, 0, 0)`,
                                                    top: '85px',
                                                    position: 'absolute'
                                                }}
                                        >
                                            <StockPerformance stock={this.state.selectedStock}/>
                                        </Col>
                                    </React.Fragment>
                            }
                        </Motion>
                    )}
                />
                <Media 
                    query={`(min-width: ${screenSize.desktop})`}
                    render={() => (
                        <React.Fragment>
                            <Col span={12} style={{padding: '20px'}}>
                                {this.renderSearchStocksList()}
                            </Col>
                            <Col span={12} style={{padding: '20px'}}>
                                {this.renderSelectedStocks()}
                                <StockPerformance stock={this.state.selectedStock}/>
                            </Col>
                        </React.Fragment>
                    )}
                />
            </React.Fragment>
        );
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

    renderSelectedStocksMobile = () => {
        const selectedStocks = [...this.state.selectedStocks];
        return (
            this.state.selectedStocks.length > 0 
            && !this.state.stockPerformanceOpen 
            && global.screen.width <= 600
            ?   <Col 
                        span={24}
                        className='selectedstocks-mobile'
                        style={{
                            ...horizontalBox,
                            width: '100%',
                            zIndex: '200',
                            backgroundColor: '#fff',
                            height: '50px',
                            overflow: 'hidden',
                            overflowX: 'scroll',
                            borderTop: '1px solid #eaeaea',
                            borderBottom: '1px solid #eaeaea',
                            padding: '0 10px',
                        }}
                >
                    {
                        selectedStocks.map((stock, index) => {
                            return (
                                <Tag 
                                        selected
                                        style={{
                                            marginBottom: '5px',
                                            // marginRight: '15px' ,
                                            // border: `1px solid ${primaryColor}`,
                                            // color: primaryColor
                                        }}
                                        color='blue'
                                        key={stock}
                                        closable
                                        onClose={() => {
                                            this.conditionallyAddItemToSelectedArray(stock)
                                        }}
                                >
                                    {stock}
                                </Tag>
                            );
                        })
                    }
                </Col>
            : null
        );
    }

    render() { 
        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);
        const toggleIconColor = this.state.selectedStocks.length === 0 ? textColor : primaryColor;

        return (
            <Row 
                    style={{
                        width: global.screen.width, 
                        overflow: 'hidden', 
                        height: global.screen.height,
                        position: 'relative'
                    }}
            >
                <Media 
                    query='(max-width: 600px)'
                    render={() => 
                        <SearchStockHeaderMobile 
                                filters={this.props.filters}
                                selectedStocks={this.state.selectedStocks}
                                stockPerformanceOpen={this.state.stockPerformanceOpen}
                                toggleBottomSheet={this.props.toggleBottomSheet}
                                stockPerformanceOpen={this.state.stockPerformanceOpen}
                                addSelectedStocksToPortfolio={this.addSelectedStocksToPortfolio}
                                portfolioLoading={this.state.portfolioLoading}
                                toggleStockPerformanceOpen={this.toggleStockPerformanceOpen}
                                renderSelectedStocks={this.renderSelectedStocksMobile}
                        />
                    }
                />
                <Media 
                    query='(min-width: 601px)'
                    render={() => 
                        <SearchStockHeader 
                            filters={this.props.filters}
                            selectedStocks={this.state.selectedStocks}
                            stockPerformanceOpen={this.state.stockPerformanceOpen}
                            toggleBottomSheet={this.props.toggleBottomSheet}
                            stockPerformanceOpen={this.state.stockPerformanceOpen}
                            addSelectedStocksToPortfolio={this.addSelectedStocksToPortfolio}
                            portfolioLoading={this.state.portfolioLoading}
                        />
                    }
                />
                {this.renderStockListDetails()}
            </Row>
        );
    }
}

const StockListItemMobile = props => {
    const {symbol, name, change, changePct, current, onClick, checked = false, onAddIconClick, selected = false} = props;
    const containerStyle = {
        borderBottom: '1px solid #eaeaea',
        color: textColor,
        // marginTop: '20px',
        cursor: 'pointer',
        backgroundColor: '#fff',
        padding: '10px 0',
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
            <Col span={11} style={leftContainerStyle} onClick={() => onClick({symbol, name})}>
                <div style={horizontalBox}>
                    <h3 style={{fontSize: '16px', fontWeight: '700'}}>{symbol}</h3>
                    <Icon style={{color: changeColor, marginLeft: '10px'}} type={changeIcon} />
                </div>
                <div style={horizontalBox}>
                    <h3 style={{fontSize: '14px', fontWeight: '400'}}>{Utils.formatMoneyValueMaxTwoDecimals(current)}</h3>
                </div>
            </Col>
            <Col span={11} style={detailContainerStyle} onClick={() => onClick({symbol, name})}>
                <div style={horizontalBox}>
                    <h3 
                            style={{color: changeColor, fontSize: '14px', marginLeft: '10px', fontWeight: '700'}}
                    >
                        {change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(change)}
                    </h3>
                    <h3 
                            style={{color: changeColor, marginLeft: '5px', fontSize: '14px'}}
                    >
                        ({change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(nChangePct)} %)
                    </h3>
                </div>
            </Col>
            <Col span={2} onClick={() => onAddIconClick(symbol)}>
                <AddIcon checked={checked} size='24px'/>
            </Col>
        </Row>
    );
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

const AddIcon = ({checked = false, size = '20px'}) => {
    const type = checked ? "minus-circle-o" : "plus-circle";
    const color = checked ? metricColor.negative : primaryColor;

    return <Icon style={{fontSize: size, color}} type={type} />
}

const topHeaderContainer = {
    ...horizontalBox,
    justifyContent: 'space-between',
    borderBottom: '1px solid lightgrey',
    padding: '0 20px'
};