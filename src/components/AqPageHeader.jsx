import * as React from 'react';
import {Row, Col, Button} from 'antd';
import {pageTitleStyle} from '../constants';
import {AqBreadCrumb} from './AqBreadCrumb';

export class AqPageHeader extends React.Component {
    constructor(props) {
        super(props);
    };

    render() {
        const {
            title,
            breadCrumbs,
            button
        } = this.props;
        
        return (
            <Row type="flex" justify="space-between" align="middle" style={{backgroundColor: '#f9f9f9', paddingTop:'10px', marginBottom:'5px'}}>
                <Col span={16}>
                    <h1 style={pageTitleStyle}>{title}</h1>
                    <AqBreadCrumb breadCrumbs={breadCrumbs} />
                </Col>
                {button && 
                    <Col span={3}>
                        <Button 
                            type="primary" 
                            onClick={() => this.props.history.push(button.route)}>
                            {button.title}
                        </Button>
                    </Col>
                }
            </Row>
        );
    }
}