import * as React from 'react';
import {Link} from 'react-router-dom';

export class QuantResearch extends React.Component {
    render() {
        return (
            <div>
                <h1>Quant Research</h1>
                <Link 
                    to={{
                        pathname: '/research',
                        state: {
                            name: 'Quant Research/Research Platform'
                        }
                    }}
                >
                    Research Platform
                </Link>
            </div>
        );
    }
}