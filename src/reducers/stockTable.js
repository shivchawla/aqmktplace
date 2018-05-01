import {fromJS} from 'immutable';

const initialTransactions = () => {
    const data = [];
    for(let i=0; i < 5; i++) {
        data.push({
            symbol: '',
            key: i,
            shares: 0,
            lastPrice: 0,
            totalValue: 0,
            tickerValidationStatus: "warning",
            sharesValidationStatus: "success",
            sharesDisabledStatus: true
        });
    }
    return data;
};

const initialState = fromJS({
    transactionData: initialTransactions(),
    highStockSeries: [],
    remainingCash: 100000
});

export const stockTable = (state = initialState, action) => {
    switch(action.type) {
        case "ADD_TRANSACTION":
            return state.update('transactionData', transactionData => transactionData.push(action.payload));

        case "UPDATE_TRANSACTION":
            // console.log(action.payload.key);
            return state.updateIn(['transactionData', action.payload.key], item => item.mergeDeep(action.payload));

        case "ADD_HIGHSTOCK_SERIES":
            return state.update('highStockSeries', highStockSeries => highStockSeries.push(action.payload));

        case "UPDATE_REMAINING_CASH": 
            return state.set('remainingCash', action.payload);

        default:
            return state;
    }
}
