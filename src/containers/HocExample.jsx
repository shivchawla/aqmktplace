import * as React from 'react';
import _ from 'lodash';
import {getStockPerformance} from '../utils';
import {MyChartNew} from './MyChartNew';
import {myHoc} from '../hoc/highChart';

export class HocExampleImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [{
                name: 'HDFC'
            }],
            tickerName: 'YESBANK'
        };
    }
   
    addTicker = () => {
        const {tickerName} = this.state;
        const series = [...this.state.series];
        getStockPerformance(tickerName)
        .then(performance => {
            series.push({
                name: tickerName,
                data: performance
            });
            this.setState({series, tickerName: ''});
        });
    } 

    renderTickers = () => {
        return this.state.series.map((item, index) => {
            return <li key={index} onClick={(e) => this.handleListItemClick(item)}>{item.name}</li>
        });
    }

    handleListItemClick = (item) => {
        const series = [...this.state.series];
        const index = _.findIndex(series, seriesItem => seriesItem.name === item.name);
        series.splice(index, 1);
        this.setState({series});
    }

    clearAllExceptOne = () => {
        let series = [...this.state.series];
        series = series.filter(item => item.name === 'HDFC');
        this.setState({series});
    }

    updateTickers = () => {
        let series = [...this.state.series];
        getStockPerformance('SAIL')
        .then(performance => {
            series[0] = {
                name: 'SAIL',
                data: performance
            };
            series[2] = {
                name: 'ICICIBANK',
                data: performance
            };
            this.setState({series, tickerName: ''});
        });
    }

    onChange = e => {
        this.setState({tickerName: e.target.value});
    }

    render() {
        return (
            <div>
                <h1>{this.state.tickerName}</h1>
                <input value={this.state.tickerName} onChange={this.onChange} />
                <button onClick={this.addTicker}>Add Ticker</button>
                <button onClick={this.clearAllExceptOne}>Clear all except one</button>
                <button onClick={this.updateTickers}>Simulate Benchmark Change</button>
                <ul>
                    {this.renderTickers()}
                </ul>
                <MyChartNew series = {this.state.series} />

            </div>
        );
    }
}

export const HocExample = myHoc(HocExampleImpl);