import * as React from 'react';
import {myHoc} from './Hoc';
import {getStockPerformance} from '../utils';
import {MyChart} from './MyChart';

class HocExampleImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [
                {
                    name: 'Installation',
                    data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
                }
            ]
        }
    }
    
    updateBenchmark = () => {
        const tickers = [...this.props.tickers];
        tickers[0] = {name: 'AimsQuant', value: 100};
        this.props.updateTickers(tickers);
    }

    onChange = e => {
        this.setState({username: e.target.value});
    }

    getSeries = (series) => {
        return series.length >= 2 ? [] : [...series];
    }

    addItem = () => {
        const series = [...this.state.series];
        series.push({
            name: 'Manufacturing',
            data: [24916, 24064, 29742, 29851, 32490, 30282, 38121, 40434]
        })
        this.setState({series});
    }

    render() {
        return (
            <div>
                <h1>{this.state.username}</h1>
                <input value={this.props.username} onChange={this.state.onChange} />
                <button onClick={this.addItem}>Update Tickers</button>
                <MyChart series = {this.state.series} />
            </div>
        );
    }
}

export const HocExample = myHoc(HocExampleImpl);