import * as React from 'react';
import {Link} from 'react-router-dom';
import {Row, Col} from 'antd';

export const Footer = props => {
    return (
        <Row className="footer">
            <h3 className="footer-header">AdviceQube</h3>
            <Col span={4} className="footer-container">
                <h5 className="footer-group-header">Products</h5>
                <div className="footer-list">
                    <Link className="footer-link" to="/home">MarketPlace</Link>
                    <a className="footer-link" href="https://www.aimsquant.com/">Research Platform</a>
                </div>
            </Col>
            {/* <Col span={4} className="footer-container">
                <h5 className="footer-group-header">Company</h5>
                <div className="footer-list">
                    <a className="footer-link" href="#">Contact Us</a>
                    <a className="footer-link" href="#">Career</a>
                    <a className="footer-link" href="#">People</a>
                </div>
            </Col> */}
            <Col span={4} className="footer-container">
                <h5 className="footer-group-header">Policies</h5>
                <div className="footer-list">
                    <Link className="footer-link" to="/policies/tnc">Terms of use</Link>
                    <Link clLinkssName="footer-link" to="/policies/privacy">Privacy Policy</Link>
                </div>
            </Col>
            <Col span={4} className="footer-container">
                <h5 className="footer-group-header">AimsQuant</h5>
                <div className="footer-list">
                    <a className="footer-link" href="https://www.aimsquant.com/research/community">Community</a>
                    <a className="footer-link" href="https://www.aimsquant.com/research/strategy">Research</a>
                </div>
            </Col>
            <Col span={4} className="footer-container">
                <h5 className="footer-group-header">Help</h5>
                <div className="footer-list">
                    <Link className="footer-link" to="/faq">FAQ</Link>
                </div>
            </Col>
        </Row>
    );
}