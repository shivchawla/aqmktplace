import * as React from 'react';
import {StepperAdviceForm} from './StepperAdviceForm/AdviceForm';
import {UpdateAdviceMeta} from '../metas';

export default class UpdateAdvice extends React.Component {
    render() {
        return (
            <React.Fragment>
                <UpdateAdviceMeta />
                <StepperAdviceForm  isUpdate={true} adviceId={this.props.match.params.id} />
            </React.Fragment>
        );
    }
}