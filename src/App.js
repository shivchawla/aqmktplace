import * as React from 'react';
import {Layout, Menu, Row, Col} from 'antd';
import {Route, withRouter} from 'react-router-dom';
import {Dashboard, QuantResearch, StockResearch, ScreenAdvices, AdviceDetail, CreateAdvice, CreatePortfolio} from './containers'; 
import AqBreadCrumb from './components/AqBreadCrumb';
import {AqNavLink, AqLink} from './components';

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
            const {pageTitle = ''} = location.state;
            this.setState({pageTitle});
        });
    }

    render() {
        return (
            <Layout style={{backgroundColor: '#fff'}}>
                <Header style={headerStyle}>
                    <Row type="flex">
                        <Col span={4}>
                            <AqLink to='/' pageTitle='Home'>
                                <h1 style={headerColor}>AIMSQUANT</h1>
                            </AqLink>
                        </Col>
                        <Col span={10} offset={10}>
                            <Menu 
                                mode="horizontal"
                                defaultSelectedKeys={['1']}
                                style={{lineHeight: '64px'}}
                            >
                            <Menu.Item key={1}>
                                <AqNavLink to='/dashboard' pageTitle='Dashboard' />
                            </Menu.Item>
                            <Menu.Item key={2}>
                                <AqNavLink to='/advice' pageTitle='Screen Advices' />
                            </Menu.Item>
                            <Menu.Item key={3}>
                                <AqNavLink to='/stockresearch' pageTitle='Stock Research' />
                            </Menu.Item>
                            <Menu.Item key={4}>
                                <AqNavLink to='/quantresearch' pageTitle='Quant Research' />
                            </Menu.Item>
                        </Menu>
                        </Col> 
                    </Row>
                </Header>
                <Layout style={contentLayoutStyle}>
                    <h1 style={pageTitleStyle}>{this.state.pageTitle}</h1>
                    <AqBreadCrumb />
                    <Content>
                        <Route exact={true} path='/dashboard' component={Dashboard} />
                        <Route exact={true} path='/advice' component={ScreenAdvices} />
                        <Route exact={true} path='/stockresearch' component={StockResearch} />
                        <Route exact={true} path='/quantresearch' component={QuantResearch} />
                        <Route exact={true} path='/advice/:id' component={AdviceDetail} />
                        <Route exact={true} path='/dashboard/createadvice' component={CreateAdvice} />
                        <Route exact={true} path='/dashboard/createportfolio' component={CreatePortfolio} />
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
