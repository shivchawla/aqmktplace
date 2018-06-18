import * as React from 'react';
import {Row} from 'antd';

export default class ForbiddenAccess extends React.Component {
    render() {
        return (
            <Row type="flex" align="middle" justify="center" style={{height: '100%'}}>
                <h1 
                        style={{textAlign: 'left', position: 'absolute', top: '50%', fontSize: '40px', fontWeight: '700'}}
                >
                    403 Forbidden
                    <span style={{fontSize: '20px', fontWeight: '400', marginLeft: '5px'}}>Access Denied.</span>
                </h1>
            </Row>
        );
    }
}