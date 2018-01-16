import * as React from 'react';
import {Breadcrumb} from 'antd';

export class AqBreadCrumb extends React.Component {
    renderBreadCrumbs = (breadCrumbs) => {
        return breadCrumbs.map((item, index) => {
            if (index === breadCrumbs.length - 1) {
                return <Breadcrumb.Item key={index}><a style={{color: '#26899A'}} href="">{item}</a></Breadcrumb.Item>;
            }

            return <Breadcrumb.Item key={index}>{item}</Breadcrumb.Item>
        }); 
    }

    render() {
        const {path = null} = this.props;
        const breadCrumbs = path.split('/');
        console.log(breadCrumbs);

        return (
            <Breadcrumb style={{background: '#fff'}}>
                <Breadcrumb.Item>Home</Breadcrumb.Item>
                {
                    breadCrumbs.length > 0
                        ? this.renderBreadCrumbs(breadCrumbs)
                        : null
                }
            </Breadcrumb>
        );
    }
}