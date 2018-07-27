import * as React from 'react';
import Loadable from 'react-loadable';
import Media from 'react-media';
import {withRouter} from 'react-router';
import _ from 'lodash';
import {Spin, Row, Col, Collapse, DatePicker, Radio, Icon, Select, Tooltip} from 'antd';
import {SegmentedControl} from 'antd-mobile';
import {metricsHeaderStyle, shadowBoxStyle, primaryColor, metricsLabelStyle, metricsValueStyle, metricColor, adviceApprovalPending, adviceApproved, adviceRejected, advicePublic, advicePrivate, horizontalBox, verticalBox} from '../constants';
import {AqTag} from '../components/AqTag';
import {WarningIcon} from '../components/WarningIcon'
import {IconItem} from '../components/IconItem';
import {AqRate} from '../components/AqRate';
import {formatMetric} from '../containers/Contest/utils';
import {metricDefs} from '../containers/Contest/constants';
import {AdviceMetricsItems} from '../components/AdviceMetricsItems';
import {MetricItem} from '../components/MetricItem';
import {AqStockPortfolioTable} from '../components/AqStockPortfolioTable';
import medalIcon from '../assets/award.svg';
import {Utils} from '../utils';
import '../css/adviceDetail.css';

const MyChartNew = Loadable({
    loader: () => import('./MyChartNew'),
    loading: () => <div>Loading</div>
});

const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const Panel = Collapse.Panel;

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

class AdviceDetailContentImpl extends React.Component {
    constructor(props) {
        super(props);
        const participatedContestLength = _.get(props, 'participatedContests', []).length;
        this.state = {
            selectedContestId: _.get(props, `participatedContests[${participatedContestLength - 1}]._id`, null),
            showCurrentRankView: true
        }
    }
    
    renderAdviceMetrics = () => {
        const {
            annualReturn = 0, 
            volatility = 0, 
            maxLoss = 0, 
            dailyNAVChangePct = 0, 
            totalReturn = 0, 
            nstocks = 0
        } = this.props.metrics || {};
        const {followers = 0, subscribers = 0, contestOnly} = this.props.adviceDetail || {};
        var subscriberOrFollowers = contestOnly ? {value: followers, label: 'Wishlisters'} : {value: subscribers, label: 'Subscribers'};
        const metricsItems = [
            subscriberOrFollowers,
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

    handleContestDropdownChange = contestId => {
        this.setState({selectedContestId: contestId});
    }

    renderParticipatedContestDropdown = () => {
        const participatedContests = [...this.props.participatedContests];
        return (
            <Select value={this.state.selectedContestId} onChange={this.handleContestDropdownChange}>
                {
                    participatedContests.map((contest, index) => {
                        return <Option key={index} value={contest._id}>{contest.name}</Option>
                    })
                }
            </Select>
        );
    }

    processMetricsForSelectedAdvice = (selectedAdvice, metricType) => {
        if (selectedAdvice !== undefined) {
            const adviceMetrics = _.get(selectedAdvice, `adviceSummary.latestRank.rating.${metricType}.detail`, []);

            var pctMetrics = ['annualReturn', 'volatility', 'maxLoss'];
            var labels =  {
                annualReturn: {label: "Excess Return", index: 0},
                volatility: {label: "Tracking Error", index: 1},
                maxLoss: {label: 'Maximum Loss', index: 2},
                sharpe: {label: 'Information Ratio', index: 3},
                calmar: {label: 'Calmar Ratio', index: 4},
                concentration: {label: 'Concentration', index: 5}
            };
                        
            return adviceMetrics.map(metricItem => {
                const field = metricItem.field;
                var rawVal = metricItem.metricValue;
                if (field == "maxLoss") {
                    rawVal *=-1;
                }

                var idx = pctMetrics.indexOf(field);
                const adjustedVal = idx != -1 ? formatMetric(rawVal, "pct") : formatMetric(rawVal);
                const color = ["annualReturn", "maxLoss"].indexOf(field) != -1 ? rawVal > 0 ? metricColor.positive : rawVal < 0 ? metricColor.negative : '#353535' : '#353535';

                return {
                    metricValue: adjustedVal,
                    rank: metricItem.rank,
                    label: _.get(labels, `${metricItem.field}.label`, ''),
                    index: _.get(labels, `${metricItem.field}.index`, 0),
                    tooltip: _.get(metricDefs, field, ""),
                    color: color
                }
            }).sort((a,b) => {return a.index < b.index ? -1 : 1});

        } else {
            return metrics;
        }
    }

    onRankRadioClick = () => {
        this.setState({showCurrentRankView: !this.state.showCurrentRankView})
    }

    renderPageContent() {
        const {
            name = '', 
            advisor = '', 
            updatedDate = '', 
            isSubscribed = false, 
            isOwner = false, 
            rating = 0,
            investmentObjective = {},
            approvalRequested = true,
            isAdmin = false,
            isPublic = false,
            approval = {},
            contestOnly = false,
            active = false,
            withdrawn = false,
            prohibited = false
        } = this.props.adviceDetail || {};
        const {
            annualReturn = 0, 
            totalReturns = 0, 
            averageReturns = 0, 
            dailyReturns = 0
        } = this.props.metrics || {};
        const {goal = {}, capitalization = {}, portfolioValuation = {}, userText = {}} = investmentObjective;
        const defaultActiveKey = Utils.isLoggedIn() ? (isSubscribed || isOwner) ? ["1", "2","3", "5"] : ["1","5","3"] : ["1","5","3"];
        const tickers = _.get(this.props, 'tickers', []);
        const {netValue = 0, dailyNAVChangePct = 0} = this.props.metrics || {};
        const netValueMetricItem = {
            value: netValue, 
            label: 'Net Value', 
            money:true, 
            isNetValue:true, 
            dailyChangePct:dailyNAVChangePct
        };
        const ownerColumns = ['name', 'symbol', 'shares', 'price', 'avgPrice', 'unrealizedPnL', 'weight'];
        const notOwnerColumns = ['name', 'symbol', 'shares', 'price', 'sector', 'weight'];
        const portfolioTableColumns = ((isOwner || isAdmin) && !this.props.preview) ? ownerColumns : notOwnerColumns;
        const approvalStatus = _.get(approval, 'status', false);

        //Use from portfolio (instead of Investment Objective)
        let sectors;
        if (this.props.preview) {
            sectors = this.props.positions ? _.uniq(this.props.positions.map(item => _.get(item, 'sector', '')).filter(item => item != '')) : [];
        } else {
            sectors = this.props.positions ? _.uniq(this.props.positions.map(item => _.get(item, 'security.detail.Sector', '')).filter(item => item != '')) : [];
        }

        // Selected participated contest operation
        const selectedContest = this.props.participatedContests.filter(contest => contest._id === this.state.selectedContestId)[0];
        const currentMetrics = this.processMetricsForSelectedAdvice(selectedContest, 'current');
        const simulatedMetrics = this.processMetricsForSelectedAdvice(selectedContest, 'simulated');

        return (
            <Col xl={18} md={24} style={{...shadowBoxStyle, ...this.props.style, marginBottom: '20px'}}>
                <Row className="row-container" type="flex" justify="space-between" align="middle">
                    <Col span={18}>
                        <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                            <h1 style={adviceNameStyle}>{name}</h1>
                            {
                                !contestOnly 
                                && isPublic 
                                && !approvalStatus 
                                && !this.getWarning('name').valid 
                                && !approvalRequested 
                                && <WarningIcon reason={this.getWarning('name').reason}/>
                            }
                            {
                                !contestOnly && (isOwner || isAdmin) && approvalRequested && isPublic &&
                                <AqTag 
                                        color='#FFAB00' 
                                        tooltipTitle={adviceApprovalPending}
                                        text='Approval Pending'
                                        tagStyle={{marginLeft: '10px'}}
                                />
                            }
                            {
                                !contestOnly && (isOwner || isAdmin) && !approvalRequested && isPublic &&
                                <AqTag 
                                        color={approvalStatus ? primaryColor : metricColor.negative}
                                        tooltipTitle={approvalStatus ? adviceApproved : adviceRejected}
                                        text={approvalStatus ? 'Approved' : 'Rejected'}
                                        tagStyle={{marginLeft: '10px'}}
                                />
                            }
                        </div>
                        {
                            advisor.user && !contestOnly ?
                            <h5 
                                    style={{...userStyle, cursor: 'pointer'}} 
                                    onClick={() => this.props.history.push(`/dashboard/advisorProfile/${advisor._id}`)}
                            >
                                By <span style={{color: primaryColor}}>{advisor.user.firstName} {advisor.user.lastName}</span>
                                <span style={dateStyle}>{updatedDate}</span>
                            </h5>
                        :
                            <h5 style={{...userStyle, marginTop:'-15px'}} >
                                By <span style={{color: primaryColor}}>{advisor.user.firstName} {advisor.user.lastName}</span>
                                <span style={dateStyle}>{updatedDate}</span>
                            </h5>

                        }
                        {
                            !this.props.preview && !contestOnly &&
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
                        {
                            !contestOnly &&
                            <AqTag 
                                tooltipTitle='Rebalancing Frequency: The advice is rebalanced/updated at this frequency'
                                tooltipPlacement='bottom'
                                color='#f58231'
                                text={this.props.adviceDetail.rebalanceFrequency}
                                icon='clock-circle-o'
                                iconStyle={{fontWeight: '400', marginRight: '5px'}}
                            />  
                        }
                        {
                            isOwner &&
                            <AqTag 
                                tooltipTitle={contestOnly ? 'You are the owner of this contest entry' : 'You are the owner of this advice'}
                                tooltipPlacement='bottom'
                                icon='user'
                                iconStyle={{marginRight: '5px'}}
                                color='#3cb44b'
                                text='Owner'
                            />
                        }
                        {
                            !contestOnly && (this.props.adviceDetail.isSubscribed || this.props.adviceDetail.isFollowing) &&
                            <AqTag 
                                tooltipTitle={this.props.adviceDetail.isSubscribed ? 'You are subscribed to this advice' : 'You have wislisted this advice'}
                                text={this.props.adviceDetail.isSubscribed ? 'Subscribed' : 'Wishlisted'}
                                color='rgb(24, 144, 255)'
                            />
                        }
                        {
                            !contestOnly && this.props.adviceDetail.isOwner &&
                            <AqTag 
                                    color='#673AB7'
                                    tooltipTitle={this.props.adviceDetail.isPublic ? advicePublic : advicePrivate}
                                    text={this.props.adviceDetail.isPublic ? 'Public' : 'Private'}
                                    icon={this.props.adviceDetail.isPublic ? 'team' : 'lock'}
                                    iconStyle={{fontWeight: '400', fontSize: '15px', marginRight: '5px'}}
                            />
                        }
                        {
                            contestOnly && active &&
                            <AqTag 
                                    color={primaryColor}
                                    tooltipTitle="This is an active entry"
                                    text="Active"
                                    tagStyle={{marginLeft: '10px'}}
                            />
                        }
                        {
                            contestOnly && withdrawn &&
                            <AqTag 
                                    color={metricColor.neutral}
                                    tooltipTitle="This Entry is withdrawn"
                                    text="Withdrawn"
                                    tagStyle={{marginLeft: '10px'}}
                            />
                        }
                        {
                            contestOnly && prohibited &&
                            <AqTag 
                                    color={metricColor.negative}
                                    tooltipTitle="This is entry is prohibited from the current entry"
                                    text="Prohibited"
                                    tagStyle={{marginLeft: '10px'}}
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
                                    <RadioButton value={true}>Active</RadioButton>
                                    <RadioButton value={false}>Historical</RadioButton>
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
                    {
                        !contestOnly &&
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

                                    <Row style={{marginTop: '25px'}}>
                                        <Col span={24}>
                                            <InvestmentObjItem label="Investor Type" value={_.get(goal, 'investorType', '-')}/>
                                        </Col>
                                    </Row>

                                    <Row style={{marginTop: '25px'}}>
                                        <Col span={24}>
                                            <InvestmentObjItem label="Suitability" value={_.get(goal, 'suitability', '-')}/>
                                        </Col>
                                    </Row>
                                
                                    <Row style={{marginTop: '25px'}}>
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
                                                        sectors.map((item, index) => {
                                                            return (
                                                                <AqTag 
                                                                        key={index}
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
                                                    {/*
                                                        isPublic && 
                                                        isPublic && 
                                                        !approvalStatus && 
                                                        !this.getInvestmentObjWarning('sectors').valid &&
                                                        !approvalRequested &&
                                                        <WarningIcon 
                                                                reason={this.getInvestmentObjWarning('sectors').reason}
                                                        />
                                                    */}
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
                                                !contestOnly &&
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
                    }
                    {
                        contestOnly && selectedContest &&
                        <Panel 
                                key="5"
                                style={customPanelStyle}
                                header={<h3 style={metricsHeaderStyle}>Contest Detail</h3>}
                        >
                            <Row>
                                <AdviceContestMetrics 
                                    selectedAdvice={selectedContest.adviceSummary}
                                    onPerformanceToggle={this.onRankRadioClick}
                                    currentMetrics={currentMetrics}
                                    simulatedMetrics={simulatedMetrics}
                                    advisorName=''
                                    adviceName=''
                                    view={this.state.showCurrentRankView}
                                    contestDropdown={this.renderParticipatedContestDropdown}
                                />
                            </Row>
                        </Panel>
                    }
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
                                            !contestOnly &&
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

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(nextState, this.state)) {
            return true;
        } 
        return false;
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
            <div style={{display: 'flex', flexDirection: 'row', marginTop: '0px'}}>
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

export const AdviceContestMetrics = ({selectedAdvice, view, onPerformanceToggle, currentMetrics, simulatedMetrics, contestDropdown}) => {
    return (
        <Row>

            <Col 
                span={24} 
                style={{
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    top: '-40px', 
                    position:'absolute', 
                }}>
                {contestDropdown && contestDropdown()}
            </Col>
            
            <Col>          
                <div style={{display: 'flex', justifyContent: 'center', margin: '0 0 20px 0'}}>
                    <Media 
                        query="(max-width: 600px)"
                        render={() => 
                            <SegmentedControl
                                style={{width: '50%'}}
                                values={['Active', 'Historical']}
                                onChange={onPerformanceToggle}
                                selectedIndex={view === true ? 0 : 1}
                            />
                        }
                    />
                    <Media 
                        query="(min-width: 601px)"
                        render={() => 
                            <RadioGroup size="small" onChange={onPerformanceToggle} defaultValue="0">
                                <RadioButton value="0">Active</RadioButton>
                                <RadioButton value="1">Historical</RadioButton>
                            </RadioGroup>
                        }
                    />
                </div>

                {view ?
                    <MetricContainer 
                        header={
                            <MetricHeader 
                                rank={_.get(selectedAdvice, 'latestRank.rating.current.rank', null)}
                                header='Active Performance'
                                score={(_.get(selectedAdvice, 'latestRank.rating.current.value', 0) || 0).toFixed(2)}
                            />
                        }
                        metrics={currentMetrics} 
                    />
                :
                    <MetricContainer 
                        metrics={simulatedMetrics} 
                        header={
                            <MetricHeader 
                                rank={_.get(selectedAdvice, 'latestRank.rating.simulated.rank', null)}
                                header='Historical Performance'
                                score={(_.get(selectedAdvice, 'latestRank.rating.simulated.value', 0) || 0).toFixed(2)}
                            />
                        }
                    />
                }
            </Col>
        </Row>
    );
}

export const MetricHeader = ({rank, header, score}) => {
    return (
        <Row >
            <Col span={24} style={verticalBox}>
                <h3 style={{fontSize: global.screen.width > 600 ? '16px' : '14px', fontWeight: 400}}>
                    Score: 
                    <span 
                            style={{
                                fontSize: global.screen.width > 600 ? '16px' : '14px', 
                                fontWeight: 400
                            }}
                    >   
                        {score}
                    </span>
                </h3>
            </Col>
            <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                <h3 
                        style={{
                            marginLeft: '5px', 
                            fontWeight: 400, 
                            fontSize: global.screen.width > 600 ? '16px' : '14px', 
                            marginBottom:'10px'
                        }}
                >
                    <span style={{color: primaryColor, marginRight:'4px'}}>{rank}</span>
                    {header}
                </h3>
            </Col>
            
        </Row>
    );
}

export const MetricContainer = ({header, metrics}) => {
    return (
        <Row style={{padding: '10px'}}>
            <Col span={24} style={{marginBottom: '10px'}}>
                {header}
            </Col>
            {
                metrics.map((metric, index) => {
                
                    if (metric !== undefined) {
                        return (
                            <Col 
                                    key={index}
                                    span={8} 
                                    style={{
                                        ...verticalBox, 
                                        padding: '5px',
                                    }}
                            >
                                <ContestMetricItems key={index} {...metric} />
                            </Col>
                        );
                    }
                })
            }
        </Row>
    );
}

export const ContestMetricItems = ({metricValue, rank, label, tooltip, color}) => {
    const containerStyle = {
        marginBottom: '10px'
    };
    const metricValueStyle = {
        fontSize: '15px', 
        fontWeight: '700', 
        color: primaryColor
    };

    return (
        <Col span={24} style={containerStyle}>
            <Row type="flex" justify="center" style={{position: 'relative'}}>
                <Col 
                    span={4} 
                    style={{
                        ...horizontalBox, 
                        position: 'absolute',
                        left: '5px',
                        alignItems: 'flex-start', 
                        justifyContent: 'flex-start'
                    }}
                >
                </Col>
                <Col span={20} style={{...verticalBox, width: 'fit-content'}}>
                    <h5 
                            style={{
                                fontSize: global.screen.width > 600 ? '18px' : '16px', 
                                display: 'inline-block', 
                                fontWeight: 400, 
                                color: color
                            }}
                    >
                        {metricValue}
                    </h5>
                    <Tooltip title={tooltip} placement="top">
                        <h5 
                                style={{
                                    fontSize: global.screen.width > 600 ? '16px' : '13px', 
                                    display: 'inline-block', 
                                    fontWeight: 400
                                }}
                        >
                            <span style={{backgroundColor: '#fff', color: primaryColor, marginRight: '4px'}}>{rank}</span>
                            {label}
                        </h5>
                    </Tooltip>
                    
                </Col>
            </Row>
        </Col>
    );
}

const userStyle = {
    fontWeight: 700,
    fontSize: '12px',
    color: '#595959'
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

const adviceNameStyle = {
    fontSize: '24px',
    color: '#353535',
};

const customPanelStyle = {
    background: 'transparent',
    borderRadius: 4,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
};

