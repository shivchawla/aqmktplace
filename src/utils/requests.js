import axios from 'axios';
const localConfig = require('../localConfig.js');

export const getStockData = (ticker, field='priceHistory') => {
    const {requestUrl, aimsquantToken} = localConfig;
    const url = `${requestUrl}/stock/detail?ticker=${ticker.toUpperCase()}&exchange=NSE&country=IN&securityType=EQ&field=${field}`;
    return axios.get(url, {
        headers: {
            'aimsquant-token': aimsquantToken
        }
    });
};