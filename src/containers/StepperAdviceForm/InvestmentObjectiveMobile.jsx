import * as React from 'react';
import {Row, Col, Form, Select, Radio} from 'antd';
import {SegmentedControl, Picker, List} from 'antd-mobile';
import {InvestMentObjComponent} from './InvestmentobjComponentMobile';
import {goals, portfolioValuation, capitalization} from '../../constants';
import {getStepIndex} from './steps';
import {tooltips} from './constants';
import './css/investmentObjectiveMobile.css';

const investmentObjRowProps = {
    gutter: 16,
    type: 'flex',
    align: 'middle'
};


const textStyle = {
    fontWeight: 300, 
    color: '#000000',
    fontSize: '17px'
};

const investmentObjPortfolioValuationFieldId = 'investmentObjPortfolioValuation';
const investmentObjCapitalizationFieldId = 'investmentObjCapitalization';


export class InvestmentObjective extends React.Component {
    renderInvestmentObjectSegmentedControl = (fieldName, fieldId, items) => {
        return (
            <InvestMentObjComponent 
                header={fieldName}
                content={
                    <SegmentedControl
                        style={{width: '100%', height: '30px'}} 
                        values={items}
                        key={fieldId}
                        selectedIndex={this.getSelectedIndexForSegment(items, fieldId)}
                        onValueChange={value => {
                            this.props.form.setFieldsValue({[fieldId]: value});
                        }}
                    />
                }
            />
        );
    }

    getSelectedIndexForSegment = (values, fieldId) => {
        return values.indexOf(this.props.form.getFieldValue(fieldId));
    }

    getGoalDetail = type => {
        const investorType = this.props.form.getFieldValue('investmentObjInvestorType');
        const goalItem = goals.filter(item => item.investorType === (investorType ? investorType[0] : null));
        if (goalItem[0]) {
            switch(type) {
                case "field":
                    return goalItem[0].field;
                case "suitability":
                    return goalItem[0].suitability;
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

    initializeFormValuesForSegmentedControl = () => {
        this.props.form.setFieldsValue({
            [investmentObjCapitalizationFieldId]: capitalization[0],
            [investmentObjPortfolioValuationFieldId]: portfolioValuation[0],
        });
    }

    onPickerChange = value => {
        this.props.form.setFieldsValue({['investmentObjInvestorType']: value[0]})
    }

    componentDidMount() {
        this.initializeFormValuesForSegmentedControl();
    }

    render() {
        const {getFieldProps} = this.props.form;
        return (
            <Col 
                    span={24}                        
                    style={{display: 'block'}}
            >
                <Row {...investmentObjRowProps}>
                    <Col span={24}>
                        <h3 style={labelStyle}>Investor Type</h3>
                    </Col>
                    <Col span={24}>
                        <Picker
                                data={goals.map(item => {return {label: item.investorType, value: item.investorType}})}
                                title=""
                                cols={1}
                                okText="Select"
                                dismissText="Cancel"
                                onChange={this.onPickerChange}
                                {...getFieldProps('investmentObjInvestorType', {
                                    initialValue: [goals[0].investorType],
                                    rules: [{
                                        required: true,
                                        message: "Please choose a valid investor type"
                                    }]
                                })}
                        >
                            <List.Item style={{paddingLeft: '0px', paddingRight: '0px'}} arrow="horizontal">
                                {this.props.form.getFieldValue('investmentObjInvestorType')}
                            </List.Item>
                        </Picker>
                    </Col>
                    <Col span={24} style={{marginTop: '20px'}}>
                        {
                            this.renderInvestmentObjectSegmentedControl(
                                'Valuation', 
                                investmentObjPortfolioValuationFieldId,
                                portfolioValuation
                            )
                        }
                    </Col>
                    <Col span={24} style={{marginTop: '20px'}}>
                        {
                            this.renderInvestmentObjectSegmentedControl(
                                'Capitalization', 
                                investmentObjCapitalizationFieldId,
                                capitalization
                            )
                        }
                    </Col>
                </Row>
                <Row {...investmentObjRowProps}>
                    <Col span={24} style={{marginTop: '20px'}}>
                        <InvestMentObjComponent 
                            header="Suitability"
                            tooltip={{text: tooltips['suitability']}}
                            content={
                                <Col span={24}>
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


const labelStyle = {
    fontWeight: 300, 
    color: '#000000',
    fontSize: '17px'
};
