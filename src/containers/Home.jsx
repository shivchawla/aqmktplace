import * as React from 'react';
import Media from 'react-media';
import YouTube from 'react-youtube';
import pulse from 'react-animations/lib/pulse';
import Radium, {StyleRoot} from 'radium';
import Modal from 'react-responsive-modal';
import {Row, Col, Button, Form, Icon} from 'antd';
import adviceLogo from '../assets/AdviceLogo.svg';
import adviceLogoMobile from '../assets/AdviceLogoMobile.svg';
import portfolioLogoMobile from '../assets/PortfolioLogo.svg';
import portfolioLogo from '../assets/PortfolioLogo.svg';
import heroImage from '../assets/HeroImageSmall.svg';
import heroImageMobile from '../assets/HeroImageMobile.svg';
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
import CreatePortfolio from '../assets/CreatePortfolio-Home.svg';
import EnterContest from '../assets/EnterContest2-Home.svg';
import WinPrizes from '../assets/WinPrizes-Home.svg';
import ExpertIdea from '../assets/ExpertIdea-Home.svg';
import {HomeMeta} from '../metas';
import '../css/home.css';
import AppLayout from './AppLayout'

const {youtubeVideoId} = require('../localConfig');

export class Home extends React.Component { 
    constructor(props) {
        super(props);
        this.state = {
            selectedTabBar: 'advisor',
            loading: true,
            youtubeModalVisible: false
        }
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
                    <h3 className='tab-content-text'>
                        Compete to showcase your Investment Ideas on the platform.
                        Participate in our Investment Idea contest, win prizes and sell the winning ideas.
                        Perfect platform for expert investment advisor and skillful stock pickers
                    </h3>
                </Col>
                <Col span={12}>
                    <img src={adviceLogo} style={{transform: 'scale(0.8, 0.8)', marginLeft: '-40px'}}/>
                </Col>
                <Col span={12} className="tab-content-button-container">
                    <Button 
                        className="home-action-buttons"
                        onClick={() => this.props.history.push('/contest')}>
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
                    <h3 className='tab-content-text' style={{lineHeight: '26px', paddingRight: '10px'}}>
                        Compete to showcase your Investment Ideas on the platform.
                        Participate in our Investment Idea contest, win prizes and sell the winning ideas.
                        Perfect platform for expert investment advisor and skillful stock pickers
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
                        onClick={() => this.props.history.push('/contest')}>
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
                    header="Marketplace for experts"
                    content="While you focus primarily on improving your investment ideas, we help you find the investors"/>
                
                <DetailListComponent 
                    key="2" 
                    icon={globe}
                    small={type === 'small' ? true : false}
                    header="Barrier Less Investment Advisory"
                    content="The power of online to everyone. Now, you can sell your winner ideas to anyone, anywhere in the world"
                    style={{marginTop: type === 'small' ? '40px' : '110px'}}/>
                <DetailListComponent
                    key="3"  
                    icon={wheel}
                    small={type === 'small' ? true : false}
                    header="Superior Research Tools"
                    content="We provide you the tools to test your investment ideas, historical performance and ranking. You can also automate your investment advice."
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
                        onClick={() => this.props.history.push('/advice')} >
                        FIND INVESTMENT IDEAS
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
            <Col span={12} style={{paddingLeft: '40px'}}>
                <Row>
                    <Col span={24}>
                        <h1 className="hero-text">Expert-Sourced<br></br>Investment Portfolio</h1>
                    </Col>
                    <Col span={24}>
                        <h5 style={{fontWeight:300}} className="hero-description-text">
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
                                            style={{lineHeight: '30px', textAlign: 'center', fontWeight: 700, fontSize: '24px'}}
                                    >
                                        Expert-Sourced <br></br> Investment Portfolio
                                    </h1>
                                </Col>
                                <Col span={24}>
                                    <h5 className="hero-description-text-mobile" style={{textAlign: 'center'}}>
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

    renderActionButtonsDesktop = () => {
        return (
            <Col span={24}>
                <Button 
                        className="signup-button"
                        onClick={() => this.props.history.push('/contest')}
                >
                    ENTER CONTEST
                </Button>
                <Button 
                        style={{marginLeft: '20px'}}
                        className="action-buttons"
                        onClick={() => this.props.history.push('/advice')}
                >
                    FIND INVESTMENT IDEAS
                </Button>
            </Col>
        );
    }

    renderActionButtonsMobile = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Col span={24} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                            <Button 
                                    className="signup-button-mobile"
                                    style={{marginTop: 0}}
                                    onClick={() => this.props.history.push('/contest')}
                            >
                                ENTER CONTEST
                            </Button>
                            <Button 
                                    className="create-advice-button-mobile"
                                    onClick={() => this.props.history.push('/advice')}
                            >
                                FIND INVESTMENT IDEAS
                            </Button>
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
                                    onClick={() => this.props.history.push('/contest')}
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
            <Col span={12} className='hero-image'>
                <object style={{width: '85%'}} type="image/svg+xml" data={heroImage}></object>
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
                                style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}} 
                                className='hero-image-mobile'
                        >
                            <object style={{width: '100%'}} type="image/svg+xml" data={heroImageMobile}></object>
                        </Col>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <Col 
                                span={24} 
                                style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: '400px'}} 
                                className='hero-image-mobile'
                        >
                            <object 
                                    style={{width: '100%', height: '400px'}} 
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
                <h3 style={{textAlign: 'center', fontSize:'24px', color: 'teal', marginBottom:'50px'}}>INVESTMENT IDEA MARKETPLACE</h3>
                <Col span={10} className="middle-left-section">
                    <Col className='tab-bar'>
                        <TabBarElement 
                                onClick={() => this.handleTabBarClick('advisor')} 
                                text='Expert' 
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
                <h3 style={{textAlign: 'center', fontSize:'20px', color: 'teal', marginBottom:'30px'}}>INVESTMENT IDEA MARKETPLACE</h3>
                <Col span={24} className="middle-left-section">
                    <Col className='tab-bar'>
                        <TabBarElement 
                                onClick={() => this.handleTabBarClick('advisor')} 
                                text='Expert' 
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

    renderLowerSectionDesktop_O = () => {
        return (
            <React.Fragment>
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
            </React.Fragment>
        );
    }

    renderLowerSectionDesktop = () => {
        return (
            <React.Fragment>
                <h3 className="lower-section-header">HOW IT WORKS?</h3>
                <Row type="flex" className="lower-section-card-container">
                    <Col span={14} style={{paddingLeft: '50px', textAlign:'left'}}>
                    <HowCard 
                        key="2"
                        icon={EnterContest}
                        header="Step 1: Enter Contest"
                        content="Create a diversified portfolio to beat the market."
                        container
                    />
                    </Col>

                    <Col offset={12} span={12} style={{paddingRight: '-10px', textAlign: 'right', marginTop:'-80px'}}>
                        <HowCard
                            key="3" 
                            icon={WinPrizes}
                            header="Step 2: Win cash prizes"
                            content="Beat the market benchmark and win cash prizes every week worth Rs.10,000"
                            right
                        />
                    </Col>

                    <Col span={13} style={{paddingLeft: '0px', textAlign: 'left', marginTop:'-110px'}}>
                        <HowCard
                            key="4" 
                            icon={ExpertIdea}
                            header="Step 3: Expert Portfolio Allocation"
                            content='Winners contribute to the “Expert Portfolio” and earn royalty'
                        />
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

    renderLowerSectionMobile_O = () => {
        return (
            <React.Fragment>
                <h3 className="lower-section-header">Other Features</h3>
                <Col span={24} className="lower-section-card-container-mobile">
                    <FeatureCard 
                            key="1"
                            small={true}
                            icon={research}
                            header="Quant Research"
                            content="Systematically research investment ideas"
                    />
                    <FeatureCard 
                            key="2"
                            small={true}
                            icon={share}
                            header="Share"
                            content="Share your ideas with community"
                            containerStyle={{marginTop: '20px'}}
                    />
                    <FeatureCard
                            key="3"
                            iconStyle={{width: '90%'}}
                            small={true} 
                            icon={automate}
                            header="Automate"
                            content="Automate your investment process"
                            containerStyle={{marginTop: '20px'}}
                    />
                    <FeatureCard
                            key="4" 
                            small={true}
                            iconStyle={{transform: 'scale(0.9, 0.9)'}}
                            icon={realtime}
                            header="Realtime"
                            content="Get real-time data for latest updates"
                            containerStyle={{marginTop: '20px'}}
                    />
                </Col>
            </React.Fragment>
        );
    }

    renderLowerSectionMobile = () => {
        return (
            <React.Fragment>
                <h3 className="lower-section-header" style={{marginTop: '50px'}}>HOW IT WORKS?</h3>
                <Row type="flex" className="lower-section-card-container">
                    <Col span={24} style={{textAlign:'center'}}>
                    <HowCard 
                        key="2"
                        icon={EnterContest}
                        header="Step 1: Enter Contest"
                        content="Create a diversified portfolio to beat the market."
                        mobile
                    />
                    </Col>

                    <Col span={24} style={{textAlign: 'center'}}>
                        <HowCard
                            key="3" 
                            icon={WinPrizes}
                            header="Step 2: Win cash prizes"
                            content="Beat the market benchmark and win cash prizes every week worth Rs.10,000"
                            right
                            mobile
                        />
                    </Col>

                    <Col span={24} style={{textAlign: 'center'}}>
                        <HowCard
                            key="4" 
                            icon={ExpertIdea}
                            header="Step 3: Expert Portfolio Allocation"
                            content='Winners contribute to the “Expert Portfolio” and earn royalty'
                            mobile
                        />
                    </Col>
                </Row>
            </React.Fragment>
        );
    }

    render() {
        return (
            <AppLayout 
                loading={this.state.loading}
                content={
                    <StyleRoot>
                        <Media 
                            query="(max-width: 1199px)"
                            render={() => (
                                <React.Fragment>
                                    <Media 
                                        query="(max-width: 600px)"
                                        render={() => this.renderVideoPlayerModalMobile()}
                                    />
                                    <Media 
                                        query="(min-width: 601px)"
                                        render={() => this.renderVideoPlayerModalMobile('tablet')}
                                    />
                                </React.Fragment>
                            )}
                        />
                        <Media 
                            query="(min-width: 1200px)"
                            render={() => this.renderVidePlayerModalDesktop()}
                        />
                        {/* {this.renderVidePlayerModalDesktop()} */}
                        <Col span={24} className='page-container'>
                            <HomeMeta />
                            <Media 
                                query="(max-width: 1199px)"
                                render={() => {
                                    return (
                                        <Row>
                                            <React.Fragment>
                                                {this.renderTopLeftSectionMobile()}
                                                {/* {this.renderPlayVideoButtonMobile()} */}
                                                {this.renderTopHeroImageMobile()}
                                                {this.renderActionButtonsMobile()}
                                            </React.Fragment>
                                        </Row>
                                    );
                                }}
                            />
                            <Media
                                query="(min-width: 1200px)"
                                render={() => {
                                    return (
                                        <Row className="top-section">
                                            <React.Fragment>
                                                {this.renderTopLeftSectionDesktop()}
                                                {this.renderTopHeroImageDesktop()}
                                                {/* {this.renderPlayVideoButtonDesktop()} */}
                                            </React.Fragment>
                                        </Row>
                                    );
                                }}
                            />
                            
                            <Row className="lower-section" style={{marginTop: '30px', height:'100vh', minHeight: '600px'}}>
                                <Media 
                                    query="(max-width: 1199px)"
                                    render={() => this.renderLowerSectionMobile()}
                                />
                                <Media 
                                    query="(min-width: 1200px)"
                                    render={() => this.renderLowerSectionDesktop()}
                                />
                            </Row>

                            <Row className="middle-section" style={{marginTop: '50px'}}>
                                <Media 
                                    query="(max-width: 1199px)"
                                    render={() => this.renderMiddleSectionMobile()}
                                />
                                <Media 
                                    query="(min-width: 1200px)"
                                    render={() => this.renderMiddleSectionDesktop()}
                                />
                            </Row>
                            {/*<Row className="lower-section" style={{marginTop: '80px'}}>
                                <Media 
                                    query="(max-width: 1199px)"
                                    render={() => this.renderLowerSectionMobile()}
                                />
                                <Media 
                                    query="(min-width: 1200px)"
                                    render={() => this.renderLowerSectionDesktop()}
                                />
                            </Row>*/}
                        </Col>
                    </StyleRoot>
                }>
            </AppLayout>
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

const styles = {
    bounce: {
      animation: 'pulse 1s infinite',
      animationName: Radium.keyframes(pulse, 'pulse')
    }
};