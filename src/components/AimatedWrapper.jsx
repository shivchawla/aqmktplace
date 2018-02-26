import * as React from 'react';
import * as Animated from 'animated/lib/targets/react-dom';

const AnimatedWrapper = WrappedComponent => class AnimatedWrapper extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            animate: new Animated.Value(0)
        };
    }
    render() {
        return (
            <Animated.div className="animated-page-wrapper">
                <WrappedComponent {...this.props} />
            </Animated.div>
        );
    }
};

export default AnimatedWrapper;