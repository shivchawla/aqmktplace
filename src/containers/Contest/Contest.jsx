import * as React from 'react';
import {Route} from 'react-router-dom';
import ContestHome from './ContestHome';
import LeaderBoard from './LeaderBoard';
import HowToCreateAdvice from './HowToCreateAdvice';
import CreateAdvice from './CreateAdvice/CreateAdvice';
import UpdateAdvice from './CreateAdvice/UpdateAdvice';
import ContestTnC from './ContestTnC';
import ContestAdviceForm from './CreateAdvice/AdviceForm';
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
                    path={`${this.props.match.url}/createadvice/how`}
                    render={props => <HowToCreateAdvice/>} 
                />
                <Route 
                    path={`${this.props.match.url}/createadvice/edit`}
                    render={props => <CreateAdvice {...props}/>} 
                />
                <Route 
                    path={`${this.props.match.url}/updateadvice/:id`}
                    render={props => <UpdateAdvice {...props}/>} 
                />
                <Route 
                    path={`${this.props.match.url}/terms`}
                    render={props => <ContestTnC/>} 
                />
            </React.Fragment>
        );
    }
}