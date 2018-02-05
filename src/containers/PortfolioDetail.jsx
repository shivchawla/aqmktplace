import * as React from 'react';
import axios from 'axios';
import _ from 'lodash';

export class PortfolioDetail extends React.Component {
    constructor(props) {
        super(props);
    }
    componentWillMount() {

    }
    render() {
        return (
            <div>
                <h1>{this.props.match.params.id}</h1>
            </div>
        );
    }
}