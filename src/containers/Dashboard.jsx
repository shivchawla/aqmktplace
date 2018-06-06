import * as React from 'react';
import _ from 'lodash';
import {Route} from 'react-router-dom';
import {Layout, Menu, Icon, Row, Col} from 'antd';
import InvestorDashboard from './InvestorDashboard';
import AdvisorDashboard from './AdvisorDashboard';
import {AqPageHeader} from '../components';
import {getBreadCrumbArray} from '../utils';

const {Header, Content, Sider} = Layout;
const { SubMenu } = Menu;

export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            view: {
                page: 'investor',
                section: 'performanceSummary'
            }
        }
    }

    handleMenuClick = e => {
        const page = e.keyPath[1];
        const section = e.keyPath[0];
        this.props.history.push(`${this.props.match.url}/${page}/${section}`)
    }

    getSelectedSection = () => {
        const crumbs = _.split(this.props.location.pathname, '/');
        if (crumbs[crumbs.length - 1] === 'dashboard' || crumbs[crumbs.length - 1].length < 1) {
            return 'performanceSummary';
        }
        return crumbs[crumbs.length - 1];
    }

    getMenuItem = value => <span style={menuItemStyle}>{value}</span>

    render() {
        const breadCrumbArray = getBreadCrumbArray([{name: 'Dashboard'}]);
        const investorTitle = <span style={subMenuLabelStyle}><Icon type="shopping-cart" />Investor Dashboard</span>;
        const advisorTitle = <span style={subMenuLabelStyle}><Icon type="rocket" />Advisor Dashboard</span>;

        return(
            <Layout>
                <Layout>
                    <Sider 
                            width={250} 
                            style={{ background: '#fff', height: '100%'}}
                    >
                        <Menu
                                mode="inline"
                                defaultSelectedKeys={[this.getSelectedSection()]}
                                defaultOpenKeys={['investor', 'advisor']}
                                style={{ height: '100%' }}
                                onClick={this.handleMenuClick}
                        >
                            <Menu.Item key="account">Account</Menu.Item>
                            <SubMenu 
                                    key="investor" 
                                    title={investorTitle}
                            >
                                <Menu.Item key="performanceSummary">{this.getMenuItem('Performance Summary')}</Menu.Item>
                                <Menu.Item key="portfolioSummary">{this.getMenuItem('Portfolio Summary')}</Menu.Item>
                                <Menu.Item key="createdPortfolios">{this.getMenuItem('Created Portfolios')}</Menu.Item>
                                <Menu.Item key="subscribedAdvices">{this.getMenuItem('Subscribed Advices')}</Menu.Item>
                            </SubMenu>
                            <SubMenu key="advisor" title={advisorTitle}>
                                <Menu.Item key="myAdvices">{this.getMenuItem('My Advices')}</Menu.Item>
                                <Menu.Item key="advicePerformance">{this.getMenuItem('Advice Performance')}</Menu.Item>
                                <Menu.Item key="metrics">{this.getMenuItem('Metrics')}</Menu.Item>
                            </SubMenu>
                        </Menu>
                    </Sider>
                    <Layout style={{paddingBottom: '40px', paddingTop: '10px', paddingLeft: '10px'}}>
                        <AqPageHeader
                                style={{marginLeft: '30px'}} 
                                backgroundColor='transparent' 
                                breadCrumbs = {breadCrumbArray} 
                                title="Dashboard" 
                        />
                        <Content>
                            <Route 
                                    exact={true}
                                    path={`${this.props.match.url}/advisor/:section`} 
                                    render={
                                        props => <AdvisorDashboard {...props} />
                                    }
                            />
                            <Route 
                                    path={`${this.props.match.url}`} 
                                    exact={true}
                                    render={
                                        props => <InvestorDashboard {...props} />
                                    }
                            />
                            <Route 
                                    path={`${this.props.match.url}/investor/:section`} 
                                    exact={true}
                                    render={
                                        props => <InvestorDashboard {...props} />
                                    }
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        );
    }
}

const subMenuLabelStyle = {
    fontWeight: 700
};

const menuItemStyle = {
    marginLeft: '10px'
};