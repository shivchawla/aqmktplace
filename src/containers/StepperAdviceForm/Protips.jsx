import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Icon, List} from 'antd';
import {horizontalBox, primaryColor, shadowBoxStyle} from '../../constants';
import {steps} from './steps';
import {adviceNameConfig} from './configs/adviceName';
import {investmentObjectiveConfig} from './configs/investment';
import {otherSettingsConfig} from './configs/otherSettings';
import {portfolioConfig} from './configs/portfolio';

export class Protips extends React.Component {
    constructor(props) {
        super(props);
    }
    getValidProTips = (selectedStep) => {
        const selectedStepKey = _.get(steps, `[${selectedStep}].key`, '');
        switch(selectedStepKey) {
            case "adviceName":
                return(adviceNameConfig);
            case "investmentObjective":
                return(investmentObjectiveConfig);
            case "portfolio":
                return(portfolioConfig);
            case "otherSettings":
                return(otherSettingsConfig);
        }
    }

    render() {
        return (
            <Row 
                    style={{
                        ...shadowBoxStyle, 
                        padding: '10px 20px', 
                        height: '100%', 
                        maxHeight: '600px', 
                        overflow: 'hidden', 
                        overflowY: 'scroll'
                    }}
            >
                <Col span={24}>
                    <List
                        style={{marginTop: '-10px'}}
                        header={<div style={{fontSize: '20px'}}>PRO-TIPS</div>}
                        dataSource={this.getValidProTips(this.props.selectedStep)}
                        renderItem={
                            protip => (
                                <List.Item><ProTipComponent key="index" protip={protip} /></List.Item>
                            )
                        }
                    />
                </Col>
            </Row>
        );
    }
}

const ProTipComponent = ({protip}) => {
    const {header = '', detail = {}} = protip;
    const headerTextStyle = {fontSize: '14px', fontWeight: '700', marginLeft: '5px', color: '#4C4C4C', color: primaryColor};
    const iconStyle = {fontSize: '18px', color: primaryColor};
    
    return (
        <Col span={24} style={{paddingRight: '15px'}}>
            <h3 style={{fontSize: '16px', fontWeight: '700', color: primaryColor}}>{header}</h3>
            <h4 style={{fontSize: '16px', color: '#4C4C4C'}}>{_.get(detail, 'definition', '')}</h4>
            <Row style={{marginTop: '10px'}}>
                <Col span={24} style={{...horizontalBox, alignItems: 'center'}}>
                    <Icon type="info-circle-o" style={iconStyle} />
                    <h4 style={headerTextStyle}>Importance</h4>
                </Col>
                <Col span={24} offset={2}>
                    <h4>{_.get(detail, 'importance', '')}</h4>
                </Col>
            </Row>
            {
                _.get(detail, 'suggestedData', []).length > 0 &&
                <Row style={{marginTop: '10px'}}>
                    <Col span={24} style={{...horizontalBox, alignItems: 'center'}}>
                        <Icon type="profile" style={iconStyle} />
                        <h4 style={headerTextStyle}>Example</h4>
                    </Col>
                    <Col span={24} offset={2}>
                        <h4>
                            {_.join(_.get(detail, 'suggestedData', []), ' , ')}
                        </h4>
                    </Col>
                </Row>
            }
        </Col>
    );
}