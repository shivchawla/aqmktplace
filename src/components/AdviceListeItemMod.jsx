import * as React from 'react';
import _ from 'lodash';
import Radium from 'radium';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {AqRate, AqTag} from '../components';
import {primaryColor, metricColor} from '../constants';
import medalIcon from '../assets/award.svg';
import {Utils} from '../utils';
import '../css/adviceListItem.css';

class AdviceListItemImpl extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isHovered: false,
        }
    }

    handleClick = (id) => {
        this.props.history.push(`/advice/${id}`);
    }

    renderDiversityChart = (diversity) => {
        return (
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                    <span style={{fontSize: '12px'}}>
                        Diversity Index
                    </span>
                </Col>

                <Col span={24}>
                    <h5 style={{fontSize: "18px"}}>
                        {(diversity * 100).toFixed(2)} %
                    </h5>
                </Col>
            </Row>
        );
    }

    renderBetaChart = (beta) => {
        return (
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                    <span style={{fontSize: '12px'}}>Beta</span>
                </Col>
                <Col span={24}>
                    <h5 style={{fontSize: "18px"}}>{beta.toFixed(2)}</h5>
                </Col>
            </Row>
        );
    }

    renderAnnualReturnIcon = annualReturn => {
        return (
            <Row style={{textAlign: 'center'}}>
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
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                    <span style={{fontSize: '12px'}}>Volatility </span>
                </Col>    
                <Col span={24}>
                <h5 style={{fontSize: "18px"}}>{Number((volatility * 100).toFixed(2))} %</h5>
                </Col>
                
            </Row>
        );
    }

    renderTrendingApprovedIcon = () => {
        const {isApproved} = this.props.advice;
        return (
            <Row>
                {isApproved &&
                    <Col span={12}>
                        <IconItem 
                            src={medalIcon} 
                            imageStyle={{transform: 'scale(0.7, 0.7)'}} 
                            labelStyle={{marginLeft: '5px', color:'teal'}}
                            label="Approved"
                        />
                    </Col>
                }
            </Row>
        );
    }

    renderMetricIcons = performanceSummary => {
        return (      
            <Row type="flex" justify="end">
                <Col span={6}>
                    {performanceSummary.simulated && 
                        this.renderVolatilityChart(performanceSummary.simulated.volatility)}
                </Col>
                <Col span={6}>
                    {performanceSummary.simulated && 
                        this.renderAnnualReturnIcon(performanceSummary.simulated.annualReturn)}
                </Col>
            </Row>
        );
    }

    renderNetValueChange = performanceSummary => {
        let netValue = 0;
        if (performanceSummary ) {
            netValue = _.get(performanceSummary, 'netValue', 0) || _.get(performanceSummary, 'current.netValueEOD', 0);
        }
      
        return (
            <Row type="flex" style={{marginRight:'15px'}}>
                <Col span={24} style={{textAlign: 'right'}}>
                    <span style={{fontSize: '12px'}}>Min. Investment Value</span>
                </Col>    

                <Col span={24}>
                    <h5 style={{...netValueStyle, color:'green'}}>
                        {`\u20B9 ${Utils.formatMoneyValueMaxTwoDecimals(netValue)}`}
                    </h5>
                </Col>
            </Row>
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
            approvalStatus = false
        } = this.props.advice;
        const isPublic = this.props.advice.public;
        const cardBackgroundColor = '#fff' ; //isOwner ? '#E8EAF6' : (isSubscribed ? '#E0F2F1' : '#fff');
        const statusTagColor = isOwner ? '#3cb44b' : isSubscribed ? '#1890ff' : isFollowing ? '#03a7ad' : '#fff';
        const statusTagLabel = isOwner ? 'Owner' : isSubscribed ? 'Subscribed' : isFollowing ? 'Wishlisted' : "";
        const advisorName = `${_.get(advisor, 'user.firstName')} ${_.get(advisor, 'user.lastName')}`;
        const advisorId = _.get(advisor, '_id', '');
        const statusTagStyle = {border:'1px solid', borderColor:statusTagColor};
        const adviceApprovalPending = 'Approval is pending for this advice by the admin';
        const adviceRejected = 'Advice is rejected by the admin.';
        const adviceApproved = 'Advice is approved by the admin ';
        const advicePublic = 'This advice is public';
        const advicePrivate = 'This advice is private and not open to Marketplace';

        return (

            <Row 
                type="flex"
                className="advice-card" 
                style={{backgroundColor: cardBackgroundColor}} 
                align="top" 
                onClick={e => this.handleClick(id)}>

                <Col span={24} style={{paddingLeft:'10px', paddingRight:'10px'}}>
                    <Row type="flex" justify="space-between">
                        <Col span={12}>
                            <Row>
                                <h3 style={{fontSize: '18px'}}>{name}</h3>
                            </Row>
                            
                            <Row>
                                <Col span={14}>
                                    By
                                    <span id ="advisorName" style={{color: primaryColor, marginRight: '5px'}}
                                        onClick={e => {
                                        e.stopPropagation();
                                        this.props.history.push(`/dashboard/advisorprofile/${advisorId}`)}}>{` ${advisorName}`}
                                    </span>
                                </Col>
                            </Row>

                        </Col>

                        <Col span={12} style={{textAlign: 'center'}}>
                            <Row>
                                {this.renderMetricIcons(performanceSummary)}
                            </Row>
                        </Col>

                    </Row>
                
                    <Row style={{marginTop: '5px'}} type="flex" justify="space-between">

                        <Col span={12} style={{marginTop: '-5px'}}>
                            <Row>
                                <AqRate value={Number(rating)}/>
                            </Row>
                            
                            <Row style={{marginTop: '5px'}}>
                                <AqTag 
                                        tooltipTitle="Rebalancing Frequency: The advice is rebalanced/updated at this frequency"
                                        tooltipPlacement="bottom"
                                        text={rebalancingFrequency}
                                        textStyle={{marginLeft: '5px'}}
                                        color='#f58231'
                                        icon='clock-circle-o'
                                />
                                
                                {statusTagLabel!="" &&
                                    <AqTag 
                                            text={statusTagLabel}
                                            color={statusTagColor}
                                    />
                                }
                                {
                                    (isOwner || isAdmin) &&
                                    <React.Fragment>
                                        <AqTag 
                                                tooltipTitle={isPublic ? advicePublic : advicePrivate}
                                                tooltipPlacement='bottom'
                                                color='#673AB7'
                                                icon={isPublic ? 'team' : 'lock'}
                                                iconStyle={{fontWeight: 400, fontSize: '15px', marginRight: '5px'}}
                                                text={isPublic ? 'Public' : 'Private'}
                                        />
                                        {
                                            approvalStatus &&
                                            <AqTag 
                                                    tooltipTitle={adviceApprovalPending}
                                                    placement='bottom'
                                                    text='Approval Pending'
                                                    textStyle={{marginLeft: '5px'}}
                                                    color='#FFAB00'
                                            />
                                        }
                                        {
                                            !approvalStatus &&
                                            <AqTag 
                                                    tooltipTitle={isApproved ? adviceApproved : adviceRejected}
                                                    tooltipPlacement='bottom'
                                                    color={isApproved ? '#00897B' : metricColor.negative}
                                                    text={isApproved ? "Approved" : "Rejected"}
                                                    textStyle={{marginLeft: '5px'}}
                                            />
                                        }
                                    </React.Fragment>
                                }
                            </Row>

                        </Col>

                        <Col span={7}>
                            {this.renderNetValueChange(Object.assign({netValue:netValue}, performanceSummary))}
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const AdviceListItemMod = withRouter(Radium(AdviceListItemImpl));

const IconItem = ({src, label, imageStyle={}, labelStyle={}}) => {
    return (
        <Row>
            <Col span={3} style={iconItemImageStyle}>
                <img style={imageStyle} src={src} />
            </Col>
            <Col span={8}>
                <span style={{...iconItemLabelStyle, ...labelStyle}}>{label}</span>
            </Col>
        </Row>
    );
}

const iconItemImageStyle = {
    color: '#5A5A5A',
    fontSize: '12px',
    fontWeight: 400
    
};

const iconItemLabelStyle = {
    fontSize: '12px',
    verticalAlign:'sub'
};

const netValueStyle = {
    fontSize: '20px',
    fontWeight: 400,
    color: '#3B3737',
    textAlign: 'right',
};

