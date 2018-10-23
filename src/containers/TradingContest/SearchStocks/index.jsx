import * as React from 'react';
import Media from 'react-media';
import {Motion, spring} from 'react-motion';
import _  from 'lodash';
import {Row, Col, Input, Icon, Button, Tag} from 'antd';
import {SearchBar, Tag as TagMobile} from 'antd-mobile';
import {StockPerformance} from '../../Contest/CreateAdvice/StockPerformance';
import {screenSize} from '../../Contest/CreateAdvice/constants';
import StockFilter from '../../Contest/SearchStockFilter/StockFilter';
import SearchStockHeader from '../../Contest/CreateAdvice/Mobile/SearchStockHeader';
import SearchStockHeaderMobile from './components/StockSearchHeaderMobile';
import StockList from './components/StockList';
import {horizontalBox, verticalBox} from '../../../constants';
import {fetchAjax, openNotification} from '../../../utils';
import './css/searchStocks.css';

const {Search} = Input;
const {requestUrl} = require('../../../localConfig');

export class SearchStocks extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            stocks: [],
            sellStocks: [],
            searchInput: '',
            selectedStock: '',
            selectedStocks: [], // This will contain the symbols of all stocks that are selected for buying
            sellSelectedStocks: [], // This will contain the symbols of all stocks that are selected for selling
            selectedPage: 0,
            portfolioLoading: false,
            loadingStocks: false,
            stockPerformanceOpen: false,
            stockFilterOpen: false,
            filter: {
                sector: '',
                industry: ''
            }
        };
        this.localStocks = []; // Used to get the list of all stocks obtained from N/W calls
        this.stockListComponent = null;
    }

    renderSearchStocksList = () => {
        return (
            <Row>
                <Col span={24} style={horizontalBox}>
                    <Search placeholder="Search Stocks" onChange={this.handleSearchInputChange}/>
                    {/* <Button shape="circle" icon="filter" /> */}
                </Col>
                {/* <SectorItems sectors={this.getSectors()}/> */}
                <Col 
                        span={24} 
                        style={{marginTop: '20px', marginBottom: '20px'}}
                        ref={el => this.stockListComponent = el}
                >
                    {
                        // !this.state.loadingStocks &&
                        this.renderStockList()
                    }
                </Col>
                {this.renderPagination()}
            </Row>
        );
    }

    renderSearchStockListMobile = () => {
        return (
            <Row>
                <Col 
                        span={24} 
                        style={{
                            ...horizontalBox,
                            backgroundColor: '#efeff4'
                        }}
                >
                    <SearchBar 
                        style={{width: '90%'}}
                        placeholder="Search Stocks"
                        onChange={value => this.handleSearchInputChange(value, 'mobile')}
                    />
                    {
                        this.shouldFiltersBeShown() &&
                        <Icon type="filter" style={{fontSize: '25px'}} onClick={this.toggleStockFilterOpen}/>
                    }
                </Col>
                {this.renderBenchmarkDetailMobile()}
                <Col 
                        span={24} 
                        style={{
                            ...verticalBox,
                            padding: '0 15px'
                        }}
                >
                    {
                        this.renderStockList()
                    }
                </Col>
                {
                    this.state.stocks.length >= 8 
                    && this.renderPaginationMobile(true)
                }
            </Row>
        );
    }

    handleSearchInputChange = (e, type = 'desktop') => {
        const searchQuery = type === 'desktop' ? e.target.value : e;
        this.setState({searchInput: searchQuery, selectedPage: 0}, () => {
            this.fetchStocks(this.state.searchInput, false);
        });
    }

    fetchStocks = (searchQuery = this.state.searchInput, shoudlConcatenate = true) => new Promise(resolve => {
        const limit = 10;
        const stocks = [...this.state.stocks];
        const skip = this.state.selectedPage * limit;
        const populate = true;
        const universe = _.get(this.props, 'filters.universe', 'NIFTY_50');
        const sector = _.get(this.props, 'filters.sector', '').length === 0
                ?   this.state.filter.sector
                :   _.get(this.props, 'filters.sector', '');
        const industry = _.get(this.props, 'filters.industry', '').length === 0
                ?   this.state.filter.industry
                :   _.get(this.props, 'filters.industry', '');
        const url = `${requestUrl}/stock?search=${encodeURIComponent(searchQuery)}&populate=${populate}&universe=${universe}&sector=${sector}&industry=${industry}&skip=${skip}&limit=${limit}`;
        this.setState({loadingStocks: true});
        fetchAjax(url, this.props.history, this.props.pageUrl)
        .then(({data: stockResponseData}) => {
            const processedStocks = this.processStockList(stockResponseData);
            if (!shoudlConcatenate) {
                this.setState({stocks: processedStocks})
            } else {
                this.setState({stocks: [...stocks, ...processedStocks]});
            }
            this.pushStocksToLocalArray(processedStocks);
            resolve(true);
        })
        .catch(err => {
            console.log(err);
        })
        .finally(() => {
            this.setState({loadingStocks: false});
        })
    })

    resetSearchFilters = () => new Promise((resolve, reject) => {
        this.setState({selectedPage: 0}, () => this.fetchStocks('', false).then(() => resolve(true)));
    })

    resetFilterFromParent = (sector, industry) => {
        this.setState({filter: {
            sector,
            industry
        }});
    }

    pushStocksToLocalArray = (stocks = []) => {
        const localStocks = [...this.localStocks];
        stocks.map(stock => {
            const stockIndex = _.findIndex(localStocks, localStock => localStock.symbol === stock.symbol);
            if (stockIndex === -1) {
                localStocks.push(stock);
            } else {
                localStocks[stockIndex] = stock;
            }
        });
        this.localStocks = localStocks;
    }

    renderStockList = () => {
        const {stocks = []} = this.state;
        const selectedStock = _.get(this.state, 'selectedStock.symbol', '');

        return (
            <StockList 
                stocks={stocks}
                selectedStock={selectedStock}
                handleStockListItemClick={this.handleStockListItemClick}
                conditionallyAddItemToSelectedArray={this.conditionallyAddItemToSelectedArray}
                conditionallyAddItemToSellSelectedArray={this.conditionallyAddItemToSellSelectedArray}
            />
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
        const sellSelectedStocks = [...this.state.sellSelectedStocks];

        return stocks.map(stock => {
            const symbol = _.get(stock, 'security.detail.NSE_ID', null) !== null
                    ? _.get(stock, 'security.detail.NSE_ID', null) 
                    : _.get(stock, 'security.ticker', null);
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
                sellChecked: sellSelectedStocks.indexOf(symbol) >= 0,
                sector: _.get(stock, 'security.detail.Sector', null),
                industry: _.get(stock, 'security.detail.Industry', null)
            };
        }).filter(stock => stock.name !== null);
    }

    conditionallyAddItemToSelectedArray = (symbol, addToPortfolio = false) => {
        const {maxLimit = 5} = this.props;
        if (this.state.selectedStocks.length >= maxLimit) {
            openNotification('info', 'Max Limit Reached', "You can't buy more than 5 stocks");
            return;
        }
        const selectedStocks = _.map([...this.state.selectedStocks], _.cloneDeep);
        const localStocks = _.map([...this.localStocks], _.cloneDeep);
        const stocks = _.map([...this.state.stocks], _.cloneDeep);
        const selectedStockIndex = selectedStocks.indexOf(symbol);
        const targetIndex = _.findIndex(stocks, stock => stock.symbol === symbol);
        const targetStock = stocks[targetIndex];
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
            stocks[targetIndex] = targetStock;
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

    conditionallyAddItemToSellSelectedArray = (symbol, addToPortfolio = false) => {
        const {maxLimit = 5} = this.props;
        if (this.state.sellSelectedStocks.length >= maxLimit) {
            openNotification('info', 'Max Limit Reached', "You can't sell more than 5 stocks");
            return;
        }
        const selectedStocks = _.map([...this.state.sellSelectedStocks], _.cloneDeep);
        const localStocks = _.map([...this.localStocks], _.cloneDeep);
        const stocks = _.map([...this.state.stocks], _.cloneDeep);
        const selectedStockIndex = selectedStocks.indexOf(symbol);
        const targetIndex = _.findIndex(stocks, stock => stock.symbol === symbol);
        const targetStock = stocks[targetIndex];
        const targetLocalStock = localStocks.filter(stock => stock.symbol === symbol)[0];
        if (targetStock !== undefined) {
            if (selectedStockIndex === -1) {
                selectedStocks.push(symbol);
                targetStock.sellChecked = true;
                targetLocalStock.sellChecked = true;
            } else {
                selectedStocks.splice(selectedStockIndex, 1);
                targetStock.sellChecked = false;
                targetLocalStock.sellChecked = false;
            }
            stocks[targetIndex] = targetStock;
            this.setState({sellSelectedStocks: selectedStocks, stocks});
            this.localStocks = localStocks;
        } else {
            if (selectedStockIndex === -1) {
                selectedStocks.push(symbol);
                targetLocalStock.sellChecked = true;
            } else {
                selectedStocks.splice(selectedStockIndex, 1);
                targetLocalStock.sellChecked = false;
            }
            this.setState({sellSelectedStocks: selectedStocks});
            this.localStocks = localStocks;
        }
    }

    addSelectedStocksToPortfolio = async () => {
        const buyPositions = await this.processPositionsForPortfolio('buy');
        const sellPositions = await this.processPositionsForPortfolio('sell');
        const positions = [...buyPositions, ...sellPositions];
        this.props.addPositions(positions);
        this.props.toggleBottomSheet();
    }

    processPositionsForPortfolio = (type = 'buy') => {
        let localStocks = [...this.localStocks];
        if (type === 'buy') {
            localStocks = localStocks.filter(stock => stock.checked === true);
        } else {
            localStocks = localStocks.filter(stock => stock.sellChecked === true);
        }

        return Promise.map(localStocks, stock => {
            return {
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                name: _.get(stock, 'name', ''),
                sector: _.get(stock, 'sector', null),
                industry: _.get(stock, 'industry', null),
                lastPrice: stock.current,
                shares: 1,
                symbol: stock.symbol,
                ticker: stock.symbol,
                totalValue: stock.current,
                chg: stock.change,
                chgPct: stock.changePct,
                points: type === 'buy' ? 10 : -10
            };
        });
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps, this.props)) {
            this.syncStockListWithPortfolio(nextProps);
        }
    }

    syncStockListWithPortfolio = (props = this.props) => {
        const positions = _.get(props, 'portfolioPositions', []);
        const sellPositions = _.get(props, 'portfolioSellPositions', []);

        const selectedStocks = positions.map(position => position.symbol);
        const sellSelectedStocks = sellPositions.map(position => position.symbol);

        let stocks = [...this.state.stocks]; 
        let localStocks = [...this.localStocks];
        stocks = stocks.map(stock => {
            // If stock is present in the portfolio mark checked as true else false
            const stockIndex = _.findIndex(positions, position => position.symbol === stock.symbol);
            const sellStockIndex = _.findIndex(sellPositions, sellPosition => sellPosition.symbol === stock.symbol);
            const checked = stockIndex !== -1 ? true : false;
            const sellChecked = sellStockIndex !== -1 ? true : false;

            return {...stock, checked, sellChecked};
        });
        localStocks = localStocks.map(stock => {
            // If stock is present in the portfolio mark checked as true else false
            const stockIndex = _.findIndex(positions, position => position.symbol === stock.symbol);
            const sellStockIndex = _.findIndex(sellPositions, sellPosition => sellPosition.symbol === stock.symbol);
            const checked = stockIndex !== -1 ? true : false;
            const sellChecked = sellStockIndex !== -1 ? true : false;

            return {...stock, checked, sellChecked};
        })
        this.localStocks = localStocks;
        this.setState({stocks});
    }

    initializeSelectedStocks = async () => {
        const positions = [...this.props.portfolioPositions];
        const sellPositions = [...this.props.portfolioSellPositions];
        const selectedStocks = positions.map(position => position.symbol);
        const sellSelectedStocks = sellPositions.map(position => position.symbol);
        const processedBuySelectedStocks = await this.getLocalStocksFromPortfolio(positions, 'buy');
        const processedSellSelectedStocks = await this.getLocalStocksFromPortfolio(sellPositions, 'sell');
        this.localStocks = [...processedBuySelectedStocks, ...processedSellSelectedStocks];
        this.setState({selectedStocks, sellSelectedStocks});
    }

    /**
     * Processes positions obtained from CreateEntry to add in localStocks
     */
    getLocalStocksFromPortfolio = (positions = [], type = 'buy') => {
        return Promise.map(positions, position => {
            return {
                change: 0,
                changePct: 0,
                [type === 'buy' ? 'checked' : 'sellChecked']: true,
                close: _.get(position, 'lastPrice', 0),
                current: _.get(position, 'lastPrice', 0),
                high: 0,
                low: 0,
                name: '',
                open: 0,
                sector: _.get(position, 'sector', ''),
                symbol: _.get(position, 'symbol', '')
            }
        })
    }

    componentWillMount() {
        this.fetchStocks('');
        // if (this.props.isUpdate) {
        this.initializeSelectedStocks();
        // }
        this.syncStockListWithPortfolio();
        // this.syncStockListWithPortfolio(this.props.portfolioPositions);
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
            <Col 
                    span={24} 
                    style={{...horizontalBox, justifyContent: 'center', marginTop: '10px'}}
            >
                {/* <Button 
                        onClick={() => this.handlePagination('previous')} 
                        disabled={this.state.selectedPage === 0}
                >
                    Previous
                </Button>
                {
                    this.state.loadingStocks &&
                    <Icon type="loading" style={{fontSize: '20px'}}/>
                } */}
                <Button
                        onClick={() => this.handlePagination('next')}  
                        disabled={this.state.stocks.length % 10 !== 0}
                        loading={this.state.loadingStocks}
                        type="primary"
                >
                    MORE
                </Button>
            </Col>
        );
    }

    renderPaginationMobile = (hideBenchmarkConfig = false) => {
        return (
            <Col 
                    span={24} 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'center', 
                        marginTop: '10px',
                        padding: '0 15px'
                    }}
            >
                <Button
                    onClick={() => this.handlePagination('next')}  
                    disabled={this.state.stocks.length % 10 !== 0}
                    type="primary"
                    loading={this.state.loadingStocks}
                >
                    MORE
                </Button>
            </Col>
        );
    }

    renderBenchmarkDetailMobile = (hideBenchmarkConfig = false) => {
        const universe = _.get(this.props, 'filters.universe', 'NIFTY_50');
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);

        return (
            <Col 
                    span={24} 
                    style={{
                        ...horizontalBox, 
                        justifyContent: 'center', 
                        marginTop: '10px',
                        padding: '0 15px'
                    }}
            >
                {
                    this.state.loadingStocks 
                    ?   <Icon type="loading" style={{fontSize: '20px'}}/>
                    :   !hideBenchmarkConfig &&
                        <div 
                                style={{
                                    ...horizontalBox, 
                                    alignItems: 'center',
                                    marginLeft: '10px',
                                    marginTop: '5px',
                                    marginBottom: '10px',
                                    justifyContent: 'center'
                                }}
                        >
                            {
                                !this.props.stockPerformanceOpen &&
                                <React.Fragment>
                                    {industry && 
                                        <Tag style={{fontSize: '14px'}}>{industry}</Tag>  
                                    }

                                    {sector && 
                                        <Tag style={{fontSize: '14px'}}>{sector}</Tag>
                                    }
                                    
                                    {universe && 
                                        <Tag style={{fontSize: '14px', color: 'green'}}>{universe}</Tag>
                                    }
                                </React.Fragment>
                            }
                        </div>
                }
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

    toggleStockFilterOpen = () => {
        this.setState({stockFilterOpen: !this.state.stockFilterOpen});
    }

    onFilterChange = filterData => {
        return new Promise(resolve => {
            const sectors = _.get(filterData, 'sectors', []);
            const industries = _.get(filterData, 'industries', []);
            this.setState({
                filter: {
                    ...this.state.filter,
                    sector: _.join(sectors.map(item => encodeURIComponent(item)), ','),
                    industry: _.join(industries.map(item => encodeURIComponent(item)), ',')
                },
                selectedPage: 0
            }, () => this.fetchStocks(this.state.searchInput, false));
            resolve(true);
        });
    }

    shouldFiltersBeShown = () => {
        if (this.props.benchmark === 'NIFTY_50' || this.props.benchmark === 'NIFTY_MIDCAP_50') {
            return true;
        } else {
            if (this.props.filters.sector.length > 0 && this.props.filters.industry.length === 0) {
                return true
            }
            return false;
        }
    }

    renderStockListDetails = () => {
        return (
            <React.Fragment>
                <Media 
                    query={`(max-width: ${screenSize.mobile})`}
                    render={() => (
                        <Motion
                                style={{ 
                                    detailX: spring((this.state.stockPerformanceOpen || this.state.stockFilterOpen) ? 0 : 600),
                                    listX: spring((this.state.stockPerformanceOpen || this.state.stockFilterOpen) ? -600 : 0)
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
                                            <div style={{height: '200px'}}></div>
                                        </Col>
                                        <Col 
                                                span={24} 
                                                style={{
                                                    transform: `translate3d(${detailX}px, 0, 0)`,
                                                    top: this.state.stockPerformanceOpen ? '85px' : '45px',
                                                    position: 'absolute'
                                                }}
                                        >
                                            {
                                                this.state.stockPerformanceOpen &&
                                                <StockPerformance stock={this.state.selectedStock}/>
                                            }
                                            <div
                                                    style={{
                                                        display: this.state.stockFilterOpen ? 'block' : 'none'
                                                    }}
                                            >
                                                <StockFilter 
                                                    onFilterChange={this.onFilterChange}
                                                    filters={this.props.filters}
                                                />
                                            </div>
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
                            {
                                this.shouldFiltersBeShown() &&
                                <Col 
                                        span={4}
                                        style={{
                                            height: global.screen.height - 195,
                                            overflow: 'hidden',
                                            overflowY: 'scroll',
                                            borderRight: '1px solid #eaeaea'
                                        }}
                                >
                                    <StockFilter 
                                        onFilterChange={this.onFilterChange}
                                        filters={this.props.filters}
                                    />
                                </Col>
                            }
                            <Col 
                                    span={this.shouldFiltersBeShown() ? 10 : 12} 
                                    style={{
                                        padding: '20px',
                                        height: global.screen.height - 195,
                                        overflow: 'hidden',
                                        overflowY: 'scroll',
                                        borderRight: '1px solid #eaeaea'
                                    }}
                            >
                                {this.renderSearchStocksList()}
                            </Col>
                            <Col 
                                    span={this.shouldFiltersBeShown() ? 10 : 12}
                                    style={{
                                        padding: '20px',
                                        height: global.screen.height - 195,
                                        overflow: 'hidden',
                                        overflowY: 'scroll',
                                        borderRight: '1px solid #eaeaea'
                                    }}
                            >
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

    renderSelectedStocksMobile = (type = 'buy') => {
        const selectedStocks = type === 'buy' ? [...this.state.selectedStocks] : [...this.state.sellSelectedStocks];
        return (
            selectedStocks.length > 0 
            && !this.state.stockPerformanceOpen 
            && !this.state.stockFilterOpen 
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
                                <TagMobile 
                                        selected
                                        style={{
                                            marginRight: '15px' ,
                                            border: `1px solid #5ce5ea`,
                                            color: '#5ce5ea'
                                        }}
                                        color='blue'
                                        key={stock}
                                        closable
                                        onClose={() => {
                                            type === 'buy'
                                            ? this.conditionallyAddItemToSelectedArray(stock)
                                            : this.conditionallyAddItemToSellSelectedArray(stock)
                                        }}
                                >
                                    {stock}
                                </TagMobile>
                            );
                        })
                    }
                </Col>
            : null
        );
    }

    render() { 
        const selectedStocks = [...this.state.selectedStocks, ...this.state.sellSelectedStocks];

        return (
            <React.Fragment>
                <Row 
                        style={{
                            width: global.screen.width, 
                            overflow: 'hidden', 
                            height: global.screen.width <= 600 ? global.screen.height : global.screen.height - 100,
                            position: 'relative',
                            zIndex: 20000
                        }}
                >
                    <Media 
                        query='(max-width: 600px)'
                        render={() => 
                            <SearchStockHeaderMobile 
                                    filters={this.props.filters}
                                    selectedStocks={selectedStocks}
                                    stockPerformanceOpen={this.state.stockPerformanceOpen}
                                    stockFilterOpen={this.state.stockFilterOpen}
                                    toggleBottomSheet={this.props.toggleBottomSheet}
                                    addSelectedStocksToPortfolio={this.addSelectedStocksToPortfolio}
                                    portfolioLoading={this.state.portfolioLoading}
                                    toggleStockPerformanceOpen={this.toggleStockPerformanceOpen}
                                    toggleStockFilterOpen={this.toggleStockFilterOpen}
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
                                addSelectedStocksToPortfolio={this.addSelectedStocksToPortfolio}
                                portfolioLoading={this.state.portfolioLoading}
                            />
                        }
                    />
                    {this.renderStockListDetails()}
                </Row>
            </React.Fragment>
        );
    }
}
