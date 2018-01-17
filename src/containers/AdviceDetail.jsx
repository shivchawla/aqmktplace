import * as React from 'react';

export class AdviceDetail extends React.Component {
    render() {
        return (
            <div>
                <h1>Advice Detail{this.props.match.params.id}</h1>
            </div>
        );
    }
}