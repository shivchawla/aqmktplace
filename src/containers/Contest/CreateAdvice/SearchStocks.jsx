import * as React from 'react';
import _  from 'lodash';
import {Row, Col, Input, Icon, Checkbox, Button} from 'antd';
import {withRouter} from 'react-router';
import {StockPerformance} from './StockPerformance';
import {horizontalBox, verticalBox, metricColor, primaryColor} from '../../../constants';
import {fetchAjax} from '../../../utils';

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
            selectedPage: 0
        };
    }

    renderSearchStocksList = () => {
        return (
            <Row>
                <Col span={24}>
                    <Search placeholder="Search Stocks" onChange={this.handleSearchInputChange}/>
                </Col>
                {this.renderPagination()}
                <Col span={24} style={{marginTop: '20px'}}>
                    {this.renderStockList()}
                </Col>
            </Row>
        );
    }

    handleSearchInputChange = e => {
        const searchQuery = e.target.value;
        this.setState({searchInput: searchQuery}, () => {
            this.fetchStocks();
        });
    }

    fetchStocks = (searchQuery = this.state.searchInput) => new Promise(resolve => {
        const skip = this.state.selectedPage;
        const limit = 10;
        const populate = true;
        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', '');
        const industry = _.get(this.props, 'filters.industry', '');
        const url = `${requestUrl}/stock?search=${searchQuery}&populate=${populate}&universe=${universe}&sector=${sector}&industry=${industry}&skip=${skip}&limit=${limit}`;
        fetchAjax(url, this.props.history, this.props.pageUrl)
        .then(({data: stockResponseData}) => {
            this.setState({stocks: this.processStockList(stockResponseData)});
            resolve(true);
        });
    })

    renderStockList = () => {
        const {stocks = []} = this.state;

        return stocks.map((stock, index) => 
            <StockListItem 
                key={index} 
                {...stock} 
                onClick={this.handleStockListItemClick} 
                onAddIconClick={this.conditionallyAddItemToSelectedArray}
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
                checked: selectedStocks.indexOf(symbol) >= 0
            };
        }).filter(stock => stock.name !== null);
    }

    conditionallyAddItemToSelectedArray = (symbol, addToPortfolio = true) => {
        const selectedStocks = [...this.state.selectedStocks];
        const stocks = [...this.state.stocks];
        const selectedStockIndex = selectedStocks.indexOf(symbol);
        const targetStock = stocks.filter(stock => stock.symbol === symbol)[0];
        if (targetStock !== undefined) {
            if (selectedStockIndex === -1) {
                selectedStocks.push(symbol);
                targetStock.checked = true;
            } else {
                selectedStocks.splice(selectedStockIndex, 1);
                targetStock.checked = false;
            }
            this.setState({selectedStocks, stocks}, () => {
                const position = {
                    key: symbol,
                    name: _.get(targetStock, 'name', ''),
                    sector: _.get(targetStock, 'sector', null),
                    lastPrice: targetStock.current,
                    shares: 1,
                    symbol: symbol,
                    ticker: symbol,
                    totalValue: targetStock.current,
                };
                addToPortfolio && this.props.addPosition(position);
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!_.isEqual(nextProps, this.props)) {
            this.syncStockListWithPortfolio(nextProps.portfolioPositions);
            // console.log(this.props.portfolioPositions);
        }
    }

    syncStockListWithPortfolio = positions => {
        const selectedStocks = positions.map(position => position.symbol);
        let stocks = [...this.state.stocks]; 
        stocks = stocks.map(stock => {
            // If stock is present in the portfolio mark checked as true else false
            const stockIndex = _.findIndex(positions, position => position.symbol === stock.symbol);
            let checked = stockIndex !== -1 ? true : false;

            return {...stock,checked};
        });

        this.setState({selectedStocks, stocks});
    }

    componentWillMount() {
        this.fetchStocks('');
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
                <Button
                        onClick={() => this.handlePagination('next')}  
                        disabled={this.state.stocks.length % 10 !== 0}
                >
                    Next
                </Button>
            </Col>
        );
    }

    render() {
        const containerStyle = {
            padding: '20px'
        };
        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);

        return (
            <Row style={containerStyle}>
                <Col span={24} style={topHeaderContainer}>
                    <div>
                        <h3 style={{fontSize: '14px'}}>Add Stocks to your Portfolio</h3>
                        <div style={horizontalBox}>
                            <h3 style={{fontSize: '14px'}}>Universe: {universe}</h3>
                            <h3 style={{fontSize: '14px'}}>, Sector: {sector}</h3>
                            <h3 style={{fontSize: '14px'}}>, Industry: {industry}</h3>
                        </div>
                    </div>
                    <Icon 
                        style={{fontSize: '24px', cursor: 'pointer'}} 
                        type="close-circle" 
                        onClick={this.props.toggleBottomSheet}
                    />
                </Col>
                <Col span={12}>
                    {this.renderSearchStocksList()}
                </Col>
                <Col span={12}>
                    <StockPerformance stock={this.state.selectedStock}/>
                </Col>
            </Row>
        );
    }
}

// export const SearchStocks = withRouter(SearchStocksImpl);

const StockListItem = ({symbol, name, change, changePct, close, open, current, onClick, checked = false, onAddIconClick}) => {
    const containerStyle = {
        borderBottom: '1px solid #eaeaea',
        color: textColor,
        marginBottom: '20px',
        cursor: 'pointer'
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
        <Row style={containerStyle} type="flex" align="middle">
            <Col span={1} onClick={() => onAddIconClick(symbol)}>
                <AddIcon checked={checked}/>
            </Col>
            <Col span={15} style={leftContainerStyle} onClick={() => onClick(symbol)}>
                <div style={horizontalBox}>
                    <h3 style={{fontSize: '16px', fontWeight: '700'}}>{symbol}</h3>
                    <Icon style={{color: changeColor, marginLeft: '10px'}} type={changeIcon} />
                </div>
                <h3 style={{fontSize: '12px'}}>{name}</h3>
            </Col>
            <Col span={8} style={detailContainerStyle} onClick={() => onClick(symbol)}>
                <div style={horizontalBox}>
                    <h3 style={{fontSize: '18px', fontWeight: '700'}}>{current}</h3>
                </div>
                <div style={horizontalBox}>
                    <h3 style={{color: changeColor, fontSize: '14px', marginLeft: '10px'}}>{change > 0 && '+'} {change}</h3>
                    <h3 style={{color: changeColor, marginLeft: '5px', fontSize: '14px'}}>({change > 0 && '+'} {nChangePct} %)</h3>
                </div>
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
};