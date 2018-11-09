import * as React from 'react';
import Media from 'react-media';
import {Layout, Menu, Row, Col, Badge, Button, Icon} from 'antd';
import withRouter from 'react-router-dom/withRouter';
import {Utils} from '../utils';
import ContactUsModal from '../components/ContactUs';
import {primaryColor, verticalBox, horizontalBox} from '../constants';
import logo from "../assets/logo-advq-new.png";
import {Footer as AqFooter} from '../components/Footer';
import Loading from 'react-loading-bar';
import {loadingColor} from '../constants';

const SubMenu = Menu.SubMenu;
const MenuItemGroup = Menu.ItemGroup;
const {Header, Content, Footer} = Layout;


class AppLayout extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            parentPath: '/', 
            sideMenuOpen: true, 
            isLoggedIn: false,
            contactUsModalVisible: false
        };
    }

    componentWillMount() {
        this.onRouteChanged(this.props.location.pathname);
    }

    componentDidUpdate(prevProps) {
        if (this.props.location !== prevProps.location) { // Route changed
            this.onRouteChanged(this.props.location.pathname);
        }
    }

    handleNavMenuClick = e => {
        if (e.key === 'logout') {
            Utils.logoutUser();
            window.location.href = '/login';
            return;
        }
        window.location.href = (`/${e.key}`);
    }

    onRouteChanged = location => {
        const locationArray = location.split('/');
        locationArray.splice(0, 1);
        const parentPath = locationArray.length > 0 ? locationArray[0] : '/'; 
        this.setState({parentPath});
    }

    renderHeaderActionItemsDesktop = () => {
        return (
            <Col 
                    span={20}
                    style={{
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        height: '64px', 
                        paddingRight: '10px',
                    }}
            >   
                <Menu
                        style={{marginTop: '10px'}} 
                        mode="horizontal"
                        onClick={this.handleNavMenuClick}
                        selectedKeys={[this.state.parentPath]}
                        // selectedKeys={[this.state.parentPath, 'contest/leaderboard']}
                >
                    {/* <SubMenu 
                            key="contest"
                            title={
                                <div style={{...horizontalBox, color: '#595959'}}>
                                    Contest
                                    <div style={{marginTop: '-15px', fontSize: '10px', color:'red'}}>NEW</div>
                                </div>
                            }
                    >
                        <Menu.Item key="contest">Contest Home</Menu.Item>
                        <Menu.Item key="contest/leaderboard">Leaderboard</Menu.Item>
                        <Menu.Item key="contest/createentry">Create Entry</Menu.Item>
                    </SubMenu>                        */}
                    {/* <Menu.Item 
                            key="contest" 
                            style={{...horizontalBox, color: '#595959'}}
                    >
                        Contest
                        <div style={{marginTop: '-15px', fontSize: '10px', color:'red'}}>NEW</div>
                                
                    </Menu.Item> */}
                    {
                        <Menu.Item key="dailycontest">Daily Contest</Menu.Item>
                    }
                    {/* {
                        Utils.isLoggedIn() &&
                        <Menu.Item key="dailycontest/create">Create Entry</Menu.Item>
                    } */}

                    {/* <Menu.Item key="advice">Screen Advices</Menu.Item> */}
                    
                    {
                        Utils.isLoggedIn() &&
                        <Menu.Item key="stockresearch">Stock Research</Menu.Item>
                    }
                    {
                        !Utils.isLoggedIn() &&
                        <Menu.Item key="login">Login</Menu.Item>
                    }
                    {
                        !Utils.isLoggedIn() &&
                        <Menu.Item key="signup">Signup</Menu.Item>
                    }
                    {
                        Utils.isLoggedIn() &&
                        <Menu.Item key="logout">Logout</Menu.Item>
                    }
                </Menu>
                {/* <Button 
                        onClick={this.toggleContactUsModal} 
                        type="primary" 
                        style={{marginTop: '15px'}}
                >
                    Ask a Question
                </Button> */}
                <React.Fragment>
                    {/* <div style={{margin:'auto 20px auto 20px', height:'50%', borderRight:'1px solid grey'}}/> */}
                    {/* <Button 
                        type="primary" 
                        onClick={() => this.props.history.push('/contest')}
                        style={{marginTop: '18px'}}>
                        CONTEST
                    </Button>                                         */}
                </React.Fragment>
            </Col> 
        );
    }

    showHeaderAdviceLogo = parentPath => {
        const restrictedParentPaths = ['login', 'signup', 'forgotPassword', 'resetPassword'];
        if (restrictedParentPaths.indexOf(parentPath) === -1) {
            return true;
        }

        return false;
    }

    renderHeader = () => {
        return (
            <React.Fragment>
                {
                    this.showHeaderAdviceLogo(this.state.parentPath) &&
                    <Media 
                        query="(max-width: 599px)"
                        render={() => {
                            return (
                                <Header
                                    style={{
                                        backgroundColor: '#f9f9f9'
                                    }}
                                >
                                    <Col 
                                            span={24} 
                                            style={{
                                                display: 'flex', 
                                                flexDirection: 'row', 
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                    >
                                        <img src={logo} style={{height: '40px'}}/>
                                        <div onClick={() => this.props.history.push('/home')} 
                                            style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>
                                            <span style={{...biggerFont, color:primaryColor}}>A</span>
                                            <span style={{color: primaryColor}}>DVICE</span>
                                            <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                            <span style={{color: '#e06666'}}>UBE</span>
                                        </div>
                                    </Col>
                                </Header>
                            );
                        }}
                    />
                }
                <Media 
                    query="(min-width: 600px)"
                    render={() => {
                        return (
                            <Header style={headerStyle}>
                                <Row type="flex">
                                    <Col span={4} style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                        <img
                                            onClick={() => this.props.history.push('/home')}  
                                            src={logo} 
                                            style={{height: '40px', marginTop: '-10px', cursor: 'pointer'}}
                                        />
                                        <h1 onClick={() => this.props.history.push('/home')} 
                                            style={{...headerColor, cursor: 'pointer', marginLeft: '10px'}}>
                                            <span style={{...biggerFont, color:primaryColor}}>A</span>
                                            <span style={{color: primaryColor}}>DVICE</span>
                                            <span style={{...biggerFont, color: '#e06666'}}>Q</span>
                                            <span style={{color: '#e06666'}}>UBE</span>

                                        </h1>
                                    </Col>
                                    {this.renderHeaderActionItemsDesktop()}
                                </Row>
                            </Header>
                        );
                    }}
                />
            </React.Fragment>
        );
    } 

    renderFooterMobile = () => {
        return <AqFooter mobile={true}/>;
    }

    renderFooterDesktop = () => {
        return <AqFooter />;
    }

    renderFooter = () => {
        return  (
            <div>
                <Media 
                    query="(max-width: 1199px)"
                    render={() => this.renderFooterMobile()}
                />
                <Media 
                    query="(min-width: 1200px)"
                    render={() => this.renderFooterDesktop()}
                />
            </div>
        );
    }      

    toggleContactUsModal = () => {
        this.setState({contactUsModalVisible: !this.state.contactUsModalVisible});
    }

    render() {
        return (
            <React.Fragment>
                <Loading
                    show={this.props.loading}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                <ContactUsModal 
                    title='Ask a Question'
                    visible={this.state.contactUsModalVisible}
                    onClose={this.toggleContactUsModal}
                />
                {
                    !this.props.loading &&
                    <div style={{height:'100%'}}> 
                        
                        {!this.props.noHeader &&
                            this.renderHeader()
                        }
                        <Content>
                            {this.props.content}
                        </Content>
                        {
                            !this.props.noFooter &&
                            this.renderFooter()
                        }
                    </div>
                }
            </React.Fragment>
        );
    }
}

export default withRouter(AppLayout);

const headerStyle = {
    background: '#fff',
    borderBottom: '1px solid #e1e1e1', 
    // boxShadow: '0 3px 8px rgba(0,0,0,0.2)',
    width: '100%',
    height:'64px',
    padding:'0 0 0 30px'

};

const headerColor = {
    color: '#595959',
    fontSize: '16px'
};

const biggerFont = {
    fontSize: '24px',
    fontWeight: '400',
    //color: primaryColor
}

const contentLayoutStyle = {
    //padding: '10px 0px 0px 0px',
    //background: '#f9f9f9',
    //marginTop: '15px'
    width:'95%',
    margin:'0 auto',
    //height:'calc(100vh - 64px)'
    //minHeight: '640px',
    //overflow:'inherit'
    //overflowY:'scroll',
};
