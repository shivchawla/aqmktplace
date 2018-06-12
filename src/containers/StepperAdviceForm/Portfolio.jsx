import * as React from 'react';
import {metricColor} from '../../constants';
import {AqStockTableMod} from '../../components';
import {getStepIndex} from './steps';

export class Portfolio extends React.Component {
    render() {
        const portfolioStep = getStepIndex('portfolio');
        
        return (
            <div style={{display: this.props.step === portfolioStep ? 'block': 'none'}}>  
                {
                    this.props.error.show &&
                    <h3 
                            style={{
                                color: metricColor.negative, 
                                fontSize: '12px'
                            }}
                    >
                        {this.props.error.detail}
                    </h3>
                }
                <AqStockTableMod 
                    style={{display: this.props.step >= 3 ? 'block': 'none'}}
                    onChange = {this.props.onChange}
                />
            </div>
        );
    }
}