import * as React from 'react';
import {Menu, Dropdown, Icon, Button} from 'antd';

export class AqDropDown extends React.Component {
    render () {
        const {renderMenu, value} = this.props;

        return (
            <Dropdown overlay={renderMenu()} trigger={['click']}>
                {/* <a className="ant-dropdown-link" href="#">
                    {value}<Icon type="down" />
                </a> */}
                <Button>{value}</Button>
            </Dropdown>
        );
    }
}