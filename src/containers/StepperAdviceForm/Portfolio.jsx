import * as React from 'react';
import {Row, Col} from 'antd';
import {metricColor} from '../../constants';
import {stepHeaderStyle, headerContainerStyle} from './constants';
import {AqStockTableMod, WarningIcon} from '../../components';
import {getStepIndex} from './steps';
import {getPortfolioWarnings} from './utils';

export class Portfolio extends React.Component {
    render() {
        const portfolioStep = getStepIndex('portfolio');
        
        return (
            <Row style={{display: this.props.step === portfolioStep ? 'block': 'none'}}>
                <Col span={24} style={headerContainerStyle}>
                    <h3 style={stepHeaderStyle}>
                        Step {portfolioStep + 1}: Portfolio
                    </h3>
                    {
                        this.props.isPublic &&
                        this.props.isUpdate &&
                        !getPortfolioWarnings(this.props.approvalStatusData).valid &&
                        <WarningIcon 
                            content={
                                <div>
                                    {
                                        getPortfolioWarnings(this.props.approvalStatusData).reasons.map((reason, index) => {
                                            return <p key={index}>{reason}</p>
                                        })
                                    }
                                </div>
                            }
                        />
                    }
                </Col>
                <Col span={24} style={{marginTop: '20px'}}>
                    {
                        this.props.error.show &&
                        <h3 
                                style={{
                                    color: metricColor.negative, 
                                    fontSize: '14px',
                                    marginBottom: '10px'
                                }}
                        >
                            * {this.props.error.detail}
                        </h3>
                    }
                    <AqStockTableMod 
                        style={{display: this.props.step >= 3 ? 'block': 'none'}}
                        onChange = {this.props.onChange}
                        data={this.props.data}
                        isUpdate={this.props.isUpdate}
                    />
                </Col>
            </Row>
        );
    }
}