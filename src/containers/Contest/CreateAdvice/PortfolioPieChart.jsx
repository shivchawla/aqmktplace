import * as React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {SegmentedControl} from 'antd-mobile';
import {Radio, Row, Col} from 'antd';
import {generateColorData} from '../../../utils';
import {HighChartNew} from '../../../components/HighChartNew';
import {horizontalBox} from '../../../constants';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;


export class PortfolioPieChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedView: 'stock'
        };
    }

    processDataForPieChart = () => {
        let {data = []} = this.props;
        data = data.filter(item => item.shares > 0);
        const tickers = _.uniq(data.map(item => item.symbol));
        const colorData = generateColorData(tickers);
        
        let nData = tickers.map(ticker => {
            var weightInTicker = _.sum(data.filter(item => {return item.symbol == ticker}).map(item => item.weight));
            
            return {
                name: ticker,
                y: Number(weightInTicker.toFixed(2)),
                color: colorData[ticker]
            }
        });

        return nData;
    }

    processSectorsForPieChart = () => {
        let {data = []} = this.props;
        data = data.filter(item => item.shares > 0);
        const sectorData = []; // This will contain the sector data
        data.map(stock => {
            const stockIndexInSector = _.findIndex(sectorData, item => item.name === stock.sector);
            let totalWeight = 0;
            if (stockIndexInSector === -1) {
                // Getting stocks with the same sectors
                const similarSectorStocks = data.filter(item => item.sector === stock.sector);
                // Getting the total weights of the selected sector
                similarSectorStocks.map(item => {totalWeight += item.weight});
                sectorData.push({
                    name: stock.sector,
                    y: Number(totalWeight.toFixed(2))
                });
            }
        });

        return sectorData;
    }

    onChange = value => {
        this.setState({selectedView: value.toLowerCase()});
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (!_.isEqual(nextProps.data, this.props.data) || !_.isEqual(nextState, this.state)) {
    //         return true;
    //     }

    //     return false;
    // }

    render() {
        const {chartId = "chart-container"} = this.props;

        return (
            <Row style={{backgroundColor: '#fff', padding: '10px'}}>
                <Col span={24}>
                    <HighChartNew
                        maxSlices={8}
                        maxWeight={90} 
                        chartId={chartId}
                        series={[{
                            name: 'Portfolio Composition', 
                            data: this.state.selectedView === 'sector' 
                                    ? this.processSectorsForPieChart()
                                    : this.processDataForPieChart()
                        }]}
                    />
                </Col>
                <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                    <Media 
                        query="(max-width: 600px)"
                        render={() => (
                            <SegmentedControl 
                                values={['Stock', 'Sector']}
                                onValueChange={this.onChange}
                                selectedIndex={this.state.selectedView === 'stock' ? 0 : 1}
                            />
                        )}
                    />
                    <Media 
                        query="(min-width: 601px)"
                        render={() => (
                            <RadioGroup defaultValue="stock" onChange={e => this.onChange(e.target.value)} size="small">
                                <RadioButton value="stock">Stock</RadioButton>
                                <RadioButton value="sector">Sector</RadioButton>
                            </RadioGroup>
                        )}
                    />
                </Col>
            </Row>
        );
    }
}