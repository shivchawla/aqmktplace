import React from 'react';
import _ from 'lodash';
import {Col} from 'antd';
import StockEditListItem from './StockEditListItem';

export default class StockList extends React.Component {

    calculateMax = (stockItem) => {
        const points = _.get(stockItem, 'points', 10);
        const totalSelectedPoints = _.sum(this.props.positions.map(item => item.points));
        const allowedExposure = Math.min(60, (100 - totalSelectedPoints) + points);
        
        return allowedExposure;
    }

    render() {
        const {positions = []} = this.props;

        return (
            <Col className='stock-list' span={24} style={{...stockListContainer, paddingTop: '20px'}}>
                {
                    positions.map((position, index) => {
                        return (
                            <StockEditListItem 
                                stockItem={{
                                    ...position,
                                    max: this.calculateMax(position)
                                }} 
                                key={index}
                                onStockItemChange={this.props.onStockItemChange}
                            />
                        );
                    })
                }
            </Col>
        );
    }
}

const stockListContainer = {
    height: global.screen.height - 50,
    overflow: 'hidden',
    overflowY: 'scroll',
    paddingBottom: '100px'
};