import * as React from 'react';
import {AqLink} from '../components';

export class Dashboard extends React.Component {
    render() {
        return (
            <div>
                <AqLink to='dashboard/investordashboard' pageTitle='Investor Dashboard'/>
            </div>
        );
    }
}