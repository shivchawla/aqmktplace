import * as React from 'react';
import {Layout, Menu, Row, Col, Button, notification, Popover, Icon} from 'antd';
import {Route, withRouter, Link, Switch} from 'react-router-dom';
import TransitionGroup from 'react-transition-group/TransitionGroup';
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

import {PageNotFound, NoIternetAccess} from './components';
import AppliedRoute from './components/AppliedRoute';
import {AuthComponent} from './containers/AuthComponent';
import {HocExample} from './containers/HocExample';
import {Utils} from './utils';
import {primaryColor} from './constants';
import asyncComponent from './components/AsyncComponent';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const {Header, Content} = Layout;
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

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {parentPath: '/'};
    }

    componentWillMount() {
        this.onRouteChanged(this.props.location.pathname);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            this.onRouteChanged(this.props.location.pathname);
        }
    }

    onRouteChanged = location => {
        const locationArray = location.split('/');
        // Getting the parent path of any route
        // For eg. if route is /advice/{adviceId} then parent path is advice
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
                <div className="row" onClick={() => {Utils.logoutUser(); this.props.history.push('/login')}}>
                    <Icon type="logout" className="icon" />
                    SIGN OUT
                </div>
            </div>
            </div>
        );
    }

    render() {
        return (
            <Layout style={{backgroundColor: '#f9f9f9', height:'auto'}}>
                <Header style={headerStyle}>
                    <Row type="flex">
                        <Col span={4}>
                            <h1
                                    onClick={() => this.props.history.push('/home')} 
                                    style={{...headerColor, cursor: 'pointer'}}>
                                    <span style={biggerFont}>A</span>DVICE<span style={biggerFont}>Q</span>UBE
                                {/* ADVICEQUBE <span style={{fontSize: '12px', color: primaryColor}}>&nbsp;Beta</span> */}
                            </h1>
                        </Col>
                        <Col 
                                span={20} 
                                style={{
                                    display: 'flex', 
                                    justifyContent: 'flex-end', 
                                    height: '64px', 
                                    // alignItems: 'center'
                                }}
                        >
                            <Menu
                                    style={{marginTop: '10px'}} 
                                    mode="horizontal"
                                    onClick={this.handleNavMenuClick}
                                    selectedKeys={[this.state.parentPath]}
                            >
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
                                <Popover
                                    placement="bottomRight" 
                                    content={this.getPopOverContent()} 
                                    trigger="click"
                                >
                                    <Button 
                                            type="primary" 
                                            shape="circle"
                                            style={{marginTop: '18px'}}
                                            onClick={this.openPopOverMenu}
                                    >
                                        {Utils.getLoggedInUserInitials()} 
                                    </Button>
                                </Popover>
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
                        <Route exact={true} path='/home' component={Home} />
                        <Route exact={true} path='/' component={Home} />
                        <Route exact={true} path='/advice' component={ScreenAdvices} />
                        <Route path="/stockresearch" exact component={StockResearch} />
                        <Route exact={true} path='/tokenUpdate' component={TokenUpdate}/>
                        <Route exact={true} path='/advice/:id' component={AdviceDetail} />
                        <Route exact={true} path='/advisordashboard/createadvice' component={CreateAdvice} />
                        <Route exact={true} path='/investordashboard/createportfolio' component={CreatePortfolio} />
                        <Route exact={true} path='/advisordashboard/updateadvice/:id' component={UpdateAdvice} />
                        <Route exact={true} path='/investordashboard/portfolio/:id' component={PortfolioDetail} />
                        <Route exact={true} path='/investordashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} />
                        <Route exact={true} path='/investordashboard' component={InvestorDashboard} />
                        <Route exact={true} path='/advisordashboard/advisorprofile/:id' component={AdvisorProfile} />
                        <Route exact={true} path='/advisordashboard' component={AdvisorDashboard} />
                        <Route path='/policy/policy' component={Policy} />
                        <Route path='/policy/tnc' component={TnC} />
                        <Route path='/forgotPassword' component={ForgotPassword} />
                        <Route path='/errorPage' component={NoIternetAccess} />
                        <Route path='/AuthMessage' component={AuthMessage} />
                        <Route exact={true} path='/login' component={Login} />
                        <Route exact={true} path='/signup' component={Signup} />
                        <Route component={PageNotFound} />
                    </Switch>
                </Content>
            </Layout>
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
    height:'64px'

};

const headerColor = {
    color: '#595959',
    fontSize: '16px'
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
    color: primaryColor
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
