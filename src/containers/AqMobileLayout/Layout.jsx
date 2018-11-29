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
import {primaryColor, horizontalBox, loadingColor, verticalBox} from '../../constants';
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
                <Row style={{position: 'relative', height: '100vh'}}>
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
                                onClick={() => window.location.href = '/home'}
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
                                    key={1} 
                                    onClick={() => {window.location.href = '/dailycontest/home'}}
                            >
                                <SideMenuItem menuItem={{name: 'Stock Prediction Contest', Icon: BubbleChart}} />
                            </Menu.Item>
                            <Menu.Item 
                                    key={2} 
                                    onClick={() => {window.location.href = '/dailycontest/stockpredictions'}}
                            >
                                <SideMenuItem menuItem={{name: 'Create Entry', Icon: Create}} />
                            </Menu.Item>
                            <Menu.Item 
                                    key={3} 
                                    onClick={() => window.location.href = '/home'}
                            >
                                <SideMenuItem menuItem={{name: 'Home', Icon: Home}} />
                            </Menu.Item>
                            <Menu.Item 
                                    key={4} 
                                    onClick={() => {window.location.href = '/dailycontest/watchlist'}}
                            >
                                <SideMenuItem menuItem={{name: 'Watchlist', Icon: RemoveRedEye}} />
                            </Menu.Item>
                            <Menu.Item 
                                    key={5} 
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
                    {
                        Utils.isLoggedIn() &&
                        <Col 
                                span={24}
                                style={{
                                    ...horizontalBox,
                                    width: '100%',
                                    backgroundColor: '#efeded',
                                    height: '55px',
                                    position: 'absolute',
                                    bottom: 0
                                }}
                        >
                            <div 
                                    style={{
                                        ...verticalBox , 
                                        width: '40px', 
                                        height: '40px',
                                        borderRadius: '100%',
                                        backgroundColor: primaryColor,
                                        marginLeft: '10px',
                                    }}
                            >
                                <h3 
                                        style={{
                                            fontFamily: 'Lato, sans-serif',
                                            fontWeight: '14px',
                                            fontWeight: 500,
                                            color: '#fff',
                                            marginBottom: 0
                                        }}
                                >
                                    {Utils.getLoggedInUserInitials()}
                                </h3>
                            </div>
                            <h3 
                                    style={{
                                        marginLeft: '10px', 
                                        color: primaryColor,
                                        fontFamily: 'Lato, sans-serif',
                                        fontWeight: 500,
                                        fontSize: '16px',
                                        marginBottom: 0
                                    }}
                            >
                                {Utils.getLoggedInUserName()}
                            </h3>
                        </Col>
                    }
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