import * as React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import {Row, Col, Button, Tabs, Table, Tag, Icon, Select, Badge} from 'antd';
import {primaryColor, verticalBox, horizontalBox} from '../../constants';
import {AdviceListItemMod} from '../../components/AdviceListeItemMod';
import {scoringMetrics, faqs, howItWorksContents, prizes, requirements, prizeText, scoringText} from './constants';
import {processAdviceForLeaderboardListItem} from './utils';
import {fetchAjax, Utils} from '../../utils';
import AppLayout from '../../containers/AppLayout';
import ContactUsModal from '../../components/ContactUs';
import contestFormula from "../../assets/contestFormula2.png";
import {ContestHomeMeta} from '../../metas';
import Countdown from 'react-countdown-now';
import moment from 'moment-timezone';
import DateHelper from '../../utils/date';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const {requestUrl} = require('../../localConfig');

class ContestHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            metric: scoringMetrics[0],
            activeContests: [],
            loading: false,
            selectedContestId: null,
            selectedContest: {},
            advices: [], // list of advices currently participating in the contest
            userEntries: [], // advices of the user inside contest,
            selectedUserEntryPage: 0,
            contactUsModalVisible: false
        }
    }

    getActiveContests = () => new Promise((resolve, reject) => {
        const contestsUrl = `${requestUrl}/contest`;
        this.setState({loading: true});
        fetchAjax(contestsUrl, this.props.history, this.props.match.url)
        .then(response => {
            let contests = _.get(response.data, 'contests', []).map(contest => {
                return {
                    id: _.get(contest, '_id', null),
                    name: _.get(contest, 'name', null),
                    startDate: _.get(contest, 'startDate', null)
                };
            })
            this.setState({activeContests: contests});

            var allActiveContests = contests.filter(item => {return DateHelper.compareDates(item.startDate, new Date()) == 1});
            //Use the first active contest
            //IMPROVE: Better sort by dates before using
            if (allActiveContests[0] !== undefined) {
                let activeContest = allActiveContests[0];
                this.setState({selectedContestId: activeContest.id, selectedContest: activeContest});
                return this.getLatestContestSummary(activeContest.id, false);
            }

            return null;
        })        
        .then(() => {
            resolve(true);
        })
        .catch(err => {
            reject(err)
        })
        .finally(() => {
            this.setState({loading: false});
        })
    })

    // Gets the summary of the latest ongoing contest
    getLatestContestSummary = (contestId = this.state.selectedContestId, showLoader=true) => new Promise((resolve, reject) => {
        showLoader && this.setState({loading: true});
        const limit = 10;
        const skip = 0;
        const contestSummaryUrl = `${requestUrl}/contest/${contestId}/advices?skip=${skip}&limit=${limit}`;
        fetchAjax(contestSummaryUrl, this.props.history, this.props.match.params.url)
        .then(({data: contestSummaryData}) => {
            let advices = _.get(contestSummaryData, 'advices', []);
            advices = advices.map(advice => processAdviceForLeaderboardListItem(advice));
            advices = _.orderBy(advices, 'rank', 'asc');
            this.setState({advices, selectedAdviceId: _.get(advices, '[0].adviceId', null)});
            resolve(true);
        })
        .catch(err => reject(err))
        .finally(() => {
            showLoader && this.setState({loading: false});
        })
    })

    renderWinnerRankingList = () => {
        return (
            <Row style={{position: 'relative'}}>
                <Col span={24} style={{padding: '10px'}}>
                    <Row>
                        <Col span={4} style={{fontSize: '16px', color: primaryColor}}>Rank</Col>
                        <Col span={16} style={{fontSize: '16px', color: primaryColor}}>Name</Col>
                        <Col span={4} style={{fontSize: '16px', color: primaryColor}}>Score</Col>
                    </Row>
                </Col>
                <Col 
                        className='ranking-container'
                        span={24} 
                        style={{overflow: 'hiddden', overflowY: 'scroll'}}
                >
                    {
                        this.state.advices.map((advice, index) => {
                            return (
                                <LeaderboardItem 
                                    key={index}
                                    striped={index % 2 === 0}
                                    rank={advice.rank} 
                                    name={advice.advisorName}
                                    score={_.get(advice, 'metrics.current.score', 0)}
                                />
                            );
                        })
                    }
                </Col>
            </Row>
        );
    }

    toggleContactUsModal = () => {
        this.setState({contactUsModalVisible: !this.state.contactUsModalVisible});
    }

    renderTopSection = () => {
        const containerStyle = {
            backgroundColor: '#00B79C',
            height: '300px',
        };

        const buttonStyle = {
            marginTop: '20px',
            border: 'none',
            outline: 'none',
            height: '50px',
            width: '150px',
            fontSize: '16px',
            backgroundColor: '#fff'
        };

        return (

            <Col span={24} style={containerStyle}>
                <Row style={{height: '100%'}}>
                    <Col span={16} style={{...verticalBox, height: '100%'}}>
                        <div style={{color: '#fff', fontSize: '40px', fontWeight: 300, marginTop:'50px'}}>Investment Idea Contest</div>
                        <div style={{color: '#fff', fontSize: '18px', fontWeight: 300, marginTop:'-10px'}}>Beat the market and win cash prizes every week</div>
  
                        <Button 
                                icon="rocket" 
                                style={buttonStyle}
                                onClick={() => this.props.history.push('/contest/createentry')}
                        >
                            Submit Entry
                        </Button>
                        {this.state.selectedContest &&
                            <div style={{marginTop:'10px', fontSize:'16px', color:'#fff', fontWeight:300, textAlign:'center'}}>Submission ends in
                                <Countdown date = {moment.tz(new Date(this.state.selectedContest.startDate), "Asia/Kolkata").startOf('day').format()} renderer={this.renderCountdown}/> 
                            </div>
                        }
                    </Col>
                </Row>
            </Col>
        );
    }

    renderCountdown = ({total, days, hours, minutes, seconds}) => {
        //return `${days}D ${hours}H ${minutes}M ${seconds}S`;
        const timeStyle = {border:'1px solid', backgroundColor:'#fff', fontSize:'14px', margin:'0 2px', padding:'2px', color: primaryColor, fontWeight:400, width:'35px'};
        return (
            <div style={horizontalBox}>
                <div style={timeStyle}>{days}</div>
                <div style={timeStyle}>{hours}</div>
                <div style={timeStyle}>{minutes}</div>
                <div style={timeStyle}>{seconds}</div>
            </div>
        );
    }

    renderHowItWorks = () => {   
        return (
            <Row type="flex" justify="space-between" style={{marginTop: '20px'}}>
                {
                    howItWorksContents.map((item, index) => {
                        return <HowItWorksCard key={index} {...item} />
                    })
                }
            </Row>
        );
    }

    renderPrizeList = () => {
        const columns = [
            {
                title: 'PLACE',
                dataIndex: 'rank',
                key: 'place',
                width: 200
            },
            {
                title: 'REWARD',
                dataIndex: 'reward',
                key: 'reward'
            }
        ];
        return (
            <Row>
                <Col span={24}>
                    <h3 style={{margin: '10px 0 10px 0'}}>{prizeText}</h3>
                </Col>
                <Col span={24}>
                    <Table 
                        dataSource={prizes} 
                        columns={columns} 
                        pagination={false}
                        size="medium"
                    />
                </Col>
            </Row>
        );
    }

    renderRequirementList = () => {
        return (
            <Row style={{marginTop: '20px'}}>
                {
                    requirements.map((requirement, index) => {
                        return <RequirementCard key={index} {...requirement} />
                    })
                }
            </Row>
        );
    }

    renderScoring = () => {
        const scoring = {
            header: 'Scoring Function', 
            content: scoringText, 
        };

        return (
            <Row>
                <Col span={24}>
                    <ScoringCard {...scoring} />
                </Col>
                
                <Col span={24}>
                    <h5 style={{fontSize: '18px', color: '#616161', fontStyle:'italic'}}>Excess Return  = Return of Investment Idea -  Return of Benchmark</h5>
                </Col>

                <Col span={24}>
                    <img style={{marginLeft:'-30px'}} src={contestFormula}/>
                </Col>

                <Col span={24}>
                    <h5 style={{fontSize: '16px', color: '#616161'}}>Metrics</h5>
                </Col>

                <Col span={24}>
                    {
                        scoringMetrics.map((metric, index) => 
                            <MetricCard 
                                onClick={this.selectScoringMetric} 
                                key={index} 
                                {...metric}
                                selected={this.state.metric.header === metric.header}
                            />
                        )
                    }
                </Col>
                    
                <Col span={24} style={{...verticalBox, alignItems: 'flex-start', padding: '15px', paddingLeft: 0}}>
                    <h2>{this.state.metric.header}</h2>
                    <h3>{this.state.metric.content}</h3>
                </Col>
            </Row>
        );

    }

    getUserAdvices = () => new Promise((resolve, reject) => {
        const limit = 10;
        const skip = this.state.selectedUserEntryPage * limit;
        const adviceUrl = `${requestUrl}/advice?personal=1&contestOnly=true&skip=${skip}&limit=${limit}`;
        fetchAjax(adviceUrl, this.props.history, this.props.match.url, undefined, err => err)
        .then(advicesResponse => {
            const advices = _.get(advicesResponse.data, 'advices', []);
            const count = _.get(advicesResponse.data, 'count', 0);
            resolve({advices: this.processAdvices(advices), count});
        })
        .catch(err => {
            reject(err);
        });
    })

    processAdvices = (responseAdvices) => {
        const advices = [];
        responseAdvices.map((advice, index) => {
            advices.push({
                contestOnly: true,
                isFollowing: advice.isFollowing || false,
                id: advice._id || 0,
                name: advice.name || '',
                advisor: advice.advisor || {},
                createdDate: advice.createdDate || '',
                heading: advice.heading || '',
                subscribers: advice.numSubscribers || 0,
                followers: advice.numFollowers || 0,
                rating: Number(_.get(advice, 'rating.current', 0) || 0).toFixed(2),
                performanceSummary: advice.performanceSummary,
                rebalancingFrequency: _.get(advice, 'rebalance', 'N/A'),
                isApproved: _.get(advice, 'latestApproval.status', false),
                approvalStatus: _.get(advice, 'approvalRequested', false),
                isOwner: _.get(advice, 'isOwner', false),
                isAdmin: _.get(advice, 'isAdmin', false),
                isSubscribed: _.get(advice, 'isSubscribed', false),
                isTrending: false,
                public: _.get(advice, 'public', false),
                netValue: advice.netValue,
                contest: advice.contest
            })
        });

        return advices;
    }

    renderMyEntriesList = () => {
        return (
            <Row>
                <Col span={24}>
                    {
                        this.state.userEntries.map((advice, index) => {
                            return (
                                <AdviceListItemMod key={index} advice={advice} contestOnly={true}/>
                            );
                        })
                    }
                </Col>
            </Row>
        );
    }

    renderTabsSection = () => {
        const containerStyle = {
            padding: '10px 20px',
            paddingRight: '40px'
        };

        return (
            <Col span={16} style={containerStyle}>
                <Tabs animated={false} defaultActiveKey="1">
                    <TabPane tab="HOW IT WORKS" key="1">{this.renderHowItWorks()}</TabPane>
                    <TabPane tab="PRIZES" key="2">{this.renderPrizeList()}</TabPane>
                    <TabPane tab="REQUIREMENTS" key="3">{this.renderRequirementList()}</TabPane>
                    <TabPane tab="SCORING" key="4">{this.renderScoring()}</TabPane>
                    <TabPane tab="FAQ" key="5">{this.renderFAQ()}</TabPane>
                    <TabPane tab="MY ENTRIES" key="6">{this.renderMyEntriesList()}</TabPane>
                </Tabs>
            </Col>
        );
    }

    renderFAQ = () => {        
        return (
            <Row>
                {
                    faqs.map((faq, index) => <FAQCard key={index} {...faq} />)
                }
            </Row>
        );
    }

    renderNoActiveParticipants = () => {
        const buttonStyle = {
            transform: Utils.isLoggedIn() ? 'scale(0, 0)' : 'scale(1, 1)'
        }
        return (
            <Row style={{marginTop: '100px'}}>
                <Col span={24} style={{...verticalBox, textAlign: 'center'}}>
                    <h3 style={{color: 'transparent'}}>There are no active participants in the contest yet.</h3>
                    <Button type="primary" style={buttonStyle}>
                        SIGN UP
                    </Button>
                </Col>
            </Row>
        );
    }

    renderContestRanking = () => {
        const containerStyle = {
            ...verticalBox,
            justifyContent: 'flex-start',
            position: 'absolute',
            top: '20px',
            right: '20px',
            backgroundColor: '#fff',
            boxShadow: '0 5px 16px rgba(154, 154, 154, 0.5)',
            height: this.props.windowHeight - 50,
            borderRadius: '6px',
            overflow: 'hidden'
        };

        const headerContainer = {
            ...horizontalBox,
            height: '60px',
            width: '100%',
            padding: '10px',
            backgroundColor: '#607D8B',
            justifyContent: 'space-between',
            position: 'relative'
        }

        return (
            <Col span={8} style={containerStyle}>
                <Row style={{position: 'relative', height: '100%'}}>
                    <Col span={24} style={headerContainer}>
                        <h3 style={{color: '#fff'}}>LEADERBOARD</h3>
                        {this.renderContestDropdown()}
                    </Col>
                    <Col span={24}>
                        {
                            this.state.advices.length > 0 
                            ? this.renderWinnerRankingList()
                            : this.renderNoActiveParticipants()
                        }
                    </Col>
                </Row>
                {
                    this.state.advices.length > 0 &&
                    <Button
                            className='button-container' 
                            span={24} 
                            style={{
                                position: 'absolute', 
                                bottom: '20px', 
                                zIndex: '20px',
                                backgroundColor: primaryColor,
                                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)',
                                cursor: 'pointer',
                                color:'#fff'
                            }}
                            onClick={() => this.props.history.push('/contest/leaderboard')}
                    >
                        MORE
                    </Button>
                }
            </Col>
        );
    }

    renderContestDropdown = () => {
        const {activeContests = []} = this.state;
        return (
            // <Select 
            //         style={{width: 200}} 
            //         value={this.state.selectedContestId} 
            //         onChange={this.handleContestChange}
            //         disabled={true}
            // >
            //     {
            //         activeContests.map((contest, index) => {
            //             return <Option key={index} value={_.get(contest, 'id', null)}>{_.get(contest, 'name', null)}</Option>
            //         })
            //     }
            // </Select>
            <h3 style={{color: '#fff', fontSize: '14px', marginRight: '5px'}}>
                {_.get(this.state, 'selectedContest.name', '')}
            </h3>
        );
    }

    selectScoringMetric = header => {
        const selectedItem = scoringMetrics.filter(metric => metric.header === header)[0];
        this.setState({
            metric: {
                header: selectedItem.header,
                content: selectedItem.content
            }
        });
    }

    componentWillMount() {
        Promise.all([
            this.getActiveContests(),
            Utils.isLoggedIn() && this.getUserAdvices()
        ])
        .then(([contestResponse, userAdvices]) => {
            
            const advices = _.get(userAdvices, 'advices', []);
            this.setState({userEntries: advices});
        })
    }

    render() {
        return (
            <AppLayout
                content = {
                    <Row style={{height: this.props.windowHeight + 100}}>
                        <ContestHomeMeta />
                        {this.renderTopSection()}
                        {this.renderTabsSection()}
                        {this.renderContestRanking()}
                        <ContactUsModal 
                            visible={this.state.contactUsModalVisible}
                            onClose={this.toggleContactUsModal}
                            title='Ask a Question'
                        />
                    </Row>
                }
                loading={this.state.loading}
           />
        );
    }
}

export default windowSize(ContestHome);

const HowItWorksCard = ({image, header, content, span=7}) => {
    const containerStyle = {
        //...verticalBox,
        border: '1px solid #eaeaea',
        margin: '0 10px',
        padding: '30px 15px 15px 15px',
        borderRadius: '4px',
        height:'300px',
        textAlign:'center'
    };

    return (
        <Col span={span} style={containerStyle}>
            <img src={image} />
            <h3 style={{...cardHeaderTextStyle, fontSize:'18px', marginTop:'20px'}}>{header}</h3>
            <h5 style={{...cardContentTextStyle, fontSize:'15px'}}>{content}</h5>
        </Col>
    );
};

const RequirementCard = ({header, content, span=12}) => {
    const containerStyle = {
        marginBottom: '40px',
        borderBottom: '1px solid #eaeaea',
        height:'80px'
    };

    return (
        <Col span={span} style={containerStyle}>
            <Row>
                <Col span={2}>
                    <Icon style={{fontSize: '20px', color: primaryColor}} type="check" />
                </Col>
                <Col span={22}>
                    <h3 style={cardHeaderTextStyle}>{header}</h3>
                    <h5 style={cardContentTextStyle}>{content}</h5>
                </Col>
            </Row>
        </Col>
    );
};

const ScoringCard = ({header, content, metrics}) => {
    const containerStyle = {
        ...verticalBox,
        alignItems: 'flex-start'
    }
    return (
        <Row style={{marginBottom: '30px'}}>
            <Col span={24} style={containerStyle}>
                <h3 style={cardHeaderTextStyle}>{header}</h3>
                <h5 style={cardContentTextStyle}>{content}</h5>
            </Col>
        </Row>
    );
};

const FAQCard = ({header, content, span=12}) => {
    const containerStyle = {
        ...verticalBox,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '0 10px',
        //marginBottom: '60px',
        height:'200px'
    };

    return (
        <Col span={12} style={containerStyle}>
            <h3 style={cardHeaderTextStyle}>{header}</h3>
            <h5 style={cardContentTextStyle}>{content}</h5>
        </Col>
    );
};

const MetricCard = ({header, selected = false, onClick}) => {
    const containerStyle = {
        backgroundColor: '#FBFBFB',
        borderRadius: '4px',
        marginBottom: '20px',
        cursor: 'pointer',
        padding: '10px'
    };

    const rowColStyle = {
        ...verticalBox,
        alignItems: 'flex-start',
    };

    return (
        <Tag 
                color={selected ? primaryColor : null} 
                onClick={() => onClick(header)}
        >
            {header}
        </Tag>
    );
}

const LeaderboardItem = ({rank, name, score, striped=false}) => {
    return (
        <Row style={{padding: '15px 10px', backgroundColor: striped ? '#ECEFF1' : '#fff'}}>
            <Col span={4} style={{fontSize: '16px'}}>{rank}</Col>
            <Col span={16} style={{fontSize: '16px'}}>{name}</Col>
            <Col span={4} style={{fontSize: '16px'}}>{score}</Col>
        </Row>
    );
}

const cardHeaderTextStyle = {
    fontSize: '18px',
    color: '#252a2f'
};

const cardContentTextStyle = {
    fontSize: '15px',
    color: '#596572'
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