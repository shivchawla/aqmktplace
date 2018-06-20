import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Icon, List, Collapse, Divider} from 'antd';
import {horizontalBox, primaryColor, shadowBoxStyle} from '../../constants';
import {steps} from './steps';
import {adviceNameConfig} from './configs/adviceName';
import {investmentObjectiveConfig} from './configs/investment';
import {otherSettingsConfig} from './configs/otherSettings';
import {portfolioConfig} from './configs/portfolio';
import {unorderedListStyle, listItemStyle} from './style/protips';
import '../../css/protips.css';

const Panel = Collapse.Panel;

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

    shouldComponentUpdate(nextProps) {
        if (this.props.selectedStep !== nextProps.selectedStep) {
            return true;
        } 

        return false;
    }

    render() {
        const customPanelStyle = {
            background: '#fff',
            border: 0,
            overflow: 'hidden',
        };

        return (
            <Row 
                    style={{
                        ...shadowBoxStyle, 
                        paddingTop: '10px', 
                        minHeight: '550px',
                        height: '100%', 
                        marginBottom: 0,
                    }}
            >
                <Col span={24}>
                    <h3 style={{marginLeft: '20px'}}>PRO-TIPS</h3>
                </Col>
                <Col 
                        span={24} 
                        style={{
                            overflow: 'hidden', 
                            overflowY: 'scroll',
                            height: '100%'
                        }}
                >
                    <Collapse accordion bordered={false} defaultActiveKey={['0']}>
                        {
                            this.getValidProTips(this.props.selectedStep).map((protip, index) => (
                                <Panel
                                        style={{
                                            ...customPanelStyle,
                                            borderBottom: index !== this.getValidProTips(this.props.selectedStep).length - 1 
                                                    ? '1px solid #ccc' : 'none'
                                        }}
                                        key={index}
                                        header={
                                            <h3 
                                                    style={{
                                                        fontSize: '16px', 
                                                        fontWeight: '700', 
                                                        color: primaryColor, 
                                                    }}
                                            >
                                                {protip.header}
                                            </h3>
                                        }
                                >
                                    <ProTipComponent protip={protip}/>
                                </Panel>
                            ))
                        }
                    </Collapse>
                </Col>
            </Row>
        );
    }
}

const ProTipComponent = ({protip}) => {
    const {header = '', detail = {}, requirements = []} = protip;
    const headerTextStyle = {fontSize: '14px', marginLeft: '5px', color: '#4C4C4C', color: primaryColor};
    const iconStyle = {fontSize: '18px', color: primaryColor};
    
    return (
        <Row>
            <Col span={24} style={{paddingRight: '80px', marginLeft: '40px'}}>
                <h4 style={{fontSize: '16px', color: '#4C4C4C'}}>{_.get(detail, 'definition', '')}</h4>
                <Row style={{marginTop: '10px'}}>
                    <Col span={24} style={{...horizontalBox, alignItems: 'center'}}>
                        <Icon type="info-circle-o" style={iconStyle} />
                        <h4 style={headerTextStyle}>Importance</h4>
                    </Col>
                    {
                        _.get(detail, 'importance', null) !== null &&
                        <Col span={24} style={{marginTop: '5px'}}>
                            <h4>{_.get(detail, 'importance', '')}</h4>
                        </Col>
                    }
                </Row>
                {
                    _.get(detail, 'suggestedData', []).length > 0 &&
                    <Row style={{marginTop: '10px'}}>
                        <Col span={24} style={{...horizontalBox, alignItems: 'center'}}>
                            <Icon type="profile" style={iconStyle} />
                            <h4 style={headerTextStyle}>Example</h4>
                        </Col>
                        <Col span={24} style={{marginTop: '5px'}}>
                            <ul style={unorderedListStyle}>
                                {
                                    _.get(detail, 'suggestedData', []).map((example, index) => {
                                        return (
                                            <li style={listItemStyle} key={index}>
                                                <h4>{example}</h4>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </Col>
                    </Row>
                }
                {
                    requirements.length > 0 &&
                    <Row style={{marginTop: '10px'}}>
                        <Col span={24} style={{...horizontalBox, alignItems: 'center'}}>
                            <Icon type="form" style={iconStyle} />
                            <h4 style={headerTextStyle}>Requirements</h4>
                        </Col>
                        <Col span={24} >
                            <ul style={unorderedListStyle}>
                                {
                                    requirements.map((requirement, index) => {
                                        return (
                                            <li style={listItemStyle} key={index}>
                                                <h4>{requirement}</h4>
                                            </li>
                                        );
                                    })
                                }
                            </ul>
                        </Col>
                    </Row>
                }
            </Col>
        </Row>
    );
}