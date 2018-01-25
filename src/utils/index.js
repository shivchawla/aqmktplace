import moment from 'moment';
import _ from 'lodash';
import {getStockData} from './requests';

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
            const data = performance.data.priceHistory.values;
            if (data.length > 0) { // Check if ticker is valid
                const performanceArray = data.map((item, index) => {
                    return [item.date * 1000, item.price]
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
export * from './requests';