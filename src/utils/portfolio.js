import _ from 'lodash';
import moment from 'moment';
import {Utils} from '../utils';

export const addToMyPortfolio = (advices, advicePerformance, position, positionIndex) => {
    const adviceIndex = _.findIndex(advices, advice => advice.id === null);

    // Check if an advice with the same id is already added.
    // if not create a new advice and add the position into it
    // if exists insert the position into the particular advice
    return adviceIndex === -1 
                    ? addPositionToAdvice(advices, advicePerformance, position, positionIndex) 
                    : addPositionToAdvice(advices, advicePerformance, position, positionIndex, adviceIndex);
}

export const addToAdvice = (advices, advicePerformance, position, positionIndex) => {
    const adviceIndex = _.findIndex(advices, advice => {
        if (position.advice !== null) {
            return advice.id === position.advice._id
        }
        return false;
    });

    // Check if an advice with the same id is already added.
    // if not create a new advice and add the position into it
    // if exists insert the position into the particular advice
    return adviceIndex === -1 
                    ? addPositionToAdvice(advices, advicePerformance, position, positionIndex) 
                    : addPositionToAdvice(advices, advicePerformance, position, positionIndex, adviceIndex);
}

export const addPositionToAdvice = (advices, advicePerformance, position, positionIndex, adviceIndex = null) => {
    const advice = advicePerformance.filter(advicePerformanceItem => {
        if (position.advice !== null) { // such that the sub position belongs to an advice
            return position.advice._id === advicePerformanceItem.advice;
        } else {
            return advicePerformanceItem.advice === "";
        }
    })[0];
    if (adviceIndex === null) { // A new advice is to be created with position in it
        advices.push({
            id: position.advice ? position.advice._id : null,
            name: position.advice ? position.advice.name : 'My Portfolio',
            key: positionIndex,
            weight: _.get(advice, 'personal.weightInPortfolio', 0),
            profitLoss: _.get(advice, 'personal.totalPnl', 0),
            oldUnits: 1,
            newUnits: 1,
            netAssetValue: _.get(advice, 'personal.netValue', 0),
            hasChanged: advice.hasChanged || false,
            date: moment().format('YYYY-MM-DD'),
            composition: [
                {
                    key: 1,
                    adviceKey: positionIndex,
                    symbol: _.get(position, 'security.detail.NSE_ID', null) || _.get(position, 'security.ticker',''),
                    shares: position.quantity,
                    modifiedShares: position.quantity,
                    newShares: 0,
                    price: position.lastPrice,
                    avgPrice: position.avgPrice,
                    costBasic: position.avgPrice,
                    unrealizedPL: 1231,
                    weight: 0,
                    name: _.get(position, 'security.detail.Nse_Name', '-'),
                    sector: _.get(position, 'security.detail.Sector', '-'),
                    transactionalQuantity: 0
                }
            ]
        });
    } else { // A new position needs to be added where the advice has index == adviceIndex
        advices[adviceIndex].composition.push({
            key: positionIndex + 1,
            adviceKey: advices[adviceIndex].key,
            symbol: position.security.ticker,
            shares: position.quantity,
            modifiedShares: position.quantity,
            price: position.lastPrice,
            avgPrice: position.avgPrice,
            costBasic: position.avgPrice,
            unrealizedPL: 1231,
            newShares: 0,
            weight: '12%',
            name: _.get(position, 'security.detail.Nse_Name', '-'),
            sector: _.get(position, 'security.detail.Sector', '-'),
            transactionalQuantity: 0
        });
    }

    return advices;
}
