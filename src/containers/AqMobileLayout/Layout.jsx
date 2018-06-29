import * as React from 'react';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {slide as HamburgerMenu} from 'react-burger-menu';
import {Layout, Menu, Icon} from 'antd';
import {NavBar} from 'antd-mobile';
import {sidebarUrls} from './constants';
import {Utils} from '../../utils';
import {primaryColor, horizontalBox} from '../../constants';
import * as style from './layoutStyle';

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
                        type={this.props.innerPage ? "left" : "menu-unfold"} 
                        style={{...style.sideBarMenuIconStyle, ...this.state.iconRotateStyle}}
                        onClick = {() => this.props.innerPage ? this.props.history.goBack() : this.toggleSideMenu()}
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

    logoutUser = () => {
        Utils.logoutUser();
        this.props.history.push('/login');
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
                <Row>
                    <Col 
                            span={24} 
                            style={{
                                display: 'flex', 
                                justifyContent: 'flex-end', 
                                paddingTop: '10px', 
                                paddingRight: '10px'
                            }}
                    >
                        <Icon 
                            type="close" 
                            style={{fontSize: '24px', zIndex: '20'}}
                            onClick={this.toggleSideMenu}
                        />
                    </Col>
                    <Col span={24}>
                        <Menu style={{backgroundColor: 'transparent'}}>
                            {
                                sidebarUrls.map((item, index) => (
                                    <Menu.Item key={index} onClick={() => this.props.history.push(item.url)}>
                                        <SideMenuItem menuItem={item} />
                                    </Menu.Item>
                                ))
                            }
                            <Menu.Item 
                                    key={20} 
                                    onClick={() => {
                                        Utils.isLoggedIn()
                                        ?   this.logoutUser()
                                        :   this.props.history.push('/login')
                                    }}
                            >
                                <SideMenuItem 
                                    menuItem={{
                                        name: Utils.isLoggedIn() ? 'Logout' : 'Login', 
                                        icon: Utils.isLoggedIn() ? 'logout' : 'login'
                                    }} 
                                />
                            </Menu.Item>
                        </Menu>
                    </Col>
                </Row>
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