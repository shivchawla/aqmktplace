import * as React from 'react';
import _ from 'lodash';
import {AqLink} from '../components';
import {AqHighChartMod} from '../components/AqHighChartMod';
export class StockResearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickers: ['TCS', 'WIPRO'],
            tickerName: ''
        };
    }

    addItem = () => {
        const {tickers} = this.state;
        tickers.push(this.state.tickerName);
        this.setState(tickers);
    }

    onChange = (e) => { 
        this.setState({tickerName: e.target.value});
    }

    render() {
        return (
            <div>
                <input onChange={this.onChange} value={this.state.tickerName} />
                <button onClick={this.addItem}>Add Item</button>
                <AqHighChartMod tickers={this.state.tickers}/>
                <AqLink to='/stockresearch/researchDetails' pageTitle='Research Data' />
            </div>
        );
    }
}