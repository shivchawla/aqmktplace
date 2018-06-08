import * as React from 'react';
import _ from 'lodash';
import {Route} from 'react-router-dom';
import {Layout, Menu, Icon, Row, Col, Button} from 'antd';
import InvestorDashboard from './InvestorDashboard';
import AdvisorDashboard from './AdvisorDashboard';
import {primaryColor} from '../constants';
import {getBreadCrumbArray, Utils} from '../utils';

const {Content, Sider} = Layout;
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
        if (page === undefined && section === 'createPortfolio') {
            this.props.history.push('/dashboard/createportfolio');
        } else if (page === 'account') {
            if (section === 'signOut') {
                Utils.logoutUser();
                this.props.history.push('/login');
            } else if (section === 'myProfile') {
                this.props.history.push(this.props.history.push(`/dashboard/advisorprofile/${Utils.getUserInfo().advisor}`));
            }
        }
        else {
            this.props.history.push(`${this.props.match.url}/${page}/${section}`);
        }
    }

    getSelectedSection = () => {
        const crumbs = _.split(this.props.location.pathname, '/');
        if (crumbs[crumbs.length - 1] === 'dashboard' || crumbs[crumbs.length - 1].length < 1) {
            return 'performanceSummary';
        }
        return crumbs[crumbs.length - 1];
    }

    getMenuItem = value => <span style={menuItemStyle}>{value}</span>

    getUserDetailDiv = () => (
        <div 
                style={{
                    backgroundColor: '#fff', 
                    padding: '10px 10px',
                    display: 'flex',
                    flexDirection: 'row',
                    borderBottom: `1px solid #e0e0e0`,
                    alignItems: 'center',
                    height: '60px'
                }}
        >
            <Button 
                    style={{background: primaryColor, border: 'none', color: '#fff'}}
                    shape="circle"
                    onClick={
                        () => this.props.history.push(this.props.history.push(`/dashboard/advisorprofile/${Utils.getUserInfo().advisor}`))
                    }
            >
                {Utils.getLoggedInUserInitials()} 
            </Button>
            <div style={{display: 'flex', flexDirection: 'column', marginLeft: '5px'}}>
                <h3 
                        style={{
                            color: primaryColor, 
                            fontSize: '16px', 
                            marginTop: '5px',
                        }}
                >
                    {Utils.getLoggedInUserName()}
                </h3>
                <h5 
                        style={{
                            color: primaryColor, 
                            fontSize: '12px', 
                        }}
                >
                    {Utils.getLoggedInUserEmail()}
                </h5>
            </div>
        </div>
    )

    render() {
        const investorTitle = <span style={subMenuLabelStyle}><Icon type="shopping-cart" />Investor Dashboard</span>;
        const advisorTitle = <span style={subMenuLabelStyle}><Icon type="rocket" />Advisor Dashboard</span>;
        const createPortfolioTitle = <span style={subMenuLabelStyle}><Icon type="plus-square-o" />Create Portfolio</span>;
        const accountTitle = <span style={subMenuLabelStyle}><Icon type="user" />Account</span>;

        return(
            <Layout style={{height: '100%'}}>
                <Sider 
                        width={250} 
                        style={{ background: '#fff'}}
                >   
                    {this.getUserDetailDiv()}
                    <Menu
                            mode="inline"
                            defaultSelectedKeys={[this.getSelectedSection()]}
                            defaultOpenKeys={['investor', 'advisor']}
                            onClick={this.handleMenuClick}
                    >
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
                        <Menu.Item key="createPortfolio">{createPortfolioTitle}</Menu.Item>
                        <SubMenu key="account" title={accountTitle}>
                            <Menu.Item key="signOut">{this.getMenuItem('Sign Out')}</Menu.Item>
                            <Menu.Item key="myProfile">{this.getMenuItem('My Profile')}</Menu.Item>
                        </SubMenu>
                    </Menu>
                </Sider>
                <Layout style={{paddingTop: '10px', paddingLeft: '10px'}}>
                    <Content style={{overflow: 'hidden', overflowY: 'scroll'}}>
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
        );
    }
}

const subMenuLabelStyle = {
    fontWeight: 700
};

const menuItemStyle = {
    marginLeft: '10px'
};