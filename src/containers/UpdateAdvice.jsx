import * as React from 'react';
import {AdviceForm} from './AdviceForm';

export class UpdateAdvice extends React.Component {
    render() {
        return (
            <AdviceForm  isUpdate={true} adviceId={'5a72ce5c816fb46abe81af75'} />
        );
    }
}