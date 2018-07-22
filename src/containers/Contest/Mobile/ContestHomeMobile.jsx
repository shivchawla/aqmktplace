import * as React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import {StickyContainer, Sticky} from 'react-sticky';
import {Row, Col, Button, Table, Tag, Icon, Select} from 'antd';
import {Tabs} from 'antd-mobile';
import {primaryColor, verticalBox, horizontalBox} from '../../../constants';
// import {AdviceListItemMod} from '../../../components/AdviceListeItemMod';
import {AdviceListItemMobile as AdviceListItemMod} from '../../ScreenAdviceMobile/AdviceListItem';
import {scoringMetrics, faqs, howItWorksContents, prizes, requirements, prizeText, scoringText} from '../constants';
import {processAdviceForLeaderboardListItem} from '../utils';
import {fetchAjax, Utils} from '../../../utils';
import AppLayout from '../../../containers/AppLayout';
import logo from "../../../assets/logo-advq-new.png";
import contestFormula from "../../../assets/contestFormula2.png";
import {ContestHomeMeta} from '../../../metas';

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const {requestUrl} = require('../../../localConfig');
const tabs = [
    { title: 'HOW' },
    { title: 'PRIZES' },
    { title: 'REQ' },
    { title: 'SCORING' },
    { title: 'FAQ' },
    { title: 'ENTRIES' },
];

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
            selectedUserEntryPage: 0
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
                    name: _.get(contest, 'name', null)
                };
            })
            this.setState({activeContests: contests});
            if (contests[contests.length - 1] !== undefined) {
                this.setState({selectedContestId: contests[contests.length - 1].id, selectedContest: contests[contests.length - 1]});
                return this.getLatestContestSummary(contests[contests.length - 1].id, false);
            }

            return null;
        })        
        .then(() => {
            resolve(true);
        })
        .catch(err => reject(err))
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
            this.setState({advices, selectedAdviceId: advices[0].adviceId});
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

    renderTopSection = () => {
        const containerStyle = {
            backgroundColor: '#00B79C',
            height: '250px',
        };

        const buttonStyle = {
            marginTop: '20px',
            border: 'none',
            outline: 'none',
            height: '40px',
            width: '150px',
            fontSize: '16px',
            backgroundColor: '#fff'
        };

        return (
            <Col span={24} style={containerStyle}>
                <Row style={{height: '100%'}}>
                    <Col span={24} style={{...verticalBox, height: '100%'}}>
                        <div 
                                style={{
                                    display: 'flex', 
                                    flexDirection: 'row', 
                                    alignItems: 'center',
                                    position: 'absolute',
                                    left: '20px',
                                    top: '20px',
                                    cursor: 'pointer'
                                }}
                                onClick={() => this.props.history.push('/home')}
                        >
                            <img src={logo} style={{height: '40px', marginTop: '-10px'}}/>
                        </div>
                        <h1 
                                style={{
                                    color: '#fff', 
                                    fontSize: '24px', 
                                    fontWeight: 400, 
                                    margin: 0, 
                                    marginTop: '40px'
                                }}
                        >
                            Investment Idea Contest
                        </h1>
                        <h3 
                                style={{
                                    color: '#fff', 
                                    fontSize: '16px', 
                                    fontWeight: 400,
                                    textAlign: 'center'
                                }}
                        >
                            Beat the market and win cash prizes every week
                        </h3>
  
                        <Button 
                                icon="rocket" 
                                style={buttonStyle}
                                onClick={() => this.props.history.push('/contest/createadvice')}
                        >
                            Submit Entry
                        </Button>
                    </Col>
                </Row>
            </Col>
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
            <Row style={{padding: '0 10px'}}>
                <Col span={24} style={{marginTop: '20px'}}>
                    <h3 style={{fontSize: '14px', margin: '10px 0 10px 0'}}>{prizeText}</h3>
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
                        return (
                            <RequirementCard 
                                height={index === 0 ? 60 : 80} 
                                key={index} {...requirement} 
                            />
                        );
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
                <Col span={24} style={{marginTop: '20px'}}>
                    <ScoringCard {...scoring} />
                </Col>
                
                <Col span={24} style={{padding: '0 10px'}}>
                    <h5 
                            style={{
                                fontSize: '12x', 
                                color: '#616161', 
                                fontStyle:'italic',
                                //marginTop: '20px'
                            }}
                    >
                        Excess Return = Return of Investment Idea -  Return of Benchmark
                    </h5>
                </Col>

                <Col span={24} style={{padding: '0 10px'}}>
                    <img style={{marginLeft:'-18px', width: '110%'}} src={contestFormula}/>
                </Col>

                <Col span={24} style={{padding: '0 10px'}}>
                    <h5 style={{fontSize: '16px', color: '#616161'}}>Metrics</h5>
                </Col>

                <Col span={24} style={{padding: '0 10px'}}>
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
                    
                <Col 
                        span={24} 
                        style={{...verticalBox, alignItems: 'flex-start', padding: '0 10px', marginTop: '20px'}}
                >
                    <h2 style={{fontSize: '16px'}}>{this.state.metric.header}</h2>
                    <h3 style={{fontSize: '14px', color: '#616161'}}>{this.state.metric.content}</h3>
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
        .catch(err => reject(err));
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
            })
        });

        return advices;
    }

    renderMyEntriesList = () => {
        return (
            <Row>
                <Col span={24} style={{marginTop: '20px'}}>
                    {
                        this.state.userEntries.map((advice, index) => {
                            return (
                                <React.Fragment>
                                    <AdviceListItemMod key={index} advice={advice} contestOnly={true}/>
                                    <div 
                                        style={{
                                            height: '6px', 
                                            backgroundColor: '#eaeaea',
                                            margin: '10px 0'
                                        }}
                                    />
                                </React.Fragment>
                            );
                        })
                    }
                </Col>
            </Row>
        );
    }

    renderTabBar = props => {
        return (
            <Sticky>
                {
                    ({ style }) => <div style={{ ...style, zIndex: 1 }}>
                        <Tabs.DefaultTabBar renderTab={this.renderTab} {...props} />
                    </div>
                }
            </Sticky>
        );
    }

    renderTab = data => {
        return (
            <h3 style={{width: 'fit-content', fontSize: '12px'}}>{data.title}</h3>
        );
    }

    renderTabsSection = () => {
        const containerStyle = {
            padding: '10px 20px',
            paddingRight: '40px'
        };
        
        return (
            <Tabs 
                    tabs={Utils.isLoggedIn() ? tabs : tabs.slice(0 , tabs.length - 1)}
                    renderTab={this.renderTab}
            >
                {this.renderHowItWorks()}
                {this.renderPrizeList()}
                {this.renderRequirementList()}
                {this.renderScoring()}
                {this.renderFAQ()}
                {this.renderMyEntriesList()}
            </Tabs>
        );
    }

    renderFAQ = () => {        
        return (
            <Row style={{marginTop: '20px'}}>
                {
                    faqs.map((faq, index) => <FAQCard key={index} {...faq} />)
                }
            </Row>
        );
    }

    renderNoActiveParticipants = () => {
        return (
            <Row style={{marginTop: '100px'}}>
                <Col span={24} style={{textAlign: 'center'}}>
                    <h3>There are no active participants in the contest yet.</h3>
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
                noHeader
                noFooter
                content = {
                    <Row style={{height: '100%', paddingBottom: '50px'}}>
                        <ContestHomeMeta />
                        {this.renderTopSection()}
                        {this.renderTabsSection()}
                    </Row>
                }
                loading={this.state.loading}
            >
            </AppLayout>
        );
    }
}

export default windowSize(ContestHome);

const HowItWorksCard = ({image, header, content, span=24}) => {
    const containerStyle = {
        ...verticalBox,
        border: '1px solid #eaeaea',
        margin: '0 10px',
        padding: '15px',
        borderRadius: '4px',
        marginBottom: '20px',
        width: '95%'
    };

    return (
        <Col span={span} style={containerStyle}>
            <img src={image} />
            <h3 style={{...cardHeaderTextStyle, marginTop: '20px'}}>{header}</h3>
            <h5 style={{...cardContentTextStyle, textAlign: 'center'}}>{content}</h5>
        </Col>
    );
};

const RequirementCard = ({header, content, span=24, height=80}) => {
    const containerStyle = {
        padding: '0 10px',
        marginBottom: '10px',
        borderBottom: '1px solid #eaeaea',
        height,
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
        <Row style={{padding: '0 10px',marginBottom: '30px'}}>
            <Col span={24} style={containerStyle}>
                <h3 style={cardHeaderTextStyle}>{header}</h3>
                <h5 style={cardContentTextStyle}>{content}</h5>
            </Col>
        </Row>
    );
};

const FAQCard = ({header, content, span=24}) => {
    const containerStyle = {
        ...verticalBox,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: '0 10px',
        marginBottom: '40px',
    };

    return (
        <Col span={span} style={containerStyle}>
            <h3 style={cardHeaderTextStyle}>{header}</h3>
            <h5 style={cardContentTextStyle}>{content}</h5>
        </Col>
    );
};

const MetricCard = ({header, selected = false, onClick}) => {
    const containerStyle = {
        backgroundColor: '#FBFBFB',
        borderRadius: '4px',
        margin: '0 10px',
        marginBottom: '20px',
        cursor: 'pointer',
        padding: '0 10px'
    };

    const rowColStyle = {
        ...verticalBox,
        alignItems: 'flex-start',
    };

    return (
        <Tag 
                style={{marginBottom: '10px'}}
                color={selected ? primaryColor : null} 
                onClick={() => onClick(header)}
        >
            {header}
        </Tag>
    );
}

const LeaderboardItem = ({rank, name, score, striped=false}) => {
    return (
        <Row style={{margin: '0 10px', padding: '15px 10px', backgroundColor: striped ? '#ECEFF1' : '#fff'}}>
            <Col span={4} style={{fontSize: '16px'}}>{rank}</Col>
            <Col span={16} style={{fontSize: '16px'}}>{name}</Col>
            <Col span={4} style={{fontSize: '16px'}}>{score}</Col>
        </Row>
    );
}

const cardHeaderTextStyle = {
    fontSize: '16px',
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