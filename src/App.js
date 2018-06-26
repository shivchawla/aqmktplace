import * as React from 'react';
import Media from 'react-media';
import ReactGA from 'react-ga';
import Loadable from 'react-loadable';
import {Layout, Menu, Row, Col, Button, Icon} from 'antd';
import {Route} from 'react-router';
import {withRouter, Switch} from 'react-router-dom';
import {Utils} from './utils';
import {primaryColor} from './constants';
import logo from "./assets/logo-advq-new.png";

const {Header, Content} = Layout;
const {gaTrackingId} = require('./localConfig');

const ScreenAdvices = Loadable({
    loader: () => import('./containers/ScreenAdvices'),
    loading: () => <Icon type="loading" />
});

const ScreenAdviceMobile = Loadable({
    loader: () => import('./containers/ScreenAdviceMobile/ScreenAdviceMobile'),
    loading: () => <Icon type="loading" />
});

const ScreenAdviceAntMobile = Loadable({
    loader: () => import('./containers/ScreenAdviceMobile/ScreenAdviceAntMobile'),
    loading: () => <Icon type="loading" />
})

const Home = Loadable({
    loader: () => import('./containers/Home'),
    loading: () => <Icon type="loading" />
});

const StockResearch = Loadable({
    loader: () => import('./containers/StockResearch'),
    loading: () => <Icon type="loading" />
});

const TokenUpdate = Loadable({
    loader: () => import('./containers/TokenUpdate'),
    loading: () => <Icon type="loading" />
});

const AdviceDetail = Loadable({
    loader: () => import('./containers/AdviceDetail'),
    loading: () => <Icon type="loading" />
});

const AdviceDetailMobile = Loadable({
    loader: () => import('./containers/AdviceDetailMobile/AdviceDetailMobile'),
    loading: () => <Icon type="loading" />
});

const CreateAdvice = Loadable({
    loader: () => import('./containers/CreateAdvice'),
    loading: () => <Icon type="loading" />
});

const CreatePortfolio = Loadable({
    loader: () => import('./containers/CreatePortfolio'),
    loading: () => <Icon type="loading" />
});

const UpdateAdvice = Loadable({
    loader: () => import('./containers/UpdateAdvice'),
    loading: () => <Icon type="loading" />
});

const PortfolioDetail = Loadable({
    loader: () => import('./containers/PortfolioDetail'),
    loading: () => <Icon type="loading" />
});

const PortfolioAddTransactions = Loadable({
    loader: () => import('./containers/PortfolioAddTransactions'),
    loading: () => <Icon type="loading" />
});

const AdvisorProfile = Loadable({
    loader: () => import('./containers/AdvisorProfile'),
    loading: () => <Icon type="loading" />
});

const StepperAdviceForm = Loadable({
    loader: () => import('./containers/StepperAdviceForm/AdviceForm'),
    loading: () => <Icon type="loading" />
});

const Dashboard = Loadable({
    loader: () => import('./containers/Dashboard'),
    loading: () => <Icon type="loading" />
});

const Policy = Loadable({
    loader: () => import('./containers/Policy'),
    loading: () => <Icon type="loading" />
});

const TnC = Loadable({
    loader: () => import('./containers/TnC'),
    loading: () => <Icon type="loading" />
});

const ForgotPassword = Loadable({
    loader: () => import('./containers/ForgotPassword'),
    loading: () => <Icon type="loading" />
});

const NoIternetAccess = Loadable({
    loader: () => import('./components/NoIternetAccess'),
    loading: () => <Icon type="loading" />
});

const ForbiddenAccess = Loadable({
    loader: () => import('./components/ForbiddenAccess'),
    loading: () => <Icon type="loading" />
});

const AuthMessage = Loadable({
    loader: () => import('./containers/AuthMessage'),
    loading: () => <Icon type="loading" />
});

const Login = Loadable({
    loader: () => import('./containers/Login'),
    loading: () => <Icon type="loading" />
});

const Signup = Loadable({
    loader: () => import('./containers/Signup'),
    loading: () => <Icon type="loading" />
});

const FAQ = Loadable({
    loader: () => import('./containers/FAQ'),
    loading: () => <Icon type="loading" />
});

const ResetPassword = Loadable({
    loader: () => import('./containers/ResetPassword'),
    loading: () => <Icon type="loading" />
});

const PageNotFound = Loadable({
    loader: () => import('./components/PageNotFound'),
    loading: () => <Icon type="loading" />
});

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {parentPath: '/', sideMenuOpen: true, isLoggedIn: false};
        ReactGA.initialize(gaTrackingId); //Unique Google Analytics tracking number
    }

    componentWillMount() {
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
            {regExp: '^\/dashboard\/investor\/[A-Za-z0-9]+$', title: 'Investor Dashboard - AdviceQube'},
            {regExp: '^\/dashboard\/advisor\/[A-Za-z0-9]+$', title: 'Advisor Dashboard - AdviceQube'},
            {regExp: '^\/dashboard\/createportfolio$', title: 'Create Portfolio - AdviceQube'},
            {regExp: '^\/stockresearch$', title: 'Stock Research - AdviceQube'},
            {regExp: '^\/login$', title: 'Login - AdviceQube'},
            {regExp: '^\/signup$', title: 'Register - AdviceQube'},
            {regExp: '^\/advice\/[A-Za-z0-9]+$', title: 'Advice Detail - AdviceQube'},
            {regExp: '^\/advice\/[A-Za-z0-9]+/mobile$', title: 'Advice Detail Mobile - AdviceQube'},
            {regExp: '^\/dashboard\/updateadvice\/[A-Za-z0-9]+$', title: 'Update Advice - AdviceQube'},
            {regExp: '^\/dashboard\/advisorprofile\/[A-Za-z0-9]+$', title: 'Advisor Profile - AdviceQube'},
            {regExp: '^\/dashboard\/portfolio\/[A-Za-z0-9]+$', title: 'Portfolio Detail - AdviceQube'},
            {regExp: '^\/dashboard\/portfolio\/transactions\/[A-Za-z0-9]+$', title: 'Update Portfolio - AdviceQube'},
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

    checkLoggedIn = () => {
        return Utils.isLoggedIn() && this.state.isLoggedIn;
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
        const restrictedParentPaths = ['login', 'signup', 'forgotPassword', 'resetPassword', 'advice'];
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

    render() {
        return (
            <React.Fragment>
                {/* {this.renderBurgerMenu()} */}
                <Layout style={{backgroundColor: '#f9f9f9', height:'100%'}}>
                    {this.renderHeader()}
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
                            <Route exact={true} path='/advice' component={ScreenAdviceMobile} /> 
                            <Route exact={true} path='/advice/desktop' component={ScreenAdvices} /> 
                            <Route exact={true} path='/advice/mobile' component={ScreenAdviceMobile} /> 
                            <Route path="/stockresearch" exact component={StockResearch} /> 
                            <Route exact={true} path='/tokenUpdate' component={TokenUpdate}/>
                            <Route exact={true} path='/advice/:id' component={AdviceDetailMobile} /> 
                            <Route exact={true} path='/advice/:id/desktop' component={AdviceDetail} /> 
                            <Route exact={true} path='/advice/:id/mobile' component={AdviceDetailMobile} /> 
                            <Route exact={true} path='/dashboard/createadvice' component={CreateAdvice} /> 
                            <Route exact={true} path='/dashboard/createportfolio' component={CreatePortfolio} /> 
                            <Route exact={true} path='/dashboard/updateadvice/:id' component={UpdateAdvice} /> 
                            <Route exact={true} path='/dashboard/portfolio/:id' component={PortfolioDetail} /> 
                            <Route exact={true} path='/dashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} /> 
                            <Route exact={true} path='/dashboard/advisorprofile/:id' component={AdvisorProfile} /> 
                            <Route exact={true} path='/dashboard/stepperCreateAdvice' component={StepperAdviceForm} /> 
                            <Route path='/dashboard' component={Dashboard} /> 
                            <Route path='/policies/privacy' component={Policy} /> 
                            <Route path='/policies/tnc' component={TnC} /> 
                            <Route path='/forgotPassword' component={ForgotPassword} /> 
                            <Route path='/errorPage' component={NoIternetAccess} /> 
                            <Route path='/forbiddenAccess' component={ForbiddenAccess} /> 
                            <Route path='/authMessage' component={AuthMessage} /> 
                            <Route exact={true} path='/login' component={Login} /> 
                            <Route exact={true} path='/signup' component={Signup} /> 
                            <Route exact={true} path='/faq' component={FAQ} /> 
                            <Route exact={true} path='/resetPassword' component={ResetPassword} /> 
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
