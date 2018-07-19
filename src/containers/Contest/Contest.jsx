import * as React from 'react';
import {Route} from 'react-router-dom';
import ContestHome from './ContestHome';
import LeaderBoard from './LeaderBoard';
import HowToCreateAdvice from './HowToCreateAdvice';
import CreateAdvice from './CreateAdvice/CreateAdvice';
import UpdateAdvice from './CreateAdvice/UpdateAdvice';
import ContestAdviceDetail from './ContestAdviceDetail';
import ContestTnC from './ContestTnC';
import {ContestHomeMeta} from '../../metas';
export default class Contest extends React.Component {
    render() {
        return(
            <React.Fragment>
                <ContestHomeMeta />
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
                    exact={true} 
                    path={`${this.props.match.url}/createadvice`}
                    render={props => <HowToCreateAdvice/>} 
                />
                <Route 
                    exact={true}
                    path={`${this.props.match.url}/entry/:contestId/:id`}
                    render={props => <ContestAdviceDetail {...props}/>} 
                />
                <Route
                    exact={true} 
                    path={`${this.props.match.url}/createadvice/edit`}
                    render={props => <CreateAdvice {...props}/>} 
                />
                <Route
                    exact={true} 
                    path={`${this.props.match.url}/updateadvice/:contestId/:id`}
                    render={props => <UpdateAdvice {...props}/>} 
                />
                <Route
                    exact={true} 
                    path={`${this.props.match.url}/terms`}
                    render={props => <ContestTnC/>} 
                />
            </React.Fragment>
        );
    }
}