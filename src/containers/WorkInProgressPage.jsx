import * as React from 'react';
import {Row, Col} from 'antd';
import {AqMobileLayout} from '../containers/AqMobileLayout/Layout';
import {Button as MobileButton} from 'antd-mobile';

export default class WorkInProgressPage extends React.Component {
    render() {
        return (
            <AqMobileLayout innerPage={true}>
                <Row>
                    <Col 
                            span={24} 
                            style={{
                                height: '-webkit-fill-available', 
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center',
                                alignItems: 'center'
                            }}
                    >
                        <h3 style={{textAlign: 'center', fontSize: '20px', fontWeight: 300}}>
                            This page is not yet available for Mobile. Please try our desktop version.
                        </h3>
                        <MobileButton 
                                type="primary" 
                                onClick={() => this.props.history.goBack()}
                                style={{marginTop: '20px', width: '40%'}}
                                size="small"
                        >
                            Go Back
                        </MobileButton>
                    </Col>
                </Row>
            </AqMobileLayout>
        );
    }
}