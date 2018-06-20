import * as React from 'react';

export const IconItem = ({src, label, imageStyle={}, labelStyle={}}) => {
    return (
        <div style={{display: 'flex', justifyContent: 'row', alignItems: 'center'}}>
            <img style={imageStyle} src={src} />
            <span style={{...iconItemLabelStyle, ...labelStyle}}>{label}</span>
        </div>
    );
}

const iconItemLabelStyle = {
    fontSize: '12px',
    verticalAlign:'sub',
    marginLeft: '10px'
};
