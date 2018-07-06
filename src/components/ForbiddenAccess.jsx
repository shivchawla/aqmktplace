import * as React from 'react';
import {Row, Button} from 'antd';

export default class ForbiddenAccess extends React.Component {
    render() {
        return (
            <Row type="flex" align="middle" justify="center" style={{height: '100%'}}>
                <div style={{textAlign: 'center', position: 'absolute', top: '50%'}}>
                    <h1 
                            style={{fontSize: '40px', fontWeight: '700'}}
                    >
                        403 Forbidden
                        <span style={{fontSize: '20px', fontWeight: '400', marginLeft: '5px'}}>Access Denied.</span>
                    </h1>
                    <Button type="primary" onClick={() => this.props.history.push('/advice')}>GO TO ADVICES</Button>
                </div>
            </Row>
        );
    }
}