import axios from 'axios';
import _ from 'lodash';
import {Utils} from './index';
const localConfig = require('../localConfig.js');

export const getStockData = (ticker, field='priceHistory', detailType='detail') => {
    const {requestUrl} = localConfig;
    const symbol = encodeURIComponent(ticker.toUpperCase());
    const url = `${requestUrl}/stock/${detailType}?ticker=${symbol}&exchange=NSE&country=IN&securityType=EQ&field=${field}`;
    return axios.get(url, {
        headers: Utils.getAuthTokenHeader()
    });
};

export const fetchAjax = (url, history, redirectUrl = '/advice', header=undefined) => {
    return axios.get(url, {headers: header ? header : Utils.getAuthTokenHeader()})
    .catch(error => {
        Utils.checkForInternet(error, history);
        if (Utils.isLoggedIn()) {
            if (error.response) {
                Utils.checkForServerError(error, history, redirectUrl);
                Utils.checkErrorForTokenExpiry(error, history, redirectUrl);
                if (error.response.status === 400 || 
                            (error.response.status === 403 && _.get(error, 'response.data.code', '') !== 'server_error')
                    ) {
                    history.push('/forbiddenAccess');
                }
            }
        } else {
            history.push('/login');
        }
        return error;
    })
};
