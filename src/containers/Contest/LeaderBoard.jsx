import * as React from 'react';
import {Row, Col, Progress} from 'antd';
import AppLayout from '../AppLayout';
import {primaryColor, verticalBox} from '../../constants';
import './css/leaderBoard.css';

const leaderboardListItem = {
    adviceName: 'Large Cap Investment Advice',
    advisorName: 'Shiv Chawla',
    metrics: {
        totalReturn: 1.5,
        volatility: 10.5,
        annualReturn: 4.5,
        beta: 3.2,
        alpha: 4.8
    }
};

const metrics = [
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    },
    {
        metricValue: 0.6,
        rank: 10,
        label: 'Max Loss'
    }
];


export default class LeaderBoard extends React.Component {
    renderLeaderBordListHeader = () => {
        return (
            <Row
                    type="flex"
                    align="middle" 
                    style={{
                        borderBottom: '1px solid #eaeaea', 
                        marginBottom: '20px',
                        backgroundColor: '#fff',
                        height: '40px',
                        borderTopLeftRadius: '4px',
                        borderTopRightRadius: '4px',
                        paddingTop: '7px'
                    }}
            >
                <Col span={12}>
                    <Row>
                        <Col offset={4} span={20}>
                            <h3 style={{color: primaryColor, fontSize: '14px'}}>ADVICE</h3>
                        </Col>
                    </Row>
                </Col>
                <Col span={4}>
                    <h3 style={{color: primaryColor, fontSize: '14px'}}>TOTAL RETURN</h3>
                </Col>
                <Col span={4}>
                    <h3 style={{color: primaryColor, fontSize: '14px'}}>VOLATILITY</h3>
                </Col>
                <Col span={4}>
                    <h3 style={{color: primaryColor, fontSize: '14px'}}>SCORE</h3>
                </Col>
            </Row>
        );
    }

    renderLeaderList = () => {
        const leaders = this.getLeaderList();

        return (
            <Row>
                <Col span={24}>
                    {this.renderLeaderBordListHeader()}
                </Col>
                <Col span={24} style={{padding: '20px', paddingTop: '0px'}}>
                    {
                        leaders.map((leader, index) => 
                            <LeaderItem key={index} leaderItem={leader} index={index + 1} />
                        )
                    }
                </Col>
            </Row>
        );

    }

    getLeaderList = () => {
        const leaders = [];
        for(let i = 0; i < 10; i++) {
            leaders.push(leaderboardListItem);
        }

        return leaders;
    }

    renderPageContent() {
        return (
            <Row style={{padding: '20px', paddingTop: '10px'}}>
                <Col span={24} style={{marginBottom: '20px'}}>
                    <h3 style={{fontSize: '26px', color: '#252a2f', marginBottom: '0px'}}>Leaderboard</h3>
                    <h5 style={{fontSize: '14px', color: '#6F6F6F'}}>View leaderboard of the recent contest</h5>
                </Col>
                <Col 
                        span={16}
                        style={{
                            backgroundColor: '#fff',
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
                            borderRadius: '4px',
                        }}
                >
                    {this.renderLeaderList()}
                </Col>
                <Col 
                        offset={1}
                        span={7}
                        style={{
                            boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)', 
                            height: '-webkit-fill-available',
                            backgroundColor: '#fff'
                        }}
                >
                    <MetricContainer header="CURRENT METRICS" metrics={metrics} />
                    <MetricContainer header="SIMULATED METRICS" metrics={metrics} />
                </Col>
            </Row>
        );
    }

    render() {
        return (
            <AppLayout
                noFooter={true}
                content={this.renderPageContent()}
            ></AppLayout>
        );
    }
}

const LeaderItem = ({leaderItem, index}) => {
    const containerStyle = {
        borderBottom: '1px solid #eaeaea',
        marginBottom: '10px',
        cursor: 'pointer',
        paddingBottom: '10px'
    };

    return (
        <Row style={containerStyle}>
            <Col span={12}>
                <Row>
                    <Col span={4}>
                        <h3 style={{fontSize: '14px', margin: 0, width: '200px'}}>{index} .</h3>
                    </Col>
                    <Col span={20}>
                        <Row>
                            <Col span={22}>
                                <h3 style={{fontSize: '14px', margin: 0}}>{leaderItem.adviceName}</h3>
                            </Col>
                            <Col span={24}>
                                <h5 style={{fontSize: '12px', margin: 0}}>{leaderItem.advisorName}</h5>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
            <Col span={4}>
                <h3 style={{fontSize: '14px'}}>{leaderItem.metrics.totalReturn}</h3>
            </Col>
            <Col span={4}>
                <h3 style={{fontSize: '14px'}}>{leaderItem.metrics.volatility}</h3>
            </Col>
            <Col span={4}>
                <h3 style={{fontSize: '14px'}}>{leaderItem.metrics.volatility}</h3>
            </Col>
        </Row>
    );
}

const MetricContainer = ({header, metrics}) => {
    return (
        <Row style={{padding: '10px'}}>
            <Col span={24} style={{marginBottom: '10px'}}>
                <h3 style={{fontSize: '14px'}}>{header}</h3>
            </Col>
            {
                metrics.map((metric, index) => {
                    return (
                        <Col 
                                span={12} 
                                style={{
                                    ...verticalBox, 
                                    border: '1px solid #E5E5E5', 
                                    padding: '5px',
                                    boxSizing: 'border-box'
                                }}
                        >
                            <ContestMetricItems key={index} {...metric} />
                        </Col>
                    );
                })
            }
        </Row>
    );
}

const ContestMetricItems = ({metricValue, rank, label}) => {
    const containerStyle = {
        // alignItems: 'flex-start',
        marginBottom: '10px'
    };

    return (
        <Col span={24} style={containerStyle}>
            <Row>
                <Col span={6}>
                    <Progress type="circle" percent={30} width={40} showInfo={false} strokeWidth={15}/>
                </Col>
                <Col span={12} offset={2}>
                    <h3 style={{fontSize: '15px', fontWeight: '700', color: primaryColor}}>{metricValue} (Rank {rank})</h3>
                    <h5 style={{fontSize: '13px'}}>{label}</h5>
                </Col>
            </Row>
        </Col>
    );
}
