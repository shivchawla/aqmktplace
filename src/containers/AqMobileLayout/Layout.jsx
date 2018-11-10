import * as React from 'react';
import Loading from 'react-loading-bar';
import BubbleChart from 'rmdi/lib/BubbleChart';
import Home from 'rmdi/lib/Home';
import Create from 'rmdi/lib/Create';
import Logout from 'rmdi/lib/Input';
import RemoveRedEye from 'rmdi/lib/RemoveRedEye';
import MaterialIconReact, {colorPalette} from 'material-icons-react';
import Accessibility from 'rmdi/lib/Accessibility';
import NewReleases from 'rmdi/lib/NewReleases';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {slide as HamburgerMenu} from 'react-burger-menu';
import {Icon as MaterialIcon} from 'rmdi'
import {Layout, Menu, Icon as AntdIcon} from 'antd';
import {NavBar, Button as MobileButton} from 'antd-mobile';
import {sidebarUrls, tradingContestSidebarUrls} from './constants';
import {Utils} from '../../utils';
import {primaryColor, horizontalBox, loadingColor} from '../../constants';
import logo from "../../assets/logo-advq-new.png";
import * as style from './layoutStyle';
import './layout.css';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;

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
        const {theme = 'light'} = this.props;
        const navBarStyle = {
            backgroundColor: theme === 'light' ? '#fff' : primaryColor,
        };
        const iconLightThemeColor = '#686868';

        return (
            <NavBar
                mode="light"
                icon={
                    <AntdIcon 
                        type={this.props.innerPage ? "left" : "menu-unfold"} 
                        style={{
                            ...style.sideBarMenuIconStyle, 
                            ...this.state.iconRotateStyle, 
                            ...this.props.menuIconStyle,
                            color: theme === 'light' ? iconLightThemeColor : '#fff',
                            zIndex: 20
                        }}
                        onClick = {
                            () => 
                                this.props.innerPage 
                                ? this.props.previousPageUrl
                                  ? this.props.history.push(this.props.previousPageUrl)
                                  : this.props.history.goBack()
                                : this.toggleSideMenu()}
                    />
                }
                onLeftClick={() => this.toggleSideMenu}
                style={{
                    display: 'flex', 
                    flexDirection: 'row', 
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    borderBottom: `1px solid ${theme === 'light' ? '#eaeaea' : primaryColor}`,
                    zIndex: 20,
                    ...navBarStyle,
                    ...this.props.navbarStyle
                }}
            >
                {
                    this.props.customHeader === undefined
                    ?   <div style={{...headerColor, cursor: 'pointer',display: 'inline-block'}}>
                            <span style={{...biggerFont, color: theme === 'light' ? primaryColor : '#fff'}}>A</span>
                            <span style={{color: theme === 'light' ? primaryColor : '#fff'}}>DVICE</span>
                            <span style={{...biggerFont, color: theme === 'light' ? '#e06666' : '#fff'}}>Q</span>
                            <span style={{color: theme === 'light' ? '#e06666' : '#fff'}}>UBE</span>
                        </div>
                    :   this.props.customHeader
                }
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
                    isOpen={this.state.sideBarOpenStatus} 
                    styles={style.sideBarMenuStyle}
                    disableOverlayClick={this.toggleSideMenu}
            >
                <Row>
                    <Col 
                            span={24} 
                            style={{
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                padding: '5px 15px', 
                                alignItems: 'center',
                                borderBottom: '1px solid #eaeaea'
                            }}
                    >
                        <div 
                                onClick={() => this.props.history.push('/home')} 
                                style={{...horizontalBox}}
                        >
                            <img src={logo} style={{height: '25px'}}/>
                            <div style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>
                                <span style={{...biggerFont, color:primaryColor}}>A</span>
                                <span style={{color: primaryColor}}>DVICE</span>
                                <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                <span style={{color: '#e06666'}}>UBE</span>
                            </div>
                        </div>
                    </Col>
                    <Col span={24} style={{marginTop: '20px'}}>
                        <Menu style={{backgroundColor: 'transparent'}} mode="inline">
                            <Menu.Item 
                                    key={20} 
                                    onClick={() => {window.location.href = '/dailycontest/home'}}
                            >
                                <SideMenuItem menuItem={{name: 'Daily Contest', Icon: BubbleChart}} />
                            </Menu.Item>
                            <Menu.Item 
                                    key={20} 
                                    onClick={() => {window.location.href = '/dailycontest/mypicks'}}
                            >
                                <SideMenuItem menuItem={{name: 'Create Entry', Icon: Create}} />
                            </Menu.Item>
                            <Menu.Item 
                                    key={20} 
                                    onClick={() => {this.props.history.push('/home')}}
                            >
                                <SideMenuItem menuItem={{name: 'Home', Icon: Home}} />
                            </Menu.Item>
                            <Menu.Item 
                                    key={20} 
                                    onClick={() => {window.location.href = '/dailycontest/watchlist'}}
                            >
                                <SideMenuItem menuItem={{name: 'Watchlist', Icon: RemoveRedEye}} />
                            </Menu.Item>
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
                                        Icon: Utils.isLoggedIn() ? Logout : Logout
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
            <React.Fragment>
                <Loading
                    show={this.props.loading}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                {
                    !this.props.loading &&
                    <Layout id="aq-layout-container">
                        {this.renderLeftSidebar()}
                        {
                            !this.props.noHeader &&
                            this.renderHeader()
                        }
                        <Layout id="menu-wrapper">
                            <Layout style={{backgroundColor: '#fff', ...this.props.style}}>
                                {this.props.children}
                            </Layout>
                        </Layout>
                    </Layout>
                }
            </React.Fragment>
        );
    }
}

export const AqMobileLayout = withRouter(AqMobileLayoutImpl);

const SideMenuItem = ({menuItem}) => {
    const {Icon = null} = menuItem;

    return (
        <div style={{...horizontalBox, alignItems: 'center'}}>
            {
                Icon &&
                <Icon 
                    size={26}
                    color={primaryColor}
                />
            }
            <span style={{fontSize: '14px', color: '#686868', margin: 0, padding: 0, marginLeft: '10px'}}>{menuItem.name}</span>
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