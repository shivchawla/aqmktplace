import * as React from 'react';
import {Route} from 'react-router-dom';
import ContestHome from './ContestHome';
import LeaderBoard from './LeaderBoard';
import CreateAdvice from './CreateAdvice/CreateAdvice';
import UpdateAdvice from './CreateAdvice/UpdateAdvice';
export default class Contest extends React.Component {
    render() {
        return(
            <React.Fragment>
                <Route 
                    exact={true} 
                    path={`${this.props.match.url}`} 
                    render={props => <ContestHome {...props}/>} 
                />
                <Route 
                    path={`${this.props.match.url}/leaderboard`}
                    render={props => <LeaderBoard {...props}/>} 
                />
                <Route 
                    path={`${this.props.match.url}/createadvice`}
                    render={props => <CreateAdvice {...props}/>} 
                />
                <Route 
                    path={`${this.props.match.url}/updateadvice/:id`}
                    render={props => <UpdateAdvice {...props}/>} 
                />
            </React.Fragment>
        );
    }
}