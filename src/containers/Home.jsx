import * as React from 'react';
import {Row, Col, Button} from 'antd';
import {Motion, spring} from 'react-motion';
import {Utils} from '../utils';
import adviceLogo from '../assets/AdviceLogo.svg';
import portfolioLogo from '../assets/PortfolioLogo.svg';
import heroImage from '../assets/HeroImageSmall.svg';
import chevronRight from '../assets/chevron-right.svg';
import people from '../assets/people.svg';
import wheel from '../assets/wheel.svg';
import stack from '../assets/stack.svg';
import research from '../assets/research.svg';
import share from '../assets/share.svg';
import automate from '../assets/automate.svg';
import realtime from '../assets/realtime.svg';
import test from '../assets/test.svg';
import track from '../assets/track.svg';
import performance from '../assets/performance.svg';

import '../css/home.css';

export class Home extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            selectedTabBar: 'advisor'
        }
    }

    handleTabBarClick = type => {
        this.setState({selectedTabBar: type});
    }

    renderAdvisorMiddleLeftSection = () => {
        return (
            <div>
                <Col span={24}>
                    <h3 className='tab-content-text'>
                        While you spend time researching stock markets 
                        for best investment ideas, let us take care of the 
                        rest. Perfect platform for expert investment 
                        advisor, corporate advisory or a skillful stock 
                        picker looking to expand their business.
                    </h3>
                </Col>
                <Col span={12}>
                    <img src={adviceLogo} style={{transform: 'scale(0.8, 0.8)', marginLeft: '-40px'}}/>
                </Col>
                <Col span={12} className="tab-content-button-container">
                    {
                        Utils.isLoggedIn()
                        ?   <ButtonComponent 
                                    onClick={() => this.props.history.push('/advisordashboard/createadvice')} 
                                    text="Create an Advice" 
                            />
                        :   <ButtonComponent 
                                    onClick={() => this.props.history.push('/signup')} 
                                    text="Become an advisor" 
                            />
                    }
                </Col>
            </div>
        );
    }

    reenderAdvisorMiddleRightSection = () => {
        return (
            <React.Fragment>
                <DetailListComponent
                        key="1" 
                        icon={people}
                        header="Expand your advisory business"
                        content="You don’t have to reinvent the wheel. Focus on your great investment 
                        ideas. While you showcase your ideas, let us do the investor reachout."
                />
                <DetailListComponent 
                        key="2" 
                        icon={wheel}
                        header="Barrier less investment advisory"
                        content="You don’t have reinvent the wheel. Focus on your great investment 
                        ideas. While you showcase your ideas, let us do the investor reachout."
                        style={{marginTop: '110px'}}
                />
                <DetailListComponent
                        key="3"  
                        icon={stack}
                        header="Expand your clientele and no."
                        content="You don’t have reinvent the wheel. Focus on your great investment 
                        ideas. While you showcase your ideas, let us do the investor reachout."
                        style={{marginTop: '110px'}}
                />
            </React.Fragment>
        );
    }

    renderInvestorMiddleLeftSection = () => {
        return (
            <div>
                <Col span={24}>
                    <h3 className='tab-content-text'>
                    Only careful and systematic approach towards stock market can generate alpha. 
                    Meet advisors who meticulously research stock market to generate 
                    the best investment ideas, not just from India but from around the globe. 
                    </h3>
                </Col>
                <Col span={12}>
                    <img src={portfolioLogo} style={{transform: 'scale(0.8, 0.8)', marginLeft: '-40px'}}/>
                </Col>
                <Col span={12} className="tab-content-button-container">
                    <ButtonComponent 
                            onClick={() => this.props.history.push('/advice')} 
                            text="Screen Advices" 
                    />
                </Col>
            </div>
        );
    }

    renderInvestorMiddleRightSection = () => {
        return (
            <React.Fragment>
                <DetailListComponent
                        key="1" 
                        icon={performance}
                        header="Clear investment ideas"
                        content="Select Track the performance of an advice/advisor."
                />
                <DetailListComponent 
                        key="2" 
                        icon={test}
                        header="Test it before you believe it"
                        content="Integrate multiple advice in your portfolio from your subscribed advices."
                        style={{marginTop: '110px'}}
                />
                <DetailListComponent
                        key="3"  
                        icon={track}
                        header="Track investment portfolios"
                        content="Create multiple investment portfolios and track metrics like never before."
                        style={{marginTop: '110px'}}
                />
            </React.Fragment>
        );
    }

    render() {
        return (
            <Col span={24} className='page-container'>
                <Row className="top-section">
                    {/* <Col span={24}>
                        <h3 className="page-header">AimsQube</h3>
                    </Col> */}
                    <Col span={12}>
                        <Row>
                            <Col span={24}>
                                <h1 className="hero-text">Crowd-Sourced<br></br>Investment Portfolio</h1>
                            </Col>
                            <Col span={24}>
                                <h5 className="hero-description-text">
                                    Best investment ideas. Let the experts help you <br></br> build the portfolio your desire.
                                </h5>
                            </Col>
                            {
                                !Utils.isLoggedIn() &&
                                <Button 
                                        className="signup-button" 
                                        onClick={() => this.props.history.push('/signup')}
                                >SIGN UP</Button>
                            }
                        </Row>
                    </Col>
                    <Col span={12} className='hero-image'>
                        <img src={heroImage} />
                    </Col>
                </Row>
                <Row className="middle-section">
                    <Col span={10} className="middle-left-section">
                        <Col className='tab-bar'>
                            <TabBarElement 
                                    onClick={() => this.handleTabBarClick('advisor')} 
                                    text='Advisor' 
                                    isSelected={this.state.selectedTabBar === 'advisor' ? true : false} 
                            />
                            <TabBarElement 
                                    onClick={() => this.handleTabBarClick('investor')} 
                                    text='Investor' 
                                    isSelected={this.state.selectedTabBar === 'investor' ? true : false} 
                            />
                        </Col>
                        {
                            this.state.selectedTabBar === 'advisor' 
                            ? this.renderAdvisorMiddleLeftSection()
                            : this.renderInvestorMiddleLeftSection()
                        }
                    </Col>
                    <Col span={14} className="middle-right-section">
                        {
                            this.state.selectedTabBar === 'advisor'
                            ? this.reenderAdvisorMiddleRightSection()
                            : this.renderInvestorMiddleRightSection()
                        }
                    </Col>
                </Row>
                <Row className="lower-section">
                    <h3 className="lower-section-header">Other Features</h3>
                    <Col span={24} className="lower-section-card-container">
                        <FeatureCard 
                                key="1"
                                icon={research}
                                header="Quant Research"
                                content="Systematically research investment ideas"
                        />
                        <FeatureCard 
                                key="2"
                                icon={share}
                                header="Share"
                                content="Share your ideas with community"
                        />
                        <FeatureCard
                                key="3" 
                                icon={automate}
                                header="Automate"
                                content="Automate your investment process"
                        />
                        <FeatureCard
                                key="4" 
                                iconStyle={{transform: 'scale(0.9, 0.9)'}}
                                icon={realtime}
                                header="Realtime"
                                content="Get real-time data for latest updates"
                        />
                    </Col>
                </Row>
                <Row className="footer">
                    <h3 className="footer-header">AdviceQube</h3>
                    <Col span={4} className="footer-container">
                        <h5 className="footer-group-header">Products</h5>
                        <div className="footer-list">
                            <a className="footer-link" href="#">MarketPlace</a>
                            <a className="footer-link" href="https://www.aimsquant.com/">Research Platform</a>
                        </div>
                    </Col>
                    {/* <Col span={4} className="footer-container">
                        <h5 className="footer-group-header">Company</h5>
                        <div className="footer-list">
                            <a className="footer-link" href="#">Contact Us</a>
                            <a className="footer-link" href="#">Career</a>
                            <a className="footer-link" href="#">People</a>
                        </div>
                    </Col> */}
                    <Col span={4} className="footer-container">
                        <h5 className="footer-group-header">Policies</h5>
                        <div className="footer-list">
                            <a className="footer-link" href="/policy/policy">Terms of use</a>
                            <a className="footer-link" href="/policy/tnc">Privacy Policy</a>
                        </div>
                    </Col>
                    <Col span={4} className="footer-container">
                        <h5 className="footer-group-header">AimsQuant</h5>
                        <div className="footer-list">
                            <a className="footer-link" href="https://www.aimsquant.com/research/community">Community</a>
                            <a className="footer-link" href="https://www.aimsquant.com/research/strategy">Research</a>
                        </div>
                    </Col>
                </Row>
            </Col>
        );
    }
}

const TabBarElement = props => {
    const {text, isSelected} = props;
    const barColor = isSelected ? '#fff' : 'transparent';
    return (
        <div className="tab-bar-component" onClick={props.onClick}>
            <h3 className="tab-bar-text">{text}</h3>
            <div className="bar" style={{backgroundColor: barColor}}></div>
        </div>
    );
};

const ButtonComponent = props => {
    const {text} = props;

    return (
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}} onClick={props.onClick}>
            <span style={{color: '#fff', fontSize: '16px'}}>{text}</span>
            <img style={{marginLeft: '5px', marginTop: '2px'}} src={chevronRight} />
        </div>
    );
};

const DetailListComponent = props => {
    const {icon, header, content, style={}} = props;

    return (
        <Row style={style}>
            <Col span={2}>
                <img src={icon} />
            </Col>
            <Col span={19} >
                <h3 className="detail-list-component-header">{header}</h3>
                <h5 className="detail-list-component-content">{content}</h5>
            </Col>
        </Row>
    );
};

const FeatureCard = props => {
    const {icon, header, content, iconStyle} = props;

    return (
        <div 
                style={{
                    backgroundColor: '#fff',
                    display: 'flex', 
                    flexDirection: 'column', 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    width: '250px',
                    padding: '10px',
                    paddingBottom: '20px',
                    boxShadow: '0 4px 32px rgba(193, 193, 193, 0.5)',
                    borderRadius: '4px'
                }}
        >
            <img 
                    style={{transform: 'scale(1, 1)', marginTop: '10px', width: '70px', height: '70px', ...iconStyle}} 
                    src={icon} 
            />
            <h3 style={{color: '#3961FF', fontSize: '20px', marginTop: '5px'}}>{header}</h3>
            <h3 style={{fontSize: '16px', color: '#333333', marginTop: '15px'}}>{content}</h3>
        </div>
    );
};


