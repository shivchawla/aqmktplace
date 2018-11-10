import * as React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import Media from 'react-media';
import YouTube from 'react-youtube';
import pulse from 'react-animations/lib/pulse';
import Radium, {StyleRoot} from 'radium';
import Modal from 'react-responsive-modal';
import {Row, Col, Button, Form, Icon} from 'antd';
import {Footer} from '../components/Footer';
import {AqMobileLayout} from './AqMobileLayout/Layout';
import ContactUsModal from '../components/ContactUs';
import adviceLogo from '../assets/AdviceLogo.svg';
import adviceLogoMobile from '../assets/AdviceLogoMobile.svg';
import portfolioLogoMobile from '../assets/PortfolioLogo.svg';
import portfolioLogo from '../assets/PortfolioLogo.svg';
import heroImage from '../assets/funnel.svg';
import heroImageMobile from '../assets/funnel-mobile.svg';
import people from '../assets/people.svg';
import wheel from '../assets/wheel.svg';
import globe from '../assets/globe.svg'
import research from '../assets/research.svg';
import share from '../assets/share.svg';
import automate from '../assets/automate.svg';
import realtime from '../assets/realtime.svg';
import test from '../assets/test.svg';
import track from '../assets/track.svg';
import performance from '../assets/performance.svg';
import EnterContest from '../assets/EnterContest2-Home.svg';
import WinPrizes from '../assets/WinPrizes-Home.svg';
import ExpertIdea from '../assets/ExpertIdea-Home.svg';
import {HomeMeta} from '../metas';
import '../css/home.css';
import AppLayout from './AppLayout'
import { verticalBox, horizontalBox} from '../constants';

const {youtubeVideoId} = require('../localConfig');

export class Home extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            selectedTabBar: 'advisor',
            loading: true,
            youtubeModalVisible: false,
            contactUsModalvisible: false
        };
        this.howItWorks = null;
    }

    componentDidMount = () => {
        this.setState({loading: false});
    }
 
    handleTabBarClick = type => {
        this.setState({selectedTabBar: type});
    }

    renderAdvisorMiddleLeftSectionDesktop = () => {
        return (
            <div>
                <Col span={24}>
                    <h2 style={{color:'white', fontWeight:300}}>
                        Combining Winner Ideas
                    </h2>

                    <h3 className='tab-content-text'>
                        Compete to showcase your Investment Ideas on the platform.
                        Participate in our Investment Idea contest, win prizes and allocation in Expert Portfolio.
                    </h3>
                    {/*<h3 className='tab-content-text' style={{lineHeight: '26px', paddingRight: '10px'}}>
                        Perfect platform for investment experts and skillful stock pickers
                    </h3>*/}

                </Col>
                <Col span={12}>
                    <img src={adviceLogo} style={{transform: 'scale(0.8, 0.8)', marginLeft: '-40px'}}/>
                </Col>
                <Col span={12} className="tab-content-button-container">
                    <Button 
                        className="home-action-buttons"
                        onClick={() => this.props.history.push('/dailycontest/home')}>
                        ENTER CONTEST
                    </Button>
                </Col>
            </div>
        );
    }

    renderAdvisorMiddleLeftSectionMobile = () => {
        return (
            <React.Fragment>
                <Col span={24}>
                    <h2 style={{color:'white', fontWeight:300}}>
                        Combining Winner Ideas
                    </h2>

                    <h3 className='tab-content-text' style={{lineHeight: '26px', paddingRight: '10px'}}>
                        Compete to showcase your Investment Ideas on the platform.
                        Participate in our Investment Idea contest, win prizes and allocation in Expert Portfolio.
                    </h3>

                    {/*<h3 className='tab-content-text' style={{lineHeight: '26px', paddingRight: '10px'}}>
                        Perfect platform for investment experts and skillful stock pickers
                    </h3>*/}
                </Col>
                <Col 
                        span={6} 
                        style={{
                            marginLeft: '-10px', 
                            height: '140px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            marginRight: '5px'
                        }}
                >
                    <img src={adviceLogoMobile} style={{transform: 'scale(1.2, 1.2)'}}/>
                </Col>
                <Col 
                        span={17} 
                        style={{
                            height: '140px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginRight: '10px'
                        }}
                >
                    <Button 
                        className="home-action-buttons"
                        onClick={() => this.props.history.push('/dailycontest/home')}>
                        ENTER CONTEST
                    </Button>
                </Col>
            </React.Fragment>
        );
    }

    renderAdvisorMiddleRightSectionDesktop = (type='big') => {
        return (
            <React.Fragment>
                <DetailListComponent
                    key="1" 
                    icon={people}
                    small={type === 'small' ? true : false}
                    header="Marketplace for everyone"
                    content="While you focus primarily on improving your investment ideas, we will allocate fund to your ideas"/>
                
                <DetailListComponent 
                    key="2" 
                    icon={globe}
                    small={type === 'small' ? true : false}
                    header="Barrier Free"
                    content="The power of online to everyone. Now, anyone can create and lease their winner ideas from anywhere in the world"
                    style={{marginTop: type === 'small' ? '40px' : '110px'}}/>  

                <DetailListComponent
                    key="3"  
                    icon={wheel}
                    small={type === 'small' ? true : false}
                    header="Superior Research Tools"
                    content="We provide you the tools to test your investment ideas, historical performance and ranking."
                    style={{marginTop: type === 'small' ? '40px' : '110px'}}/>

            </React.Fragment>
        );
    }

    renderInvestorMiddleLeftSectionDesktop = () => {
        return (
            <div>
                <Col span={24}>
                    <h3 className='tab-content-text'>
                    Only careful and systematic approach towards stock market can generate consistent alpha. 
                    Find winner Investment Ideas from experts, not just from India but from around the globe. 
                    </h3>
                </Col>
                <Col span={12}>
                    <img src={portfolioLogo} style={{transform: 'scale(0.8, 0.8)', marginLeft: '-40px'}}/>
                </Col>
                <Col span={12} className="tab-content-button-container">
                    <Button 
                            className="home-action-buttons"
                            // onClick={() => this.props.history.push('/advice')} s
                    >
                        HOW IT WORKS
                    </Button>
                </Col>
            </div>
        );
    }

    renderInvestorMiddleLeftSectionMobile = () => {
        return (
            <React.Fragment>
                <Col span={24}>
                    <h3 className='tab-content-text' style={{lineHeight: '26px', paddingRight: '10px'}}>
                    Only careful and systematic approach towards stock market can generate returns. 
                    Meet advisors who meticulously research stock market to generate 
                    the best investment ideas, not just from India but from around the globe. 
                    </h3>
                </Col>
                <Col 
                        span={6} 
                        style={{
                            marginLeft: '-10px', 
                            height: '140px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            marginRight: '5px'
                        }}
                >
                    <Media 
                        query="(max-width: 600px)"
                        render={() => (
                            <img src={portfolioLogoMobile} style={{transform: 'scale(1.2, 1.2)'}} />
                        )}
                    />
                    <Media 
                        query="(min-width: 601px)"
                        render={() => (
                            <img src={portfolioLogoMobile} style={{height: '160px'}} />
                        )}
                    />
                </Col>
                <Col 
                        span={17} 
                        style={{
                            height: '140px', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'center',
                            alignItems: 'flex-end',
                            marginRight: '10px'
                        }}
                >
                    <Button 
                        className="home-action-buttons"
                        onClick={() => this.props.history.push('/advice')} >
                        FIND INVESTMENT IDEAS
                    </Button>
                </Col>
            </React.Fragment>
        );
    }

    renderInvestorMiddleRightSectionDesktop = (type='big') => {
        return (
            <React.Fragment>
                <DetailListComponent
                    key="1" 
                    icon={performance}
                    small={type === 'small' ? true : false}
                    header="Best Investment Ideas"
                    content="With many winner ideas on the platform, select the best that fits your needs."/>

                <DetailListComponent 
                    key="2" 
                    icon={test}
                    small={type === 'small' ? true : false}
                    header="Power of Diversification"
                    content="Combine multiple advices in your portfolio and achieve greater diversification and better returns"
                    style={{marginTop: type === 'small' ? '40px' : '110px'}}/>

                <DetailListComponent
                    key="3"  
                    icon={track}
                    small={type === 'small' ? true : false}
                    header="Track Investment Portfolios"
                    content="Create multiple investment portfolios and track performance metrics like never before."
                    style={{marginTop: type === 'small' ? '40px' : '110px'}}/>
            </React.Fragment>
        );
    }

    onYoutubePlayerReady = event => {
        event.target.pauseVideo();
    }

    toggleVideoPlayer = () => {
        this.setState({youtubeModalVisible: !this.state.youtubeModalVisible});
    }

    renderVidePlayerModalDesktop = () => {
        const youtubeOptions = {
            height: '500',
            width: '900',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
                rel: 0
            }
        };

        return (
            <Modal
                open={this.state.youtubeModalVisible}
                onClose={this.toggleVideoPlayer}
                center
                showCloseIcon={false}
                animationDuration={500}
                closeOnOverlayClick
                closeOnEsc
                classNames={{ overlay: 'custom-overlay', modal: 'custom-modal' }}
            >
                <Row>
                    <Col span={24}>
                        <YouTube
                            className="youtube-player"
                            videoId={youtubeVideoId}
                            opts={youtubeOptions}
                            onReady={this._onReady}
                        />
                    </Col>
                </Row>
            </Modal>
        );
    }

    renderVideoPlayerModalMobile = (type='mobile') => {
        const youtubeOptionsMobile = {
            height: '300',
            width: '300',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
                rel: 0
            }
        };

        const youtubeOptionsTablet = {
            height: '400',
            width: '600',
            playerVars: { // https://developers.google.com/youtube/player_parameters
                autoplay: 1,
                rel:0
            }
        };

        return (
            <Modal
                open={this.state.youtubeModalVisible}
                onClose={this.toggleVideoPlayer}
                showCloseIcon={false}
                animationDuration={500}
                closeOnOverlayClick
                closeOnEsc
                classNames={{ overlay: 'custom-overlay', modal: 'custom-modal' }}
            >
                <Row>
                    <Col span={24} style={{left: type === 'mobile' ? '28%' : '19%'}}>
                        <YouTube
                            className="youtube-player-mobile"
                            videoId={youtubeVideoId}
                            opts={type === 'mobile' ? youtubeOptionsMobile : youtubeOptionsTablet}
                            onReady={this._onReady}
                        />
                    </Col>
                </Row>
            </Modal>
        );
    }

    renderTopLeftSectionDesktop = () => {
        return (
            <Col 
                    span={12} 
                    style={{
                        paddingLeft: '40px',
                        height: '100%'
                    }}
            >
                <Row style={{height: '100%'}}>
                    <Col span={24}>
                        <h1 className="hero-text">Crowd-Sourced<br></br>Investment Portfolio</h1>
                    </Col>
                    <Col span={24}>
                        <h5 style={{fontWeight:400}} className="hero-description-text">
                            <i>Best Investment Ideas</i><br></br>Let the experts help you build the portfolio you desire
                        </h5>
                    </Col>
                    {this.renderActionButtonsDesktop()}
                </Row>
            </Col>
        );
    }

    renderTopLeftSectionMobile = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Col span={24}>
                            <Row style={{padding: '10px 20px', paddingBottom: '0px'}}>
                                <Col span={24}>
                                    <h1 
                                            className="hero-text-mobile" 
                                            style={{
                                                lineHeight: '30px', 
                                                textAlign: 'center', 
                                                fontWeight: 700, 
                                                fontSize: '24px'
                                            }}
                                    >
                                        Crowd-Sourced <br></br> Investment Portfolio
                                    </h1>
                                </Col>
                                <Col span={24}>
                                    <h5 
                                            className="hero-description-text-mobile" 
                                            style={{textAlign: 'center'}}
                                    >
                                        Let the experts help you build the portfolio you desire
                                    </h5>
                                </Col>
                            </Row>
                        </Col>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <Col span={24}>
                            <Row style={{padding: '10px 20px', paddingBottom: '0px'}}>
                                <Col span={24}>
                                    <h1 
                                            className="hero-text-mobile" 
                                            style={{
                                                lineHeight: '30px', 
                                                textAlign: 'center', 
                                                fontWeight: 700, 
                                                fontSize: '32px',
                                                marginTop: '70px'
                                            }}
                                    >
                                        Expert-Sourced Investment Portfolio
                                    </h1>
                                </Col>
                                <Col span={24}>
                                    <h5 
                                            className="hero-description-text-mobile" 
                                            style={{
                                                textAlign: 'center', 
                                                fontSize: '18px'
                                            }}
                                    >
                                        Let the experts help you build the portfolio you desire
                                    </h5>
                                </Col>
                            </Row>
                        </Col>
                    )}
                />
            </React.Fragment>
        );
    }

    toggleContactUsModal = () => {
        this.setState({contactUsModalVisible: !this.state.contactUsModalVisible});
    }

    renderActionButtonsDesktop = () => {
        return (
            <Col 
                    span={24} 
                    style={{
                        position: 'absolute',
                        bottom: '15%'
                    }}
            >
                <Row>
                    <Col span={24}>
                        <Button 
                                className="signup-button"
                                onClick={() => this.props.history.push('/dailycontest/home')}
                        >
                            ENTER CONTEST
                        </Button>
                        <Button 
                                style={{marginLeft: '20px', border: '2px solid #fff'}}
                                className="action-buttons"
                                onClick={() => {
                                    const domNode = ReactDOM.findDOMNode(this.howItWorks);
                                    if (domNode) {
                                        domNode.scrollIntoView();
                                    }
                                }}
                        >
                            HOW IT WORKS
                        </Button>
                    </Col>
                </Row>
            </Col>
        );
    }

    renderActionButtonsMobile = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Col span={24} style={{...verticalBox, marginTop: '40px'}}>
                            <div 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        width: '80%'
                                    }}
                            >
                                <Button 
                                        className="signup-button-mobile"
                                        style={{marginTop: 0}}
                                        onClick={() => this.props.history.push('/dailycontest/home')}
                                >
                                    ENTER CONTEST
                                </Button>
                                <Button 
                                        className="create-advice-button-mobile"
                                        onClick={() => {
                                            const domNode = ReactDOM.findDOMNode(this.howItWorks);
                                            if (domNode) {
                                                domNode.scrollIntoView();
                                            }
                                        }}
                                >
                                    HOW IT WORKS
                                </Button>
                            </div>
                            <span 
                                    style={{
                                        marginTop: '30px',
                                        cursor: 'pointer',
                                        fontSize: '16px',
                                        color: '#fff'
                                    }}
                                    onClick={this.toggleContactUsModal}
                            >
                                Ask a Question
                            </span>
                        </Col>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <Col 
                                span={24} 
                                style={{
                                        display: 'flex', 
                                        flexDirection: 'row', 
                                        alignItems: 'center', 
                                        justifyContent: 'space-between',
                                        padding: '0 20px'
                                    }}
                                >
                            <Button 
                                    className="signup-button-mobile"
                                    style={{marginTop: 0}}
                                    onClick={() => this.props.history.push('/dailycontest/home')}
                            >
                                ENTER CONTEST
                            </Button>
                            <div style={{width: '40px'}}></div>
                            <Button 
                                    className="create-advice-button-mobile"
                                    style={{marginTop: 0}}
                                    onClick={() => this.props.history.push('/advice')}
                            >
                                FIND INVESTMENT IDEAS
                            </Button>
                        </Col>
                    )}
                />
            </React.Fragment>
        );
    }

    renderTopHeroImageDesktop = () => {
        return (
            <Col 
                    span={12} 
                    className='hero-image' 
                    style={{
                        height: '100%',
                        display: 'flex',
                        display: 'flex',
                        justifyContent: 'center'
                    }}
            >
                <object style={{width: '50%'}} type="image/svg+xml" data={heroImage}></object>
            </Col>
        );
    }

    renderTopHeroImageMobile = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Col 
                                span={24} 
                                style={{
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    marginTop: '20px'
                                }} 
                                className='hero-image-mobile'
                        >
                            <object style={{width: '48%'}} type="image/svg+xml" data={heroImageMobile}></object>
                        </Col>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <Col 
                                span={24} 
                                style={{
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center', 
                                    height: '400px',
                                    marginTop: '20px'
                                }} 
                                className='hero-image-mobile'
                        >
                            <object 
                                    style={{width: '48%', height: '400px'}} 
                                    type="image/svg+xml" 
                                    data={heroImageMobile}
                            ></object>
                        </Col>
                    )}
                />
            </React.Fragment>
        );
    }

    renderPlayVideoButtonDesktop = () => {
        return (
            <StyleRoot>
                <Col 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            bottom: '25%',
                            position: 'absolute'
                        }} 
                        span={24}
                >
                    <div style={styles.bounce}>
                        <Icon 
                                className='play-icon animated infinite bounce' 
                                type="play-circle-o" 
                                onClick={this.toggleVideoPlayer}
                        />
                    </div>
                    <span 
                            style={{marginTop: '5px', fontWeight: 400, color: '#444', fontSize: '14px'}}
                    >
                        Play Video
                    </span>
                </Col>
            </StyleRoot>
        );
    }

    renderPlayVideoButtonMobile = () => {
        return (
            <StyleRoot>
                <Col 
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            marginTop: '30px'
                        }} 
                        span={24}
                >
                    <div style={styles.bounce}>
                        <Icon 
                                className='play-icon animated infinite bounce' 
                                type="play-circle-o"
                                onClick={this.toggleVideoPlayer}
                        />
                    </div>
                </Col>
            </StyleRoot>
        );
    }

    renderMiddleSectionDesktop = () => {
        return (
            <React.Fragment>
                <h3 style={{textAlign: 'center', fontSize:'24px', color: 'teal', marginBottom:'50px'}}>Crowd-Sourced Investment Portfolio</h3>
                <Col span={10} className="middle-left-section">
                    {
                        this.state.selectedTabBar === 'advisor' 
                        ? this.renderAdvisorMiddleLeftSectionDesktop()
                        : this.renderInvestorMiddleLeftSectionDesktop()
                    }
                </Col>
                <Col span={14} className="middle-right-section">
                    {
                        this.state.selectedTabBar === 'advisor'
                        ? this.renderAdvisorMiddleRightSectionDesktop()
                        : this.renderInvestorMiddleRightSectionDesktop()
                    }
                </Col>
            </React.Fragment>
        );
    }

    renderMiddleSectionMobile = () => {
        return (
            <React.Fragment>
                <h3 style={{textAlign: 'center', fontSize:'20px', color: 'teal', marginBottom:'30px'}}>Crowd-Sourced Investment Portfolio</h3>
                <Col span={24} className="middle-left-section">
                    <Col className='tab-bar'>
                        {/*<TabBarElement 
                                onClick={() => this.handleTabBarClick('advisor')} 
                                text='Expert' 
                                isSelected={this.state.selectedTabBar === 'advisor' ? true : false} 
                        />
                        <TabBarElement 
                                onClick={() => this.handleTabBarClick('investor')} 
                                text='Investor' 
                                isSelected={this.state.selectedTabBar === 'investor' ? true : false} 
                        />*/}
                    </Col>
                    {
                        this.state.selectedTabBar === 'advisor' 
                        ? this.renderAdvisorMiddleLeftSectionMobile()
                        : this.renderInvestorMiddleLeftSectionMobile()
                    }
                </Col>
                <Col 
                        span={24} 
                        style={{backgroundColor: '#fff', padding: '20px', paddingTop: '30px'}} 
                        className="middle-right-section"
                >
                    {
                        this.state.selectedTabBar === 'advisor'
                        ? this.renderAdvisorMiddleRightSectionDesktop('small')
                        : this.renderInvestorMiddleRightSectionDesktop('small')
                    }
                </Col>
            </React.Fragment>
        );
    }

    renderLowerSectionDesktop = () => {
        return (
            <React.Fragment>
                <h3 
                        className="lower-section-header"
                        style={{
                            width: '100%',
                            top: '20%',
                            textAlign: 'center',
                            position: 'absolute'
                        }}
                >
                    HOW IT WORKS?
                </h3>
                <Row type="flex" className="lower-section-card-container" style={{marginTop: '20px'}}>
                    <Col span={8} style={{display: 'flex', justifyContent: 'center'}}>
                        <StepsCard 
                            step={1}
                            header='Enter Contest'
                            headerText='Create a diversified portfolio to beat the market.'
                            color='#EBD53B'
                        />
                    </Col>
                    <Col span={8} style={{display: 'flex', justifyContent: 'center'}}>
                        <StepsCard 
                            step={2}
                            header='Win cash prizes'
                            headerText='Beat the market benchmark 
                            and win cash prizes every 
                            week worth Rs.10,000
                            '
                            color='#86F0E1'
                        />
                    </Col>
                    <Col span={8} style={{display: 'flex', justifyContent: 'center'}}>
                        <StepsCard 
                            step={3}
                            header='Expert Portfolio 
                            Allocation'
                            headerText='Winners contribute to the 
                            “Expert Portfolio” and earn 
                            royalty'
                            color='#9FD0FF'
                        />
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

    renderLowerSectionMobile = () => {
        return (
            <React.Fragment>
                <h3 className="lower-section-header" style={{marginTop: '50px'}}>HOW IT WORKS?</h3>
                <Row  
                        type="flex" 
                        className="lower-section-card-container"
                >
                    <Col span={24} style={{textAlign:'center'}}>
                        <StepsCard 
                            step={1}
                            header='Enter Contest'
                            headerText='Create a diversified portfolio to beat the market.'
                            color='#EBD53B'
                        />
                    </Col>

                    <Col span={24} style={{textAlign: 'center'}} style={{marginTop: '20px'}}>
                        <StepsCard 
                            step={2}
                            header='Win cash prizes'
                            headerText='Beat the market benchmark 
                            and win cash prizes every 
                            week worth Rs.10,000
                            '
                            color='#86F0E1'
                        />
                    </Col>

                    <Col span={24} style={{textAlign: 'center'}} style={{marginTop: '20px'}}>
                        <StepsCard 
                            step={3}
                            header='Expert Portfolio 
                            Allocation'
                            headerText='Winners contribute to the 
                            “Expert Portfolio” and earn 
                            royalty'
                            color='#9FD0FF'
                        />
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

    renderMobile = () => {
        return (
            <AqMobileLayout 
                    theme='transparent'
                    headerType='transparent'
                    loading={this.state.loading}
                    navbarStyle={{
                        backgroundColor: 'transparent',
                        border: 'none'
                    }}
            >
                <Media 
                    query="(max-width: 600px)"
                    render={() => this.renderVideoPlayerModalMobile()}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => this.renderVideoPlayerModalMobile('tablet')}
                />
                <Col 
                        span={24} 
                        style={{
                            ...verticalBox,
                            marginTop: '-45px',
                            // paddingTop: '45px'
                        }}
                >
                    <TopSectionMobile>
                        {this.renderTopLeftSectionMobile()}
                        {this.renderTopHeroImageMobile()}
                        {this.renderActionButtonsMobile()}
                    </TopSectionMobile>
                    <Row 
                            className="lower-section" 
                            style={{marginTop: '30px', height:'120vh', minHeight: '600px'}}
                            ref={el => this.howItWorks = el}
                    >
                        {this.renderLowerSectionMobile()}
                    </Row>
                    <Row 
                            className="middle-section" 
                            style={{
                                marginTop: '50px'
                                }}
                    >
                        {this.renderMiddleSectionMobile()}
                    </Row>
                    <Row>
                        <Footer mobile={true} />
                    </Row>
                </Col>
            </AqMobileLayout>
        );
    }

    renderDesktop = () => {
        return (
            <AppLayout 
                headerType='transparent'
                loading={this.state.loading}
                content={
                    <React.Fragment>
                        {this.renderVidePlayerModalDesktop()}
                        <Col span={24} className='page-container'>
                            <Row className="top-section" style={{width: '100%'}}>
                                <React.Fragment>
                                    {this.renderTopLeftSectionDesktop()}
                                    {this.renderTopHeroImageDesktop()}
                                </React.Fragment>
                            </Row>
                            <Row 
                                    ref={el => this.howItWorks = el}
                                    className="lower-section" 
                                    style={{
                                        marginTop: 0,
                                        height:'100vh', 
                                        minHeight: '600px',
                                        backgroundColor: '#F8F6FF',
                                        paddingTop: '60px',
                                        height: '100vh',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center'
                                    }}
                            >
                                {this.renderLowerSectionDesktop()}
                            </Row>
                            <Row className="middle-section" style={{marginTop: '50px'}}>
                                {this.renderMiddleSectionDesktop()}
                            </Row>
                        </Col>
                    </React.Fragment>
                }
            />
        );
    }

    render() {
        return (
            <StyleRoot>
                <Media 
                    query="(max-width: 1199px)"
                    render={() => this.renderMobile()}
                />
                <Media 
                    query="(min-width: 1200px)"
                    render={() => this.renderDesktop()}
                />
                <HomeMeta />
                <ContactUsModal 
                    visible={this.state.contactUsModalVisible}
                    onClose={this.toggleContactUsModal}
                    title='Ask a Question'
                />
            </StyleRoot>
        );
    }
}

export default Form.create()(Home);

const DetailListComponent = props => {
    const {icon, header, content, style={}, small = false} = props;

    return (
        <Row style={style}>
            <Col span={2}>
                <img src={icon} />
            </Col>
            <Col offset={small ? 1 : 0} span={19} style={{paddingLeft: '20px'}}>
                <h3 className="detail-list-component-header">{header}</h3>
                <h5 className="detail-list-component-content">{content}</h5>
            </Col>
        </Row>
    );
};

const HowCard = props => {
    const {icon, header, content, iconStyle, mobile = false, containerStyle, right} = props;
    const mobileStyle = {
        backgroundColor: '#fff',
        width: '100%',
        padding: '10px',
        //paddingBottom: '20px',
        //boxShadow: '0 4px 32px rgba(193, 193, 193, 0.5)',
        borderRadius: '4px'
    };
    const desktopStyle = {
        backgroundColor: '#fff',
        //display: 'flex', 
        //flexDirection: 'column', 
        //justifyContent: 'center', 
        alignItems: 'center',
        //width: '300px',
        padding: '10px',
        //paddingBottom: '20px',
        //boxShadow: '0 4px 32px rgba(193, 193, 193, 0.5)',
        //borderRadius: '4px'
    };

    return (
        mobile
        ?   <Row style={{...mobileStyle, ...containerStyle}}>
                <Col span={24}>
                    <img 
                        style={{
                            transform: 'scale(1, 1)', 
                            marginTop: '10px',
                            width: '120px', 
                            height: '60px', 
                            ...iconStyle
                        }} 
                        src={icon}
                    />
                </Col>
                <Col span={24}>
                    <Row>
                        <Col span={24}>
                            <div 
                                style={{
                                    textAlign: 'center', 
                                    color: '#00A2A2', 
                                    fontSize: '20px',
                                    fontWeight: 300 
                                    //marginTop: '5px',
                                    //marginLeft: '10px',
                                    //marginBottom: 0
                                }}
                            >
                                {header}
                            </div>
                        </Col>
                        <Col span={24}>
                            <div 
                                style={{
                                    fontSize: '16px', 
                                    color: '#333333',
                                    textAlign: 'center',
                                    //marginLeft: '10px'
                                }}
                            >
                                {content}
                            </div>
                        </Col>
                    </Row>
                </Col>
            </Row>
        :   <div style={{...desktopStyle, ...containerStyle, display: 'inline-flex'}}>
                {!right && 
                    <img 
                        style={{
                            //transform: 'scale(3, 3)', 
                            marginTop: '10px', 
                            //size:'200px',
                            //width: '70px', 
                            //height: '40px', 
                            ...iconStyle
                        }} 
                        src={icon}/>
                }

                <div style={{marginTop:'00px', marginRight: right ? '20px' : '0px', marginLeft: !right ? '20px' : '0px'}}>
                    <div style={{color: '#00A2A2', fontSize: '20px', marginTop: '0px', fontWeight:300}}>{header}</div>
                    <div style={{fontSize: '16px', color: '#333333', marginTop: '0px', fontWeight:400}}>{content}</div>
                </div>

                {right &&
                    <img 
                        style={{
                            //transform: 'scale(3, 3)', 
                            marginTop: '10px', 
                            //size:'200px',
                            //width: '70px', 
                            //height: '40px', 
                            ...iconStyle
                        }} 
                        src={icon}/>
                }
            </div>
    );
};

const FeatureCard = props => {
    const {icon, header, content, iconStyle, small = false, containerStyle} = props;
    const mobileStyle = {
        backgroundColor: '#fff',
        width: '100%',
        padding: '10px',
        paddingBottom: '20px',
        boxShadow: '0 4px 32px rgba(193, 193, 193, 0.5)',
        borderRadius: '4px'
    };
    const desktopStyle = {
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
    };

    return (
        small 
        ?   <Row span={24} style={{...mobileStyle, ...containerStyle}}>
                <Col span={4}>
                    <img 
                        style={{
                            transform: 'scale(1, 1)', 
                            marginTop: '10px',
                            width: '70px', 
                            height: '40px', 
                            ...iconStyle
                        }} 
                        src={icon}
                    />
                </Col>
                <Col span={20}>
                    <Row>
                        <Col span={24}>
                            <h3 
                                style={{
                                    textAlign: 'left', 
                                    color: '#00A2A2', 
                                    fontSize: '20px', 
                                    marginTop: '5px',
                                    marginLeft: '10px',
                                    marginBottom: 0
                                }}
                            >
                                {header}
                            </h3>
                        </Col>
                        <Col span={24}>
                            <h3 
                                style={{
                                    fontSize: '16px', 
                                    color: '#333333',
                                    textAlign: 'left',
                                    marginLeft: '10px'
                                }}
                            >
                                {content}
                            </h3>
                        </Col>
                    </Row>
                </Col>
            </Row>
        :   <div style={{...desktopStyle, ...containerStyle}}>
                <img 
                    style={{
                        transform: 'scale(1, 1)', 
                        marginTop: '10px', 
                        width: '70px', 
                        height: '40px', 
                        ...iconStyle
                    }} 
                    src={icon}/>
                <h3 style={{color: '#00A2A2', fontSize: '20px', marginTop: '5px'}}>{header}</h3>
                <h3 style={{fontSize: '16px', color: '#333333', marginTop: '15px'}}>{content}</h3>
            </div>
    );
};

const StepsCard = props => {
    const {color = '#EBD53B', step = 1, header = 'Enter Contest', headerText = 'Header Text'} = props;

    return (
        <div
                style={{
                    border: `2px solid ${color}`,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-start',
                    alignItems: 'flex-start',
                    width: '300px',
                    borderRadius: '8px',
                    backgroundColor: '#fff',
                    height: '250px',
                    padding: '10px',
                    boxShadow: '0 4px 16px #CECECE'
                }}
        >
            <CardStep>0{step}</CardStep>
            <CardHeader>{header}</CardHeader>
            <Text>{headerText}</Text>
        </div>
    );
}

const styles = {
    bounce: {
      animation: 'pulse 1s infinite',
      animationName: Radium.keyframes(pulse, 'pulse')
    }
};

const CardStep = styled.h3`
    font-weight: 700;
    color: #4E4E4E;
    font-size: 22px;
`;

const CardHeader = styled.h3`
    font-weight: 700;
    color: #3F3F3F;
    font-size: 22px;
`;

const Text = styled.h3`
    font-weight: 600;
    color: #636363;
    font-size: 18px;
    text-align: start;
`;

const TopSectionMobile = styled(Row)`
    background: linear-gradient(to bottom right, #39D6B1, #8A9DFF);
    height: 100vh;
    padding-top: 45px;
`;