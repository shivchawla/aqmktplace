import * as React from 'react';
import {Row, Col, Radio} from 'antd';
import _ from 'lodash';
import HighChartNew from './HighChartNew';

export class AqPortfolioSummary extends React.Component {
    constructor(props) {
        super(props);
        this.chart = null;
        this.state = {
        }
    }

    componentDidMount() {
        this.initializeChart();
    }

    componentWillReceiveProps(nextProps, nextState) {
        if (!_.isEqual(nextProps.series,this.props.series)) {
            if (nextProps.series !== undefined) {
                this.updateSeries(nextProps.series);
            }
        } else {
            console.log('Same');
        }
    }

    componentWillUnmount() {
        this.chart.destroy();
    }

    renderOverviewMetrics = () => {
        const {positions, defaultComposition} = this.state;
        const {concentration = 0} = this.state.metrics;
        const colStyle = {marginBottom: '20px'};
        let nStocks = 0, nSectors = 0, nIndustries = 0, maxPosSize = {y: 0}, minPosSize = {y: 0};
        try {
            if (defaultComposition.length){
                nStocks = defaultComposition[0].data.length;
                nSectors = this.processSectorsForChart(positions, defaultComposition[0].data)[0].data.length;
                nIndustries = this.processIndustriesForChart(positions, defaultComposition[0].data)[0].data.length;
                maxPosSize = _.maxBy(defaultComposition[0].data, item => item.y);
                minPosSize = _.minBy(defaultComposition[0].data, item => item.y);
            }
    
            return (
                <Row style={{height: '345px'}}>
                    <Col span={24}>
                        <Row> 
                            <Col span={24} style={colStyle}>
                                <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="No. of Stocks" 
                                    value={nStocks}
                                />
                            </Col>
                            <Col span={24} style={colStyle}>
                                <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Concentration" 
                                    value={Number(concentration).toFixed(2)}/>
                            </Col>
                            <Col span={24} style={colStyle}>
                                <MetricItem 
                                    valueStyle={valueStyle} 
                                    labelStyle={labelStyle} 
                                    label="Max. Position Size" 
                                    value={maxPosSize.y}/>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            );
        } catch(err) {
            console.log(err);
        }
    }

    renderOverviewPieChart = () => {
        return (
            <Col>
                <HighChartNew series = {this.state.composition} />
                
                <Row style={{textAlign: 'center', marginTop: '-60px'}}>
                    <RadioGroup onChange={this.handleOverviewSelectChange} defaultValue="stocks" size="small">
                        <RadioButton value="stocks">Stocks</RadioButton>
                        <RadioButton value="sectors">Sectors</RadioButton>
                        <RadioButton value="industries">Industries</RadioButton>
                    </RadioGroup>
                </Row>
            </Col>
        );
    }


    render() {
        return(
            <Row type="flex" justify="space-between">
                <Col span="18"style={{height: '320px'}} id="chart-container"></Col>
                <Col span="6">
                    {this.renderOverviewMetrics()}
                </Col>
            </Row>
        );
    }
}