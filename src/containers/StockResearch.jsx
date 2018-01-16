import * as React from 'react';
import {Link} from 'react-router-dom';

export class StockResearch extends React.Component {
    render() {
        return (
            <div>
                <h1>Stock Research</h1>
                <Link 
                    to={{
                        pathname: '/researchDetails',
                        state: {
                            name: 'Stock Research/Reasearch Details'
                        }
                    }}
                >
                    Research Data
                </Link>
            </div>
        );
    }
}