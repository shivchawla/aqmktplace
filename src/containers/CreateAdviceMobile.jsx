import * as React from 'react';
import {AdviceFormMobile} from './StepperAdviceForm/AdviceFormMobile';
import {CreateAdviceMeta} from '../metas';

export default class CreateAdviceMobile extends React.Component {
    render() {
        return (
            <React.Fragment>
                <CreateAdviceMeta />
                <AdviceFormMobile />
            </React.Fragment>
        );
    }
}