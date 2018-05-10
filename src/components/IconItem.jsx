import * as React from 'react';
import {Row, Col, Icon, Tag} from 'antd';

export const IconItem = ({src, label, imageStyle={}, labelStyle={}}) => {
    return (
        <div style={{display: 'flex', justifyContent: 'row', alignItems: 'center'}}>
            <img style={imageStyle} src={src} />
            <span style={{...iconItemLabelStyle, ...labelStyle}}>{label}</span>
        </div>
    );
}

const iconItemImageStyle = {
    color: '#5A5A5A',
    fontSize: '12px',
    fontWeight: 400
    
};

const iconItemLabelStyle = {
    fontSize: '12px',
    verticalAlign:'sub',
    marginLeft: '10px'
};
