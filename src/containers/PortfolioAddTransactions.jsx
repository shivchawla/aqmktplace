import * as React from 'react';
import {AddTransactions} from './AddTransactions';

export default class PortfolioAddTransactions extends React.Component {
    render() {
        return (
            <AddTransactions portfolioId={this.props.match.params.id}/>
        );
    }
}


