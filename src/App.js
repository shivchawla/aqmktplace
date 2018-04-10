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
    ScreenAdvisors
} from './containers'; 
import {AuthComponent} from './containers/AuthComponent';
import {HocExample} from './containers/HocExample';

const {Header, Content} = Layout;
const firstChild = props => {
    const childrenArray = React.Children.toArray(props.children);
    return childrenArray[0] || null;
};

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
            <Layout style={{backgroundColor: '#fff'}}>
                <Header style={headerStyle}>
                    <Row type="flex">
                        <Col span={4}>
                            <Link to='/' pageTitle='Home'>
                                <h1 style={headerColor}>AIMSQUANT</h1>
                            </Link>
                        </Col>
                        <Col span={10} offset={10}>
                            <Menu 
                                mode="horizontal"
                                defaultSelectedKeys={['1']}
                                style={{lineHeight: '64px'}}
                            >
                                <Menu.Item key={1}>
                                    <Link to='/dashboard' pageTitle='Dashboard'>Dashboard</Link>
                                </Menu.Item>
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
                    <h1 style={pageTitleStyle}>{this.state.pageTitle}</h1>
                    {/* <AqBreadCrumb /> */}
                    <Content>
                        <Route exact={true} path='/dashboard' component={Dashboard} />
                        <Route exact={true} path='/advice' component={ScreenAdvices} />
                        <Route exact={true} path='/stockresearch' component={StockResearch} />
                        <Route exact={true} path='/login' component={LoginModal} />
                        {/* <Route exact={true} path='/quantresearch' component={QuantResearch} /> */}
                        <AuthRoute path='/quantresearch' component={QuantResearch}/>
                        <AuthRoute path='/advice/:id' component={AdviceDetail} />
                        <AuthRoute path='/dashboard/createadvice' component={CreateAdvice} />
                        <AuthRoute path='/dashboard/createportfolio' component={CreatePortfolio} />
                        <AuthRoute path='/dashboard/updateadvice/:id' component={UpdateAdvice} />
                        <AuthRoute path='/dashboard/portfolio/:id' component={PortfolioDetail} />
                        <AuthRoute path='/dashboard/portfolio/transactions/:id' component={PortfolioAddTransactions} />
                        <AuthRoute path='/investordashboard' component={InvestorDashboard} />
                        <AuthRoute path='/advisorprofile/:id' component={AdvisorProfile} />
                        <AuthRoute path='/advisordashboard' component={AdvisorDashboard} />
                        <AuthRoute path='/screenadvisors' component={ScreenAdvisors} />
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
    boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
    overflow: 'hidden'
};

const headerColor = {
    color: '#595959',
    fontSize: '20px'
};

const contentLayoutStyle = {
    padding: '0 50px',
    background: '#fff',
    marginTop: '25px'
};

const pageTitleStyle = {
    fontSize: '18px',
    color: '#595959'
};
