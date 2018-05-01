import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {withRouter} from 'react-router'
import {AddTransactions} from './AddTransactions';

export class CreatePortfolioImpl extends React.Component {
    render() {
        return (
            <AddTransactions />
        );
    }
}

export default withRouter(CreatePortfolioImpl);
