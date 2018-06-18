import * as React from 'react';
import {Row, Col, Form, Input, Select, Radio} from 'antd';
import {InvestMentObjComponent, WarningIcon} from '../../components';
import {goals, portfolioValuation, sectors, capitalization} from '../../constants';
import {getStepIndex} from './steps';
import {getInvestmentObjectiveWarning, checkForInvestmentObjectiveError} from './utils';
import {headerContainerStyle, tooltips} from './constants';

const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

const investmentObjRowProps = {
    gutter: 16,
    type: 'flex',
    align: 'middle'
};


export class InvestmentObjective extends React.Component {
    
    renderInvestmentObjectRadioGroup = (fieldName, fieldId, items, message, warning = false, reason = '', span={label: 4, content: 20, warning: 2}) => {
        const {getFieldDecorator} = this.props.form;

        return (
            <InvestMentObjComponent 
                header={fieldName}
                warning={
                    this.props.isPublic &&
                    this.props.isUpdate &&
                    warning
                }
                span={span}
                reason={reason}
                tooltip={{text: tooltips[fieldId]}}
                content={
                    <FormItem>
                        {
                            getFieldDecorator(fieldId, {
                                initialValue: items[0],
                                rules: [{
                                    required: true, 
                                    message
                                }]
                            })(
                                <RadioGroup size="small" disabled={this.props.disabled}>
                                    {
                                        items.map((item, index) => 
                                            <RadioButton key={index} value={item}>{item}</RadioButton>
                                        )
                                    }
                                </RadioGroup>
                            )
                        }
                    </FormItem>
                }
            />
        );
    }

    getGoalDetail = type => {
        const goal = this.props.form.getFieldValue('investmentObjGoal');
        const goalItem = goals.filter(item => item.field === goal)[0];
        if (goalItem) {
            switch(type) {
                case "investorType":
                    return goalItem.investorType;
                case "suitability":
                    return goalItem.suitability;
            }
        }
        return null;
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        const investmentObjectiveStep = getStepIndex('investmentObjective');

        return (
            <Col 
                    span={24}                        
                    style={{display: this.props.step === investmentObjectiveStep ? 'block': 'none'}}
            >
                <Row {...investmentObjRowProps}>
                    {/* <Col span={24} style={{...headerContainerStyle, marginTop: '10px', marginBottom: '20px'}}>
                        {
                            this.props.isPublic &&
                            this.props.isUpdate &&
                            !checkForInvestmentObjectiveError(this.props.approvalStatusData) &&
                            <WarningIcon reason="There are invalid Investment Objective items" />
                        }
                    </Col> */}
                    <Col span={24}>
                        <InvestMentObjComponent 
                            header="Goal"
                            warning={
                                this.props.isPublic &&
                                this.props.isUpdate &&
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'goal').valid
                            }
                            tooltip={{text: tooltips['goal']}}
                            reason={getInvestmentObjectiveWarning(this.props.approvalStatusData, 'goal').reason}
                            content={
                                <Col span={24}>
                                    <FormItem>
                                        {
                                            getFieldDecorator('investmentObjGoal', {
                                                initialValue: goals[0].field,
                                                rules: [{
                                                    required: true,
                                                    message: "Please enter the goal of your Advice"
                                                }]
                                            })(
                                                <Select
                                                        placeholder="Select Goal of your Advice"
                                                        style={{width: '100%'}}
                                                        disabled={this.props.disabled}
                                                >
                                                    {
                                                        goals.map((item, index) => 
                                                            <Option
                                                                    key={index}
                                                                    value={item.field}
                                                            >
                                                                {item.field}
                                                            </Option>
                                                        )
                                                    }
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                </Col>
                            }
                        />
                    </Col>
                    <Col span={12}>
                        {
                            this.renderInvestmentObjectRadioGroup(
                                'Valuation',
                                'investmentObjPortfolioValuation',
                                portfolioValuation,
                                'Please enter the Portfolio Valuation of your advice',
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'portfolioValuation').valid,
                                getInvestmentObjectiveWarning(this.props.approvalStatusData, 'portfolioValuation').reason,
                                {label: 6, content: 15, warning: 2}
                            )
                        }
                    </Col>
                    <Col span={12}>
                        {
                            this.renderInvestmentObjectRadioGroup(
                                'Capitalization',
                                'investmentObjCapitalization',
                                capitalization,
                                'Please enter the Capitalization of your advice',
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'capitalization').valid,
                                getInvestmentObjectiveWarning(this.props.approvalStatusData, 'capitalization').reason,
                                {label: 7, content: 15, warning: 2}
                            )
                        }
                    </Col>
                </Row>
                <Row {...investmentObjRowProps}>
                    <Col span={24}>
                        <InvestMentObjComponent 
                            header="Sectors"
                            warning={
                                this.props.isPublic &&
                                this.props.isUpdate &&
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'sectors').valid
                            }
                            tooltip={{text: tooltips['sectors']}}
                            reason={getInvestmentObjectiveWarning(this.props.approvalStatusData, 'sectors').reason}
                            content={
                                <Col span={24}>
                                    <FormItem>
                                        {
                                            getFieldDecorator('investmentObjSectors', {
                                                rules: [{
                                                    required: true,
                                                    message: 'Please enter the relevant sectors of your portfolio',
                                                    type: 'array'
                                                }]
                                            })(
                                                <Select
                                                        mode="multiple"
                                                        placeholder="Add sectors"
                                                        type="array"
                                                        style={{width: '100%'}}
                                                        disabled={this.props.disabled}
                                                >
                                                    {
                                                        sectors.map((sector, index) => 
                                                            <Option
                                                                    key={index} 
                                                                    value={sector}
                                                            >
                                                                {sector}
                                                            </Option>
                                                        )
                                                    }
                                                </Select>
                                            )
                                        }
                                    </FormItem>
                                </Col>
                            }
                            />
                    </Col>
                </Row>
                <Row {...investmentObjRowProps}>
                    <Col span={24}>
                        <InvestMentObjComponent 
                            header="Description"
                            tooltip={{text: tooltips['userText']}}
                            warning={!getInvestmentObjectiveWarning(this.props.approvalStatusData, 'userText').valid}
                            reason={getInvestmentObjectiveWarning(this.props.approvalStatusData, 'userText').reason}
                            content={
                                <Col span={24}>
                                    <FormItem>
                                        {
                                            getFieldDecorator('investmentObjUserText', {
                                                rules: [{
                                                    required: false
                                                }]
                                            })(
                                                <Input placeholder="Optional" disabled={this.props.disabled}/>
                                            )
                                        }
                                    </FormItem>
                                </Col>
                            }                                                    
                        />
                    </Col>
                </Row>
                <Row {...investmentObjRowProps}>
                    <Col span={24} style={{marginTop: '20px'}}>
                        <InvestMentObjComponent 
                            header="Suitability"
                            tooltip={{text: tooltips['suitability']}}
                            content={
                                <Col span={24}>
                                    <h3 style={{fontSize: '16px'}}>
                                        {
                                            this.getGoalDetail('investorType')
                                        }
                                    </h3>
                                    <h3 style={{fontSize: '16px'}}>
                                        {   
                                            this.getGoalDetail('suitability')
                                        }
                                    </h3>
                                </Col>
                            }
                        />
                    </Col>
                </Row>
            </Col>
                            
        );
    }
}