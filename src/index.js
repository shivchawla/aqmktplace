import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import {Provider} from 'react-redux';
import './index.css';
import 'antd/dist/antd.css';
import 'react-loading-bar/dist/index.css'
import App from './App';
import {unregister} from './registerServiceWorker';
import {store} from './store';

ReactDOM.render(
        <Provider store={store}>
            <Router>
                <App />
            </Router>
        </Provider>, 
        document.getElementById('root'));
unregister();
