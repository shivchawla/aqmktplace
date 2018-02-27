import * as React from 'react';
import axios from 'axios';
import {Link} from 'react-router-dom';
import {Button, Row, Col} from 'antd';
import {withRouter} from 'react-router';
import {AqLink} from '../components';
import {CreatePortfolioDialog} from '../containers';
import '../css/highstock.css';
const ReactHighstock = require('react-highcharts/ReactHighstock.src');

const {aimsquantToken, requestUrl, investorId} = require('../localConfig.json');

export class DashboardImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            portfolios: []
        }
    }

    createPortfolio = () => {
        this.setState({visible: !this.state.visible});
    }
    
    componentWillMount() {
        this.getInvestorPortfolios();
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

    render() {
        return (
            <Row>
                <Col span={24}>
                    <AqLink to='/dashboard/createadvice' pageTitle='Create Advice'/>
                </Col>
                <Col span={24}>
                    <AqLink to='/dashboard/createportfolio' pageTitle='Create Portfolio'/>
                </Col>
                <Col span={24}>
                    <CreatePortfolioDialog 
                            visible={this.state.visible} 
                            onCancel={this.createPortfolio}
                            toggleDialog={this.createPortfolio}
                            history={this.props.history}
                    />
                </Col>
                {this.renderPortfolios()}
            </Row>
        );
    }
}

export const Dashboard = withRouter(DashboardImpl);