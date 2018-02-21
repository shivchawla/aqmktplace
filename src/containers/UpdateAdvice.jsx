import * as React from 'react';
import {AdviceForm} from './AdviceForm';

export class UpdateAdvice extends React.Component {
    render() {
        return (
            <AdviceForm  isUpdate={true} adviceId={this.props.adviceId} />
        );
    }
}