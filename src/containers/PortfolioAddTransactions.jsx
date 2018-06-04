import * as React from 'react';
import {AddTransactions} from './AddTransactions';
import {UpdatePortfolioMeta} from '../metas';

export default class PortfolioAddTransactions extends React.Component {
    render() {
        return (
            <React.Fragment>
                <UpdatePortfolioMeta />
                <AddTransactions portfolioId={this.props.match.params.id}/>
            </React.Fragment>
        );
    }
}


