import * as React from 'react';
import {Tooltip, Tag, Icon} from 'antd';

export const AqTag = props => {
    const {tooltipTitle, tooltipPlacement = 'right', color = '#e91363', tagStyle, icon, iconStyle, text = 'undefined', textStyle} = props;

    return (
        <Tooltip title={tooltipTitle} placement={tooltipPlacement}>
            <Tag style={{border: `1px solid ${color}`, cursor: 'auto', ...tagStyle}}>
                {
                    icon &&
                    <Icon type={icon} style={{color, ...iconStyle}}/>
                }
                <span style={{color, ...textStyle}}>{text}</span>
            </Tag>
        </Tooltip>
    );
}