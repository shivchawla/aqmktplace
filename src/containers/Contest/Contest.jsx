import * as React from 'react';
import Media from 'react-media';
import {Route, Switch} from 'react-router-dom';
import ContestHome from './ContestHome';
import LeaderBoard from './LeaderBoard';
import AdviceDetailMobile from '../AdviceDetailMobile/AdviceDetailMobile';
import HowToCreateAdvice from './HowToCreateAdvice';
import CreateAdvice from './CreateAdvice/CreateAdvice';
import UpdateAdvice from './CreateAdvice/UpdateAdvice';
import ContestAdviceDetail from './ContestAdviceDetail';
import ContestHomeMobile from './Mobile/ContestHomeMobile';
import PageNotFoundMobile from '../../containers/WorkInProgressPage';
import PageNotFoundDesktop from  '../../components/PageNotFound';
import ContestTnC from './ContestTnC';
import {ContestHomeMeta} from '../../metas';
import {sendErrorToBackend, Utils} from '../../utils';

const {sendErrorEmailsForApp = false} = require('../../localConfig');
export default class Contest extends React.Component {
    componentWillMount() {
        let userEmail = 'support@adviceqube.com';
        if (Utils.isLoggedIn()) {
            userEmail = Utils.getLoggedInUserEmail();
        }
        sendErrorEmailsForApp && sendErrorToBackend(null, userEmail, 'Contest Page Intializing')
    }

    componentDidMount() {
        let userEmail = 'support@adviceqube.com';
        if (Utils.isLoggedIn()) {
            userEmail = Utils.getLoggedInUserEmail();
        }
        sendErrorEmailsForApp && sendErrorToBackend(null, userEmail, 'Contest Page Intialized')
    }

    componentDidCatch(error, info) {
        let userEmail = 'support@adviceqube.com';
        if (Utils.isLoggedIn()) {
            userEmail = Utils.getLoggedInUserEmail();
        }
        sendErrorEmailsForApp && sendErrorToBackend(error, userEmail, 'Contest Page Error')
    }

    render() {
        return(
            <React.Fragment>
                <ContestHomeMeta />
                <Media 
                    query="(max-width: 599px)"
                    render={() => (
                        <Switch>
                            <Route 
                                exact={true} 
                                path={`${this.props.match.url}`} 
                                render={props => <ContestHomeMobile {...props}/>} 
                            />
                            <Route 
                                exact={true} 
                                path={`${this.props.match.url}/createentry`} 
                                render={props => <HowToCreateAdvice {...props}/>} 
                            />
                            <Route 
                                exact={true} 
                                path={`${this.props.match.url}/createentry/edit`} 
                                render={props => <CreateAdvice {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/updateentry/:id`}
                                render={props => <UpdateAdvice {...props}/>} 
                            />
                            <Route 
                                exact={true}
                                path={`${this.props.match.url}/entry/:id`}
                                render={props => <AdviceDetailMobile {...props}/>} 
                            />
                            <Route
                                exact={true}
                                path={`${this.props.match.url}/leaderboard`}
                                render={props => <LeaderBoard {...props}/>} 
                            />
                            <Route component={PageNotFoundMobile} />
                        </Switch>
                    )}
                />
                <Media 
                    query="(min-width: 600px)"
                    render={() => (
                        <Switch>
                            <Route 
                                exact={true} 
                                path={`${this.props.match.url}`} 
                                render={props => <ContestHome {...props}/>} 
                            />
                            <Route
                                exact={true}
                                path={`${this.props.match.url}/leaderboard`}
                                render={props => <LeaderBoard {...props}/>} 
                            />
                            <Route
                                path={`${this.props.match.url}/leaderboard/:id`}
                                render={props => <LeaderBoard {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/createentry`}
                                render={props => <HowToCreateAdvice/>} 
                            />
                            <Route 
                                exact={true}
                                path={`${this.props.match.url}/entry/:id`}
                                render={props => <ContestAdviceDetail {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/createentry/edit`}
                                render={props => <CreateAdvice {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/updateentry/:id`}
                                render={props => <UpdateAdvice {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/rules`}
                                render={props => <ContestTnC/>} 
                            />
                            <Route component={PageNotFoundDesktop} />
                        </Switch>
                    )}
                />
            </React.Fragment>
        );
    }
}