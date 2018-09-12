import React from 'react';
import _ from 'lodash';
import {Col} from 'antd'
import StockPreviewListItem from './StockPreviewListItem';

export default class StockPreviewList extends React.Component {
    render() {
        const {positions = []} = this.props;

        return (
            <Col className='stock-list' span={24} style={{...stockListContainer, paddingTop: '20px'}}>
                {
                    positions.map((position, index) => {
                        return (
                            <StockPreviewListItem position={position} key={index} />
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