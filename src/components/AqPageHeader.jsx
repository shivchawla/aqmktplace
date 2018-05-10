import * as React from 'react';
import {Row, Col, Button} from 'antd';
import {withRouter} from 'react-router';
import {pageTitleStyle} from '../constants';
import {AqBreadCrumb} from './AqBreadCrumb';

class AqPageHeaderImpl extends React.Component {
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
                <Col span={12}>
                    <h1 style={pageTitleStyle}>{title}</h1>
                    <AqBreadCrumb breadCrumbs={breadCrumbs} />
                </Col>
                {
                    button && 
                    <Col span={3} style={{textAlign: 'right'}}>
                        <Button 
                            type="primary" 
                            onClick={() => this.props.history.push(button.route)}>
                            {button.title}
                        </Button>
                    </Col>
                }
                {this.props.children && 
                    <Col span={12} style={{display: 'flex', justifyContent: 'flex-end'}}>
                        {this.props.children}
                    </Col>
                }
            </Row>
        );
    }
}

export const AqPageHeader = withRouter(AqPageHeaderImpl);