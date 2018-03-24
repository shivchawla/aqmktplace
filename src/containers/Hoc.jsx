import * as React from 'react';

export function myHoc(WrappedComponent) {
    return class NewHoc extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                username: 'Saurav Biswas',
                tickers: [
                    {name: 'TCS', value: 5},
                    {name: 'WIPRO', value: 7},
                    {name: 'LT', value: 9},
                    {name: 'NTPC', value: 10},
                    {name: 'HDFC', value: 12},
                    {name: 'ICICI', value: 14},
                ],
                series: [
                    {
                        name: 'Installation',
                        data: [43934, 52503, 57177, 69658, 97031, 119931, 137133, 154175]
                    }
                ]
            }
            
        }

        updateSeries = series => {
            this.setState({series});
        }

        addItem = item => {
            const series = [...this.state.series];
            series.push(item);
            this.setState({series});
        }

        onChange = e => {
            this.setState({username: e.target.value});
        }

        updateTickers = tickers => {
            this.setState({tickers})
        }
        
        render() {
            const newProps = {
                username: this.state.username,
                onChange: this.onChange,
                tickers: this.state.tickers,
                updateTickers: this.updateTickers,
                series: this.state.series,
                updateSeries: this.updateSeries,
                addItem: this.addItem
            };
            return <WrappedComponent {...this.props} {...newProps} />
        }
    }
}