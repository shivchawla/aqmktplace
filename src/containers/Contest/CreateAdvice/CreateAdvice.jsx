import * as React from 'react';
import AdviceForm from './AdviceForm';
import {ContestCreateAdviceMeta} from '../../../metas';

export default class CreateAdvice extends React.Component {
    render() {
        return (
            <React.Fragment>
                <ContestCreateAdviceMeta />
                <AdviceForm />
            </React.Fragment>
        );
    }
}