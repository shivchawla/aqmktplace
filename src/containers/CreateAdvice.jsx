import * as React from 'react';
import {StepperAdviceForm} from './StepperAdviceForm/AdviceForm';
import {CreateAdviceMeta} from '../metas';

export default class CreateAdvice extends React.Component {
    render() {
        return (
            <React.Fragment>
                <CreateAdviceMeta />
                <StepperAdviceForm />
            </React.Fragment>
        );
    }
}