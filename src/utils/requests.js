import axios from 'axios';
import {Utils} from './index';
const localConfig = require('../localConfig.js');

export const getStockData = (ticker, field='priceHistory', detailType='detail') => {
    const {requestUrl} = localConfig;
    const url = `${requestUrl}/stock/${detailType}?ticker=${ticker.toUpperCase()}&exchange=NSE&country=IN&securityType=EQ&field=${field}`;
    return axios.get(url, {
        headers: Utils.getAuthTokenHeader()
    });
};

export const fetchAjax = (url, header=true) => {
	return axios.get(url, header ? {headers: Utils.getAuthTokenHeader()} : {});
};
