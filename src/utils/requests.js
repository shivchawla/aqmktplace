import axios from 'axios';
import {Utils} from './index';
const localConfig = require('../localConfig.js');

export const getStockData = (ticker, field='priceHistory') => {
    const {requestUrl} = localConfig;
    const url = `${requestUrl}/stock/detail?ticker=${ticker.toUpperCase()}&exchange=NSE&country=IN&securityType=EQ&field=${field}`;
    return axios.get(url, {
        headers: Utils.getAuthTokenHeader()
    });
};