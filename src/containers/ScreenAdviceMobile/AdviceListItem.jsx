import * as React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {AqRate} from '../../components/AqRate';
import {AqTag} from '../../components/AqTag';
import {primaryColor, metricColor, horizontalBox} from '../../constants';
import {Utils} from '../../utils';

class AdviceListItemMobileImpl extends React.Component {
    handleClick = (id) => {
        this.props.contestOnly 
            ? this.props.history.push(`/contest/entry/${id}`) 
            : this.props.history.push(`/advice/${id}`)
    }

    renderAnnualReturnIcon = annualReturn => {
        return (
            <Row style={{textAlign: 'left'}}>
                <Col span={24}>
                    <span style={{fontSize: '12px'}}>1 Year Return</span>
                </Col>
                <Col span={24}>
                    <h5 style={{fontSize: "18px"}}>{(annualReturn * 100).toFixed(2)} %</h5>
                </Col>
            </Row>
        );
    }

    renderVolatilityChart = (volatility) => {
        return (
            <Row style={{textAlign: 'left'}}>
                <Col span={24}>
                    <span style={{fontSize: '12px'}}>Volatility </span>
                </Col>    
                <Col span={24}>
                <h5 style={{fontSize: "18px"}}>{Number((volatility * 100).toFixed(2))} %</h5>
                </Col>
                
            </Row>
        );
    }

    renderMetricIcons = performanceSummary => {
        return (      
            <Row type="flex" justify="space-between">
                <Col span={8}>
                    {performanceSummary.simulated && 
                        this.renderVolatilityChart(performanceSummary.simulated.volatility)}
                </Col>
                <Col span={8}>
                    {performanceSummary.simulated && 
                        this.renderAnnualReturnIcon(performanceSummary.simulated.annualReturn)}
                </Col>
                <Col span={8}>
                    {this.renderNetValueChange(performanceSummary)}
                </Col>
            </Row>
        );
    }

    renderNetValueChange = performanceSummary => {
        let {netValue = 0} = this.props.advice;
        // if (performanceSummary ) {
        //     netValue = _.get(performanceSummary, 'netValue', 0) || _.get(performanceSummary, 'current.netValueEOD', 0);
        // }
      
        return (
            <Row style={{textAlign: 'left'}}>
                <Col span={24}>
                    <span style={{fontSize: '12px'}}>Net Value</span>
                </Col>    

                <Col span={24}>
                    <h5 style={{fontSize: '18px', color:'green'}}>
                        {`\u20B9 ${Utils.formatMoneyValueMaxTwoDecimals(netValue)}`}
                    </h5>
                </Col>
            </Row>
        );
    }

    shouldComponentUpdate(nextProps) {
        if (!_.isEqual(nextProps, this.props)) {
            return true;
        }

        return false;
    }

    contestTooltipTitle = (contestDetail) => {
        return (
            <div>{contestDetail.map(item => {
                    <span>{item.name} ({item.rank})</span>;
                })}
            </div>
        );
    }

    render() {
        let {
            name, 
            advisor = {}, 
            rating, 
            performanceSummary = {}, 
            id,
            isFollowing,
            isSubscribed,
            isApproved,
            isOwner,
            isAdmin,
            rebalancingFrequency,
            netValue,
            approvalStatus = false,
            contestOnly = false,
            contest
        } = this.props.advice;
        
        const isPublic = this.props.advice.public;
        const cardBackgroundColor = '#fff' ; //isOwner ? '#E8EAF6' : (isSubscribed ? '#E0F2F1' : '#fff');
        const advisorName = `${_.get(advisor, 'user.firstName')} ${_.get(advisor, 'user.lastName')}`;
        const advisorId = _.get(advisor, '_id', '');
        const statusTagColor = isOwner ? '#3cb44b' : isSubscribed ? '#1890ff' : isFollowing ? '#03a7ad' : '#fff';
        const statusTagLabel = isOwner ? 'Owner' : isSubscribed ? 'Subscribed' : isFollowing ? 'Wishlisted' : "";
        var activeInContest = false;
        var withdrawnFromContest = true;
        var prohibitedFromContest = true;

        const contestDetail = contest ? contest.map(item => {
            return {
                name: item.name, 
                contestActive: item.active, 
                active: item.adviceSummary.active, 
                prohibited: item.adviceSummary.prohibited, 
                withdrawn: item.adviceSummary.withDrawn, 
                rank: _.get(item, 'adviceSummary.latestRank.value', null)
            };}) : [];

        contestDetail.map(item => {
            activeInContest  = activeInContest || item.active;
            withdrawnFromContest = withdrawnFromContest && item.withdrawn;
            prohibitedFromContest = prohibitedFromContest && item.prohibited;
        });



        return (
            <Row 
                type="flex"
                // className="advice-card" 
                style={{backgroundColor: cardBackgroundColor, margin: 0, marginBottom: '5px'}} 
                align="top" 
                onClick={e => this.handleClick(id)}>

                <Col span={24} style={{padding: '0 15px'}}>
                    <Row type="flex" justify="space-between" align="middle">
                        <Col span={24}>
                            <h3 style={{fontSize: '18px'}}>{name}</h3>                            
                        </Col>
                        <Col span={14}>
                            By
                            <span id ="advisorName" style={{color: primaryColor, marginRight: '5px'}}
                                onClick={e => {
                                e.stopPropagation();
                                this.props.history.push(`/dashboard/advisorprofile/${advisorId}`)}}>{` ${advisorName}`}
                            </span>
                        </Col>
                        <Col span={24}>
                            <AqRate value={Number(rating)}/>
                        </Col>
                        <Col span={24} style={{...horizontalBox, justifyContent: 'space-between', margin: '5px 0'}}>
                            <Row>
                                {
                                    !contestOnly && 
                                    <AqTag 
                                            tooltipPlacement="bottom"
                                            text={rebalancingFrequency}
                                            textStyle={{marginLeft: '5px'}}
                                            color='#f58231'
                                            icon='clock-circle-o'
                                    />
                                }
                                
                                {
                                    statusTagLabel!="" && !contestOnly && 
                                    <AqTag 
                                            text={statusTagLabel}
                                            color={statusTagColor}
                                    />
                                }
                                {
                                    (isOwner || isAdmin) && !contestOnly && 
                                    <React.Fragment>
                                        <AqTag 
                                                tooltipPlacement='bottom'
                                                color='#673AB7'
                                                icon={isPublic ? 'team' : 'lock'}
                                                iconStyle={{fontWeight: 400, fontSize: '15px', marginRight: '5px'}}
                                                text={isPublic ? 'Public' : 'Private'}
                                        />
                                        {
                                            approvalStatus && !contestOnly && 
                                            <AqTag 
                                                    placement='bottom'
                                                    text='Approval Pending'
                                                    textStyle={{marginLeft: '5px'}}
                                                    color='#FFAB00'
                                            />
                                        }
                                        {
                                            !approvalStatus && !contestOnly && 
                                            <AqTag 
                                                    tooltipPlacement='bottom'
                                                    color={isApproved ? '#00897B' : metricColor.negative}
                                                    text={isApproved ? "Approved" : "Rejected"}
                                                    textStyle={{marginLeft: '5px'}}
                                            />
                                        }
                                    </React.Fragment>
                                }
                                {
                                    (isOwner || isAdmin) && contestOnly &&
                                    <AqTag 
                                            tooltipPlacement='bottom'
                                            color={isApproved ? '#00897B' : metricColor.negative}
                                            text="Contest"
                                            textStyle={{marginLeft: '5px'}}
                                    />
                                }
                                {   
                                    contestOnly &&
                                    <AqTag 
                                            tooltipTitle={this.contestTooltipTitle(contestDetail)}
                                            tooltipPlacement='right'
                                            color='purple'
                                            text={activeInContest ? "Active" : withdrawnFromContest ? "Withdrawn" : prohibitedFromContest ? "Prohibited" : ""}
                                            textStyle={{marginLeft: '5px'}}
                                    />
                                }
                            </Row>
                        </Col>
                        <Col span={24} style={{textAlign: 'center'}}>
                            <Row>
                                {this.renderMetricIcons(performanceSummary)}
                            </Row>
                        </Col>
                    </Row>
                </Col>
                {
                    this.props.border &&
                    <Col span={24}>
                        <div style={{height: '7px', backgroundColor: '#efeff4', marginTop: '5px'}}></div>
                    </Col>
                }
            </Row>
        );
    }
}

export const AdviceListItemMobile = withRouter(AdviceListItemMobileImpl);

const netValueStyle = {
    fontSize: '20px',
    fontWeight: 400,
    color: '#3B3737',
    textAlign: 'right',
};
