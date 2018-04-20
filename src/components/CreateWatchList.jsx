import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Col, AutoComplete, Input, Icon, List, Modal, message} from 'antd';
import {Utils} from '../utils';

const dateFormat = 'YYYY-MM-DD';
const Option = AutoComplete.Option;
const {requestUrl} = require('../localConfig');

class CreateWatchListImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            watchlists: [],
            name: '' 
        };
    }

    renderTickers = () => {
        return (
            <List 
                    style={{marginTop: '20px'}}
                    size="small"
                    bordered
                    dataSource={this.state.watchlists}
                    renderItem={
                        item => this.renderListItem(item)
                    }
            />
        );
    }

    renderListItem = item => {
        return (
            <List.Item>
                <Col span={8}>
                    <span>{item}</span>
                </Col>
                <Col span={16} style={{textAlign: 'right'}}>
                    <Icon 
                        type="close-circle-o" 
                        style={{
                            fontSize: '18px', 
                            fontWeight: 700, 
                            color: '#FF6767', 
                            cursor: 'pointer', 
                        }} 
                        onClick={() => this.deleteItem(item)}
                    />
                </Col>
            </List.Item>
        );
    }

    deleteItem = item => {
        const watchlists = [...this.state.watchlists];
        const index = _.findIndex(watchlists, watchListItem => watchListItem === item);
        watchlists.splice(index, 1);
        this.setState({watchlists});
    }

    handleSearch = query => {
        const url = `${requestUrl}/stock?search=${query}`;
        axios.get(url, {headers: Utils.getAuthTokenHeader()})
        .then(response => {
            try {
                this.setState({dataSource: this.processSearchResponseData(response.data)})
            } catch(error) {
                console.log(error);
            }
            
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

    onSelect = value => {
        let watchlists = [...this.state.watchlists];
        watchlists = _.uniq([...watchlists, value]);
        this.setState({watchlists});
    }

    createWatchList = () => {
        const {name} = this.state;
        if (name.length > 0) {
            const data = {
                name,
                securities: this.processWatchListItem(this.state.watchlists)
            };
            const url = `${requestUrl}/watchlist`;
            axios({
                url,
                data,
                method: 'POST',
                headers: Utils.getAuthTokenHeader()
            })
            .then(response => {
                message.success('Watchlist create successfully');
                this.props.getWatchlists();
                this.props.toggleModal();
            })
            .catch(error => {
                message.error('Error occured while creating watchlist');
                console.log(error);
                if (error.response) {
                    Utils.checkErrorForTokenExpiry(error, this.props.history, this.props.match.url);
                }
            })
        } else {
            message.error('Please provide a name for your watchlist');
        }
    }

    processWatchListItem = (items) => {
        return items.map(item => {
            return {
                ticker: item,
                securityType: "EQ",
                country: "IN",
                exchange: "NSE"
            };
        })
    }

    handleInputChange = e => {
        try {
            this.setState({name: e.target.value});
        } catch(error) {
            console.log(error);
        }
    }

    render() {
        const {dataSource} = this.state;
        return (
            <Modal
                    visible={this.props.visible}
                    title="Create Watchlist"
                    onOk={this.createWatchList}
                    onCancel={this.props.toggleModal}
            >
                <Col span={24}>
                    <Input placeholder="Watchlist Name" onChange={this.handleInputChange} value={this.state.name}/>
                </Col>
                <Col span={24} style={{backgroundColor: '#fff', padding: '10px'}}>
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
                    {this.renderTickers()}
                </Col>
            </Modal>
        );
    }
}

export const CreateWatchList = withRouter(CreateWatchListImpl);

const searchIconStyle = {
    marginRight: '20px',
    fontSize: '18px'
};