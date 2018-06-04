import * as React from 'react';
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import {withRouter} from 'react-router'
import {AddTransactions} from './AddTransactions';
import {CreatePortfolioMeta} from '../metas';

export class CreatePortfolioImpl extends React.Component {
    render() {
        return (
            <React.Fragment>
                <CreatePortfolioMeta />
                <AddTransactions />
            </React.Fragment>
        );
    }
}

export default withRouter(CreatePortfolioImpl);
