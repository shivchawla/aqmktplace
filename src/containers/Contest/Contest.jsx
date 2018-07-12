import * as React from 'react';
import {Route} from 'react-router-dom';
import ContestHome from './ContestHome';
import LeaderBoard from './LeaderBoard';

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
            </React.Fragment>
        );
    }
}