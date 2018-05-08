import * as React from 'react';
import axios from 'axios';
import SkyLight from 'react-skylight';
import Loading from 'react-loading-bar';
import {withRouter} from 'react-router';
import _ from 'lodash';
import moment from 'moment';
import {Row, Col, Divider, Tabs, Button, Modal, message, Card, Rate, Collapse, DatePicker, Radio, Input} from 'antd';
import {currentPerformanceColor, simulatedPerformanceColor, newLayoutStyle, metricsHeaderStyle, pageHeaderStyle, dividerNoMargin, loadingColor, pageTitleStyle, shadowBoxStyle, benchmarkColor, statusColor, cashStyle, primaryColor} from '../constants';
import UpdateAdvice from './UpdateAdvice';
import {AqTableMod, AqStockPortfolioTable, AqHighChartMod, MetricItem, AqCard, HighChartNew, HighChartBar, AdviceMetricsItems, AqRate} from '../components';
import {MyChartNew} from './MyChartNew';
import {generateColorData, Utils, getBreadCrumbArray, convertToDecimal,fetchAjax} from '../utils';
import '../css/adviceDetail.css';

const TabPane = Tabs.TabPane;
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
            netValue = 0, 
            totalReturn = 0, 
            nstocks = 0
        } = this.props.metrics || {};
        const {followers = 0, subscribers = 0} = this.props.adviceDetail || {};
        const metricsItems = [
            {value: subscribers, label: 'Subscribers'},
            {value: nstocks, label: 'Num. of Stocks'},
            {value: annualReturn, label: 'Annual Return', percentage: true, color:true, fixed: 2},
            {value: volatility, label: 'Volatility', percentage: true, fixed: 2},
            {value: totalReturn, label: 'Total Return', percentage: true, color:true, fixed: 2},
            //{value: maxLoss, label: 'Max. Loss', percentage: true, fixed: 2},
            {value: netValue, label: 'Net Value', money:true, isNetValue:true, dailyChangePct:dailyNAVChangePct},
        ]

        return <AdviceMetricsItems metrics={metricsItems} />
    };


    render() {
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
        const defaultActiveKey = !Utils.isLoggedIn() 
                ? "1" // Show description
                : isSubscribed || isOwner ? ["2","3"] : ["3"];
        const tickers = _.get(this.props, 'tickers', []);

        return (
            <Col xl={18} md={24} style={{...shadowBoxStyle, ...this.props.style}}>
                <Row className="row-container" type="flex" justify="space-between">
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
                    <Col xl={0} md={6}>
                        {this.props.renderActionButtons && this.props.renderActionButtons()}
                    </Col>
                </Row>
                <Row className="row-container">
                    {this.renderAdviceMetrics()}
                </Row>
                <Row>
                    <Col span={24} style={dividerStyle}></Col>
                </Row>
                <Collapse bordered={false} defaultActiveKey={defaultActiveKey} onChange={this.onCollapseChange}>
                    <Panel
                            key="1"
                            style={customPanelStyle}
                            header={<h3 style={metricsHeaderStyle}>Description</h3>}
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
                            <Row className="row-container" type="flex" justify="end" align="middle">
                                {isOwner && this.props.handlePortfolioStartDateChange  &&
                                    <Col span={6} style={{display: 'flex', justifyContent: 'flex-end', top: '225px', position:'absolute', zIndex:'2'}}>
                                        <DatePicker
                                            value={this.props.selectedPortfolioDate}
                                            onChange={this.props.handlePortfolioStartDateChange}
                                            allowClear={false}/>
                                    </Col>
                                }
                                <Col span={24} style={{marginTop: '-10px'}}>
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
                    {
                        Utils.isLoggedIn() &&
                        <Panel
                                key="3"
                                style={customPanelStyle}
                                header={<h3 style={metricsHeaderStyle}>Performance</h3>}
                            >
                            <Row className="row-container">
                                <MyChartNew series={tickers} chartId="advice-detail-chart"/>
                            </Row>
                        </Panel>
                    }
                </Collapse>
            </Col>
        )
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
    fontSize: '20px',
    color: '#353535'
};

const customPanelStyle = {
    background: 'transparent',
    borderRadius: 4,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
};
