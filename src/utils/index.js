import moment from 'moment';
import _ from 'lodash';

export const getUnixTimeSeries = (data) => {
    return new Promise((resolve, reject) => {
        const benchmarkArray = _.toPairs(data);
        const unixBenchmarkArray = benchmarkArray.map((item, index) => {
            const timeStamp = moment(item[0], 'YYYY-MM-DD').valueOf();
            return [timeStamp, item[1]];
        });
        resolve(unixBenchmarkArray);
    });
};

export const addTimeSeries = (highStockConfig, name, data) => {
    const benchmarkSeries = {
        name, 
        data,
        tooltip: {
            valueDecimals: 2
        }
    };
    // To get the index of the ticker from the series array of HighStock config
    const tickerIndex = _.findIndex(highStockConfig.series, object => {
        return object.name === name;
    });
    // To check if the series for the ticker is already added
    if(tickerIndex === -1) {
        highStockConfig.series.push(benchmarkSeries);
    } else {
        highStockConfig.series[0].data = data;
    }

    return highStockConfig;
};

export const calculateRemainingCash = (data, initialCash) => {
    let totalCash = 0;
    data.map((item, index) => {
        totalCash += item.totalValue;
    });
    
    return (initialCash - totalCash);
};

export * from './requests';