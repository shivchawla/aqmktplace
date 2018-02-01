import * as React from 'react';
import {Menu, Dropdown, Icon} from 'antd';

export class AqDropDown extends React.Component {
    render () {
        const {renderMenu, value} = this.props;

        return (
            <Dropdown overlay={renderMenu()} trigger={['click']}>
                <a className="ant-dropdown-link" href="#">
                    {value}<Icon type="down" />
                </a>
            </Dropdown>
        );
    }
}