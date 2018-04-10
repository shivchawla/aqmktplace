import * as React from 'react';
import {withRouter} from 'react-router';
import {Route, Redirect} from 'react-router-dom';
import {Utils} from '../utils';

class AuthRouteImpl extends React.Component {
    render() {
        const {path, component} = this.props;
        const PassedComponent = component;

        return (
            <Route 
                    exact={true}
                    path={path}
                    render={() => Utils.isLoggedIn() ? <PassedComponent {...this.props}/> : <Redirect push to='/login' />} 
            />
        );
    }
}

export const AuthRoute = withRouter(AuthRouteImpl);