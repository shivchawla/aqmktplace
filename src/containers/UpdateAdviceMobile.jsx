import * as React from 'react';
import {AdviceFormMobile} from './StepperAdviceForm/AdviceFormMobile';
import {UpdateAdviceMeta} from '../metas';

export default class UpdateAdviceMoble extends React.Component {
    render() {
        return (
            <React.Fragment>
                <UpdateAdviceMeta />
                <AdviceFormMobile isUpdate={true} adviceId={this.props.match.params.id}/>
            </React.Fragment>
        );
    }
}