import * as React from 'react';
import {Layout, Menu, Row, Col, Button, notification} from 'antd';
import {Route, withRouter, Link} from 'react-router-dom';
import TransitionGroup from 'react-transition-group/TransitionGroup';
import AqBreadCrumb from './components/AqBreadCrumb';
import {LoginModal} from './components/LoginModal'; 
import {AuthRoute} from './components/AuthRoute';
import {
    Dashboard, 
    QuantResearch, 
    StockResearch, 
    ScreenAdvices, 
    AdviceDetail, 
    CreateAdvice, 
    CreatePortfolio,
    PortfolioDetail,
    UpdateAdvice,
    PortfolioAddTransactions,
    InvestorDashboard,
    AdvisorProfile,
    AdvisorDashboard,
    ScreenAdvisors,
    TokenUpdate,
} from './containers'; 
import {AuthComponent} from './containers/AuthComponent';
import {HocExample} from './containers/HocExample';
import {Utils} from './utils';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const {Header, Content} = Layout;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {parentPath: '/'};
    }

    componentWillMount() {
        this.onRouteChanged(this.props.location.pathname);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            this.onRouteChanged(this.props.location.pathname);
        }
    }

    onRouteChanged = location => {
        const locationArray = location.split('/');
        const parentPath = locationArray.length > 0 ? locationArray[1] : '/';
        this.setState({parentPath});
    }

    handleNavMenuClick = e => {
        this.props.history.push(`/${e.key}`);
    }

    render() {
        return (
            <Layout style={{backgroundColor: '#f9f9f9'}}>
                <Header style={headerStyle}>
                    <Row type="flex">
                        <Col span={4}>
                            <Link to='/'>
                                <h1 style={headerColor}>AIMSQUANT</h1>
                            </Link>
                        </Col>
                        <Col span={20} style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Button onClick={() => {Utils.logoutUser(); this.props.history.push('/login')}}>Logout</Button>
                            <Menu 
                                    mode="horizontal"
                                    onClick={this.handleNavMenuClick}
                                    selectedKeys={[this.state.parentPath]}
                            >
                                <SubMenu title="Dashboard">
                                        <Menu.Item key="investordashboard">Investor Dashboard</Menu.Item>
                                        <Menu.Item key="advisordashboard">Advisor Dashboard</Menu.Item>
                                </SubMenu>
                                <Menu.Item key="advice">Screen Advices</Menu.Item>
                                <Menu.Item key="stockresearch">Stock Research</Menu.Item>
                                <Menu.Item key="quantresearch">Quant Research</Menu.Item>
                            </Menu>
                        </Col> 
                    </Row>
                </Header>

                <Layout style={contentLayoutStyle}>
                    <Content>
                        <Route exact={true} path='/advice' component={ScreenAdvices} />
                        <Route exact={true} path='/stockresearch' component={StockResearch} />
                        <Route exact={true} path='/login' component={LoginModal} />
                        <Route exact={true} path='/tokenUpdate' component={TokenUpdate}/>
                        <Route exact={true} path='/quantresearch' component={QuantResearch}/>
                        <Route exact={true} path='/advice/:id' component={AdviceDetail} />
                        <Route exact={true} path='/advisordashboard/createadvice' component={CreateAdvice} />
                        <Route exact={true} path='/investordashboard/createportfolio' component={CreatePortfolio} />
                        <Route exact={true} path='/advisordashboard/updateadvice/:id' component={UpdateAdvice} />
                        <Route exact={true} path='/investordashboard/portfolio/:id' component={PortfolioDetail} />
                        <Route exact={true} path='/investordashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} />
                        <Route exact={true} path='/investordashboard' component={InvestorDashboard} />
                        <Route exact={true} path='/advisorprofile/:id' component={AdvisorProfile} />
                        <Route exact={true} path='/advisordashboard' component={AdvisorDashboard} />
                        <Route exact={true} path='/screenadvisors' component={ScreenAdvisors} />
                    </Content>
                </Layout>
            </Layout>
        );
    }
}

export default withRouter(App);

const headerStyle = {
    background: '#fff',
    borderBottom: '1px solid #e1e1e1', 
    //boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
    //position: 'fixed',
    width: '100%',
    //zIndex: '1000'
    height:'64px'

};

const headerColor = {
    color: '#595959',
    fontSize: '20px'
};

const contentLayoutStyle = {
    //padding: '10px 0px 0px 0px',
    background: '#f9f9f9',
    //marginTop: '15px'
    width:'90%',
    margin:'0 auto'
};
