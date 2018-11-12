import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Icon} from 'antd';
import {Utils} from '../../../../utils';
import {metricColor, primaryColor, horizontalBox, verticalBox} from '../../../../constants';
import {AddIcon} from '../AddIcon';

const textColor = '#757575';

export default class StockListItemMobile extends React.Component {
    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        const {symbol, name, change, changePct, current, onClick, checked = false, onAddIconClick, selected = false} = this.props;
        const containerStyle = {
            borderBottom: '1px solid #eaeaea',
            color: textColor,
            // marginTop: '20px',
            cursor: 'pointer',
            backgroundColor: '#fff',
            padding: '10px 0',
            width: '100%'
        };

        const detailContainerStyle = {
            ...verticalBox,
            alignItems: 'flex-end',
            paddingRight: '10px'
        };

        const leftContainerStyle = {
            ...verticalBox,
            alignItems: 'flex-start'
        };

        const changeColor = change < 0 ? metricColor.negative : metricColor.positive;
        const changeIcon = change < 0 ? 'caret-down' : 'caret-up';
        const nChangePct = (changePct * 100).toFixed(2);

        return (
            <Row className='stock-row' style={containerStyle} type="flex" align="middle">
                <Col span={11} style={leftContainerStyle} onClick={() => onClick({symbol, name})}>
                    <div style={horizontalBox}>
                        <h3 style={{fontSize: '16px', fontWeight: '700'}}>{symbol}</h3>
                        <Icon style={{color: changeColor, marginLeft: '10px'}} type={changeIcon} />
                    </div>
                    <div style={horizontalBox}>
                        <h3 style={{fontSize: '14px', fontWeight: '400'}}>
                            {name}
                        </h3>
                    </div>
                </Col>
                <Col span={11} style={detailContainerStyle} onClick={() => onAddIconClick(symbol)}>
                    <h3 style={{fontSize: '15px', fontWeight: '700'}}>{Utils.formatMoneyValueMaxTwoDecimals(current)}</h3>
                    <div style={horizontalBox}>
                        <h3 
                                style={{color: changeColor, fontSize: '14px', marginLeft: '10px', fontWeight: '400'}}
                        >
                            {change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(change)}
                        </h3>
                        <h3 
                                style={{color: changeColor, marginLeft: '5px', fontSize: '14px'}}
                        >
                            ({change > 0 && '+'} {Utils.formatMoneyValueMaxTwoDecimals(nChangePct)} %)
                        </h3>
                    </div>
                </Col>
                <Col span={2} onClick={() => onAddIconClick(symbol)}>
                    <AddIcon checked={checked} size='24px'/>
                </Col>
            </Row>
        );
    }
}
