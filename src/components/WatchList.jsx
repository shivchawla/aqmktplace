import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Tabs, Col, AutoComplete, Input, Icon, message, Row} from 'antd';
import {ChartTickerItem} from './ChartTickerItem';
import {Utils} from '../utils';

const {requestUrl} = require('../localConfig');
const Option = AutoComplete.Option;

export class WatchListImpl extends React.Component {
    numberOfTimeSocketConnectionCalled = 1;
    mounted = false;

    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            // tickers: this.props.tickers
        }
    }

    renderTickers = () => {
        // const tickers = [
        //     {name: 'TCS', y: 145, change: 1.5, hideCheckbox: true},
        // ];
        const {tickers} = this.props;
        return tickers.map((ticker, index) => 
                <ChartTickerItem 
                        key={index} 
                        legend={ticker} 
                        deleteItem={this.deleteItem} 
                />
        );
    }

    handleSearch = query => {
        const url = `${requestUrl}/stock?search=${query}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            this.setState({dataSource: this.processSearchResponseData(response.data)})
        })
        .catch(error => {
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        })
        .finally(() => {
            // this.setState({spinning: false});
        });
    }

    processSearchResponseData = data => {
        return data.map((item, index) => {
            return {
                id: index,
                symbol: item.ticker,
                name: item.detail !== undefined ? item.detail.Nse_Name : item.ticker
            }
        })
    }

    onSelect = value => {
        const presentTickers = this.props.tickers.map(item => item.name); // present ticker list 
        const newTickers = _.uniq([...presentTickers, value]); // unique ticker list after adding the selected item  
        // Calculating the difference to check if any item was added in the watchlist, a new request will only be sent
        // with the introduction of a new position
        const differenceArray = _.without(newTickers, ...presentTickers);
        if (differenceArray.length > 0) {
            const data = {
                name: this.props.name,
                securities: this.processPositions(newTickers)
            };
            const url = `${requestUrl}/watchlist/${this.props.id}`;
            axios({
                url,
                headers: Utils.getAuthTokenHeader(),
                data,
                method: 'PUT'
            })
            .then(response => {
                message.success('Successfully Updated Wishlist');
                this.props.getWatchlist(this.props.id);
            })
            .catch(error => {
                console.log(error);
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            });
        }
        
    }

    deleteItem = name => {
        console.log(name);
        const tickers = this.props.tickers.map(item => item.name);
        const newTickers = _.pull(tickers, name);
        const url = `${requestUrl}/watchlist/${this.props.id}`;
        const data = {
            name: this.props.name,
            securities: this.processPositions(newTickers)
        };
        axios({
            url,
            headers: Utils.getAuthTokenHeader(),
            data,
            method: 'PUT'
        })
        .then(response => {
            message.success(`Successfully Deleted ${name} from Wishlist`);
            this.props.getWatchlist(this.props.id);
        })
        .catch(error => {
            console.log(error);
            message.error(`Error occured while deleting ${name} from wishlist`);
            if (error.response) {
                Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
            }
        });
    }

    processPositions = positions => {
        return positions.map(item => {
            return {
                ticker: item,
                securityType: "EQ",
                country: "IN",
                exchange: "NSE"
            };
        });
    }

    renderOption = item => {
        return (
            <Option key={item.id} text={item.symbol} value={item.symbol}>
                <div>
                    <span>{item.symbol}</span><br></br>
                    <span style={{fontSize: '10px'}}>{item.name}</span>
                </div>
            </Option>
        );
    }

    componentWillUnmount() {
        this.mounted = false;
    }
    
    render() {
        const {dataSource} = this.state;

        return (
            <Row>
                <Col span={24}>
                    <AutoComplete
                            // disabled={!this.state.tickers.length}
                            className="global-search"
                            dataSource={dataSource.map(this.renderOption)}
                            onSelect={this.onSelect}
                            onSearch={this.handleSearch}
                            placeholder="Search Stocks"
                            style={{width: '100%'}}
                            optionLabelProp="value"
                    >
                        <Input suffix={<Icon style={searchIconStyle} type="search" />} />
                    </AutoComplete>
                </Col>
                 <Col span={24}>
                    {this.renderTickers()}
                </Col>
            </Row>
        );
    }
}

export const WatchList = withRouter(WatchListImpl);

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};