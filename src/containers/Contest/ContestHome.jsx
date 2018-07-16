import * as React from 'react';
import {Row, Col, Button, Tabs, Table, Tag, Icon} from 'antd';
import {primaryColor, verticalBox, horizontalBox} from '../../constants';
import {scoringMetrics, faqs, howItWorksContents, prizes, criterias, prizeText, scoringText} from './constants';
import AppLayout from '../../containers/AppLayout';

const TabPane = Tabs.TabPane;

export default class ContestHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            metric: scoringMetrics[0]
        }
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
                        <h1 style={{color: '#fff'}}>Compete to win cash prizes.10 winners daily.</h1>
                        <Button icon="rocket" style={buttonStyle}>Submit Entry</Button>
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
                            <MetricCard onClick={this.selectScoringMetric} key={index} {...metric}/>
                        )
                    }
                </Col>
                    
                <Col span={24} style={{...verticalBox, alignItems: 'flex-start', padding: '15px'}}>
                    {/*<h1>{this.state.metric.title}</h1>*/}
                    <h3>{this.state.metric.detail}</h3>
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

    renderContestRanking = () => {
        const containerStyle = {
            ...verticalBox,
            justifyContent: 'flex-start',
            position: 'fixed',
            top: '20px',
            right: '20px',
            backgroundColor: '#fff',
            boxShadow: '0 5px 16px rgba(154, 154, 154, 0.5)',
            height: '95%',
            borderRadius: '6px',
            overflow: 'hidden'
        };

        const headerContainer = {
            ...horizontalBox,
            height: '60px',
            width: '100%',
            padding: '10px',
            backgroundColor: '#607D8B'
        }
        return (
            <Col span={8} style={containerStyle}>
                <Row style={{width: '100%'}}>
                    <Col span={24} style={headerContainer}>
                        <h3 style={{color: '#fff'}}>LEADERBOARD</h3>
                    </Col>
                </Row>
            </Col>
        );
    }

    selectScoringMetric = header => {
        const selectedItem = scoringMetrics.filter(metric => metric.header === header)[0];
        this.setState({
            metric: {
                title: selectedItem.header,
                detail: selectedItem.content
            }
        });
    }

    render() {
        return (
            <AppLayout
                content = {
                    <Row style={{height: '100%'}}>
                        {this.renderTopSection()}
                        {this.renderTabsSection()}
                        {this.renderContestRanking()}
                    </Row>
                }>
            </AppLayout>
        );
    }
}

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
        padding: '0 10px',
        marginBottom: '60px'
    };

    return (
        <Col span={span} style={containerStyle}>
            <h3 style={cardHeaderTextStyle}>{header}</h3>
            <h5 style={cardContentTextStyle}>{content}</h5>
        </Col>
    );
};

const MetricCard = ({header, content, span=24, onClick}) => {
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
        <Tag>{header}</Tag>
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