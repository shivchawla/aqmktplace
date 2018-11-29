import * as React from 'react';
import {Row, Button} from 'antd';

export default class PageNotFound extends React.Component {
    render() {
        return (
            <Row type="flex" align="middle" justify="center" style={{height: '100%'}}>
                <div style={{textAlign: 'center', position: 'absolute', top: '50%'}}>
                    <h1 
                            style={{fontSize: '40px', fontWeight: '700'}}
                    >
                        404
                        <span style={{fontSize: '20px', fontWeight: '400', marginLeft: '5px'}}>Page Not Found</span>
                    </h1>
                    <Button 
                            type="primary" 
                            onClick={() => window.location.href = '/dailycontest/home'}
                    >
                        CONTEST HOME
                    </Button>
                </div>
            </Row>
        );
    }
}