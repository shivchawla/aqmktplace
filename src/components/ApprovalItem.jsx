import * as React from 'react';
import {Row, Col, Radio, Input} from 'antd';

const RadioGroup = Radio.Group;

export class ApprovalItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            valid: true,
            reason: ''
        }
    }

    handleRadioChange = e => {
        this.setState({valid: e.target.value});
    }

    render() {
        const approvalObj = this.props.approvalObj;
        const {fieldName = 'undefined', valid = false, reason = ''} = approvalObj;

        return (
            <Row style={{marginBottom: '20px', ...this.props.style}}>
                <Col span={24}>
                    <h3 style={{color: '#595959', fontSize: '14px'}}>{fieldName}</h3>
                </Col>
                <Col span={24} style={{marginTop: '2px'}}>
                    <RadioGroup 
                            onChange={this.props.onRadioChange} 
                            defaultValue={valid}
                    >
                        <Radio value={true}>Valid</Radio>
                        <Radio value={false}>Invalid</Radio>
                    </RadioGroup>
                </Col>
                {
                    !valid &&
                    <Col span={24} style={{marginTop: '8px'}}>
                        <Input onChange={this.props.onInputChange} placeholder="Reason" value={reason}/>
                    </Col>
                }
            </Row>
        );
    }
}