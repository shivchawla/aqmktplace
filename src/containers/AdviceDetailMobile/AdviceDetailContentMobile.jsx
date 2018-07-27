import * as React from 'react';
import Loadable from 'react-loadable';
import {withRouter} from 'react-router';
import _ from 'lodash';
import {Spin, Row, Col, Collapse, Radio, Icon, Button, Select} from 'antd';
import {SegmentedControl} from 'antd-mobile';
import {formatMetric, contestMetrics as metrics} from '../Contest/utils';
import {metricDefs} from '../Contest/constants';
import {horizontalBox, metricsHeaderStyle, shadowBoxStyle, primaryColor, metricsLabelStyle, metricsValueStyle, metricColor, adviceApprovalPending, adviceApproved, adviceRejected} from '../../constants';
import {AqTag} from '../../components/AqTag';
import {AdviceContestMetrics, MetricHeader, MetricContainer} from '../../containers/AdviceDetailContent';
import {WarningIcon} from '../../components/WarningIcon'
import {IconItem} from '../../components/IconItem'
import {AqRate} from '../../components/AqRate';
import {PositionItems} from './PositionItems';
import {MetricItem} from '../../components/MetricItem';
import medalIcon from '../../assets/award.svg';
import {Utils} from '../../utils';
import '../../css/adviceDetail.css';
import './adviceDetailMobile.css';

const MyChartNew = Loadable({
    loader: () => import('../MyChartNew'),
    loading: () => <div>Loading</div>
});
const Option = Select.Option;
const Panel = Collapse.Panel;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class AdviceDetailContentImpl extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            selectedContestId: _.get(props, `participatedContests[${props.participatedContests.length - 1}]._id`, null),
            showCurrentRankView: true
        };
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
            // <Spin spinning={this.props.loading}>
            
                metricsItems.map((item, index) => (
                    <Col key={index} span={8} style={{marginTop: index > 2 ? '20px' : 0}}>
                        <MetricItem
                            type="mobile" 
                            key={index}
                            valueStyle = {{...metricsValueStyle, fontSize: '22px', textAlign: 'center'}} 
                            labelStyle={metricsLabelStyle} 
                            value={item.value} 
                            label={item.label} 
                            money={item.money}
                            percentage={item.percentage}
                            color={item.color}
                            style={{padding: '10px'}} 
                            isNetValue={item.isNetValue}
                            dailyChange={item.dailyChange || null}
                            dailyChangePct={item.dailyChangePct || null}
                            tooltipText={item.tooltipText || null}
                        />
                    </Col>
                ))
            
            // </Spin>
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
        this.setState({showCurrentRankView: !this.state.showCurrentRankView});
    }

    redirectToLogin = () => {
        Utils.localStorageSave('redirectToUrlFromLogin', this.props.match.url);
        this.props.history.push('/login');
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

    renderPageContent() {
        const {
            name = '', 
            advisor = '', 
            updatedDate = '', 
            isSubscribed = false, 
            isOwner = false, 
            isFollowing = false,
            rating = 0,
            investmentObjective = {},
            approvalRequested = true,
            isAdmin = false,
            isPublic = false,
            approval = {},
            unsubscriptionPending = false,
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
        const {goal = {}, capitalization = {}, portfolioValuation = {}, sectors = {}, userText = {}} = investmentObjective;
        const defaultActiveKey = Utils.isLoggedIn() ? (isSubscribed || isOwner) ? ["1", "2","3"] : ["1", "2", "3"] : ["1", "2", "3"];
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
        // Selected participated contest operation
        const selectedContest = this.props.participatedContests.filter(contest => contest._id === this.state.selectedContestId)[0];
        const currentMetrics = this.processMetricsForSelectedAdvice(selectedContest, 'current');
        const simulatedMetrics = this.processMetricsForSelectedAdvice(selectedContest, 'simulated');

        return (
            <Col span={24} style={{backgroundColor: '#fff'}}>
                <Row className="row-container" type="flex" justify="center" align="middle">
                    <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                        <div style={{...adviceNameStyle, textAlign: 'center'}}>{name}</div>
                    </Col>
                    <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                        {
                            advisor.user &&
                            <h5 
                                    style={{...userStyle, cursor: 'pointer'}} 
                                    onClick={() => this.props.history.push(`/dashboard/advisorProfile/${advisor._id}`)}
                            >
                                By <span style={{color: primaryColor}}>{advisor.user.firstName} {advisor.user.lastName}</span>
                                <span style={dateStyle}>{updatedDate}</span>
                            </h5>
                        }
                    </Col>
                    <Col span={24} style={{textAlign: 'center'}}>
                        {
                            !this.props.preview &&
                            <AqRate value={rating} />
                        }
                    </Col>
                    <Col span={24} style={{...horizontalBox, justifyContent: 'center', marginTop: '10px'}}>
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
                                    tooltipTitle='You are the owner of this advice'
                                    tooltipPlacement='bottom'
                                    icon='user'
                                    iconStyle={{marginRight: '5px'}}
                                    color='#3cb44b'
                                    text='Owner'
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
                        {
                            (isSubscribed || isFollowing) &&
                            <AqTag 
                                    tooltipTitle={isSubscribed ? 'You are subscribed to this advice' : 'You have wislisted this advice'}
                                    text={isSubscribed ? 'Subscribed' : 'Wishlisted'}
                                    color='rgb(24, 144, 255)'
                            />
                        }
                        {
                            !contestOnly && isOwner &&
                            <AqTag 
                                    color='#673AB7'
                                    tooltipTitle={isPublic ? 'This advice is Public' : 'This advice is private'}
                                    text={isPublic ? 'Public' : 'Private'}
                                    icon={isPublic ? 'team' : 'lock'}
                                    iconStyle={{fontWeight: '400', fontSize: '15px', marginRight: '5px'}}
                            />
                        }
                        {
                            !contestOnly && (isOwner || isAdmin) && approvalRequested && isPublic &&
                            <AqTag 
                                    color='#FFAB00'
                                    text="Approval Requested"
                            />
                        }
                    </Col>
                    <Col span={24} style={{display: 'flex', justifyContent: 'center', marginTop: '10px'}}>
                        <Spin spinning={this.props.loading}>
                            <MetricItem 
                                valueStyle = {{
                                    ...metricsValueStyle, 
                                    fontSize: '32px',
                                    fontWeight: 300 
                                }} 
                                labelStyle={{...metricsLabelStyle, fontSize: '15px', marginTop: '5px'}} 
                                value={netValueMetricItem.value} 
                                label={netValueMetricItem.label} 
                                money={netValueMetricItem.money}
                                percentage={netValueMetricItem.percentage}
                                color={netValueMetricItem.color}
                                valueColor={metricColor.positive}
                                style={{padding: '20px'}} 
                                isNetValue={netValueMetricItem.isNetValue}
                                dailyChange={netValueMetricItem.dailyChange || null}
                                dailyChangePct={netValueMetricItem.dailyChangePct || null}
                                type="mobile"
                            />
                        </Spin>
                    </Col>
                    {
                        !this.props.preview &&
                        <Col 
                                span={24} 
                                style={{
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    justifyContent: 'center', 
                                    marginTop: '15px',
                                    alignItems: 'center'
                                }}
                        >
                            {
                                !isOwner
                                ?   !contestOnly &&
                                    <Button 
                                            onClick={() => 
                                                Utils.isLoggedIn() 
                                                ? unsubscriptionPending 
                                                        ? this.props.toggleUnsubscriptionModal() 
                                                        : this.props.toggleSubscriptionModal() 
                                                : this.redirectToLogin()
                                                
                                            }
                                            type="primary" 
                                            style={{fontSize: '16px', width: '55%'}}
                                    >
                                        {!isSubscribed ? "BUY ADVICE" : "UNSUBSCRIBE"}
                                    </Button>
                                :   ((!approvalRequested && isPublic) || !isPublic || contestOnly) && isOwner &&
                                    <div 
                                            style={{
                                                ...horizontalBox,
                                                width: '100%',
                                                justifyContent: 'space-around'
                                            }}
                                    >
                                        {
                                            active &&
                                            <Button 
                                                    style={{fontSize: '16px'}}
                                                    onClick={this.props.withdrawAdviceFromContest}
                                            >
                                                WITHDRAW
                                            </Button>
                                        }
                                        <Button 
                                                type="primary" 
                                                style={{fontSize: '16px'}}
                                                onClick={() => 
                                                    Utils.isLoggedIn()
                                                    ? this.props.history.push(`/contest/updateentry/${this.props.match.params.id}`)
                                                    : this.redirectToLogin()
                                                }
                                        >
                                            {active ? "UPDATE" : "ENTER CONTEST"}
                                        </Button>
                                    </div>
                            }
                            {
                                !isOwner &&
                                <div 
                                        onClick={() => console.log('Hello World')}
                                        style={{...horizontalBox, marginTop: '10px', color: '#4a4a4a'}}
                                        onClick={() => 
                                            Utils.isLoggedIn()
                                            ? this.props.followAdvice()
                                            : this.redirectToLogin()
                                        }
                                > 
                                    <h3 style={{fontSize: '14px', color: primaryColor}}>
                                        {
                                            isFollowing ? 'Remove From Wishlist' : 'Add To Wishlist'
                                        }
                                    </h3>
                                    <Icon 
                                        type={isFollowing ? "close-circle-o" : "plus-circle-o"} 
                                        style={{marginLeft: '5px', fontSize: '18px', color: primaryColor}}
                                    />
                                </div>
                            }
                        </Col>
                    }
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
                            <h3 style={{fontSize: '16px', fontWeight: 700, marginLeft: '10px'}}>Performance Snapshot</h3>
                        </div>
                    </Col>
                    <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                        { 
                            this.props.showPerformanceToggle &&
                            <SegmentedControl 
                                onValueChange={this.props.handlePerformanceToggleChange}
                                values={['Realized', 'Simulated']} 
                                selectedIndex={1}
                            />
                        }
                    </Col>
                    <Col span={24} gutter={16} style={{marginTop: '15px'}}>
                        <Row type="flex" gutter={24}>
                            {this.renderAdviceMetrics()}
                        </Row>
                    </Col>
                </Row>
                <Row>
                    <Col span={24} style={dividerStyle}></Col>
                </Row>
                <Collapse 
                        bordered={false} 
                        defaultActiveKey={[...defaultActiveKey, '6']} 
                >
                    {
                        !contestOnly &&
                        <Panel
                                key="1"
                                style={customPanelStyle}
                                header={<h3 style={{...metricsHeaderStyle, fontSize: '16px'}}>Investment Objective</h3>}
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
                                        <Col span={8}>
                                            <InvestmentObjItem  
                                                    showTag 
                                                    label="Valuation" 
                                                    value={_.get(portfolioValuation, 'field', '-')}
                                                    warning={isPublic && !approvalStatus && !this.getInvestmentObjWarning('portfolioValuation').valid && !approvalRequested}
                                                    reason={this.getInvestmentObjWarning('portfolioValuation').reason}
                                            />
                                        </Col>
                                        <Col span={8}>
                                            <InvestmentObjItem 
                                                    showTag 
                                                    label="Capitalization" 
                                                    value={_.get(capitalization, 'field', '-')}
                                                    warning={isPublic && !approvalStatus && !this.getInvestmentObjWarning('capitalization').valid && !approvalRequested}
                                                    reason={this.getInvestmentObjWarning('capitalization').reason}
                                            />
                                        </Col>
                                        <Col 
                                                span={_.get(sectors, 'detail', []).length > 1 ? 24 : 8}
                                                style={{
                                                    marginTop: _.get(sectors, 'detail', []).length > 1 ? '20px' : '0px'
                                                }}
                                        >
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
                                                                <React.Fragment key={index}>
                                                                    <AqTag 
                                                                            key={index}
                                                                            color={primaryColor}
                                                                            text={item}
                                                                            textStyle={{fontSize: '14px'}}
                                                                    />
                                                                </React.Fragment>
                                                            );
                                                        })
                                                    }
                                                </div>
                                                <div style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                                                    <h3 
                                                            style={{fontSize: '16px', color: '#515151', fontWeight: '700'}}
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
                            </Row>
                        </Panel>
                    }
                    {
                        contestOnly && Utils.isLoggedIn() &&
                        <Panel
                                key="6"
                                header={<h3 style={{...metricsHeaderStyle, fontSize: '16px'}}>Contest Detail</h3>}
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
                                    contestDropdown={null}
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
                                        <h3 style={{...metricsHeaderStyle, fontSize: '16px'}}>Portfolio</h3>
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
                            <Row 
                                    className="row-container" 
                                    type="flex" 
                                    justify="end" 
                                    align="middle" 
                                    style={{position: 'relative', paddingTop: '0px'}}
                            >
                                <Col span={24}>
                                    <PositionItems 
                                        positions={this.props.positions || []} 
                                        preview={this.props.preview}
                                    />
                                </Col>
                            </Row>
                        </Panel>
                    }
                    <Panel
                            key="3"
                            style={customPanelStyle}
                            header={<h3 style={{...metricsHeaderStyle, fontSize: '16px'}}>Performance</h3>}
                        >
                        <Row className="row-container">
                            <Spin spinning={this.props.loading}>
                                <MyChartNew mobile={true} series={tickers} chartId="advice-detail-chart"/>
                            </Spin>
                        </Row>
                    </Panel>
                </Collapse>
                <Row>
                    <Col span={24} style={{textAlign: 'center'}}>
                        {
                            (!isOwner &&  !isSubscribed) && !contestOnly &&
                            <Button 
                                    onClick={() => 
                                        Utils.isLoggedIn() 
                                        ? this.props.toggleSubscriptionModal() 
                                        : this.redirectToLogin()
                                        
                                    }
                                    type="primary" 
                                    style={{fontSize: '16px', width: '90%', margin: '20px 0'}}
                            >
                                BUY ADVICE
                            </Button>
                        }
                    </Col>
                </Row>
            </Col>
        )
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(this.props, nextProps) || !_.isEqual(this.state, nextState)) {
            return true;
        } 
        return false;
    }

    updateAdvice = () => {
        this.props.history.push(`/dashboard/updateadvice/${this.props.match.params.id}`);
    }

    render() {
        return (this.renderPageContent());
    }
}

const InvestmentObjItem = ({label, value, showTag = false, warning = false, reason= 'N/A'}) => {
    return (
        <div style={{width: 'fit-content'}}>
            {
                showTag 
                ?   <AqTag 
                            color={primaryColor}
                            text={value}
                            textStyle={{fontSize: '14px', fontWeight: 400}}
                    />
                :   <span style={{fontSize: '15px', fontWeight: '400', lineHeight: '15px'}}>
                        {value}
                    </span>
            }
            <div style={{display: 'flex', flexDirection: 'row', marginTop: '2px'}}>
                <h3 style={{fontSize: '15px', color: '#4a4a4a', fontWeight: '700'}}>{label}</h3>
                {
                    warning &&
                    <WarningIcon reason={reason}/>
                }
            </div>
        </div>
    );
}

export const AdviceDetailContentMobile = withRouter(AdviceDetailContentImpl);

const userStyle = {
    fontWeight: 700,
    fontSize: '14px',
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
    fontWeight: '700'
};

const customPanelStyle = {
    background: 'transparent',
    borderRadius: 4,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
};

