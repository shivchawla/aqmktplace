import * as React from 'react';
import {StepperAdviceForm} from './StepperAdviceForm/AdviceForm';
import {UpdateAdviceMeta} from '../metas';
import AppLayout from './AppLayout';

export default class UpdateAdvice extends React.Component {
    render() {
        return (
        	 <AppLayout 
        	 	content = {
		            <React.Fragment>
		                <UpdateAdviceMeta />
		                <StepperAdviceForm  isUpdate={true} adviceId={this.props.match.params.id} />
		            </React.Fragment>
	            }>
            </AppLayout>
        );
    }
}
