import * as React from 'react';

export function myHoc(WrappedComponent) {
    return class WrappedComponentMod extends React.Component {
        
        render() {
            return <WrappedComponent {...this.props}/>
        }
    }
}