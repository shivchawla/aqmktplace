import * as React from 'react';
import {Link} from 'react-router-dom';
import {Breadcrumb} from 'antd';

export class BreadCrumb extends React.Component {
    renderBreadCrumbs = () => {
        const {breadCrumbs = []} = this.props;
        return breadCrumbs.map((item, index) => {
            const url = item.url ? item.url : '#';
            return (
                <Breadcrumb.Item>
                    <Link to={url}>{item.name}</Link>
                </Breadcrumb.Item>
            );
        });
    }
    render() {
        return (
            <Breadcrumb style={{fontSize: '12px', marginBottom: '20px'}}>
                {this.renderBreadCrumbs()}
            </Breadcrumb>
        );
    }
}