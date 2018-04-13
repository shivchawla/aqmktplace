import * as React from 'react';
import {Layout, Menu, Row, Col} from 'antd';
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
    TokenUpdate
} from './containers'; 
import {AuthComponent} from './containers/AuthComponent';
import {HocExample} from './containers/HocExample';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const {Header, Content} = Layout;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pageTitle: 'Home'
        };
    }

    componentWillMount() {
        // listening to route change and updating local state
        this.props.history.listen((location) => { 
            if (location.state) {
                const {pageTitle = ''} = location.state;
                console.log(location.state);
                this.setState({pageTitle});
            }   
        });
    }

    render() {
        return (
            <Layout style={{backgroundColor: '#f9f9f9'}}>
                <Header style={headerStyle}>
                    <Row type="flex">
                        <Col span={4}>
                            <Link to='/' pageTitle='Home'>
                                <h1 style={headerColor}>AIMSQUANT</h1>
                            </Link>
                        </Col>
                        <Col span={20} style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <Menu 
                                mode="horizontal"
                                defaultSelectedKeys={['1']}>
                                <SubMenu title="Dashboard">
                                        <Menu.Item key={1}>
                                            <Link to='/investordashboard' pageTitle='Dashboard'>Investor Dashboard</Link>
                                        </Menu.Item>
                                        <Menu.Item key={1}>
                                            <Link to='/advisordashboard' pageTitle='Dashboard'>Advisor Dashboard</Link>
                                        </Menu.Item>
                                </SubMenu>
                                <Menu.Item key={2}>
                                    <Link to='/advice' pageTitle='Screen Advices'>Screen Advices</Link>
                                </Menu.Item>
                                <Menu.Item key={3}>
                                    <Link to='/stockresearch' pageTitle='Stock Research' >Stock Research</Link>
                                </Menu.Item>
                                <Menu.Item key={4}>
                                    <Link to='/quantresearch' pageTitle='Quant Research' >Quant Research</Link>
                                </Menu.Item>
                            </Menu>
                        </Col> 
                    </Row>
                </Header>

                <Layout style={contentLayoutStyle}>
                    <Content>
                        {/* <Route exact={true} path='/dashboard' component={Dashboard} /> */}
                        <Route exact={true} path='/advice' component={ScreenAdvices} />
                        <Route exact={true} path='/stockresearch' component={StockResearch} />
                        <Route exact={true} path='/login' component={LoginModal} />
                        <Route path='/tokenUpdate' component={TokenUpdate}/>
                        {/* <Route exact={true} path='/quantresearch' component={QuantResearch} /> */}
                        <Route exact={true} path='/quantresearch' component={QuantResearch}/>
                        <Route exact={true} path='/advice/:id' component={AdviceDetail} />
                        <Route exact={true} path='/dashboard/createadvice' component={CreateAdvice} />
                        <Route exact={true} path='/dashboard/createportfolio' component={CreatePortfolio} />
                        <Route exact={true} path='/dashboard/updateadvice/:id' component={UpdateAdvice} />
                        <Route exact={true} path='/dashboard/portfolio/:id' component={PortfolioDetail} />
                        <Route exact={true} path='/dashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} />
                        <Route exact={true} path='/investordashboard' component={InvestorDashboard} />
                        <Route exact={true} path='/advisorprofile/:id' component={AdvisorProfile} />
                        <Route exact={true} path='/advisordashboard' component={AdvisorDashboard} />
                        <Route exact={true} path='/screenadvisors' component={ScreenAdvisors} />
                        <Route exact={true} path='/hoc' component={HocExample} />
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
