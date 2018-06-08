import * as React from 'react';
import {Row, Col, Steps, Button, Form, Input} from 'antd';
import {horizontalBox, inputHeaderStyle} from '../constants';

const Step = Steps.Step;
const FormItem = Form.Item;

class StepperAdviceForm extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            current: 0
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

    // renderInvestmentObjective = () => {
    //     return (
    //         <Row style={{marginTop: '10px'}}>
    //             <h3 style={inputHeaderStyle}>
    //                 Investment Objective
    //             </h3>
    //             <Col 
    //                 span={24}
    //                 style={{
    //                     marginTop: '5px',
    //                     padding: '8px 20px', 
    //                     border: '1px solid #d9d9d9',
    //                     borderRadius: '4px',
    //                 }}>

    //                 <Row gutter={16}>
    //                     <Col span={16}>
    //                         <InvestMentObjComponent 
    //                             header="Goal"
    //                             warning={this.state.isPublic && !this.getInvestmentObjWarning('goal').valid && this.props.isUpdate}
    //                             reason={this.getInvestmentObjWarning('goal').reason}
    //                             content={
    //                                 <FormItem>
    //                                     {
    //                                         getFieldDecorator('investmentObjGoal', {
    //                                             initialValue: goals[0].field,
    //                                             rules: [{
    //                                                 required: true,
    //                                                 message: "Please enter the goal of your Advice"
    //                                             }]
    //                                         })(
    //                                             <Select
    //                                                     placeholder="Select Goal of your Advice"
    //                                                     disabled={!this.getDisableStatus()}
    //                                             >
    //                                                 {
    //                                                     goals.map((item, index) => 
    //                                                         <Option
    //                                                                 key={index}
    //                                                                 value={item.field}
    //                                                         >
    //                                                             {item.field}
    //                                                         </Option>
    //                                                     )
    //                                                 }
    //                                             </Select>
    //                                         )
    //                                     }
    //                                 </FormItem>
    //                             }
    //                         />
    //                     </Col>

    //                     <Col span={8}>
    //                         {
    //                             this.renderInvestmentObjectRadioGroup(
    //                                 'Valuation',
    //                                 'investmentObjPortfolioValuation',
    //                                 portfolioValuation,
    //                                 'Please enter the Portfolio Valuation of your advice',
    //                                 !this.getInvestmentObjWarning('portfolioValuation').valid,
    //                                 this.getInvestmentObjWarning('portfolioValuation').reason
    //                             )
    //                         }
    //                     </Col>
    //                 </Row>

    //                 <Row gutter={16}>
    //                     <Col span={16}>

    //                         <InvestMentObjComponent 
    //                             header="Sectors"
    //                             warning={this.state.isPublic && !this.getInvestmentObjWarning('sectors').valid && this.props.isUpdate}
    //                             reason={this.getInvestmentObjWarning('sectors').reason}
    //                             content={
    //                                 <FormItem>
    //                                     {
    //                                         getFieldDecorator('investmentObjSectors', {
    //                                             rules: [{
    //                                                 required: true,
    //                                                 message: 'Please enter the relevant sectors of your portfolio',
    //                                                 type: 'array'
    //                                             }]
    //                                         })(
    //                                             <Select
    //                                                     mode="multiple"
    //                                                     placeholder="Add sectors"
    //                                                     type="array"
    //                                                     disabled={!this.getDisableStatus()}
    //                                             >
    //                                                 {
    //                                                     sectors.map((sector, index) => 
    //                                                         <Option
    //                                                                 key={index} 
    //                                                                 value={sector}
    //                                                         >
    //                                                             {sector}
    //                                                         </Option>
    //                                                     )
    //                                                 }
    //                                             </Select>
    //                                         )
    //                                     }
    //                                 </FormItem>
    //                             }
    //                         />
    //                     </Col>

            
                        
    //                     <Col span={8}>
    //                         {
    //                             this.renderInvestmentObjectRadioGroup(
    //                                 'Capitalization',
    //                                 'investmentObjCapitalization',
    //                                 capitalization,
    //                                 'Please enter the Capitalization of your advice',
    //                                 !this.getInvestmentObjWarning('capitalization').valid,
    //                                 this.getInvestmentObjWarning('capitalization').reason
    //                             )
    //                         }
    //                     </Col>
    //                 </Row>
    //                 <Row>
    //                     <Col span={24}>
    //                         <InvestMentObjComponent 
    //                             header="Description"
    //                             warning={this.state.isPublic && !this.getInvestmentObjWarning('userText').valid && this.props.isUpdate}
    //                             reason={this.getInvestmentObjWarning('userText').reason}
    //                             content={
    //                                 <FormItem>
    //                                     {
    //                                         getFieldDecorator('investmentObjUserText', {
    //                                             rules: [{
    //                                                 required: false
    //                                             }]
    //                                         })(
    //                                             <Input 
    //                                                     style={inputStyle} 
    //                                                     placeholder="Optional"
    //                                                     disabled={!this.getDisableStatus()}
    //                                             />
    //                                         )
    //                                     }
    //                                 </FormItem>
    //                             }                                                    
    //                         />
    //                     </Col>
    //                 </Row>
    //                 <Row gutter={16} style={{marginTop: '15px'}}>
    //                     <Col span={24}>
    //                         <InvestMentObjComponent 
    //                             header="Suitability"
    //                             content={
    //                                 <div>
    //                                 <h3 style={{fontSize: '16px'}}>
    //                                     {
    //                                         this.getGoalDetail('investorType')
    //                                     }
    //                                 </h3>
    //                                 <h3 style={{fontSize: '16px'}}>
    //                                     {   
    //                                         this.getGoalDetail('suitability')
    //                                     }
    //                                 </h3>
    //                                 </div>
    //                             }
    //                         />
    //                     </Col>
    //                 </Row>
    //             </Col>
    //         </Row>
    //     );
    // }

    renderSteps = () => {
        return (
            <Steps current={this.state.current}>
                <Step title="Finished" description="This is a description." />
                <Step title="In Progress" description="This is a description." />
                <Step title="Waiting" description="This is a description." />
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