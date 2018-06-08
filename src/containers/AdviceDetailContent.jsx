import * as React from 'react';
import {withRouter} from 'react-router';
import _ from 'lodash';
import {Spin, Row, Col, Tabs, Collapse, DatePicker, Radio, Input, Icon} from 'antd';
import {metricsHeaderStyle, shadowBoxStyle, primaryColor, metricsLabelStyle, metricsValueStyle, metricColor, adviceApprovalPending, adviceApproved, adviceRejected} from '../constants';
import {AqStockPortfolioTable, MetricItem, AdviceMetricsItems, AqRate, IconItem, WarningIcon, AqTag} from '../components';
import {MyChartNew} from './MyChartNew';
import medalIcon from '../assets/award.svg';
import {Utils} from '../utils';
import '../css/adviceDetail.css';

const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

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

    getWarning = field => {
        const {adviceDetail = {}} = this.props;
        const {detail = []} = adviceDetail.approval;
        const fieldItem = detail.filter(item => item.field === field)[0] || {field, reason: 'N/A', valid: false};
        return fieldItem;
    }

    getInvestmentObjWarning = field => {
        const {adviceDetail = {}} = this.props;
        const {investmentObjective = {}} = adviceDetail;
        const item = _.get(investmentObjective, field, {valid: true, reason: 'N/A'});
        return item;
    }

    getPortfolioWarnings = () => {
        const {adviceDetail = {}} = this.props;
        const {detail = []} = adviceDetail.approval;
        const lookupFields = ['sectorExposure', 'industryExposure', 'stockExposure'];
        let invalidCount = 0;
        const reasons = [];
        detail.map(item => {
            const lookUpItemIndex = lookupFields.indexOf(item.field);
            if (lookUpItemIndex !== -1 && !item.valid) {
                invalidCount++;
                reasons.push(item.reason);
            }
        });

        return {valid: invalidCount === 0, reasons};
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
            rating = 0,
            investmentObjective = {},
            approvalRequested = true,
            isAdmin = false,
            isPublic = false,
            approval = {}
        } = this.props.adviceDetail || {};
        const {
            annualReturn = 0, 
            totalReturns = 0, 
            averageReturns = 0, 
            dailyReturns = 0
        } = this.props.metrics || {};
        const {goal = {}, capitalization = {}, portfolioValuation = {}, sectors = {}, userText = {}} = investmentObjective;
        const defaultActiveKey = Utils.isLoggedIn() ? (isSubscribed || isOwner) ? ["1", "2","3"] : ["1", "3"] : ["1", "3"];
        const tickers = _.get(this.props, 'tickers', []);
        const {netValue = 0, dailyNAVChangePct = 0} = this.props.metrics || {};
        const netValueMetricItem = {
            value: netValue, 
            label: 'Net Value', 
            money:true, 
            isNetValue:true, 
            dailyChangePct:dailyNAVChangePct
        };
        const ownerColumns = ['name', 'symbol', 'shares', 'price', 'avgPrice', 'unrealizedPnL', 'sector', 'weight'];
        const notOwnerColumns = ['name', 'symbol', 'shares', 'price', 'sector', 'weight'];
        const portfolioTableColumns = isOwner ? ownerColumns : notOwnerColumns;
        const approvalStatus = _.get(approval, 'status', false);

        return (
            <Col xl={18} md={24} style={{...shadowBoxStyle, ...this.props.style}}>
                <Row className="row-container" type="flex" justify="space-between" align="middle">
                    <Col span={18}>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <h1 style={adviceNameStyle}>{name}</h1>
                            {
                                isPublic && !approvalStatus && !this.getWarning('name').valid && !approvalRequested &&
                                <WarningIcon reason={this.getWarning('name').reason}/>
                            }
                            {
                                (isOwner || isAdmin) && approvalRequested && isPublic &&
                                <AqTag 
                                        color='#FFAB00' 
                                        tooltipTitle={adviceApprovalPending}
                                        text='Approval Pending'
                                        tagStyle={{marginLeft: '10px'}}
                                />
                            }
                            {
                                (isOwner || isAdmin) && !approvalRequested && isPublic &&
                                <AqTag 
                                        color={approvalStatus ? primaryColor : metricColor.negative}
                                        tooltipTitle={approvalStatus ? adviceApproved : adviceRejected}
                                        text={approvalStatus ? 'Approved' : 'Rejected'}
                                        tagStyle={{marginLeft: '10px'}}
                                />
                            }
                        </div>
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
                        <AqTag 
                                tooltipTitle='Rebalancing Frequency: The advice is rebalanced/updated at this frequency'
                                tooltipPlacement='bottom'
                                color='#f58231'
                                text={this.props.adviceDetail.rebalanceFrequency}
                                icon='clock-circle-o'
                                iconStyle={{fontWeight: '400', marginRight: '5px'}}
                        />
                        {
                            !this.props.adviceDetail.isOwner &&
                            <AqTag 
                                    tooltipTitle='You are the owner of this advice'
                                    tooltipPlacement='bottom'
                                    icon='user'
                                    iconStyle={{marginRight: '5px'}}
                                    color='#3cb44b'
                                    text='Owner'
                            />
                        }
                        {
                            (this.props.adviceDetail.isSubscribed || this.props.adviceDetail.isFollowing) &&
                            <AqTag 
                                    tooltipTitle={this.props.adviceDetail.isSubscribed ? 'You are subscribed to this advice' : 'You have wislisted this advice'}
                                    text={this.props.adviceDetail.isSubscribed ? 'Subscribed' : 'Wishlisted'}
                                    color='rgb(24, 144, 255)'
                            />
                        }
                        {
                            this.props.adviceDetail.isOwner &&
                            <AqTag 
                                    color='#673AB7'
                                    tooltipTitle={this.props.adviceDetail.isPublic ? 'This advice is Public' : 'This advice is private'}
                                    text={this.props.adviceDetail.isPublic ? 'Public' : 'Private'}
                                    icon={this.props.adviceDetail.isPublic ? 'team' : 'lock'}
                                    iconStyle={{fontWeight: '400', fontSize: '15px', marginRight: '5px'}}
                            />
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
                        <Row className="row-container" >
                            <Col span={24}>
                                <Row>
                                    <Col span={24}>
                                        <InvestmentObjItem 
                                                label="Goal" 
                                                value={_.get(goal, 'field', '-')} 
                                                warning={isPublic && !approvalStatus && !this.getInvestmentObjWarning('goal').valid && !approvalRequested}
                                                reason={this.getInvestmentObjWarning('goal').reason}
                                        />
                                    </Col>
                                </Row>

                                <Row style={{marginTop: '15px'}}>
                                    <Col span={24} style={{marginTop: '10px'}}>
                                        <InvestmentObjItem label="Investor Type" value={_.get(goal, 'investorType', '-')}/>
                                    </Col>
                                </Row>

                                <Row style={{marginTop: '15px'}}>
                                    <Col span={24} style={{marginTop: '10px'}}>
                                        <InvestmentObjItem label="Suitability" value={_.get(goal, 'suitability', '-')}/>
                                    </Col>
                                </Row>
                            
                                <Row style={{marginTop: '15px'}}>
                                    <Col span={6}>
                                        <InvestmentObjItem  
                                                showTag 
                                                label="Valuation" 
                                                value={_.get(portfolioValuation, 'field', '-')}
                                                warning={isPublic && !approvalStatus && !this.getInvestmentObjWarning('portfolioValuation').valid && !approvalRequested}
                                                reason={this.getInvestmentObjWarning('portfolioValuation').reason}
                                        />
                                    </Col>
                                    <Col span={6}>
                                        <InvestmentObjItem 
                                                showTag 
                                                label="Capitalization" 
                                                value={_.get(capitalization, 'field', '-')}
                                                warning={isPublic && !approvalStatus && !this.getInvestmentObjWarning('capitalization').valid && !approvalRequested}
                                                reason={this.getInvestmentObjWarning('capitalization').reason}
                                        />
                                    </Col>
                                    <Col span={12}>
                                        <div style={{display: 'flex', flexDirection: 'column'}}>
                                            <div style={{
                                                    display: 'flex', 
                                                    flexDirection: 'row',
                                                    overflow: 'hidden',
                                                    overflowX: 'scroll'
                                                }}
                                            >
                                                {
                                                    _.get(sectors, 'detail', []).map((item, index) => {
                                                        return (
                                                            <AqTag 
                                                                    color={primaryColor}
                                                                    text={item}
                                                                    textStyle={{fontSize: '14px'}}
                                                            />
                                                        );
                                                    })
                                                }
                                            </div>
                                            <div style={{display: 'flex', flexDirection: 'row', marginTop: '5px'}}>
                                                <h3 
                                                        style={{fontSize: '13px', color: '#515151', fontWeight: '700'}}
                                                >
                                                    Sectors
                                                </h3>
                                                {
                                                    isPublic && 
                                                    isPublic && 
                                                    !approvalStatus && 
                                                    !this.getInvestmentObjWarning('sectors').valid &&
                                                    !approvalRequested &&
                                                    <WarningIcon 
                                                            reason={this.getInvestmentObjWarning('sectors').reason}
                                                    />
                                                }
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                            {
                                _.get(userText, 'detail', '').length > 0 &&
                                <Col span={24} style={{marginTop: '10px'}}>
                                    <div style={{display: 'flex', flexDirection: 'row'}}>
                                        <h3 style={{fontSize: '14px', fontWeight: '700'}}>Description</h3>
                                        {
                                            isPublic && 
                                            isPublic && 
                                            !approvalStatus && 
                                            !this.getInvestmentObjWarning('userText').valid &&
                                            !approvalRequested &&
                                            <WarningIcon 
                                                    reason={this.getInvestmentObjWarning('userText').reason}
                                            />
                                        }
                                    </div>
                                    <h5 style={{fontSize: '16px'}}>{_.get(userText, 'detail', '')}</h5>
                                </Col>
                            }
                            <Col span={24} style={{marginTop: '20px'}}>
                                <h5 style={{fontSize: '12px'}}>* All investors are advised to conduct their own independent research into individual stocks before making a purchase decision. In addition, investors are advised that past stock performance is not indicative of future price action.</h5>
                            </Col>
                        </Row>
                    </Panel>

                    {
                        (isSubscribed || isOwner || isAdmin) &&
                        <Panel
                            key="2"
                            style={customPanelStyle}
                            header={
                                <Row type="flex" justify="space-between">
                                    <Col span={6} style={{display: 'flex', flexDirection: 'row'}}>
                                        <h3 style={metricsHeaderStyle}>Portfolio</h3>
                                        {
                                            isPublic && 
                                            !approvalStatus && 
                                            !this.getPortfolioWarnings().valid &&
                                            !approvalRequested &&
                                            <WarningIcon 
                                                    content={
                                                        <div>
                                                            {
                                                                this.getPortfolioWarnings().reasons.map((reason, index) => {
                                                                    return <p key={index}>{reason}</p>
                                                                })
                                                            }
                                                        </div>
                                                    }
                                            />
                                        }
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
                                        columns={portfolioTableColumns}
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
        return (this.renderPageContent());
    }
}

const InvestmentObjItem = ({label, value, showTag = false, warning = false, reason= 'N/A'}) => {
    return (
        <div>
            {
                showTag 
                ?   <AqTag 
                            color={primaryColor}
                            text={value}
                            textStyle={{fontSize: '14px', fontWeight: 400}}
                    />
                :   <span style={{fontSize: '16px', fontWeight: '400'}}>
                        {value}
                    </span>
            }
            <div style={{display: 'flex', flexDirection: 'row', marginTop: '5px'}}>
                <h3 style={{fontSize: '13px', color: '#515151', fontWeight: '700'}}>{label}</h3>
                {
                    warning &&
                    <WarningIcon reason={reason}/>
                }
            </div>
        </div>
    );
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

