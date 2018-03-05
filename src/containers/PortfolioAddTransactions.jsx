import * as React from 'react';
import {AddTransactions} from './AddTransactions';

export class PortfolioAddTransactions extends React.Component {
    render() {
        return (
            <AddTransactions portfolioId={this.props.match.params.id}/>
        );
    }
}


