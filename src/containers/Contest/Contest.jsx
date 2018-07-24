import * as React from 'react';
import Media from 'react-media';
import {Route, Switch} from 'react-router-dom';
import ContestHome from './ContestHome';
import LeaderBoard from './LeaderBoard';
import HowToCreateAdvice from './HowToCreateAdvice';
import CreateAdvice from './CreateAdvice/CreateAdvice';
import UpdateAdvice from './CreateAdvice/UpdateAdvice';
import ContestAdviceDetail from './ContestAdviceDetail';
import ContestHomeMobile from './Mobile/ContestHomeMobile';
import PageNotFound from '../../containers/WorkInProgressPage';
import ContestTnC from './ContestTnC';
import {ContestHomeMeta} from '../../metas';
export default class Contest extends React.Component {
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
                                path={`${this.props.match.url}/createadvice/edit`} 
                                render={props => <CreateAdvice {...props}/>} 
                            />
                            <Route component={PageNotFound} />
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
                                path={`${this.props.match.url}/createadvice`}
                                render={props => <HowToCreateAdvice/>} 
                            />
                            <Route 
                                exact={true}
                                path={`${this.props.match.url}/entry/:id`}
                                render={props => <ContestAdviceDetail {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/createadvice/edit`}
                                render={props => <CreateAdvice {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/updateadvice/:id`}
                                render={props => <UpdateAdvice {...props}/>} 
                            />
                            <Route
                                exact={true} 
                                path={`${this.props.match.url}/rules`}
                                render={props => <ContestTnC/>} 
                            />
                            <Route component={PageNotFound} />
                        </Switch>
                    )}
                />
            </React.Fragment>
        );
    }
}