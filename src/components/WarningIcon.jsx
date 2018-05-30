import * as React from 'react';
import {Icon, Popover} from 'antd';
import {metricColor} from '../constants';

export class WarningIcon extends React.Component {
    render() {
        const {reason = 'Undefined Reason'} = this.props;
        let {content = null} = this.props;

        if (content === null) {
            content = <p>{reason}</p>;
        }
        return (
            <Popover content={content} placement="right">
                <Icon type="exclamation-circle" style={exclamationIconStyle}/>
            </Popover>
        );
    }
}

const exclamationIconStyle = {
    fontSize: '18px',
    color: metricColor.negative,
    marginLeft: '5px'
}