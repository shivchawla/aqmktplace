import * as React from 'react';
import {Flex, WhiteSpace, NavBar, Icon, SearchBar, WingBlank, Drawer, List} from 'antd-mobile';

export default class ScreenAdviceAntMobile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false
        };
    }

    onOpenChange = (...args) => {
        console.log(args);
        this.setState({ open: !this.state.open });
    }

    render() {
        return (
            <div>
                <NavBar icon={<Icon type="ellipsis" />} onLeftClick={this.onOpenChange}>AdviceQube</NavBar>
                <SearchBar placeholder="Search Advices" maxLength={8} cancelText="Cancel"/>
            </div>
        );
    }
}