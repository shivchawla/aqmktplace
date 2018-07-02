import * as React from 'react';
import Media from 'react-media';
import ReactGA from 'react-ga';
import Loadable from 'react-loadable';
import {Layout, Menu, Row, Col, Button, Icon} from 'antd';
import Route from 'react-router/Route';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import {Utils} from './utils';
import {primaryColor, horizontalBox} from './constants';
import logo from "./assets/logo-advq-new.png";
global.Promise = require('bluebird');

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

const WorkInProgress = Loadable({
    loader: () => import('./containers/WorkInProgressPage'),
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

const CreateAdviceMobile = Loadable({
    loader: () => import('./containers/CreateAdviceMobile'),
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

const UpdateAdviceMobile = Loadable({
    loader: () => import('./containers/UpdateAdviceMobile'),
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
            {regExp: '^\/dashboard$', title: 'Investor Dashboard - AdviceQube'},
            {regExp: '^\/dashboard\/investor\/[A-Za-z0-9]+$', title: 'Investor Dashboard - AdviceQube'},
            {regExp: '^\/dashboard\/advisor\/[A-Za-z0-9]+$', title: 'Advisor Dashboard - AdviceQube'},
            {regExp: '^\/dashboard\/createportfolio$', title: 'Create Portfolio - AdviceQube'},
            {regExp: '^\/dashboard\/createadvice$', title: 'Create Advice - AdviceQube'},
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
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 599px)"
                    render={() => {
                        return (
                            <Switch>
                                <Route exact={true} path='/home' component={Home} /> 
                                <Route exact={true} path='/' component={Home} /> 
                                <Route exact={true} path='/advice' component={ScreenAdviceMobile} /> 
                                <Route path="/stockresearch" exact component={WorkInProgress} /> 
                                <Route exact={true} path='/tokenUpdate' component={TokenUpdate}/>
                                <Route exact={true} path='/advice/:id' component={AdviceDetailMobile} /> 
                                <Route exact={true} path='/dashboard/createadvice' component={CreateAdviceMobile} /> 
                                <Route exact={true} path='/dashboard/createportfolio' component={WorkInProgress} /> 
                                <Route exact={true} path='/dashboard/updateadvice/:id' component={UpdateAdviceMobile} /> 
                                <Route exact={true} path='/dashboard/portfolio/:id' component={WorkInProgress} /> 
                                <Route exact={true} path='/dashboard/portfolio/transactions/:id' component={WorkInProgress} /> 
                                <Route exact={true} path='/dashboard/advisorprofile/:id' component={WorkInProgress} /> 
                                <Route exact={true} path='/dashboard/stepperCreateAdvice' component={StepperAdviceForm} /> 
                                <Route path='/dashboard' component={WorkInProgress} /> 
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
                        );
                    }}
                />
                <Media 
                    query="(min-width: 600px)"
                    render={() => {
                        return (
                            <Switch>
                                <Route exact={true} path='/home' component={Home} /> 
                                <Route exact={true} path='/' component={Home} /> 
                                <Route exact={true} path='/advice' component={ScreenAdvices} /> 
                                <Route path="/stockresearch" exact component={StockResearch} /> 
                                <Route exact={true} path='/tokenUpdate' component={TokenUpdate}/>
                                <Route exact={true} path='/advice/:id' component={AdviceDetail} /> 
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
                        );
                    }}
                />
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
