import * as React from 'react';
import {Row, Col, Form, Input, Select, Radio} from 'antd';
import {InvestMentObjComponent} from '../../components/InvestmentObjComponent';
import {goals, portfolioValuation, sectors, capitalization, primaryColor} from '../../constants';
import {getStepIndex} from './steps';
import {getInvestmentObjectiveWarning} from './utils';
import {tooltips, labelStyle, valueStyle, textStyle} from './constants';

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
                    <FormItem style={textStyle}>
                        {
                            getFieldDecorator(fieldId, {
                                initialValue: items[items.length - 1],
                                rules: [{
                                    required: true, 
                                    message
                                }]
                            })(
                                <RadioGroup size="large" disabled={this.props.disabled} style={{...textStyle, fontWeight: 400}}>
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
        const investorType = this.props.form.getFieldValue('investmentObjInvestorType');
        const goalItem = goals.filter(item => item.investorType === investorType)[0];
        if (goalItem) {
            switch(type) {
                case "field":
                    return goalItem.field;
                case "suitability":
                    return goalItem.suitability;
            }
        }
        return null;
    }

    shouldComponentUpdate(nextProps) {
        const investmentObjectiveStep = getStepIndex('investmentObjective');
        if (nextProps.step === investmentObjectiveStep) {
            return true;
        }

        return false;
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        return (
            <Col 
                    span={24}                        
                    style={{display: 'block'}}
            >
                <Row {...investmentObjRowProps}>
                    <Col span={24}>
                        <InvestMentObjComponent 
                            header="Target Investor Type"
                            warning={
                                this.props.isPublic &&
                                this.props.isUpdate &&
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'investorType').valid
                            }
                            tooltip={{text: tooltips['investorType']}}
                            reason={getInvestmentObjectiveWarning(this.props.approvalStatusData, 'investorType').reason}
                            content={
                                <Col span={24}>
                                    <FormItem style={textStyle}>
                                        {
                                            getFieldDecorator('investmentObjInvestorType', {
                                                //initialValue: goals[0].investorType,
                                                rules: [{
                                                    required: true,
                                                    message: "Please choose a valid investor type"
                                                }]
                                            })(
                                                <Select
                                                        placeholder="Select Investor Type for your advice"
                                                        style={{...textStyle, width: '100%', color: primaryColor}}
                                                        disabled={this.props.disabled}

                                                >
                                                    {
                                                        goals.map((item, index) => 
                                                            <Option 
                                                                style={textStyle}
                                                                key={index}
                                                                value={item.investorType}
                                                            >
                                                                {item.investorType}
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
                    <Col span={24} style={{marginTop: '20px'}}>
                        {
                            this.renderInvestmentObjectRadioGroup(
                                'Valuation',
                                'investmentObjPortfolioValuation',
                                portfolioValuation,
                                'Please enter the Portfolio Valuation of your advice',
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'portfolioValuation').valid,
                                getInvestmentObjectiveWarning(this.props.approvalStatusData, 'portfolioValuation').reason,
                                {label: 5, content: 17, warning: 2}
                            )
                        }
                    </Col>
                    <Col span={24} style={{marginTop: '20px'}}>
                        {
                            this.renderInvestmentObjectRadioGroup(
                                'Capitalization',
                                'investmentObjCapitalization',
                                capitalization,
                                'Please enter the Capitalization of your advice',
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'capitalization').valid,
                                getInvestmentObjectiveWarning(this.props.approvalStatusData, 'capitalization').reason,
                                {label: 5, content: 17, warning: 2}
                            )
                        }
                    </Col>
                </Row>
                {/*<Row {...investmentObjRowProps}>
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
                            warning={
                                this.props.isPublic &&
                                this.props.isUpdate &&
                                !getInvestmentObjectiveWarning(this.props.approvalStatusData, 'userText').valid
                            }
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
                </Row>*/}
                <Row {...investmentObjRowProps}>
                    <Col span={24} style={{marginTop: '20px'}}>
                        <InvestMentObjComponent 
                            header="Suitability"
                            tooltip={{text: tooltips['suitability']}}
                            content={
                                <Col span={24}>
                                    {/*<h3 style={{fontSize: '15px'}}>
                                        {
                                            this.getGoalDetail('field')
                                        }
                                    </h3>*/}
                                    <h3 style={textStyle}>
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