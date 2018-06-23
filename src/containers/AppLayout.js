import * as React from 'react';
import Media from 'react-media';
import Loadable from 'react-loadable';
//import {Layout, Menu, Row, Col, Button, Icon} from 'antd';
import Layout from 'antd/lib/layout';
import Menu from 'antd/lib/menu';
import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Button from 'antd/lib/button';
import Icon from 'antd/lib/icon';

import withRouter from 'react-router-dom/withRouter';
import {Utils} from '../utils';
import {primaryColor} from '../constants';
import logo from "../assets/logo-advq-new.png";
import {Footer} from '../components/Footer';
import Loading from 'react-loading-bar';
import {loadingColor} from '../constants';

const SubMenu = Menu.SubMenu;
const {Header, Content} = Layout;


class AppLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {parentPath: '/', sideMenuOpen: true, isLoggedIn: false};
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            //this.onRouteChanged(this.props.location.pathname);
            //this.fireTracking();
        }
    }

    handleNavMenuClick = e => {
        this.props.history.push(`/${e.key}`);
    }

    getPopOverContent = () => {
        return (
            <div>
            <div className="loggedinuser-menu-popup-header">
                <div>
                    <h3>{Utils.getLoggedInUserName()}</h3>
                    <p>{Utils.getLoggedInUserEmail()}</p>
                </div>
            </div>
            <div className="loggedinuser-menu-popup-content">
                <div 
                        className="row" 
                        onClick={
                            () => 
                                {this.props.history.push(`/dashboard/advisorprofile/${Utils.getUserInfo().advisor}`)}
                        }
                >
                    <Icon type="user" className="icon" />
                    ADVISOR PROFILE
                </div>
                <div 
                        className="row" 
                        onClick={
                            () => {
                                Utils.logoutUser(); 
                                this.props.history.push('/login')
                            }
                        }
                >
                    <Icon type="logout" className="icon" />
                    SIGN OUT
                </div>
            </div>
            </div>
        );
    }

    getAddPopOverContent = () => {
        return (
            <div>
                <div className="loggedinuser-menu-popup-header">
                    {/* <div>
                        <h3>{Utils.getLoggedInUserName()}</h3>
                        <p>{Utils.getLoggedInUserEmail()}</p>
                    </div> */}
                </div>
                <div className="loggedinuser-menu-popup-content">
                    <div 
                            className="row" 
                            onClick={
                                () => 
                                    {this.props.history.push(`/dashboard/createadvice`)}
                            }
                    >
                        <Icon type="file-text" className="icon" />
                        Create Advice
                    </div>
                    <div className="row" onClick={() => {Utils.logoutUser(); this.props.history.push('/dashboard/createportfolio')}}>
                        <Icon type="line-chart" className="icon" />
                        Create Portfolio
                    </div>
                </div>
            </div>
        );
    }


    renderHeaderActionItemsDesktop = () => {
        return (
            <Col 
                    span={20}
                    style={{
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        height: '64px', 
                        paddingRight: '10px',
                    }}
            >   
                <Menu
                    style={{marginTop: '10px'}} 
                    mode="horizontal"
                    onClick={this.handleNavMenuClick}
                    selectedKeys={[this.state.parentPath]}>
                    {
                        Utils.isLoggedIn() &&
                        <Menu.Item key="dashboard">Dashboard</Menu.Item>
                    }
                    {
                        !Utils.isLoggedIn() &&
                        <Menu.Item key={'home'}>Home</Menu.Item>
                    }
                    <Menu.Item key="advice">Screen Advices</Menu.Item>
                    {
                        Utils.isLoggedIn() &&
                        <Menu.Item key="stockresearch">Stock Research</Menu.Item>
                    }
                    {
                        !Utils.isLoggedIn() &&
                        <Menu.Item key="login">Login</Menu.Item>
                    }
                    {
                        !Utils.isLoggedIn() &&
                        <Menu.Item key="signup">Signup</Menu.Item>
                    }
                </Menu>
                {
                    Utils.isLoggedIn() &&
                    <React.Fragment>
                        {/* <div style={{margin:'auto 20px auto 20px', height:'50%', borderRight:'1px solid grey'}}/> */}
                        <Button 
                            type="primary" 
                            onClick={() => this.props.history.push('/dashboard/createadvice')}
                            style={{marginTop: '18px'}}>
                            Create Advice
                        </Button>                                        
                    </React.Fragment>
                }
            </Col> 
        );
    }

    showHeaderAdviceLogo = parentPath => {
        const restrictedParentPaths = ['login', 'signup', 'forgotPassword', 'resetPassword'];
        if (restrictedParentPaths.indexOf(parentPath) === -1) {
            return true;
        }

        return false;
    }

    renderHeader = () => {
        return (
            <React.Fragment>
                {
                    this.showHeaderAdviceLogo(this.state.parentPath) &&
                    <Media 
                        query="(max-width: 599px)"
                        render={() => {
                            return (
                                <Header
                                    style={{
                                        backgroundColor: '#f9f9f9'
                                    }}
                                >
                                    <Col 
                                            span={24} 
                                            style={{
                                                display: 'flex', 
                                                flexDirection: 'row', 
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                    >
                                        <img src={logo} style={{height: '40px'}}/>
                                        <div onClick={() => this.props.history.push('/home')} 
                                            style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>
                                            <span style={{...biggerFont, color:primaryColor}}>A</span>
                                            <span style={{color: primaryColor}}>DVICE</span>
                                            <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                            <span style={{color: '#e06666'}}>UBE</span>
                                        </div>
                                    </Col>
                                </Header>
                            );
                        }}
                    />
                }
                <Media 
                    query="(min-width: 600px)"
                    render={() => {
                        return (
                            <Header style={headerStyle}>
                                <Row type="flex">
                                    <Col span={4} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                        <img src={logo} style={{height: '40px', marginTop: '-10px'}}/>
                                        <h1 onClick={() => this.props.history.push('/home')} 
                                            style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>
                                            <span style={{...biggerFont, color:primaryColor}}>A</span>
                                            <span style={{color: primaryColor}}>DVICE</span>
                                            <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                            <span style={{color: '#e06666'}}>UBE</span>

                                        </h1>
                                    </Col>
                                    {this.renderHeaderActionItemsDesktop()}
                                </Row>
                            </Header>
                        );
                    }}
                />
            </React.Fragment>
        );
    } 

    renderFooterMobile = () => {
        return <Footer mobile={true}/>;
    }

    renderFooterDesktop = () => {
        return <Footer/>;
    }

    renderFooter = () => {
        return  (
            <div style={{marginTop: '20px'}}>
                <Media 
                    query="(max-width: 1199px)"
                    render={() => this.renderFooterMobile()}
                />
                <Media 
                    query="(min-width: 1200px)"
                    render={() => this.renderFooterDesktop()}
                />
            </div>
        );
    }      

    render() {
        return (
            <React.Fragment>
                <Layout style={{backgroundColor: '#f9f9f9', height:'100%'}}>
                    <Loading
                        show={this.props.loading}
                        color={loadingColor}
                        className="main-loader"
                        showSpinner={false}
                    />
                    {!this.props.loading &&
                        <React.Fragment> 
                            {this.renderHeader()}
                            {this.props.content}
                            {!this.props.noFooter &&
                                this.renderFooter()
                            }
                        </React.Fragment>
                    }
                </Layout>
            </React.Fragment>
        );
    }
}

export default withRouter(AppLayout);

const headerStyle = {
    background: '#fff',
    borderBottom: '1px solid #e1e1e1', 
    // boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
    width: '100%',
    height:'64px',
    padding:'0 0 0 30px'

};

const headerColor = {
    color: '#595959',
    fontSize: '16px'
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
    //color: primaryColor
}

const contentLayoutStyle = {
    //padding: '10px 0px 0px 0px',
    //background: '#f9f9f9',
    //marginTop: '15px'
    width:'95%',
    margin:'0 auto',
    //height:'calc(100vh - 64px)'
    //minHeight: '640px',
    //overflow:'inherit'
    //overflowY:'scroll',
};
