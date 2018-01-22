import {combineReducers} from 'redux';
import {stockTable} from './stockTable';

export const allReducers = combineReducers({
    transactions: stockTable
});