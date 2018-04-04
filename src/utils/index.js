import moment from 'moment';
import _ from 'lodash';
import {graphColors} from '../constants';
import {getStockData} from './requests';

export const dateFormat = 'Do MMMM YYYY';

export const getUnixTimeSeries = (data) => {
    return new Promise((resolve, reject) => {
        const benchmarkArray = _.toPairs(data).sort();
        const unixBenchmarkArray = benchmarkArray.map((item, index) => {
            const timeStamp = moment(item[0], 'YYYY-MM-DD').valueOf();
            return [timeStamp, item[1]];
        });
        resolve(unixBenchmarkArray);
    });
};

export const getUnixStockData = (data) => {
    return new Promise((resolve, reject) => {
        getStockData(data)
        .then(response => {
            resolve(getUnixTimeSeries(response.data.priceHistory.values));
        })
    })
}

export const getStockPerformance = (tickerName) => {
    return new Promise((resolve, reject) => {
        getStockData(tickerName)
        .then(performance => {
            const data = performance.data.priceHistory;
            if (data.length > 0) { // Check if ticker is valid
                const performanceArray = data.map((item, index) => {
                    return [moment(item.date).valueOf(), item.price]
                });
                resolve(performanceArray);
            } else {
                reject('Invalid Ticker');
            }
        })
        .catch(error => {
            reject(error);
        });
    });
}

export const convertToPercentage = value => {
    return Number((100 * value).toFixed(2));
}

export const generateColorData = (tickers => {
    let obj = {};
    tickers.map((ticker, index) => {
        obj[ticker] = graphColors[index];
    });

    return obj;
});
export * from './requests';