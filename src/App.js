import * as React from 'react';
import ReactGA from 'react-ga';
import {Layout, Menu, Row, Col, Button, Popover, Icon} from 'antd';
import {BrowserRouter as Router, Route, withRouter, Link, Switch} from 'react-router-dom';
import {slide as SideMenu} from 'react-burger-menu'
import AqBreadCrumb from './components/AqBreadCrumb';
import Login from './containers/Login';
import Signup from './containers/Signup';
import Policy from './containers/Policy';
import TnC from './containers/TnC';
import {LoginModal} from './components/LoginModal'; 
import {AuthRoute} from './components/AuthRoute';
import {
    TokenUpdate,
    ForgotPassword, 
    AuthMessage
} from './containers';

import {PageNotFound, NoIternetAccess, ForbiddenAccess} from './components';
import AppliedRoute from './components/AppliedRoute';
import {AuthComponent} from './containers/AuthComponent';
import {HocExample} from './containers/HocExample';
import {Utils, fetchAjax} from './utils';
import {primaryColor} from './constants';
// import AdvisorDashboard from './containers/AdvisorDashboard';
// import InvestorDashboard from './containers/InvestorDashboard';
import asyncComponent from './components/AsyncComponent';

import logo from "./assets/logo-advq-new.png";

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const {Header, Content, Footer, Sider} = Layout;
const StockResearch = asyncComponent(() => import("./containers/StockResearch"));
const InvestorDashboard = asyncComponent(() => import("./containers/InvestorDashboard"));
const AdvisorDashboard = asyncComponent(() => import("./containers/AdvisorDashboard"));
const PortfolioDetail = asyncComponent(() => import("./containers/PortfolioDetail"));
const AdviceDetail = asyncComponent(() => import("./containers/AdviceDetail"));
const CreatePortfolio = asyncComponent(() => import("./containers/CreatePortfolio"));
const PortfolioAddTransactions = asyncComponent(() => import("./containers/PortfolioAddTransactions"));
const CreateAdvice = asyncComponent(() => import("./containers/CreateAdvice"));
const UpdateAdvice = asyncComponent(() => import("./containers/UpdateAdvice"));
const ScreenAdvices = asyncComponent(() => import("./containers/ScreenAdvices"));
const AdvisorProfile = asyncComponent(() => import("./containers/AdvisorProfile"));
const Home = asyncComponent(() => import("./containers/Home"));
const FAQ = asyncComponent(() => import("./containers/FAQ"));
const Dashboard = asyncComponent(() => import("./containers/Dashboard"));
const ResetPassword = asyncComponent(() => import("./containers/ResetPassword"));
const {gaTrackingId, requestUrl} = require('./localConfig');

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {parentPath: '/', sideMenuOpen: true, isLoggedIn: false};
        ReactGA.initialize(gaTrackingId); //Unique Google Analytics tracking number
    }

    componentWillMount() {
        // const params = new URLSearchParams(this.props.location.search);
        // const token = params.get('token') || '';
        // console.log('Check Token', Utils.checkToken(token));
        // if (Utils.checkToken(token)) {
        //     Utils.autoLogin(token,this.props.history, this.props.match.url, () => {
        //         this.setState({isLoggedIn: true})
        //     });
        // }
        this.onRouteChanged(this.props.location.pathname);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            this.onRouteChanged(this.props.location.pathname);
            this.fireTracking();
        }
    }

    fireTracking = () => {
        // console.log(window.location.href);
        ReactGA.pageview(window.location.href);
    }

    onRouteChanged = location => {
        const locationArray = location.split('/');
        // Getting the parent path of any route
        // For eg. if route is /advice/{adviceId} then parent path is advice
        const regexArray = [
            {regExp: '^\/advice$', title: 'Screen Advices - AdviceQube'},
            {regExp: '^\/home$', title: 'Home - AdviceQube'},
            {regExp: '^\/faq$', title: 'FAQ - AdviceQube'},
            {regExp: '^\/forgotPassword$', title: 'Forgot Password - AdviceQube'},
            {regExp: '^\/errorPage$', title: 'No Internet Access - AdviceQube'},
            {regExp: '^\/forbiddenAccess$', title: 'Forbidden Access - AdviceQube'},
            {regExp: '^\/$', title: 'Home - AdviceQube'},
            {regExp: '^\/policies\/tnc$', title: 'Terms and Conditions - AdviceQube'},
            {regExp: '^\/policies\/privacy$', title: 'Privacy Policy - AdviceQube'},
            {regExp: '^\/investordashboard$', title: 'Investor Dashboard - AdviceQube'},
            {regExp: '^\/investordashboard\/createportfolio$', title: 'Create Portfolio - AdviceQube'},
            {regExp: '^\/advisordashboard$', title: 'Advisor Dashboard - AdviceQube'},
            {regExp: '^\/stockresearch$', title: 'Stock Research - AdviceQube'},
            {regExp: '^\/login$', title: 'Login - AdviceQube'},
            {regExp: '^\/signup$', title: 'Register - AdviceQube'},
            {regExp: '^\/advice\/[A-Za-z0-9]+$', title: 'Advice Detail - AdviceQube'},
            {regExp: '^\/advisordashboard\/updateadvice\/[A-Za-z0-9]+$', title: 'Update Advice - AdviceQube'},
            {regExp: '^\/advisordashboard\/advisorprofile\/[A-Za-z0-9]+$', title: 'Advisor Profile - AdviceQube'},
            {regExp: '^\/investordashboard\/portfolio\/[A-Za-z0-9]+$', title: 'Portfolio Detail - AdviceQube'},
            {regExp: '^\/investordashboard\/portfolio\/transactions\/[A-Za-z0-9]+$', title: 'Update Portfolio - AdviceQube'},
        ];
        regexArray.map((item, index) => {
            const expression = new RegExp(item.regExp);
            if (expression.test(location)) {
                document.title = item.title;
                return;
            }
        });
        const parentPath = locationArray.length > 0 ? locationArray[1] : '/'; 
        this.setState({parentPath});
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
                                {this.props.history.push(`/advisordashboard/advisorprofile/${Utils.getUserInfo().advisor}`)}
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
                                    {this.props.history.push(`/advisordashboard/createadvice`)}
                            }
                    >
                        <Icon type="file-text" className="icon" />
                        Create Advice
                    </div>
                    <div className="row" onClick={() => {Utils.logoutUser(); this.props.history.push('/investordashboard/createportfolio')}}>
                        <Icon type="line-chart" className="icon" />
                        Create Portfolio
                    </div>
                </div>
            </div>
        );
    }

    renderBurgerMenu = () => {
        return (
            <SideMenu isOpen={this.state.sideMenuOpen}>
                <Row style={{backgroundColor: '#fff', height: '100%'}}>
                    <Menu mode="inline">
                        <SubMenu key="sub-dashboard" title="Dashboard">
                            <Menu.Item key="sub-investor-dashboard">Investor Dashboard</Menu.Item>
                            <Menu.Item key="sub-advisor-dashboard">Advisor Dashboard</Menu.Item>
                        </SubMenu>
                        <Menu.Item key="sub-screen-advices">Screen Advices</Menu.Item>
                    </Menu>
                </Row>
            </SideMenu>
        );
    }

    checkLoggedIn = () => {
        return Utils.isLoggedIn() && this.state.isLoggedIn;
    }

    render() {
        return (
            <React.Fragment>
                {/* {this.renderBurgerMenu()} */}
                <Layout style={{backgroundColor: '#f9f9f9', height:'auto'}}>
                    <Header style={headerStyle}>
                        <Row type="flex">
                            <Col span={4} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                <img src={logo} style={{height: '40px'}}/>
                                <h1 onClick={() => this.props.history.push('/home')} 
                                    style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>

                                    <span style={{...biggerFont, color:primaryColor}}>A</span>
                                    <span style={{color: primaryColor}}>DVICE</span>
                                    <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                    <span style={{color: '#e06666'}}>UBE</span>

                                </h1>
                            </Col>
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
                                            <SubMenu title="Dashboard">
                                                <Menu.Item key="investordashboard">Investor Dashboard</Menu.Item>
                                                <Menu.Item key="advisordashboard">Advisor Dashboard</Menu.Item>
                                            </SubMenu>
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
                                        {/* <Button 
                                                type="primary"
                                                onClick={() => this.props.history.push('/investordashboard/createportfolio')}
                                                style={{marginLeft: '20px', marginTop: '18px', marginRight: '20px'}}
                                        >
                                            Create Portfolio
                                        </Button> */}
                                        <Popover
                                            placement="bottomRight" 
                                            content={this.getPopOverContent()} 
                                            trigger="click"
                                        >
                                            <Button 
                                                    type="primary" 
                                                    shape="circle"
                                                    style={{marginTop: '18px'}}
                                                    // onClick={this.openPopOverMenu}
                                            >
                                                {Utils.getLoggedInUserInitials()} 
                                            </Button>
                                        </Popover>

                                        <div style={{margin:'auto 20px auto 20px', height:'50%', borderRight:'1px solid grey'}}/>

                                        <Button 
                                            type="primary" 
                                            onClick={() => this.props.history.push('/advisordashboard/createadvice')}
                                            style={{marginTop: '18px'}}>
                                            Create Advice
                                        </Button>

                                        

                                    </React.Fragment>
                                }
                            </Col> 
                        </Row>
                    </Header>

                    <Content style={contentLayoutStyle}>
                        {/*
                            Add Routes in the following format if it is to be synced with header navigation
                            path='/parent/child/grandChild/....'
                            where parent is one of the keys from the <Menu.Item> above.
                            i.e investordashboard, advisordashboard, advice, stockresearch, quantresearch
                        */}
                        <Switch>
                            <Route exact={true} path='/home' component={Home} /> {/* Page */}
                            <Route exact={true} path='/' component={Home} /> {/* Page */}
                            <Route exact={true} path='/advice' component={ScreenAdvices} /> {/* Page */}
                            <Route path="/stockresearch" exact component={StockResearch} /> {/* Page */}
                            <Route exact={true} path='/tokenUpdate' component={TokenUpdate}/>
                            <Route exact={true} path='/advice/:id' component={AdviceDetail} /> {/* Page */}
                            <Route exact={true} path='/advisordashboard/createadvice' component={CreateAdvice} /> {/* Page */}
                            <Route exact={true} path='/investordashboard/createportfolio' component={CreatePortfolio} /> {/* Page */}
                            <Route exact={true} path='/advisordashboard/updateadvice/:id' component={UpdateAdvice} /> {/* Page */}
                            <Route exact={true} path='/investordashboard/portfolio/:id' component={PortfolioDetail} /> {/* Page */}
                            <Route exact={true} path='/investordashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} /> {/* Page */}
                            <Route exact={true} path='/investordashboard' component={InvestorDashboard} /> {/* Page */}
                            <Route exact={true} path='/advisordashboard/advisorprofile/:id' component={AdvisorProfile} /> {/* Page */}
                            <Route exact={true} path='/advisordashboard' component={AdvisorDashboard} /> {/* Page */}
                            <Route exact={true} path='/dashboard' component={Dashboard} /> {/* Page */}
                            <Route path='/policies/privacy' component={Policy} /> {/* Page */}
                            <Route path='/policies/tnc' component={TnC} /> {/* Page */}
                            <Route path='/forgotPassword' component={ForgotPassword} /> {/* Page */}
                            <Route path='/errorPage' component={NoIternetAccess} /> {/* Page */}
                            <Route path='/forbiddenAccess' component={ForbiddenAccess} /> {/* Page */}
                            <Route path='/authMessage' component={AuthMessage} /> 
                            <Route exact={true} path='/login' component={Login} /> {/* Page */}
                            <Route exact={true} path='/signup' component={Signup} /> {/* Page */}
                            <Route exact={true} path='/faq' component={FAQ} /> {/* Page */}
                            <Route exact={true} path='/resetPassword' component={ResetPassword} /> {/* Page */}
                            <Route component={PageNotFound} />
                        </Switch>
                    </Content>
                </Layout>
            </React.Fragment>
        );
    }
}

export default withRouter(App);

const headerStyle = {
    background: '#fff',
    borderBottom: '1px solid #e1e1e1', 
    //boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
    //position: 'fixed',
    width: '100%',
    //zIndex: '1000'
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
