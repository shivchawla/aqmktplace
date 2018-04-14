import * as React from 'react';
import {Link} from 'react-router-dom';
import {Breadcrumb} from 'antd';

export class AqBreadCrumb extends React.Component {
    renderBreadCrumbs = () => {
        const {breadCrumbs = []} = this.props;
        return breadCrumbs.map((item, index) => {
            const url = item.url ? item.url : '#';
            return (
                <Breadcrumb.Item key={index}>
                    <Link to={url}>{item.name}</Link>
                </Breadcrumb.Item>
            );
        });
    }
    render() {
        return (
            <Breadcrumb style={{fontSize: '12px'}}>
                {this.renderBreadCrumbs()}
            </Breadcrumb>
        );
    }
}