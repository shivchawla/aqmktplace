import * as React from 'react';
import _ from 'lodash';
import {Table, Button, Row, Col, Tooltip} from 'antd';
import SliderInput from '../components/AqSliderInput';
import {Utils} from '../utils';
import {handleSectorTargetTotalChange, processSectorStockData, updateSectorWeights} from '../containers/Contest/CreateAdvice/utils';

export default class AqSectorTable extends React.Component {
    constructor(props) {
        super(props);
        this.columns = [
            {
                title: 'SECTOR',
                dataIndex: 'sector',
                key: 'sector',
                render: (text, record) => <span>{text}</span>,
                width: 170
            },
            {
                title: 'TARGET TOTAL',
                dataIndex: 'targetTotal',
                key: 'targetTotal',
                render: (text, record) => this.renderSliderColumns(text, record, 'targetTotal', 'number'),
                width: 170
            },
            {
                title: 'TOTAL',
                dataIndex: 'total',
                key: 'total',
                render: (text, record) => <span>{Utils.formatMoneyValueMaxTwoDecimals(text)}</span>,
                width: 150
            },
            {
                title: 'STOCKS #',
                dataIndex: 'numStocks',
                key: 'numStocks',
                render: (text, record) => <span>{text}</span>,
                width: 120
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                render: (text, record) => <span>{text} %</span>,
                width: 120
            },
        ];
        this.state = {
            selectedRows: [],
            data: processSectorStockData(props.data, props.data),
            stockData: props.data
        };
    }

    renderSliderColumns = (text, record, column, type, disabled = false) => {
        const value = Number(text);
        const nPositionsInSector = this.state.stockData.filter(item => item.sector === record.sector).length;
        let maxSectorExposure = _.max([0, _.min([this.props.maxSectorTargetTotal, (nPositionsInSector * this.props.maxStockTargetTotal)])]);
        if (this.props.isUpdate) {
            if (value > this.props.maxSectorTargetTotal && value < this.props.maxSectorTargetTotalHard) {
                maxSectorExposure = value;
            }
        }
        
        return (
            <SliderInput 
                value={value}
                onChange={value => {this.handleTargetTotalChange(value, record.key, column, type)}}
                min={0}
                max={maxSectorExposure}
                inputWidth='80%'
                hideValue
                stepSize={5000}
            />
        );
    }

    handleTargetTotalChange = (value, key, column) => {
        const newData = [...this.state.data];
        let positions = [...this.state.stockData];
        let target = newData.filter(item => item.key === key)[0];
        if (target !== undefined) {
            const newNav = Number(value);
            const oldNav = target.targetTotal;
            target[column] = newNav;
            this.setState({data: newData});
            let stockData = handleSectorTargetTotalChange(newNav, oldNav, key, positions);
            this.asyncProcessData(stockData, true)
            .then(data => updateSectorWeights(data))
            .then(data => {
                this.setState({
                    data: data,    
                    stockData: stockData
                });
                this.props.onChange(stockData);
            })
            .catch(err => console.log(err))
        }
    }

    asyncProcessData = (data, disableTargetTotalUpdate = false) => new Promise((resolve, reject) => {
        resolve (processSectorStockData(data, this.state.data, disableTargetTotalUpdate));
    })

    componentWillReceiveProps(nextProps) {
        if (nextProps.shouldUpdate) {
            this.setState({
                data: processSectorStockData(nextProps.data, nextProps.data),
                stockData: nextProps.data
            })
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.state, nextState) || !_.isEqual(this.props, nextProps)) {
            return true;
        } 
        return false;
    }

    render() {
        return (
            <Col span={24} style={{marginTop: '55px'}}>
                <Table 
                    columns={this.columns} 
                    dataSource={this.state.data} 
                    pagination={false}
                    size="small"
                    rowClassName="stock-table-col"
                />
            </Col>
        );
    }
}