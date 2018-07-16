import * as React from 'react';
import _ from 'lodash';
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

    onChange = e => {
        this.setState({selectedView: e.target.value});
    }

    // shouldComponentUpdate(nextProps, nextState) {
    //     if (!_.isEqual(nextProps.data, this.props.data) || !_.isEqual(nextState, this.state)) {
    //         return true;
    //     }

    //     return false;
    // }

    render() {
        return (
            <Row style={{backgroundColor: '#fff', padding: '10px'}}>
                <Col span={24} style={{marginLeft: '-20px'}}>
                    <HighChartNew
                        maxSlices={8}
                        maxWeight={90} 
                        series={[{
                            name: 'Portfolio Composition', 
                            data: this.state.selectedView === 'sector' 
                                    ? this.processSectorsForPieChart()
                                    : this.processDataForPieChart()
                        }]}
                    />
                </Col>
                <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                    <RadioGroup defaultValue="stock" onChange={this.onChange} size="small">
                        <RadioButton value="stock">Stock</RadioButton>
                        <RadioButton value="sector">Sector</RadioButton>
                    </RadioGroup>
                </Col>
            </Row>
        );
    }
}