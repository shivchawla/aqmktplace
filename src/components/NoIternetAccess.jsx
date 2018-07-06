import * as React from 'react';
import {Row, Button} from 'antd';
export default class NoIternetAccess extends React.Component {
    render() {
        return (
            <Row type="flex" align="middle" justify="center" style={{height: '100%'}}>
                <div style={{textAlign: 'center', position: 'absolute', top: '50%'}}>
                    <h1 
                            style={{fontSize: '40px', fontWeight: '700'}}
                    >
                        Network Error
                        <span style={{fontSize: '20px', fontWeight: '400', marginLeft: '5px'}}>Something Went Wrong.</span>
                    </h1>
                    <Button type="primary" onClick={() => this.props.history.goBack()}>GO BACK</Button>
                </div>
            </Row>
        );
    }
}