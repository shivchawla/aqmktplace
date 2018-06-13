import * as React from 'react';
import axios from 'axios';
import {Row, Col, Button, Modal, Input, Form, message} from 'antd';
import {Motion, spring} from 'react-motion';
import {Utils, fetchAjax} from '../utils';
import adviceLogo from '../assets/AdviceLogo.svg';
import portfolioLogo from '../assets/PortfolioLogo.svg';
import heroImage from '../assets/HeroImageSmall.svg';
import chevronRight from '../assets/chevron-right.svg';
import people from '../assets/people.svg';
import wheel from '../assets/wheel.svg';
import globe from '../assets/globe.svg';
import research from '../assets/research.svg';
import share from '../assets/share.svg';
import automate from '../assets/automate.svg';
import realtime from '../assets/realtime.svg';
import test from '../assets/test.svg';
import track from '../assets/track.svg';
import performance from '../assets/performance.svg';
import {Footer} from '../components/Footer';
import {HomeMeta} from '../metas';
import '../css/home.css';


const {requestUrl} = require('../localConfig');
const FormItem = Form.Item;
const {TextArea} = Input;

export class Home extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            selectedTabBar: 'advisor',
            loading: false
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
                    {/* <ButtonComponent 
                                onClick={() => this.props.history.push('/dashboard/createadvice')} 
                                text="Create an Advice" 
                    /> */}
                    <Button 
                        className="home-action-buttons"
                        onClick={() => this.props.history.push('/dashboard/createadvice')}>
                        Create Investment Advice
                    </Button>
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
                    header="Expand your Business"
                    content="While you focus primarily on improving your investment advices, we help you find the investors"/>
                
                <DetailListComponent 
                    key="2" 
                    icon={globe}
                    header="Barrier Less Investment Advisory"
                    content="The power of online to everyone. Now, you can sell your ideas to anyone, anywhere in the world"
                    style={{marginTop: '110px'}}/>
                <DetailListComponent
                    key="3"  
                    icon={wheel}
                    header="Superior Research Tools"
                    content="We provide you the tools to test your investment ideas, historical performance and ranking. You can also automate your investment advice."
                    style={{marginTop: '110px'}}/>
            </React.Fragment>
        );
    }

    renderInvestorMiddleLeftSection = () => {
        return (
            <div>
                <Col span={24}>
                    <h3 className='tab-content-text'>
                    Only careful and systematic approach towards stock market can generate returns. 
                    Meet advisors who meticulously research stock market to generate 
                    the best investment ideas, not just from India but from around the globe. 
                    </h3>
                </Col>
                <Col span={12}>
                    <img src={portfolioLogo} style={{transform: 'scale(0.8, 0.8)', marginLeft: '-40px'}}/>
                </Col>
                <Col span={12} className="tab-content-button-container">
                    {/* <ButtonComponent 
                            onClick={() => this.props.history.push('/advice')} 
                            text="Screen Advices" 
                    /> */}
                    <Button 
                        className="home-action-buttons"
                        onClick={() => this.props.history.push('/advice')} >
                        Find Investment Advices
                    </Button>
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
                    header="Best Investment Ideas"
                    content="With many advisors/advices on the platform, select the best advice that fits your needs."/>

                <DetailListComponent 
                    key="2" 
                    icon={test}
                    header="Power of Diversification"
                    content="Combine multiple advices in your portfolio and achieve greater diversification and better returns"
                    style={{marginTop: '110px'}}/>

                <DetailListComponent
                    key="3"  
                    icon={track}
                    header="Track Investment Portfolios"
                    content="Create multiple investment portfolios and track performance metrics like never before."
                    style={{marginTop: '110px'}}/>
            </React.Fragment>
        );
    }

    render() {
        return (
            <Col span={24} className='page-container'>
                <HomeMeta />
                <Row className="top-section">
                    <Col span={12} style={{paddingLeft: '40px'}}>
                        <Row>
                            <Col span={24}>
                                <h1 className="hero-text">Expert-Sourced<br></br>Investment Portfolio</h1>
                            </Col>
                            <Col span={24}>
                                <h5 className="hero-description-text">
                                    Best investment ideas.<br></br>Let the experts help you build the portfolio you desire.
                                </h5>
                            </Col>
                            
                            <Col span={24}>
                                <Button 
                                        className="signup-button"
                                        onClick={() => this.props.history.push('/advice')}
                                >
                                    Find Investment Advice
                                </Button>
                                <Button 
                                        style={{marginLeft: '20px'}}
                                        className="action-buttons"
                                        onClick={() => this.props.history.push('/dashboard/createadvice')}
                                >
                                    Create Investment Advice
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col span={12} className='hero-image'>
                        <object type="image/svg+xml" style={{marginLeft: '-20px'}} data={heroImage}></object>
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
                <Footer hello='sauravbiswas' header='Hello World' />
            </Col>
        );
    }
}

export default Form.create()(Home);

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
        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '-140px'}} onClick={props.onClick}>
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
            }}>
            <img 
                style={{transform: 'scale(1, 1)', marginTop: '10px', width: '70px', height: '70px', ...iconStyle}} 
                src={icon}/>
            <h3 style={{color: '#00A2A2', fontSize: '20px', marginTop: '5px'}}>{header}</h3>
            <h3 style={{fontSize: '16px', color: '#333333', marginTop: '15px'}}>{content}</h3>
        </div>
    );
};
