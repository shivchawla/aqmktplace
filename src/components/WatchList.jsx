import * as React from 'react';
import {Tabs, Col} from 'antd';
import {ChartTickerItem} from './ChartTickerItem';

export class WatchList extends React.Component {
    renderTickers = () => {
        const tickers = [
            {name: 'TCS', y: 145, change: 1.5, hideCheckbox: true},
            {name: 'NTPC', y: 140, change: 2.5, hideCheckbox: true},
            {name: 'WIPRO', y: 125, change: -1.5, hideCheckbox: true},
            {name: 'LT', y: 110, change: 3.5, hideCheckbox: true},
            {name: 'HDFC', y: 190, change: 1.5, hideCheckbox: true},
        ];
        return tickers.map(ticker => <ChartTickerItem legend={ticker} />);
    }

    render() {
        return (
            <Col span={24}>
                {this.renderTickers()}
            </Col>
        );
    }
}