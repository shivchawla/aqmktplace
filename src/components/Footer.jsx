import * as React from 'react';
import _ from 'lodash';
import {Link} from 'react-router-dom';
import {Row, Col} from 'antd';
import {Utils} from '../utils';
const aimsquantUrl = 'https://www.aimsquant.com';

export class Footer extends React.Component{
    constructor(props) {
        super(props);
    }

    render() {
        const token = _.get(Utils.getUserInfo(), 'token', '') || '';
    
        return (
            <Row className="footer">
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">Products</h5>
                    <div className="footer-list">
                        <Link className="footer-link" to="/home">MarketPlace</Link>
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/home?token=${token}`}>Research Platform</a>
                    </div>
                </Col>
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">Policies</h5>
                    <div className="footer-list">
                        <Link className="footer-link" to="/policies/tnc">Terms of use</Link>
                        <Link className="footer-link" to="/policies/privacy">Privacy Policy</Link>
                    </div>
                </Col>
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">AimsQuant</h5>
                    <div className="footer-list">
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/community?token=${token}`}>Community</a>
                        <a className="footer-link" target="_blank" href={`${aimsquantUrl}/research?token=${token}`}>Research</a>
                    </div>
                </Col>
                <Col span={4} className="footer-container">
                    <h5 className="footer-group-header">Help</h5>
                    <div className="footer-list">
                        <a className="footer-link" href="/faq">FAQ</a>
                        <a style={{color: '#fff'}} onClick={this.props.onContactUsClick}>Contact Us</a>
                    </div>
                </Col>
                <Col span={24} style={aimsquantContainerStyle}>
                    <h3 style={{color: '#fff', fontSize: '12px'}}>
                        AimsQuant Private Limited
                    </h3>
                </Col>
            </Row>
        );
    }
}

const aimsquantContainerStyle = {
    position: 'absolute',
    bottom: 0,
    textAlign: 'right',
    left: '-20px',
    paddingBottom: '20px'
}