import React from 'react';
import ReactDOM from 'react-dom';
import createBrowserHistory from 'history/createBrowserHistory';
import './index.css';
import 'antd/dist/antd.css';
import {BrowserRouter as Router} from 'react-router-dom';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

const customHistory = createBrowserHistory();
ReactDOM.render(<Router history={createBrowserHistory}><App /></Router>, document.getElementById('root'));
registerServiceWorker();
