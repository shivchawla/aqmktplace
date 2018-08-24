import * as React from 'react';
import {Icon} from 'antd';
import {metricColor, primaryColor, horizontalBox, verticalBox} from '../../../constants';

export const AddIcon = ({checked = false, size = '20px'}) => {
    const type = checked ? "minus-circle-o" : "plus-circle";
    const color = checked ? metricColor.negative : primaryColor;

    return <Icon style={{fontSize: size, color}} type={type} />
}
