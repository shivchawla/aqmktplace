import * as React from 'react';
import {AqLink} from '../components';

export class StockResearch extends React.Component {
    render() {
        return (
            <div>
                <AqLink to='/stockresearch/researchDetails' pageTitle='Research Data' />
            </div>
        );
    }
}