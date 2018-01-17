import * as React from 'react';
import {Link} from 'react-router-dom';

export function AqLink(props) {
    const {to, pageTitle} = props;
    
    return (
        <Link 
                to={{
                    pathname: to, 
                    state:{pageTitle}
                }} 
        >   
            {
                props.children
                 ? props.children
                 : pageTitle
            }
        </Link>
    );
}