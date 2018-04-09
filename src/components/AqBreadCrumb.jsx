import * as React from 'react';
import {Link} from 'react-router-dom';
import {Breadcrumb} from 'antd';
import {withBreadcrumbs} from 'react-router-breadcrumbs-hoc';
import {routesNew} from '../routes';

const BreadCrumbs = ({breadcrumbs}) => {
    console.log(breadcrumbs);
    return <Breadcrumb style={{background: '#fff'}}>
        {
            breadcrumbs.map(({breadcrumb, path, match}) => {
                return (
                    <Breadcrumb.Item 
                        key={path}>
                        <Link 
                            to={{
                                pathname: `${path}`,
                                state: {
                                    pageTitle: breadcrumb
                                }
                            }}
                        >
                            {breadcrumb}
                        </Link>
                    </Breadcrumb.Item>
                );
            })
        }
    </Breadcrumb>
}

export default withBreadcrumbs(routesNew)(BreadCrumbs); // using the react-router-breadcrumbs-hoc