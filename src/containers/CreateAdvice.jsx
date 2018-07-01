import * as React from 'react';
import {StepperAdviceForm} from './StepperAdviceForm/AdviceForm';
import {CreateAdviceMeta} from '../metas';
import AppLayout from './AppLayout';

export default class CreateAdvice extends React.Component {
    render() {
        return (
    	    <AppLayout 
                content={
		            <React.Fragment>
		                <CreateAdviceMeta />
		                <StepperAdviceForm />
		            </React.Fragment>
	            }>
            </AppLayout>
        );
    }
}