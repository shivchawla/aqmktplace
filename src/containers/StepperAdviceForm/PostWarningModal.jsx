import * as React from 'react';
import {Row, Col, Modal, Button} from 'antd';
import {primaryColor} from '../../constants';

export class PostWarningModal extends React.Component {
    render() {
        return (
            <Modal
                    visible={this.props.visible}
                    title="Warning"
                    onOk={this.props.onOk}
                    onCancel={this.props.onCancel}
                    bodyStyle={{height: '200px', top: '20'}}
                    footer={[
                        <Button key="2" onClick={this.props.onCancel}>CANCEL</Button>,
                        <Button  
                                loading={this.props.loading} 
                                type="primary" 
                                key="1" 
                                onClick={this.props.onOk}
                        >
                            POST
                        </Button>
                    ]}
            >   
                <Row>
                    <Col span={24}>
                        <h3 style={{fontSize: '16px'}}>
                            Your advice will be submitted for Approval.<br></br>
                            If approved, modifications to the advice, except <span style={{color: primaryColor}}>Start Date</span> 
                            &nbsp;and <span style={{color: primaryColor}}>Portfolio</span>&nbsp;
                            will not be possible after you post to MarketPlace.
                        </h3>
                    </Col>
                </Row>
            </Modal>
        );
    }
}