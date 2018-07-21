import axios from 'axios';
import _ from 'lodash';
import {notification} from 'antd';
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

export const fetchAjax = (url, history, redirectUrl = '/advice', header=undefined, errorCallback = undefined) => {
    return axios.get(url, {headers: header ? header : Utils.getAuthTokenHeader()})
    .catch(error => {
        return errorCallback !== undefined ? errorCallback(error) : handleGetError(error, history, redirectUrl);
    })
};

/*
requestDetail should be in the following format
{
    url,
    method,
    data
}
*/
export const createAjax = (requestDetail, history, redirectUrl = '/advice', header=undefined) => {
    return axios({
        ...requestDetail,
        headers: header ? header : Utils.getAuthTokenHeader()
    })
    .catch(error => {
        return handleCreateAjaxError(error, history, redirectUrl);
    });
}

export const handleGetError = (error, history, redirectUrl) => {
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
}

export const handleCreateAjaxError = (error, history, redirectUrl, disableNotification = false) => {
    Utils.checkForInternet(error, history);
    if (Utils.isLoggedIn()) {
        if (error.response) {
            Utils.checkForServerError(error, history, redirectUrl);
            Utils.checkErrorForTokenExpiry(error, history, redirectUrl);
        }
        if (error.response.status === 400 || 
            (error.response.status === 403 && _.get(error, 'response.data.code', '') !== 'server_error')
        ) {
            const errorMessage = _.get(error.response, 'data.message', 'Error occurred while creating Contest Entry');
            !disableNotification && openNotification('error', 'Error', errorMessage);
        }
    } else {
        history.push('/login');
    }
    return error;
}

export const openNotification = (type, title, message) => {
    notification[type]({
        message: title,
        description: message,
    });
}
