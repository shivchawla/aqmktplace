import * as React from 'react';
import {Modal, Row, Col, Icon} from 'antd';
import {verticalBox} from '../constants';

export default class LoaderModal extends React.Component {
    render() {
        return (
            <Modal
                    visible={this.props.visible}
                    footer={null}
                    closable={false}
                    bodyStyle={verticalBox}
                    width={300}
            >
                <Row >
                    <Col span={24} style={{textAlign: 'center'}}>
                        <h3 style={{fontSize: '18px'}}>{this.props.text || 'Loading'}</h3>
                    </Col>
                    <Col span={24} style={{textAlign: 'center', marginTop: '10px'}}>
                        <Icon style={{fontSize: '34px'}} type="loading" />
                    </Col>
                </Row>
            </Modal>
        );

    }
}