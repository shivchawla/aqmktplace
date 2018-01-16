import * as React from 'react';
import {Link} from 'react-router-dom';

export class Dashboard extends React.Component {
    render() {
        return (
            <div>
                <h1>Dashboard</h1>
                <Link 
                    to={{
                        pathname: '/investordashboard',
                        state: {
                            name: 'DashBoard/Investor Dashboard'
                        }
                    }}
                >
                    Investor Dashboard
                </Link>
            </div>
        );
    }
}