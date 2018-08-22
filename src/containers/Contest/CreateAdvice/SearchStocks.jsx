import * as React from 'react';
import Media from 'react-media';
import {Motion, spring} from 'react-motion';
import _  from 'lodash';
import ReactDOM from 'react-dom';
import {Row, Col, Input, Icon, Badge, Button, Tag, Checkbox} from 'antd';
import {SearchBar, Tag as TagMobile} from 'antd-mobile';
import {StockPerformance} from './StockPerformance';
import {screenSize} from './constants';
import StockFilter from '../SearchStockFilter/StockFilter';
import SearchStockHeader from './Mobile/SearchStockHeader';
import SearchStockHeaderMobile from './Mobile/StockSearchHeaderMobile';
import {horizontalBox, verticalBox, metricColor, primaryColor} from '../../../constants';
import {fetchAjax, Utils} from '../../../utils';
import '../css/searchStocks.css';

const CheckboxGroup = Checkbox.Group;
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
            this.fetchStocks();
        });
    }

    fetchStocks = (searchQuery = this.state.searchInput) => new Promise(resolve => {
        const limit = 10;
        const stocks = [...this.state.stocks];
        const skip = this.state.selectedPage * limit;
        const populate = true;
        const universe = _.get(this.props, 'filters.universe', null);
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
            this.setState({stocks: [...stocks, ...processedStocks]});
            this.pushStocksToLocalArray(processedStocks);
            resolve(true);
        })
        .finally(() => {
            this.setState({loadingStocks: false});
        })
    })

    resetSearchFilters = () => new Promise((resolve, reject) => {
        this.setState({selectedPage: 0}, () => this.fetchStocks('').then(() => resolve(true)));
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
        console.log('Stocks ',stocks);

        return (
            <StockListComponent 
                stocks={stocks}
                selectedStock={selectedStock}
                handleStockListItemClick={this.handleStockListItemClick}
                conditionallyAddItemToSelectedArray={this.conditionallyAddItemToSelectedArray}
            />
            // <React.Fragment>
            //     {
            //         stocks.length === 0 &&
            //         <h3 style={{fontSize: '16px', textAlign: 'center'}}>No Stocks Found</h3>
            //     }
            //     {
            //         stocks.map((stock, index) => (
            //             <React.Fragment key={index}>
            //                 <Media 
            //                     query={`(max-width: ${screenSize.mobile})`}
            //                     render={() => (
            //                         <StockListItemMobile 
            //                             key={index} 
            //                             {...stock} 
            //                             onClick={this.handleStockListItemClick} 
            //                             onAddIconClick={this.conditionallyAddItemToSelectedArray}
            //                             selected={stock.symbol === _.get(this.state, 'selectedStock.symbol', '')}
            //                         />
            //                     )}
            //                 />
            //                 <Media 
            //                     query={`(min-width: ${screenSize.desktop})`}
            //                     render={() => (
            //                         <StockListItem 
            //                             key={index} 
            //                             {...stock} 
            //                             onClick={this.handleStockListItemClick} 
            //                             onAddIconClick={this.conditionallyAddItemToSelectedArray}
            //                             selected={stock.symbol === _.get(this.state, 'selectedStock.symbol', '')}
            //                         />
            //                     )}
            //                 />
            //             </React.Fragment>
            //         ))
            //     }
            // </React.Fragment>
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
                sector: _.get(stock, 'security.detail.Sector', null)
            };
        }).filter(stock => stock.name !== null);
    }

    conditionallyAddItemToSelectedArray = (symbol, addToPortfolio = false) => {
        const selectedStocks = [...this.state.selectedStocks];
        const localStocks = [...this.localStocks];
        // const stocks = [...this.state.stocks];
        const stocks = _.map(this.state.stocks, _.clone);
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
            console.log(this.state.stocks);
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
        this.props.addPositions(positions)
        this.props.toggleBottomSheet();
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
        // if (this.props.isUpdate) {
        this.initializeSelectedStocks();
        // }
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
        const universe = _.get(this.props, 'filters.universe', null);
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
            console.log('StockComponent Updated');
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
            }, () => this.fetchStocks());
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

    renderSelectedStocksMobile = () => {
        const selectedStocks = [...this.state.selectedStocks];
        return (
            this.state.selectedStocks.length > 0 
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
                                            this.conditionallyAddItemToSelectedArray(stock)
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
        return (
            <React.Fragment>
                <Row 
                        style={{
                            width: global.screen.width, 
                            overflow: 'hidden', 
                            height: global.screen.width <= 600 ? global.screen.height : global.screen.height - 100,
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

class StockListComponent extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        console.log(nextProps.stocks);
        console.log(this.props.stocks);
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            console.log('StockList Updated');
            return true;
        }

        return false;
    }

    render() {
        const {stocks = []} = this.props;
        return (
            <React.Fragment>
                {
                    stocks.length === 0 &&
                    <h3 style={{fontSize: '16px', textAlign: 'center'}}>No Stocks Found</h3>
                }
                {
                    stocks.map((stock, index) => (
                        <React.Fragment key={index}>
                            <Media 
                                query={`(max-width: ${screenSize.mobile})`}
                                render={() => (
                                    <StockListItemMobile 
                                        key={index} 
                                        {...stock} 
                                        onClick={this.props.handleStockListItemClick} 
                                        onAddIconClick={this.props.conditionallyAddItemToSelectedArray}
                                        selected={stock.symbol === this.props.selectedStock}
                                    />
                                )}
                            />
                            <Media 
                                query={`(min-width: ${screenSize.desktop})`}
                                render={() => (
                                    <StockListItem 
                                        key={index} 
                                        {...stock} 
                                        onClick={this.props.handleStockListItemClick} 
                                        onAddIconClick={this.props.conditionallyAddItemToSelectedArray}
                                        selected={stock.symbol === this.props.selectedStock}
                                    />
                                )}
                            />
                        </React.Fragment>
                    ))
                }
            </React.Fragment>
        )
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
        width: '100%'
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
                    <h3 style={{fontSize: '14px', fontWeight: '400'}}>
                        {name}
                    </h3>
                </div>
            </Col>
            <Col span={11} style={detailContainerStyle} onClick={() => onClick({symbol, name})}>
                <h3 style={{fontSize: '15px', fontWeight: '700'}}>{Utils.formatMoneyValueMaxTwoDecimals(current)}</h3>
                <div style={horizontalBox}>
                    <h3 
                            style={{color: changeColor, fontSize: '14px', marginLeft: '10px', fontWeight: '400'}}
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

const fabButtonStyle = {
    width: '150px',
    boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3)',
    margin: '0 auto',
    background: '#30B9AD',
    color: '#fff'
};