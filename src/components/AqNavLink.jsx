import * as React from 'react';
import {NavLink} from 'react-router-dom';

export function AqNavLink(props) {
    const {to, breadCrumbName, pathName} = props;
    
    return (
        <NavLink 
            to={{
                pathname: to, 
                state:{name: breadCrumbName}
            }} 
            activeStyle={linkActiveStyle}
        >
                {pathName}
        </NavLink>
    );
}

const linkActiveStyle = {
    color: '#26899A',
    fontWeight: 600
};