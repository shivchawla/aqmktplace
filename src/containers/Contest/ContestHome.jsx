import * as React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import {Row, Col, Button, Tabs, Table, Tag, Icon, Select} from 'antd';
import {primaryColor, verticalBox, horizontalBox} from '../../constants';
import {scoringMetrics, faqs, howItWorksContents, prizes, criterias, prizeText, scoringText} from './constants';
import {processAdviceForLeaderboardListItem} from './utils';
import {fetchAjax} from '../../utils';
import AppLayout from '../../containers/AppLayout';
import logo from "../../assets/logo-advq-new.png";
import {ContestHomeMeta} from '../../metas';

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
        }
    }

    getActiveContests = () => {
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
            if (contests[0] !== undefined) {
                this.setState({selectedContestId: contests[0].id, selectedContest: contests[0]});
                return this.getLatestContestSummary(contests[0].id, false);
            }

            return null;
        })
        .catch(err => err)
        .finally(() => {
            this.setState({loading: false});
        })
    }

    // Gets the summary of the latest ongoing contest
    getLatestContestSummary = (contestId = this.state.selectedContestId, showLoader=true) => {
        showLoader && this.setState({loading: true});
        const limit = 10;
        const skip = 0;
        const contestSummaryUrl = `${requestUrl}/contest/${contestId}/advices?skip=${skip}&limit=${limit}`;
        fetchAjax(contestSummaryUrl, this.props.history, this.props.match.params.url)
        .then(({data: contestSummaryData}) => {
            let advices = _.get(contestSummaryData, 'advices', []);
            advices = advices.map(advice => processAdviceForLeaderboardListItem(advice));
            advices = _.orderBy(advices, 'rank', 'asc');
            console.log(advices);
            this.setState({advices, selectedAdviceId: advices[0].adviceId});
        })
        .catch(err => {
            return err;
        })
        .finally(() => {
            showLoader && this.setState({loading: false});
        })
    }

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
                            {/* <h1 onClick={() => this.props.history.push('/home')} 
                                style={{...headerColor, cursor: 'pointer', marginLeft: '10px', marginTop: '-5px'}}>
                                <span style={{...biggerFont, color:'#fff'}}>A</span>
                                <span style={{color: '#fff'}}>DVICE</span>
                                <span style={{...biggerFont, color: '#fff'}}>Q</span>
                                <span style={{color: '#fff'}}>UBE</span>

                            </h1> */}
                        </div>
                        <h1 style={{color: '#fff', fontSize: '40px', fontWeight: 300}}>Investment Idea Contest</h1>
                        <h3 style={{color: '#fff', fontSize: '18px', fontWeight: 300}}>Beat the market and win cash prizes every week</h3>
  
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
            <Row type="flex" justify="space-between" style={{marginTop: '50px'}}>
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

    renderCriteriaList = () => {
        return (
            <Row style={{marginTop: '20px'}}>
                {
                    criterias.map((criteria, index) => {
                        return <CriteriaCard key={index} {...criteria} />
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
                    <h1>{this.state.metric.header}</h1>
                    <h3>{this.state.metric.content}</h3>
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
                <Tabs animated={false} defaultActiveKey="4">
                    <TabPane tab="HOW IT WORKS" key="1">{this.renderHowItWorks()}</TabPane>
                    <TabPane tab="PRIZES" key="2">{this.renderPrizeList()}</TabPane>
                    <TabPane tab="CRITERIA" key="3">{this.renderCriteriaList()}</TabPane>
                    <TabPane tab="SCORING" key="4">{this.renderScoring()}</TabPane>
                    <TabPane tab="FAQ" key="5">{this.renderFAQ()}</TabPane>
                    <TabPane tab="MY ENTRIES" key="6">{this.renderFAQ()}</TabPane>
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
            <Select 
                    style={{width: 200}} 
                    value={this.state.selectedContestId} 
                    onChange={this.handleContestChange}
            >
                {
                    activeContests.map((contest, index) => {
                        return <Option key={index} value={_.get(contest, 'id', null)}>{_.get(contest, 'name', null)}</Option>
                    })
                }
            </Select>
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
        this.getActiveContests();
    }

    render() {
        return (
            <AppLayout
                noHeader
                content = {
                    <Row style={{height: this.props.windowHeight + 100}}>
                        <ContestHomeMeta />
                        {this.renderTopSection()}
                        {this.renderTabsSection()}
                        {this.renderContestRanking()}
                    </Row>
                }
                loading={this.state.loading}
            >
            </AppLayout>
        );
    }
}

export default windowSize(ContestHome);

const HowItWorksCard = ({image, header, content, span=7}) => {
    const containerStyle = {
        ...verticalBox,
        border: '1px solid #eaeaea',
        margin: '0 10px',
        padding: '15px',
        borderRadius: '4px'
    };

    return (
        <Col span={span} style={containerStyle}>
            <img src={image} />
            <h3 style={{...cardHeaderTextStyle, marginTop: '20px'}}>{header}</h3>
            <h5 style={{...cardContentTextStyle, textAlign: 'center'}}>{content}</h5>
        </Col>
    );
};

const CriteriaCard = ({header, content, span=12}) => {
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
        marginBottom: '60px',
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