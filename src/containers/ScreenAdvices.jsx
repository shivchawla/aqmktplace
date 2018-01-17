import * as React from 'react';
import {AqLink} from '../components';

export class ScreenAdvices extends React.Component {
    render() {
        return (
            <div>
                <AqLink to='/advice/1' pageTitle='Advice Detail'/>
            </div>
        );
    }
}