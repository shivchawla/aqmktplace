import * as React from 'react';

export class NoIternetAccess extends React.Component {
    render() {
        return (
            <h1 style={{textAlign: 'center'}}>You are offline. Please turn on your iternet and try again</h1>
        );
    }
}