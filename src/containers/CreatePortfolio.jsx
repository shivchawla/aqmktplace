import * as React from 'react';
import {withRouter} from 'react-router'
import {AddTransactions} from './AddTransactions';
import {CreatePortfolioMeta} from '../metas';
import AppLayout from './AppLayout';

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
