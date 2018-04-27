import * as React from 'react';
import axios from 'axios';
import Websocket from 'react-websocket';
import Loading from 'react-loading-bar';
import {Link} from 'react-router-dom';
import {Button, Row, Col} from 'antd';
import {withRouter} from 'react-router';
import {AqLink} from '../components';
import {CreatePortfolioDialog} from '../containers';
import {loadingColor} from '../constants';
import '../css/highstock.css';
import {Utils} from '../utils';
const ReactHighstock = require('react-highcharts/ReactHighstock.src');

const {aimsquantToken, requestUrl, investorId} = require('../localConfig.js');

export class DashboardImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            portfolios: [],
            show: false
        }
    }

    createPortfolio = () => {
        this.setState({visible: !this.state.visible});
    }
    
    componentWillUnmount() {
        Utils.closeWebSocket();
    }

    getInvestorPortfolios = () => {
        const url = `${requestUrl}/investor/${investorId}`;
        const portfolios = [...this.state.portfolios];
        axios.get(url, {headers: {'aimsquant-token': aimsquantToken}})
        .then(response => {
            const investorPortfolios = response.data.portfolios;
            investorPortfolios.map(portfolio => {
                const portfolioUrl = `${requestUrl}/investor/${investorId}/portfolio/${portfolio._id}`;
                axios.get(portfolioUrl, {headers: {'aimsquant-token': aimsquantToken}})
                .then(response => {
                    portfolios.push({
                        id: response.data._id,
                        name: response.data.name
                    });
                    this.setState({portfolios});
                });
            });
        })
        .catch(error => {
            console.log(error.message);
        })
    }

    renderPortfolios = () => {
        const {portfolios} = this.state;
        return portfolios.map((portfolio, index) => {
            return (
                <Col span={24} key={index}>
                    <AqLink to={`/dashboard/portfolio/${portfolio.id}`} pageTitle = {portfolio.name}>
                        {portfolio.name} - {portfolio.id}
                    </AqLink> 
                </Col>
            );
        })
    }

    onShow = ()=> {
        this.setState({ show: true })
      }
  
    onHide = ()=> {
        this.setState({ show: false })
    }

    // handleData = data => {
    //     console.log('Called');
    //     console.log(data);
    // }

    render() {
        return (
            <Row>
                {/* <Websocket 
                        url='ws://localhost:1337'
                        onMessage={this.handleData}
                /> */}
                <Loading
                    show={this.state.show}
                    color={loadingColor}
                    className="main-loader"
                />

                <button
                    type="button"
                    onClick={this.onShow}>
                    show
                </button>

                <button
                    type="button"
                    onClick={this.onHide}>
                    hide
                </button>
                <Col span={24}>
                    <AqLink to='/advisordashboard' pageTitle='Advisor Dashboard'/>
                </Col>
                <Col span={24}>
                    <AqLink to='/investordashboard' pageTitle='Investor Dashboard'/>
                </Col>
                <Col span={24}>
                    <CreatePortfolioDialog 
                            visible={this.state.visible} 
                            onCancel={this.createPortfolio}
                            toggleDialog={this.createPortfolio}
                            history={this.props.history}
                    />
                </Col>
                <Col span={24}>
                    <div style={divBackground}>
                        <Row gutter={24}>
                            <Col style={gutterBox} span={6}>
                                <div className="gutter-box">col-6</div>
                            </Col>
                            <Col style={gutterBox} span={6}>
                                <div className="gutter-box">col-6</div>
                            </Col>
                            <Col style={gutterBox} span={6}>
                                <div className="gutter-box">col-6</div>
                            </Col>
                            <Col style={gutterBox} span={6}>
                                <div className="gutter-box">col-6</div>
                            </Col>
                        </Row>
                    </div>
                </Col>
            </Row>
        );
    }
}

const boxStyle = {
    backgroundColor: 'blue'
};

const gutterBox = {
    background: '#00A0E9',
    padding: '5px 0'
};

const divBackground = {
    background: 'transparent',
    border: 0
}

export const Dashboard = withRouter(DashboardImpl);