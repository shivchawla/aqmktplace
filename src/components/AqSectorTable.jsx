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
                width: 130
            },
            {
                title: 'TARGET TOTAL',
                dataIndex: 'targetTotal',
                key: 'targetTotal',
                render: (text, record) => this.renderSliderColumns(text, record, 'targetTotal', 'number'),
                width: 300
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
                width: 80
            },
            {
                title: 'WEIGHT',
                dataIndex: 'weight',
                key: 'weight',
                render: (text, record) => <span>{text} %</span>,
                width: 80
            },
        ];
        this.state = {
            selectedRows: [],
            data: processSectorStockData(this.props.data, this.props.data),
            stockData: this.props.data
        };
    }

    renderSliderColumns = (text, record, column, type, disabled = false) => {
        const nPositionsInSector = this.state.stockData.filter(item => item.sector === record.sector).length;
        const maxSectorExposure = _.max([0, _.min([this.props.maxSectorTargetTotal, (nPositionsInSector * this.props.maxStockTargetTotal)])]);
        
        return (
            <SliderInput 
                value={text}
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
        let count = 0;
        let target = newData.filter(item => item.key === key)[0];
        if (target !== undefined) {
            const newNav = Number(value);
            const oldNav = target.targetTotal;
            target[column] = newNav;
            this.setState({data: newData});
            let stockData = handleSectorTargetTotalChange(newNav, oldNav, key, this.state.stockData);
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