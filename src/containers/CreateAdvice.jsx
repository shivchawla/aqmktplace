import * as React from 'react';
import {AdviceForm} from './AdviceForm';
import {CreateAdviceMeta} from '../metas';

export default class CreateAdvice extends React.Component {
    render() {
        return (
            <React.Fragment>
                <CreateAdviceMeta />
                <AdviceForm />
            </React.Fragment>
        );
    }
}