import * as React from 'react';
import {Tooltip, Rate} from 'antd';

export class AqRate extends React.Component {
    render() {
        const {value = 0, disabled=true, style={}} = this.props;
        return (
            <Tooltip title={value.toFixed(2)} placement="rightBottom">
                <div style={{display: 'inline-block'}}>
                    <Rate style={style} disabled={disabled} value={value} allowHalf />
                </div>
            </Tooltip>
        );
    }
}