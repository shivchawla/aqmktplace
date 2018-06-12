import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Steps, Button, Form, Input, Select, Radio, DatePicker} from 'antd';
import {InvestMentObjComponent, AqStockTableMod} from '../components';
import {horizontalBox, inputHeaderStyle, goals, portfolioValuation, sectors, capitalization} from '../constants';
import {benchmarks} from '../constants/benchmarks';

const Step = Steps.Step;
const FormItem = Form.Item;
const Option = Select.Option;
const RadioGroup = Radio.Group;
const RadioButton = Radio.Button;

const dateFormat = 'YYYY-MM-DD';
const rebalancingFrequency = [ 'Monthly', 'Daily', 'Weekly', 'Bi-Weekly', 'Quartely'];

const investmentObjRowProps = {
    gutter: 16,
    type: 'flex',
    align: 'middle'
};

class StepperAdviceForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 3,
            rebalancingFrequency: rebalancingFrequency[0],
            benchmarks,
            data: []
        }
    }

    incrementCounter = () => {
        let current = this.state.current;
        if (current == 3) {
            current = 0;
        } else {
            current++;
        }
        this.setState({current});
    }

    renderAdviceInput = () => {
        const {getFieldDecorator} = this.props.form;
        return (
            <Row>
                <Col span={24} style={horizontalBox}>
                    <h3 style={inputHeaderStyle}>
                        Advice Name
                    </h3>
                </Col>
                <Col span={24}>
                    <FormItem>
                        {getFieldDecorator('name', {
                            rules: [{required: true, message: 'Please enter Advice Name'}]
                        })(
                            <Input />
                        )}
                        
                    </FormItem>
                </Col>
            </Row>
        );
    }

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
                                        items.map(item => <RadioButton value={item}>{item}</RadioButton>)
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

    renderInvestmentObjective = () => {
        const {getFieldDecorator} = this.props.form;

        return (
            <React.Fragment>
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
                                <div>
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
                                </div>
                            }
                        />
                    </Col>
                </Row>
            </React.Fragment>
                            
        );
    }

    renderMenu = (options, handleClick, defaultValue = options[0]) => (
        <Select value={defaultValue} style={{width: 150}} onChange={handleClick}>
            {
                options.map((item, index) => <Option key={index} value={item}>{item}</Option>)
            }
        </Select>
    )
    
    handleRebalanceMenuClick = (frequency) => {
        let {rebalancingFrequency} = {...this.state};
        rebalancingFrequency = frequency;
        this.setState({rebalancingFrequency});
    }

    renderOtherSettings = () => {
        const {getFieldDecorator} = this.props.form;

        return (
            <Row type="flex" align="middle">
                <Col span={8} >
                    <h4 style={labelStyle}>Rebalancing Freq.</h4>
                    {
                        this.renderMenu(
                            rebalancingFrequency, 
                            this.handleRebalanceMenuClick,
                            this.state.rebalancingFrequency
                        )
                    }
                </Col>
                <Col span={8} >
                    <h4 style={labelStyle}>Start Date</h4>
                    <FormItem>
                        {getFieldDecorator('startDate', {
                            rules: [{ type: 'object', required: true, message: 'Please select Start Date' }]
                        })(
                            <DatePicker 
                                allowClear={false}
                                format={dateFormat}
                                style={{width: 150}}
                                // disabledDate={this.getDisabledDate}
                            /> 
                        )}
                    </FormItem>
                </Col>
                <Col span={8} >
                    <h4 style={labelStyle}>Benchmark</h4>
                    {
                        this.renderMenu(
                            this.state.benchmarks, 
                            this.onBenchmarkSelected, 
                            this.state.selectedBenchmark
                        )
                    }
                </Col>
            </Row>
        );
    }

    onChange = data => {
        this.setState({data: _.cloneDeep(data)});
    }

    renderPortfolioTable = () => {
        return (
            <AqStockTableMod 
                onChange = {this.onChange}
            />
        );
    }

    renderSteps = () => {
        return (
            <Steps current={this.state.current}>
                <Step title="Advice Name" description="This is a description." />
                <Step title="Investment Objective" description="This is a description." />
                <Step title="Other Settings" description="This is a description." />
                <Step title="Portfolio" description="This is a description." />
            </Steps>
        );
    }
    
    renderPageContent = () => {
        return (
            <Row style={{padding: '20px 40px'}}>
                <Col span={24}>{this.renderSteps()}</Col>
                <Col span={24}>
                    {
                        this.state.current === 0 &&
                        this.renderAdviceInput()
                    }
                    {
                        this.state.current === 1 &&
                        this.renderInvestmentObjective()
                    }
                    {
                        this.state.current === 2 &&
                        this.renderOtherSettings()
                    }
                    {
                        this.state.current === 3 &&
                        this.renderPortfolioTable()
                    }
                </Col>
                <Col span={24}>
                    <Button onClick={this.incrementCounter}>Increment Counter</Button>
                </Col>
            </Row>
        );
    }

    render() {
        return (this.renderPageContent());
    }
}

export default Form.create()(StepperAdviceForm);

const labelColor = '#898989';
const labelStyle = {
    color: labelColor,
    marginBottom: '5px'
};