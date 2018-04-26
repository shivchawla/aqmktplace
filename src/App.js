import * as React from 'react';
import {Layout, Menu, Row, Col, Button, notification, Popover, Icon} from 'antd';
import {Route, withRouter, Link} from 'react-router-dom';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import AqBreadCrumb from './components/AqBreadCrumb';
import Login from './containers/Login';
import Signup from './containers/Signup';
import Policy from './containers/Policy';
import TnC from './containers/TnC';
import {LoginModal} from './components/LoginModal'; 
import {AuthRoute} from './components/AuthRoute';
import {
    Dashboard, 
    QuantResearch, 
    StockResearch, 
    ScreenAdvices, 
    AdviceDetail, 
    CreateAdvice, 
    CreatePortfolio,
    PortfolioDetail,
    UpdateAdvice,
    PortfolioAddTransactions,
    InvestorDashboard,
    AdvisorProfile,
    AdvisorDashboard,
    ScreenAdvisors,
    TokenUpdate,
    Home
} from './containers'; 
import {AuthComponent} from './containers/AuthComponent';
import {HocExample} from './containers/HocExample';
import {Utils} from './utils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const {Header, Content} = Layout;

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
            <Layout style={{backgroundColor: '#f9f9f9'}}>
                <Header style={headerStyle}>
                    <Row type="flex">
                        <Col span={4}>
                            <Link to='/home'>
                                <h1 style={headerColor}>AIMSQUANT</h1>
                            </Link>
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
                                <Menu.Item key="stockresearch">Stock Research</Menu.Item>
                                {
                                    Utils.isLoggedIn() &&
                                    <Menu.Item key="quantresearch">Quant Research</Menu.Item>
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

                <Layout style={contentLayoutStyle}>
                    <Content>
                        {/*
                            Add Routes in the following format if it is to be synced with header navigation
                            path='/parent/child/grandChild/....'
                            where parent is one of the keys from the <Menu.Item> above.
                            i.e investordashboard, advisordashboard, advice, stockresearch, quantresearch
                         */}
                        <Route exact={true} path='/home' component={Home} />
                        <Route exact={true} path='/advice' component={ScreenAdvices} />
                        <Route exact={true} path='/stockresearch' component={StockResearch} />
                        {/* <Route exact={true} path='/login' component={LoginModal} /> */}
                        <Route exact={true} path='/tokenUpdate' component={TokenUpdate}/>
                        <Route exact={true} path='/quantresearch' component={QuantResearch}/>
                        <Route exact={true} path='/advice/:id' component={AdviceDetail} />
                        <Route exact={true} path='/advisordashboard/createadvice' component={CreateAdvice} />
                        <Route exact={true} path='/investordashboard/createportfolio' component={CreatePortfolio} />
                        <Route exact={true} path='/advisordashboard/updateadvice/:id' component={UpdateAdvice} />
                        <Route exact={true} path='/investordashboard/portfolio/:id' component={PortfolioDetail} />
                        <Route exact={true} path='/investordashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} />
                        <Route exact={true} path='/investordashboard' component={InvestorDashboard} />
                        <Route exact={true} path='/advisordashboard/advisorprofile/:id' component={AdvisorProfile} />
                        <Route exact={true} path='/advisordashboard' component={AdvisorDashboard} />
                        <Route exact={true} path='/advisordashboard/screenadvisors' component={ScreenAdvisors} />
                        <Route exact={true} path='/dashboard' component={Dashboard} />
                        <Route path='/policy/policy' component={Policy} />
                        <Route path='/policy/tnc' component={TnC} />
                        <Route exact={true} path='/login' component={Login} />
                        <Route exact={true} path='/signup' component={Signup} />
                    </Content>
                </Layout>
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
    fontSize: '20px'
};

const contentLayoutStyle = {
    //padding: '10px 0px 0px 0px',
    background: '#f9f9f9',
    //marginTop: '15px'
    width:'95%',
    margin:'0 auto',
    //height:'calc(100vh - 64px)'
    height: '100%',
    overflowY:'scroll',
};
