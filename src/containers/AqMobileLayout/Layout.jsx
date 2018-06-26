import * as React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {slide as HamburgerMenu} from 'react-burger-menu';
import {Row, Col, Layout, Menu, Icon} from 'antd';
import {Flex, WhiteSpace, NavBar, SearchBar, WingBlank, Drawer, List} from 'antd-mobile';
import {sidebarUrls} from './constants';
import {primaryColor, horizontalBox} from '../../constants';
import * as style from './layoutStyle';

const {Header, Footer, Sider, Content} = Layout;

class AqMobileLayoutImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            sideBarOpenStatus: false,
            iconRotateStyle: {
                transform: 'rotate(0deg)'
            }
        };
    }

    renderHeader = () => {
        return (
            <NavBar
                mode="light"
                icon={
                    <Icon 
                        type="menu-unfold" 
                        style={{...style.sideBarMenuIconStyle, ...this.state.iconRotateStyle}}
                        onClick = {this.toggleSideMenu}
                    />
                }
                onLeftClick={() => this.toggleSideMenu}
                style={{
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                }}
            >
                <div 
                        onClick={() => this.props.history.push('/home')} 
                        style={{...headerColor, cursor: 'pointer',display: 'inline-block'}}
                >
                    <span style={{...biggerFont, color: primaryColor}}>A</span>
                    <span style={{color: primaryColor}}>DVICE</span>
                    <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                    <span style={{color: '#e06666'}}>UBE</span>
                </div>
            </NavBar>

        );
    }

    toggleSideMenu = () => {
        this.setState({sideBarOpenStatus: !this.state.sideBarOpenStatus});
    }

    handleBurgerMenuStateChange = state => {
        this.setState({
            iconRotateStyle: {
                transform: state.isOpen ? 'rotate(180deg)' : 'rotate(0deg)'
            }
        });
    }

    renderLeftSidebar = () => {
        return (
            <HamburgerMenu
                    id="left-drawer"
                    onStateChange={this.handleBurgerMenuStateChange}
                    customBurgerIcon={false}
                    customCrossIcon={false}
                    pageWrapId="menu-wrapper" 
                    outerContainerId="aq-layout-container"
                    isOpen={this.state.sideBarOpenStatus} 
                    styles={style.sideBarMenuStyle}
            >
                <Menu style={{backgroundColor: 'transparent'}}>
                    {
                        sidebarUrls.map((item, index) => (
                            <Menu.Item key={index} onClick={() => this.props.history.push(item.url)}>
                                <SideMenuItem menuItem={item} />
                            </Menu.Item>
                        ))
                    }
                    <Menu.Item onClick={this.toggleSideMenu}>
                        <SideMenuItem menuItem={{name: 'Toggle Drawer'}} />
                    </Menu.Item>
                </Menu>
            </HamburgerMenu>
        );
    }

    render() {
        return (
            <Layout id="aq-layout-container">
                {this.renderLeftSidebar()}
                {/* <Header style={style.headerStyle}> */}
                    {this.renderHeader()}
                {/* </Header> */}
                <Layout id="menu-wrapper">
                    <Layout>
                        {this.props.children}
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

export const AqMobileLayout = withRouter(AqMobileLayoutImpl);

const SideMenuItem = ({menuItem}) => {
    return (
        <div style={{...horizontalBox, alignItems: 'center'}}>
            {
                menuItem.icon &&
                <Icon style={{fontSize: '18px'}} type={menuItem.icon}/>
            }
            <h3 style={{fontSize: '16px', color: '#686868'}}>{menuItem.name}</h3>
        </div>
    );
}

const headerColor = {
    color: '#595959',
    fontSize: '16px'
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
}