import * as React from 'react';
import Media from 'react-media';
import ReactGA from 'react-ga';
import Loadable from 'react-loadable';
import {Layout, Menu, Row, Col, Button, Icon} from 'antd';
import Route from 'react-router/Route';
import withRouter from 'react-router-dom/withRouter';
import Switch from 'react-router-dom/Switch';
import {Utils, sendErrorToBackend} from './utils';
import {primaryColor, horizontalBox} from './constants';
import logo from "./assets/logo-advq-new.png";
global.Promise = require('bluebird');

const {Header, Content} = Layout;
const {gaTrackingId, sendErrorEmailsForApp = false} = require('./localConfig');
const appLoadEmailSent = Utils.getFromLocalStorage('appLoadEmailSent') === undefined ? false : true;

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

const AboutUs = Loadable({
    loader: () => import('./containers/AboutUs'),
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

const Contest = Loadable({
    loader: () => import('./containers/Contest/Contest'),
    loading: () => <Icon type="loading" />
});

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {parentPath: '/', sideMenuOpen: true, isLoggedIn: false};
        ReactGA.initialize(gaTrackingId); //Unique Google Analytics tracking number
    }

    componentDidUpdate(prevProps) {
        const entryDetailUrl = new RegExp('^\/contest\/entry\/[A-Za-z0-9]+$');
        const leaderboardUrl = new RegExp('^\/contest\/leaderboard$');
        if (this.props.location !== prevProps.location) { // Route changed
            const oldLocation = prevProps.location.pathname;
            const currentLocation = this.props.location.pathname;
            if (!(leaderboardUrl.test(oldLocation) && entryDetailUrl.test(currentLocation))) {
                Utils.localStorageSave('contestSelectedPage', 0);
            }
            console.log('Old Location', oldLocation);
            console.log('Current Location', currentLocation);
            this.fireTracking();
        }
    }

    componentWillMount() {
        let userEmail = 'support@adviceqube.com';
        if (Utils.isLoggedIn()) {
            userEmail = Utils.getLoggedInUserEmail();
        } 

        !appLoadEmailSent
        && sendErrorEmailsForApp 
        && sendErrorToBackend(null, userEmail, 'App Intializing')
    }

    componentDidMount() {
        this.fireTracking();
        let userEmail = 'support@adviceqube.com';
        if (Utils.isLoggedIn()) {
            userEmail = Utils.getLoggedInUserEmail();
        } 

        !appLoadEmailSent
        && sendErrorEmailsForApp 
        && sendErrorToBackend(null, userEmail, 'App Intialized', null, null, () => {
            Utils.localStorageSave('appLoadEmailSent', true);
        });
    }

    componentDidCatch(error, info) {
        let userEmail = 'support@adviceqube.com';
        if (Utils.isLoggedIn()) {
            userEmail = Utils.getLoggedInUserEmail();
        }
        sendErrorEmailsForApp && sendErrorToBackend(error, userEmail, 'App Error')
    }

    fireTracking = () => {
        ReactGA.pageview(window.location.href);
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
                                <Route exact={true} path='/aboutus' component={AboutUs} /> 
                                <Route exact={true} path='/advice' component={ScreenAdviceMobile} /> 
                                <Route path='/contest' component={Contest} />
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
                                <Route path='/aboutus' component={AboutUs} />  
                                <Route exact={true} path='/advice' component={ScreenAdvices} /> 
                                <Route path='/contest' component={Contest} />
                                <Route path="/stockresearch" exact component={StockResearch} /> 
                                <Route path='/tokenUpdate' component={TokenUpdate}/>
                                <Route path='/advice/:id' component={AdviceDetail} /> 
                                {/* <Route path='/dashboard/createadvice' component={CreateAdvice} />  */}
                                <Route path='/dashboard/createportfolio' component={CreatePortfolio} /> 
                                {/* <Route path='/dashboard/updateadvice/:id' component={UpdateAdvice} />  */}
                                <Route path='/dashboard/portfolio/:id' component={PortfolioDetail} /> 
                                <Route path='/dashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} /> 
                                <Route path='/dashboard/advisorprofile/:id' component={AdvisorProfile} /> 
                                <Route path='/dashboard/stepperCreateAdvice' component={StepperAdviceForm} /> 
                                <Route path='/dashboard' component={Dashboard} /> 
                                <Route path='/policies/privacy' component={Policy} /> 
                                <Route path='/policies/tnc' component={TnC} /> 
                                <Route path='/forgotPassword' component={ForgotPassword} /> 
                                <Route path='/errorPage' component={NoIternetAccess} /> 
                                <Route path='/forbiddenAccess' component={ForbiddenAccess} /> 
                                <Route path='/authMessage' component={AuthMessage} /> 
                                <Route path='/login' component={Login} /> 
                                <Route path='/signup' component={Signup} /> 
                                <Route path='/faq' component={FAQ} /> 
                                <Route path='/resetPassword' component={ResetPassword} /> 
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
