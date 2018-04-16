import * as React from 'react';
import {Row} from 'antd';
import {statusColor} from '../constants';

export class StatusBar extends React.Component {
    render() {
        return(
            <Row style={{height: '3px', backgroundColor: this.props.color || '#FFC107', width: '100%'}}></Row>
        );
    }
}