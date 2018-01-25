import * as React from 'react';
import _ from 'lodash';
import {AqLink} from '../components';
import {AqHighChartMod} from '../components/AqHighChartMod';
export class StockResearch extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            tickers: [
                {name: 'TCS', show: true},
                {name: 'WIPRO', show: true}
            ],
            tickerName: ''
        };
    }

    addItem = () => {
        const {tickers, tickerName} = this.state;
        tickers.push({name: tickerName, show: false});
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