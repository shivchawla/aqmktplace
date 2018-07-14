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

    checkTickerForDuplications = (data, ticker) => {
        const duplicationIndexes = [];
        const nData = data.filter((dataItem, index) => {
            if (dataItem.ticker === ticker) {
                duplicationIndexes.push(index);
            }
            return dataItem.ticker === ticker
        });

        return {indexes: duplicationIndexes, length: nData.length -1}
    }

    processDataForPieChart = () => {
        let {data = []} = this.props;
        data = data.filter(item => item.shares > 0);
        const tickers = data.map(item => item.symbol);
        const colorData = generateColorData(tickers);
        let nData = data.map((item, index) => {
            const duplicateData = this.checkTickerForDuplications(data, item.ticker);
            let duplicateIndexes = duplicateData.indexes; // [0, 1, 2]
            const duplicateLength = duplicateData.length;
            let duplicateTotal = 0;
            // Removing the current index from the duplicate index array
            duplicateIndexes = duplicateIndexes.filter(duplicateIndex => {
                return duplicateIndex !== index
            });
            if (duplicateLength > 0) {
                duplicateIndexes.map(duplicateIndex => {
                    duplicateTotal += data[duplicateIndex].weight;
                });
                duplicateTotal += item.weight || 0;
            } else {
                duplicateTotal = item.weight || 0;
            }
            
            return {
                name: _.get(item, 'ticker', null),
                y: Number(duplicateTotal.toFixed(2)),
                color: colorData[_.get(item, 'ticker', null)]
            }
        });

        return _.uniqBy(nData, 'name');
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
        console.log('Pie Chart Rendered');
        return (
            <Row style={{backgroundColor: '#fff', padding: '10px'}}>
                <Col span={24} style={{marginLeft: '-20px'}}>
                    <HighChartNew 
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