import {createStore, applyMiddleware} from 'redux';
import {createLogger} from 'redux-logger';
import {allReducers} from './reducers';

const middlewares = [
    // createLogger()
];

export const store = createStore(
    allReducers, 
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(), 
    applyMiddleware(...middlewares)
);
