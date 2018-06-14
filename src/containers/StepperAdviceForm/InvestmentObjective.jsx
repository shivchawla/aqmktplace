import * as React from 'react';
import {Row, Col, Form, Input, Select, Radio} from 'antd';
import {InvestMentObjComponent} from '../../components/InvestmentObjComponent';
import {goals, portfolioValuation, sectors, capitalization} from '../../constants';
import {getStepIndex} from './steps';

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
    renderInvestmentObjectRadioGroup = (fieldName, fieldId, items, message) => {
        const {getFieldDecorator} = this.props.form;

        return (
            <InvestMentObjComponent 
                header={fieldName}
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
                                <RadioGroup size="small">
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

    render = () => {
        const {getFieldDecorator} = this.props.form;
        const investmentObjectiveStep = getStepIndex('investmentObjective');

        return (
            <Col 
                    span={24}                        
                    style={{display: this.props.step === investmentObjectiveStep ? 'block': 'none'}}
            >
                <Row {...investmentObjRowProps}>
                    <Col span={16}>
                        <InvestMentObjComponent 
                            header="Goal"
                            content={
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
                            }
                        />
                    </Col>
                    <Col span={8}>
                        {
                            this.renderInvestmentObjectRadioGroup(
                                'Valuation',
                                'investmentObjPortfolioValuation',
                                portfolioValuation,
                                'Please enter the Portfolio Valuation of your advice',
                            )
                        }
                    </Col>
                </Row>
                <Row {...investmentObjRowProps}>
                    <Col span={16}>
                        <InvestMentObjComponent 
                            header="Sectors"
                            content={
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
                            }
                            />
                    </Col>
                    <Col span={8}>
                        {
                            this.renderInvestmentObjectRadioGroup(
                                'Capitalization',
                                'investmentObjCapitalization',
                                capitalization,
                                'Please enter the Capitalization of your advice',
                            )
                        }
                    </Col>
                </Row>
                <Row {...investmentObjRowProps}>
                    <Col span={24}>
                        <InvestMentObjComponent 
                            header="Description"
                            content={
                                <FormItem>
                                    {
                                        getFieldDecorator('investmentObjUserText', {
                                            rules: [{
                                                required: false
                                            }]
                                        })(
                                            <Input placeholder="Optional" />
                                        )
                                    }
                                </FormItem>
                            }                                                    
                        />
                    </Col>
                </Row>
                <Row {...investmentObjRowProps}>
                    <Col span={24}>
                        <InvestMentObjComponent 
                            header="Suitability"
                            content={
                                <Col>
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