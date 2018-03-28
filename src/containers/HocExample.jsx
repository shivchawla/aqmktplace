import * as React from 'react';
import _ from 'lodash';
import {Switch} from 'antd';
import {getStockPerformance} from '../utils';
import {MyChartNew} from './MyChartNew';
import {myHoc} from '../hoc/highChart';

export class HocExampleImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            series: [
                {
                    name: 'HDFC'
                },
                {
                    name: 'TCS'
                }
            ],
            tickerName: 'YESBANK',
            verticalLegend: false
        };
    }
   
    addTicker = (tickerName = this.state.tickerName) => {
        // const tickerName = name === undefined ? this.state.tickerName : name;
        console.log(tickerName);
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
            return <li key={index} onClick={(e) => this.handleListItemClick(item.name)}>{item.name}</li>
        });
    }

    handleListItemClick = (name) => {
        const series = [...this.state.series];
        const index = _.findIndex(series, seriesItem => seriesItem.name === name);
        series.splice(index, 1);
        this.setState({series});
    }

    clearAllExceptOne = () => {
        let series = [...this.state.series];
        series = [];
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
            };
            this.setState({series, tickerName: ''});
        });
    }

    onChange = e => {
        this.setState({tickerName: e.target.value});
    }

    handleSwitchChange = checked => {
        this.setState({verticalLegend: checked});
    }

    render() {
        return (
            <div>
                {/* <h1>{this.state.tickerName}</h1>
                <input value={this.state.tickerName} onChange={this.onChange} />
                <button onClick={() => this.addTicker()}>Add Ticker</button>
                <button onClick={this.clearAllExceptOne}>Clear all except one</button>
                <button onClick={this.updateTickers}>Simulate Benchmark Change</button>
                <ul>
                    {this.renderTickers()}
                </ul> */}
                {/* <Switch checked={this.state.verticalLegend} onChange={this.handleSwitchChange}/> */}
                <div style={{width: 1200, boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', padding: '20px', position: 'absolute', top: '250px'}}>
                    <MyChartNew 
                            series = {this.state.series} 
                            deleteItem={this.handleListItemClick}
                            addItem={this.addTicker}
                            verticalLegend={this.state.verticalLegend}
                    />
                </div>
            </div>
        );
    }
}

export const HocExample = myHoc(HocExampleImpl);