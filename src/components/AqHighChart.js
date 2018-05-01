import * as React from 'react';
import _ from 'lodash';
import {Checkbox, Switch} from 'antd';

const ReactHighstock = require('react-highcharts/ReactHighstock.src');

const defaultPlotOptions = {
    series: {
        compare: 'percent'
    }
};
const defaultYAxis = {
    labels:{
        formatter: function () {
            return (this.value > 0 ? ' + ' : '') + this.value + '%';
        }
    }
};

export class AqHighChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            highStockConfig: {
                rangeSelector: {
                    selected: 0
                },
                title: {
                    text: 'Stock Graph'
                },
                legend: {
                    enabled: true
                },
                series: [],
                plotOptions: defaultPlotOptions,
                yAxis: defaultYAxis,
            },
            tickerItems: [],
            seriesView: '',
            toggle: {
                name: 'Percentage',
                value: 'percent'
            }
        }
        this.seriesView = this.state.seriesView;
    }

    componentWillReceiveProps(props, state) {
        const {highStockConfig} = this.state;
        let seriesData = [];
        props.series.map((item) => {
            if(item.show){
                seriesData.push({
                    name: item.name,
                    data: item.priceHistory,
                    key: 0
                })
            }
        });
        highStockConfig.series = seriesData;
        this.setState({highStockConfig: _.cloneDeep(highStockConfig), tickerItems: props.series}, () =>{
            // console.log(this.state.tickerItems);
        });
    }

    renderCheckboxes = () => {
        return this.state.tickerItems.map((item, index) => {
            if(!item.show){
             return <Checkbox key={index} onChange={(e) => this.onCheckboxChange(item.key)}>{item.name.toUpperCase()}</Checkbox>
            } else {
                return null;
            }
        });
    }
    onCheckboxChange = (key) => {
        let {highStockConfig} = this.state;
        const seriesDataIndex = _.findIndex(highStockConfig.series, item => item.key === key);
        if(seriesDataIndex === -1) {
            const tickerData = this.state.tickerItems.filter(item => item.key === key)[0];
            highStockConfig.series.push({
                name: tickerData.name.toUpperCase(),
                data: tickerData.priceHistory,
                key: tickerData.key
            });
        } else {
            highStockConfig.series.splice(seriesDataIndex, 1);
        }
        this.setState({highStockConfig: _.cloneDeep(highStockConfig)});
    }

    onSwitchChange = (checked) => {
        let {highStockConfig} = this.state;
        let {plotOptions, yAxis} = highStockConfig;
        let toggle = {
            name: 'Percentage',
            value: 'percent'
        };
        if(!checked){
            toggle.name = 'Price';
            toggle.value = null;
            plotOptions.series.compare = null;
            yAxis = null
        } else {
            plotOptions = defaultPlotOptions;
            yAxis = defaultYAxis;
        }
        highStockConfig.plotOptions = plotOptions;
        highStockConfig.yAxis = yAxis;
        this.setState({toggle, highStockConfig: _.cloneDeep(highStockConfig)});
    }

    render() {
        return (
            <div>
                {this.renderCheckboxes()}
                <Switch defaultChecked onChange={this.onSwitchChange}/>{this.state.toggle.name}
                <ReactHighstock isPureConfig={true}  config={this.state.highStockConfig}/>
            </div>
        );
    }
}