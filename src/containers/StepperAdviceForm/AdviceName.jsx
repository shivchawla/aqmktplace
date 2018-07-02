import * as React from 'react';
import {Row, Col, Form, Input, Tag} from 'antd';
import {InputItem} from 'antd-mobile';
import {getStepIndex} from './steps';
import {getOthersWarning} from './utils';
import {inputStyle} from './style/adviceName';
import {WarningIcon} from '../../components';
import {horizontalBox, goals, primaryColor} from '../../constants';
import {labelStyle, valueStyle} from './constants';

const FormItem = Form.Item;


export class AdviceName extends React.Component {
    showWarning = () => {
        return (
            this.props.isUpdate &&
            this.props.isPublic &&
            !getOthersWarning(this.props.approvalStatusData, 'name').valid &&
            this.props.isPublic &&
            <WarningIcon 
                reason={getOthersWarning(this.props.approvalStatusData, 'name').reason} 
                style={{marginRight: '10px'}}
            />
        );
    }

    shouldComponentUpdate(nextProps) {
        const adviceNameStep = 2; //getStepIndex('adviceName');
        if (nextProps.step === adviceNameStep) {
            return true;
        }

        return false;
    }

    updateAdviceName = (e) => {
        console.log(e.currentTarget.children[0].textContent);
        this.props.form.setFieldsValue({adviceName: e.currentTarget.children[0].textContent});
    }

    getSuggestedNames() {
        let suggestedNames = [];
        
        var marketCap = this.props.form.getFieldValue('investmentObjCapitalization');
        //var valuation = this.props.form.getFieldValue('investmentObjPortfolioValuation');
        var investorType = this.props.form.getFieldValue('investmentObjInvestorType');
        var goalIdx = goals.findIndex(item => item.investorType == investorType);
        
        if (goalIdx != -1) {
            var suggestedPrefix = goals[goalIdx].suggestedName;

            suggestedPrefix.forEach(item => {
                suggestedNames.push(`${marketCap} ${item}`);
                suggestedNames.push(`${item} - ${marketCap}`);
            });
        }

        return suggestedNames;
    }

    render() {
        const {getFieldDecorator} = this.props.form;

    
        const suggestedNamesComponent = this.getSuggestedNames().map(suggestedAdviceName =>
                                  <div style={{border: `1px solid ${primaryColor}`, cursor: 'pointer', fontSize:'14px', fontWeight:300, display:'inline-block', margin: '5px 5px 0px 0px'}} onClick={this.updateAdviceName}>
                                    <span style={{color: primaryColor, padding:'5px'}}>{suggestedAdviceName}</span>
                                </div>
                            );
        
        return (
            <Row type="flex" align="middle"> 
                <Col span={24} style={labelStyle}>
                    Advice Name:
                </Col>
                <Col span={24} style={{marginTop: '7px'}}>
                    <Row>
                        <FormItem>
                            {getFieldDecorator('adviceName', {
                                rules: [{required: true, message: 'Please enter Advice Name'}]
                            })(
                                <Input
                                        placeholder='Type Advice Name' 
                                        style={inputStyle}
                                        disabled={this.props.disabled}
                                />
                            )}
                        </FormItem>      
                    </Row>
                    <Row>
                        <h4>Suggested Names</h4>
                        {suggestedNamesComponent}
                    </Row>
                </Col>
                <Col span={2}>
                    {this.showWarning()}
                </Col>
            </Row>
        );
    }
}
