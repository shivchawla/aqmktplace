import * as React from 'react';
import AdviceForm from './AdviceForm';
import {ContestUpdateAdviceMeta} from '../../../metas';

export default class UpdateAdvice extends React.Component {
    render() {
        return (
            <React.Fragment>
                <ContestUpdateAdviceMeta />
                <AdviceForm 
                    isUpdate={true} 
                    adviceId={this.props.match.params.id} 
                    contestId={this.props.match.params.contestId}
                />
            </React.Fragment>
        );
    }
}