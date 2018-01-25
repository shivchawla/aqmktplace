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

export * from './requests';