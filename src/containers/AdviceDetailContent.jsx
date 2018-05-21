import * as React from 'react';
import axios from 'axios';
import SkyLight from 'react-skylight';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Spin, Row, Col, Divider, Tabs, Button, Modal, message, Card, Rate, Collapse, DatePicker, Radio, Input, Switch, Icon, Tag, Tooltip} from 'antd';
import {currentPerformanceColor, simulatedPerformanceColor, newLayoutStyle, metricsHeaderStyle, pageHeaderStyle, dividerNoMargin, loadingColor, pageTitleStyle, shadowBoxStyle, benchmarkColor, statusColor, cashStyle, primaryColor, metricsLabelStyle, metricsValueStyle} from '../constants';
import UpdateAdvice from './UpdateAdvice';
import {AqTableMod, AqStockPortfolioTable, AqHighChartMod, MetricItem, AqCard, HighChartNew, HighChartBar, AdviceMetricsItems, AqRate, IconItem} from '../components';
import {MyChartNew} from './MyChartNew';
import medalIcon from '../assets/award.svg';
import {generateColorData, Utils, getBreadCrumbArray, convertToDecimal,fetchAjax} from '../utils';
import '../css/adviceDetail.css';

const TabPane = Tabs.TabPane;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;
const {TextArea} = Input;

class AdviceDetailContentImpl extends React.Component {
    
    renderAdviceMetrics = () => {
        const {
            annualReturn = 0, 
            volatility = 0, 
            maxLoss = 0, 
            dailyNAVChangePct = 0, 
            totalReturn = 0, 
            nstocks = 0
        } = this.props.metrics || {};
        const {followers = 0, subscribers = 0} = this.props.adviceDetail || {};
        const metricsItems = [
            {value: subscribers, label: 'Subscribers'},
            {value: nstocks, label: 'Num. of Stocks'},
            {value: annualReturn, label: 'Annual Return', percentage: true, color: true, fixed: 2, tooltipText: `Compounded annual growth rate ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            {value: volatility, label: 'Volatility', percentage: true, fixed: 2, tooltipText: `Annualized standard deviation of daily returns ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            {value: totalReturn, label: 'Total Return', percentage: true, color:true, fixed: 2, tooltipText: `Total return ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            {value: -1*maxLoss, color:true, label: 'Maximum Loss', percentage: true, fixed: 2, tooltipText: `Maximum drop from the peak return ${this.props.performanceType == "Simulated" ? "over last year (simulated) for Current Portfolio" : "since inception"}`},
            // {value: netValue, label: 'Net Value', money:true, isNetValue:true, dailyChangePct:dailyNAVChangePct},
        ]

        return (
            <Spin spinning={this.props.loading}>
                <AdviceMetricsItems metrics={metricsItems} />
            </Spin>
        );
    };

    renderTrendingApprovedIcon = () => {
        if (this.props.adviceDetail.approvalStatus === 'approved') {
            return (
                <IconItem 
                    src={medalIcon} 
                    imageStyle={{transform: 'scale(0.7, 0.7)'}} 
                    labelStyle={{marginLeft: '5px', color:'teal'}}
                    label="Approved"
                />
            );
    
        }

        return null;
    }

    renderPageContent() {
        const {
            name = '', 
            heading = '', 
            description = '', 
            advisor = '', 
            updatedDate = '', 
            isSubscribed = false, 
            isOwner = false, 
            rating = 0
        } = this.props.adviceDetail || {};
        const {
            annualReturn = 0, 
            totalReturns = 0, 
            averageReturns = 0, 
            dailyReturns = 0
        } = this.props.metrics || {};
        const defaultActiveKey = Utils.isLoggedIn() ? (isSubscribed || isOwner) ? ["2","3"] : ["3"] : ["3"];
        const tickers = _.get(this.props, 'tickers', []);
        const {netValue = 0, dailyNAVChangePct = 0} = this.props.metrics || {};
        const netValueMetricItem = {
            value: netValue, 
            label: 'Net Value', 
            money:true, 
            isNetValue:true, 
            dailyChangePct:dailyNAVChangePct
        };

        return (
            <Col xl={18} md={24} style={{...shadowBoxStyle, ...this.props.style}}>
                <Row className="row-container" type="flex" justify="space-between" align="middle">
                    <Col span={18}>
                        <h1 style={adviceNameStyle}>{name}</h1>
                        {
                            advisor.user &&
                            <h5 
                                    style={{...userStyle, cursor: 'pointer'}} 
                                    onClick={() => this.props.history.push(`/advisordashboard/advisorProfile/${advisor._id}`)}
                            >
                                By <span style={{color: primaryColor}}>{advisor.user.firstName} {advisor.user.lastName}</span>
                                <span style={dateStyle}>{updatedDate}</span>
                            </h5>
                        }
                        {
                            !this.props.preview &&
                            <AqRate value={rating} />
                        }
                    </Col>
                    <Col span={6} style={{display: 'flex', justifyContent: 'flex-end'}}>
                        <Spin spinning={this.props.loading}>
                            <MetricItem 
                                    valueStyle = {{
                                        ...metricsValueStyle, 
                                        fontSize: '24px', 
                                        fontWeight: '700', 
                                        color: '#323C5A'
                                    }} 
                                    labelStyle={metricsLabelStyle} 
                                    value={netValueMetricItem.value} 
                                    label={netValueMetricItem.label} 
                                    money={netValueMetricItem.money}
                                    percentage={netValueMetricItem.percentage}
                                    color={netValueMetricItem.color}
                                    style={{padding: '20px'}} 
                                    isNetValue={netValueMetricItem.isNetValue}
                                    dailyChange={netValueMetricItem.dailyChange || null}
                                    dailyChangePct={netValueMetricItem.dailyChangePct || null}
                                />
                        </Spin>
                    </Col>
                    <Col 
                            span={24} 
                            style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginTop: '10px'}}
                    >
                        <Tooltip title="Rebalancing Frequency: The advice is rebalanced/updated at this frequency" placement="rightBottom">
                            <Tag 
                                style={{
                                    color:'black', 
                                    border:'1px solid #f58231', 
                                    paddingTop:'1px',
                                    cursor: 'auto'}}>
                                <Icon type="clock-circle-o" style={{fontWeight: '400', color:'#f58231'}}/>
                                <span 
                                        style={{marginLeft: '5px', color:'#f58231'}}
                                >
                                    {this.props.adviceDetail.rebalanceFrequency}
                                </span>
                            </Tag>
                        </Tooltip>
                        {
                            this.props.adviceDetail.isOwner &&
                            <Tag 
                                style={{
                                    // width:'65px', 
                                    paddingTop:'1px',
                                    cursor: 'auto',
                                    border: '1px solid #3cb44b'
                                }}>
                                <Icon type="user" style={{fontWeight: '400', color:'#3cb44b'}}/>
                                <span 
                                        style={{marginLeft: '5px', color:'#3cb44b'}}
                                >
                                    Owner
                                </span>
                            </Tag>
                        }
                        {
                            (this.props.adviceDetail.isSubscribed || this.props.adviceDetail.isFollowing) &&
                            <Tag 
                                style={{
                                    paddingTop:'1px',
                                    cursor: 'auto',
                                    border: '1px solid rgb(24, 144, 255)'
                                }}>
                                <span 
                                        style={{marginLeft: '5px', color:'rgb(24, 144, 255)'}}
                                >
                                    {
                                        this.props.adviceDetail.isSubscribed 
                                        ? "Subscribed"
                                        : "Wishlisted"
                                    }
                                </span>
                            </Tag>
                        }
                        {
                            this.props.adviceDetail.isOwner &&
                            <Tag style={{border: '1px solid #673AB7', cursor: 'auto'}}>
                                <Icon 
                                        type={this.props.adviceDetail.isPublic ? 'team' : 'lock'} 
                                        style={{
                                            fontWeight: '400', 
                                            color:'#673AB7', 
                                            fontSize: '15px',
                                            // marginTop: '4px'
                                        }}
                                />
                                <span style={{color: '#673AB7', marginLeft: '5px'}}>
                                    {
                                        this.props.adviceDetail.isPublic ? 'Public' : 'Private'
                                    }
                                </span>
                            </Tag>
                        }
                        {this.renderTrendingApprovedIcon()}
                    </Col>
                </Row>
                <div style={{width: '100%', height: '1px', backgroundColor: '#e8e8e8'}}></div>
                <Row className="row-container" style={{marginTop: '5px'}}>
                    <Col 
                            span={24} 
                            style={{
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                marginBottom: '10px',
                            }}
                    >
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center', marginLeft: '-5px'}}>
                            <Icon type="down"/>
                            <h3 style={{fontSize: '14px', fontWeight: 700, marginLeft: '10px'}}>Metrics</h3>
                        </div>
                        { this.props.showPerformanceToggle &&
                            <div style={{marginLeft: '5px'}}>
                                <RadioGroup 
                                        defaultValue={false} 
                                        size="small" onChange={this.props.handlePerformanceToggleChange}>
                                    <RadioButton value={true}>Realized</RadioButton>
                                    <RadioButton value={false}>Simulated</RadioButton>
                                </RadioGroup>
                            </div>
                        }
                    </Col>
                    <Col span={24}>
                        {this.renderAdviceMetrics()}
                    </Col>
                </Row>
                <Row>
                    <Col span={24} style={dividerStyle}></Col>
                </Row>
                <Collapse 
                        bordered={false} 
                        defaultActiveKey={defaultActiveKey} 
                        onChange={this.onCollapseChange}
                >
                    <Panel
                            key="1"
                            style={customPanelStyle}
                            header={<h3 style={metricsHeaderStyle}>Investment Objective</h3>}
                    >
                        <Row className="row-container">
                            <Col span={24}>
                                <h5 style={{...textStyle, marginTop: '-10px', marginLeft: '20px'}}>{description}</h5>
                            </Col>
                        </Row>
                    </Panel>

                    {
                        (isSubscribed || isOwner) &&

                        <Panel
                            key="2"
                            style={customPanelStyle}
                            header={
                                <Row type="flex" justify="space-between">
                                    <Col span={6}>
                                        <h3 style={metricsHeaderStyle}>Portfolio</h3>
                                    </Col>
                                </Row>
                            }>
                            <Row className="row-container" type="flex" justify="end" align="middle" style={{position: 'relative'}}>
                                {isOwner && this.props.handlePortfolioStartDateChange  &&
                                    <Col 
                                            span={6} 
                                            style={{
                                                display: 'flex', 
                                                justifyContent: 'flex-end', 
                                                top: '-40px', 
                                                position:'absolute', 
                                            }}
                                    >
                                        <DatePicker
                                            value={this.props.selectedPortfolioDate}
                                            onChange={this.props.handlePortfolioStartDateChange}
                                            allowClear={false}/>
                                    </Col>
                                }
                                <Col span={24}>
                                    <AqStockPortfolioTable
                                        composition
                                        portfolio={{positions: this.props.positions || []}}
                                        updateTicker={this.props.updateTicker}
                                        processedPositions={this.props.preview}
                                    />
                                </Col>
                            </Row>
                        </Panel>
                    }
                    <Panel
                            key="3"
                            style={customPanelStyle}
                            header={<h3 style={metricsHeaderStyle}>Performance</h3>}
                        >
                        <Row className="row-container">
                            <Spin spinning={this.props.loading}>
                                <MyChartNew series={tickers} chartId="advice-detail-chart"/>
                            </Spin>
                        </Row>
                    </Panel>
                </Collapse>
            </Col>
        )
    }

    render() {
        return (
            <React.Fragment>
                {/* <Loading
                    show={this.props.loading}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                /> */}
                {
                    // !this.props.loading && 
                    this.renderPageContent()
                }
            </React.Fragment>
        );
    }
}

export const AdviceDetailContent = withRouter(AdviceDetailContentImpl);

const cardItemStyle = {
    border: '1px solid #444'
};

const metricItemStyle = {
    padding: '10px'
};

const userStyle = {
    fontWeight: 700,
    fontSize: '12px',
    color: '#595959'
};

const textStyle = {
    fontSize: '14px',
    marginTop: '10px'
};

const dateStyle = {
    color: '#757474',
    fontWeight: 500,
    marginLeft: '10px'
};

const dividerStyle = {
    backgroundColor: '#E0E0E0',
    height: '1px'
};

const labelStyle = {
    fontSize: '13px'
};

const valueStyle = {
    fontSize: '16px',
    fontWeight: '400',
    color: '#555454'
};

const adviceNameStyle = {
    fontSize: '24px',
    color: '#353535',
    // fontWeight: 700
};

const customPanelStyle = {
    background: 'transparent',
    borderRadius: 4,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
};
