import * as React from 'react';
import {Row, Col, Button, Tabs, Table, Tag, Icon} from 'antd';
import {primaryColor, verticalBox, horizontalBox} from '../../constants';
import enterContestIcon from '../../assets/enter-contest.svg';

const TabPane = Tabs.TabPane;

const metrics = [
    {header: 'Total Return', content: 'The Total Return of your portfolio'},
    {header: 'Annual Return', content: 'The Annual Return of your portfolio'},
    {header: 'Volatility', content: 'The Volatility of your portfolio'},
    {header: 'Sharpe', content: 'The Sharpe of your portfolio'},
    {header: 'Beta', content: 'The Beta of your portfolio'},
    {header: 'Alpha', content: 'The Alpha of your portfolio'}
];

export default class ContestHome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            metric: {
                title: 'Total Return',
                detail: 'The total return of your portfolio'
            }
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
        const contents = [
            {image: enterContestIcon, header: 'Enter Contest', content: 'Write an algorithm, and submit it to the contest. Submissions are entered into the contest starting at the next market open.'},
            {image: enterContestIcon, header: 'Enter Contest', content: 'Write an algorithm, and submit it to the contest. Submissions are entered into the contest starting at the next market open.'},
            {image: enterContestIcon, header: 'Enter Contest', content: 'Write an algorithm, and submit it to the contest. Submissions are entered into the contest starting at the next market open.'}
        ];
        return (
            <Row type="flex" justify="space-between" style={{marginTop: '50px'}}>
                {
                    contents.map((item, index) => {
                        return <HowItWorksCard key={index} {...item} />
                    })
                }
            </Row>
        );
    }

    renderPrizeList = () => {
        const containerStyle = {};
        const prizes = [
            {key: 1, rank: '1st Place', reward: '10000'},
            {key: 2,rank: '2nd Place', reward: '10000'},
            {key: 3,rank: '3rd Place', reward: '10000'},
            {key: 4,rank: '4th Place', reward: '10000'},
            {key: 5,rank: '5th Place', reward: '10000'},
            {key: 6,rank: '6th Place', reward: '10000'},
            {key: 7,rank: '7th Place', reward: '10000'},
            {key: 8,rank: '8th Place', reward: '10000'},
            {key: 9,rank: '9th Place', reward: '10000'},
            {key: 10,rank: '10th Place', reward: '10000'},
        ];
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
                    <h3>The top 10 contest participants are awarded cash prizes on a daily basis. The following prizes are awarded after every trading day</h3>
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
        const criterias = [
            {header: 'Returns', content: 'Your algorithm must make money.'},
            {header: 'Long/Short', content: 'Your algorithm must make money.'},
            {header: 'Long/Short', content: 'Your algorithm must make money.'},
            {header: 'Long/Short', content: 'Your algorithm must make money.'},
            {header: 'Long/Short', content: 'Your algorithm must make money.'},
            {header: 'Long/Short', content: 'Your algorithm must make money.'},
            {header: 'Long/Short', content: 'Your algorithm must make money.'},
            {header: 'Long/Short', content: 'Your algorithm must make money.'},
        ];

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
            content: 'Algorithms are scored based on their out-of-sample returns and trailing volatility.', 
        };

        return (
            <Row>
                <Col span={12}>
                    <Row>
                        <Col span={24}>
                            <ScoringCard {...scoring} />
                        </Col>
                        <Col span={24}>
                            <h5 style={{fontSize: '15px', color: '#616161'}}>Metrics</h5>
                        </Col>
                        <Col span={24}>
                            {
                                metrics.map((metric, index) => 
                                    <MetricCard onClick={this.selectScoringMetric} key={index} {...metric}/>
                                )
                            }
                        </Col>
                    </Row>
                </Col>
                <Col span={12} style={{...verticalBox, alignItems: 'flex-start', padding: '15px'}}>
                    <h1>{this.state.metric.title}</h1>
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
        const faqs = [
            {header: 'How do I submit my algorithm?', content: 'Go to your algorithm library and choose an algorithm. Run a backtest for that algorithm and then click Enter Contest.'},
            {header: 'Can I submit multiple algorithms?', content: 'Yes, you can submit up to 3 algorithms at a time. You may also stop any of your submitted algorithms to make room for another.'},
            {header: 'How do I submit my algorithm?', content: 'Go to your algorithm library and choose an algorithm. Run a backtest for that algorithm and then click Enter Contest.'},
            {header: 'Can I submit multiple algorithms?', content: 'Yes, you can submit up to 3 algorithms at a time. You may also stop any of your submitted algorithms to make room for another.'},
            {header: 'How do I submit my algorithm?', content: 'Go to your algorithm library and choose an algorithm. Run a backtest for that algorithm and then click Enter Contest.'},
            {header: 'Can I submit multiple algorithms?', content: 'Yes, you can submit up to 3 algorithms at a time. You may also stop any of your submitted algorithms to make room for another.'},
            {header: 'How do I submit my algorithm?', content: 'Go to your algorithm library and choose an algorithm. Run a backtest for that algorithm and then click Enter Contest.'},
            {header: 'Can I submit multiple algorithms?', content: 'Yes, you can submit up to 3 algorithms at a time. You may also stop any of your submitted algorithms to make room for another.'},
            {header: 'How do I submit my algorithm?', content: 'Go to your algorithm library and choose an algorithm. Run a backtest for that algorithm and then click Enter Contest.'},
            {header: 'Can I submit multiple algorithms?', content: 'Yes, you can submit up to 3 algorithms at a time. You may also stop any of your submitted algorithms to make room for another.'},
        ];
        
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
                        <h3 style={{color: '#fff'}}>Ranking</h3>
                    </Col>
                </Row>
            </Col>
        );
    }

    selectScoringMetric = header => {
        const selectedItem = metrics.filter(metric => metric.header === header)[0];
        this.setState({
            metric: {
                title: selectedItem.header,
                detail: selectedItem.content
            }
        });
    }

    render() {
        return (
            <Row style={{height: '100%'}}>
                {this.renderTopSection()}
                {this.renderTabsSection()}
                {this.renderContestRanking()}
            </Row>
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
        <Col span={24} onClick={() => onClick(header)}>
            <Row style={containerStyle} type="flex" align="middle">
                <Col style={rowColStyle} span={22}>
                    <h3 style={{fontSize: '15px', color: primaryColor}}>{header}</h3>
                </Col>
                <Col span={2}>
                    <Icon type="right" />
                </Col>
            </Row>
        </Col>
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