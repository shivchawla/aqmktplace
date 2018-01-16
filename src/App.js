import * as React from 'react';
import * as Radium from 'radium';
import {Layout, Menu, Breadcrumb, Icon, Row, Col} from 'antd';
import {Link, NavLink} from 'react-router-dom';
import {BrowserRouter as Router, Route, withRouter} from 'react-router-dom';
import {Dashboard, QuantResearch, StockResearch, ScreenAdvices} from './containers'; 
import {AqNavLink, AqBreadCrumb} from './components';
import logo from './logo.svg';

const {Header, Content, Sider, Footer} = Layout;
const {SubMenu} = Menu;

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            breadCrumbLocation: ''
        };
    }

    componentWillMount() {
        this.props.history.listen((location) => {
            this.setState({breadCrumbLocation: location.state.name});
        });
    }
    
    render() {
        const {breadCrumbLocation} = this.state;
        const pageTitle = breadCrumbLocation.trim().split('/')[breadCrumbLocation.length - 1];

        return (
            <Layout style={{backgroundColor: '#fff'}}>
                <Header style={headerStyle}>
                    <Row type="flex">
                        <Col span={4}>
                            <Link to={{
                                    pathname: '/',
                                    state: {
                                        name: 'Home'
                                    }
                                }}
                            >
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
                                <AqNavLink to='/dashboard' breadCrumbName='Dashboard' pathName='Dashboard'/>
                            </Menu.Item>
                            <Menu.Item key={2}>
                                <AqNavLink to='/screenadvices' breadCrumbName='Screen Advices' pathName='Screen Advices' />
                            </Menu.Item>
                            <Menu.Item key={3}>
                                <AqNavLink to='/stockresearch' breadCrumbName='Stock Research' pathName='Stock Research' />
                            </Menu.Item>
                            <Menu.Item key={4}>
                                <AqNavLink to='/quantresearch' breadCrumbName='Quant Research' pathName='Quant Research' />
                            </Menu.Item>
                        </Menu>
                        </Col> 
                    </Row>
                </Header>
                <Layout style={contentLayoutStyle}>
                    <h2 style={pageNameStyle}>{pageTitle}</h2>
                    <AqBreadCrumb path={this.state.breadCrumbLocation}/>
                    <Content>
                        <Route path='/dashboard' component={Dashboard} />
                        <Route path='/screenadvices' component={ScreenAdvices} />
                        <Route path='/stockresearch' component={StockResearch} />
                        <Route path='/quantresearch' component={QuantResearch} />
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

const pageNameStyle = {
    fontSize: '18px',
    color: '#595959'
};

const linkActiveStyle = {
    color: '#26899A',
    fontWeight: 600
}