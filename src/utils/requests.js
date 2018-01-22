import axios from 'axios';
const localConfig = require('../localConfig.json');

export const getStockData = (ticker) => {
    const {requestUrl, aimsquantToken} = localConfig;
    const url = `${requestUrl}/stock?ticker=${ticker.toUpperCase()}&exchange=NSE&country=IN&securityType=EQ`;
    return axios.get(url, {
        headers: {
            'aimsquant-token': aimsquantToken
        }
    });
};