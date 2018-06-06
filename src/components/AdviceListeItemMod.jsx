import * as React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Radium from 'radium';
import {withRouter} from 'react-router';
import {Row, Col, Icon, Tag, Rate, Tooltip} from 'antd';
import {AqRate} from '../components';
import {MetricItem} from './MetricItem';
import {primaryColor, metricColor} from '../constants';
import medalIcon from '../assets/award.svg';
import trendingUpIcon from '../assets/trending-up.svg';
import sunrise from '../assets/sunrise.svg';
import pie from '../assets/pie.svg';
import barChart from '../assets/bar-chart-2.svg';
import totalReturnIcon from '../assets/totalReturn.svg';
import {Utils} from '../utils';
import '../css/adviceListItem.css';

const dateFormat = 'Do MMMM YYYY';

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

    renderSectors = (sectors) => {
        if (sectors.length > 3) {
            return (
                <Tag 
                    //color="#ECFAFF" 
                    style={{color: '#414141', border:'1px solid #cc6666'}} 
                    onClick={e => {e.stopPropagation()}} 
                >
                    Multiple Sectors
                </Tag>
            );
        } 
        return sectors.slice(0, 2).map((sector, index) => {
            return <Tag 
                    //color="#ECFAFF" 
                    style={{color: '#414141', border:'1px solid #cc6666'}} 
                    onClick={e => {e.stopPropagation()}} 
                    key={index}>
                    {sector}
                </Tag>
        });
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
                    {/*<img style={iconStyle} src={pie} />*/}
                </Col>
                
                {/*<Col span={24}>
                    <img style={iconStyle} src={pie} />
                </Col>*/}
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
                    {/*<img style={{transform: 'scale(0.8, 0.8)'}} src={barChart} />*/}
                    <h5 style={{fontSize: "18px"}}>{beta.toFixed(2)}</h5>
                </Col>
                {/*<Col span={24}>
                    <img style={{transform: 'scale(0.8, 0.8)'}} src={barChart} />
                </Col>*/}
            </Row>
        );
    }

    renderAnnualReturnIcon = annualReturn => {
        return (
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                    <span style={{fontSize: '12px'}}>1 Year Return</span>

                    {/*<img style={{transform: 'scale(0.8, 0.8)'}} src={totalReturnIcon} />*/}
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
                {/*<img style={iconStyle} src={sunrise} />*/}
                <h5 style={{fontSize: "18px"}}>{Number((volatility * 100).toFixed(2))} %</h5>
                </Col>
                
            </Row>
        );
    }

    renderTrendingApprovedIcon = () => {
        const {isApproved, isOwner} = this.props.advice;
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
                
                {/* <Col span={12}>
                    <IconItem src={trendingUpIcon} imageStyle={{transform: 'scale(0.7, 0.7)', marginTop: '8px'}} label="Trending" labelStyle={{marginLeft: "9px", color:'#ff4500'}}/>
                </Col> */}
                {/*<Col span={12}>
                    <IconItem src={trendingUpIcon} imageStyle={{transform: 'scale(0.7, 0.7)', marginTop: '8px'}} label="Trending" labelStyle={{marginLeft: "9px"}}/>
                </Col>*/}
            </Row>
        );
    }

    /*<Col span={6}>
                        {this.renderDiversityChart(_.get(performanceSummary, 'current.concentration', 0))}
                    </Col>
                
                    <Col span={6}>
                        {this.renderBetaChart(_.get(performanceSummary,'current.beta', 0))}
                    </Col>*/
             

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
                
                {/*<Col span={8}>
                    {this.renderNetValueChange(performanceSummary)}
                </Col>*/}
            </Row>
        );
    }

    renderNetValueChange = performanceSummary => {
        let netValue = 0, dailyChange = 0, dailyChangePct = 0, totalReturn;
        if (performanceSummary ) {
            netValue = _.get(performanceSummary, 'netValue', 0) || _.get(performanceSummary, 'current.netValueEOD', 0);
            dailyChange = _.get(performanceSummary, 'current.dailyNAVChangeEOD', 0);
            dailyChangePct = _.get(performanceSummary, 'current.dailyNAVChangeEODPct', 0);
        }
        var str1 = "Daily Chg (\u20B9)";
        var str2 = "| Daily Chg (%)";
      
        return (
            <Row type="flex" style={{marginRight:'15px'}}>
                <Col span={24} style={{textAlign: 'right'}}>
                    <span style={{fontSize: '12px'}}>Min. Investment Value</span>
                </Col>    

                <Col span={24}>
                    <h5 style={{...netValueStyle, color:'green'}}>
                        {`\u20B9 ${Utils.formatMoneyValueMaxTwoDecimals(netValue)}`}
                    </h5>

                    {/*<Row align="bottom" >
                        <Col span={12} style={{
                                fontSize: '15px',
                                marginTop:'-2px',
                                textAlign:'right',
                                paddingRight:'2px',
                                color: dailyChange < 0 ? '#FA4747' : '#3EBB72'}}>
                                {Utils.formatMoneyValueMaxTwoDecimals(dailyChange)}     
                        </Col> 
                        <Col span={12} style={{
                                fontSize: '15px',
                                marginTop:'-2px',
                                textAlign:'left',
                                paddingLeft:'2px',
                                color: dailyChange < 0 ? '#FA4747' : '#3EBB72'}}>
                                ({(dailyChangePct * 100).toFixed(2)} %)
                        </Col>
                    </Row>
                    <Row>
                        <Col span={12} style={{fontSize: '13px', textAlign:'right', paddingRight:'2px'}}>
                            {str1}
                        </Col>
                        <Col span={12} style={{fontSize: '13px', textAlign:'left', paddingLeft:'0px'}}>
                            {str2}
                    </Col>
                    </Row>*/}
                </Col>
            </Row>
        );
    }

    render() {
        let {
            name, 
            advisor = {}, 
            createdDate = null, 
            heading = null, 
            subscribers, 
            followers,
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
        let sectors = _.get(performanceSummary, 'current.sectors', []);
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
        const adviceWishlisted = 'You have wishlisted this advice';
        const adviceSubscribed = 'You have subscribed this advice';

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
                                        this.props.history.push(`/advisordashboard/advisorprofile/${advisorId}`)}}>{` ${advisorName}`}
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
                                <Tooltip 
                                        title="Rebalancing Frequency: The advice is rebalanced/updated at this frequency" 
                                        placement="bottom"
                                >
                                    <Tag 
                                            color='f58231' 
                                            style={{color:'black', border:'1px solid #f58231', width:'85px', paddingTop:'1px', cursor: 'auto'}}
                                        >
                                        <Icon type="clock-circle-o" style={{fontWeight: '400', color:'#f58231'}}/>
                                        <span style={{marginLeft: '5px', color:'#f58231'}}>{rebalancingFrequency}</span>
                                    </Tag>
                                </Tooltip>
                                
                                {statusTagLabel!="" &&
                                    <Tag style={{...statusTagStyle, color:'black', cursor: 'auto'}}>
                                        <span style={{color: statusTagColor}}>{statusTagLabel}</span>
                                    </Tag>
                                }
                                {
                                    (isOwner || isAdmin) &&
                                    <React.Fragment>
                                        <Tooltip
                                                title={isPublic ? advicePublic : advicePrivate}
                                                placement="bottom"
                                        >
                                            <Tag style={{border: '1px solid #673AB7', cursor: 'auto'}}>
                                                <Icon 
                                                        type={isPublic ? 'team' : 'lock'} 
                                                        style={{
                                                            fontWeight: '400', 
                                                            color:'#673AB7', 
                                                            fontSize: '15px',
                                                            // marginTop: '4px'
                                                        }}
                                                />
                                                <span style={{color: '#673AB7', marginLeft: '5px'}}>
                                                    {
                                                        isPublic ? 'Public' : 'Private'
                                                    }
                                                </span>
                                            </Tag>
                                        </Tooltip>
                                        {
                                            approvalStatus &&
                                            <Tooltip
                                                    title={adviceApprovalPending}
                                                    placement="bottom"
                                            >
                                                <Tag style={{border: '1px solid #FFAB00', cursor: 'auto'}}>
                                                    <span style={{color: '#FFAB00', marginLeft: '5px'}}>
                                                        Approval Pending
                                                    </span>
                                                </Tag>
                                            </Tooltip>
                                        }
                                        {
                                            !approvalStatus &&
                                            <Tooltip
                                                    title={isApproved ? adviceApproved : adviceRejected}
                                                    placement="bottom"
                                            >
                                                <Tag 
                                                        style={{
                                                            border: isApproved ? `1px solid #00897B` : `1px solid ${metricColor.negative}`, 
                                                            cursor: 'auto'
                                                        }}
                                                >
                                                    <span 
                                                            style={{
                                                                color: isApproved ? '#00897B' : metricColor.negative, 
                                                                marginLeft: '5px'
                                                            }}
                                                    >
                                                        {
                                                            isApproved ? "Approved" : "Rejected"
                                                        }
                                                    </span>
                                                </Tag>
                                            </Tooltip>
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

const cardStyle = {
    backgroundColor: '#fff',
    padding: '10px 5px 10px 10px',
    border: '1px solid #eaeaea',
    margin: '15px 5px',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(171, 171, 171, 50)',
};

const hoverCardStyle = {
    //backgroundColor: '#F5F6FA',
    backgroundColor: '#fff',
    padding: '10px 5px 10px 10px',
    border: '1px solid #eaeaea',
    margin: '15px 5px',
    cursor: 'pointer',
    boxShadow: '0 6px 10px rgba(171, 171, 171, 50)',
};

const adviceTitleStyle = {
    fontWeight: '700',
    fontSize: '16px',
    color: '#646464'
};

const authorStyle = {
    color: '#238090',
    fontSize: '12px',
    marginTop: '-30px'
};

const dateStyle = {
    color: '#8C8C8C',
    fontSize: '12px'
};

const headingStyle = {
    color: '#1F1F1F',
    fontSize: '14px',
    marginTop: '5px'
};

const netValueStyle = {
    fontSize: '20px',
    fontWeight: 400,
    color: '#3B3737',
    textAlign: 'right',
    //marginRight: '25px'
};

const netLabelStyle = {
    fontSize: '14px',
    color: '#716E6E',
    textAlign: 'right',
};

const returnValueStyle = {
    fontSize: '16px',
    color: '#3AC089',
    fontWeight: 400
};

const returnLabelStyle = {
    fontSize: '14px',
    color: '#716E6E',
    fontSize: '10px'
};

const iconStyle = {
    transform: 'scale(0.6, 0.6)'
};