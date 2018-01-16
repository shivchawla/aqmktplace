import * as React from 'react';
import {Link} from 'react-router-dom';

export class ScreenAdvices extends React.Component {
    render() {
        return (
            <div>
                <h1>Screen Advices</h1>
                <Link 
                    to={{
                        pathname: 'advice/1',
                        state: {
                            name: 'Screen Advices/Advice Detail'
                        }
                    }}

                >
                    Advice Detail
                </Link>
            </div>
        );
    }
}