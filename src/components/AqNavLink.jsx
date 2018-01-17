import * as React from 'react';
import {NavLink} from 'react-router-dom';

export function AqNavLink(props) {
    const {to, pageTitle} = props;
    
    return (
        <NavLink 
                to={{
                    pathname: to, 
                    state:{pageTitle}
                }} 
                activeStyle={linkActiveStyle}
        >
            {
                props.children
                 ? props.children
                 : pageTitle
            }
        </NavLink>
    );
}

const linkActiveStyle = {
    color: '#26899A',
    fontWeight: 600
};