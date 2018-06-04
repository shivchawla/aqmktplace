import * as React from 'react';
import {AdviceForm} from './AdviceForm';

export default class UpdateAdvice extends React.Component {
    render() {
        return (
            <React.Fragment>
                <UpdateAdviceMeta />
                <AdviceForm  isUpdate={true} adviceId={this.props.match.params.id} />
            </React.Fragment>
        );
    }
}