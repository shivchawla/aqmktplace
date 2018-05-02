import * as React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Radium from 'radium';
import {withRouter} from 'react-router';
import {Row, Col, Icon, Tag, Rate} from 'antd';
import {AqRate} from '../components';
import {MetricItem} from './MetricItem';
import {primaryColor} from '../constants';
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
                <h5 style={{fontSize: "18px"}}>
                    {(diversity * 100).toFixed(2)} %
                </h5>
                    {/*<img style={iconStyle} src={pie} />*/}
                </Col>
                <Col span={24}>
                    <span style={{fontSize: '13px'}}>
                        Diversity Index
                    </span>
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
                    {/*<img style={{transform: 'scale(0.8, 0.8)'}} src={barChart} />*/}
                    <h5 style={{fontSize: "18px"}}>{beta.toFixed(2)}</h5>
                </Col>
                <Col span={24}>
                    <span style={{fontSize: '13px'}}>Beta</span>
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
                    <h5 style={{fontSize: "18px"}}>{(annualReturn * 100).toFixed(2)} %</h5>
                    {/*<img style={{transform: 'scale(0.8, 0.8)'}} src={totalReturnIcon} />*/}
                </Col>
                <Col span={24}>
                    <span style={{fontSize: '13px'}}>Ann. Return</span>
                </Col>
            </Row>
        );
    }

    renderVolatilityChart = (volatility) => {
        return (
            <Row style={{textAlign: 'center'}}>
                <Col span={24}>
                {/*<img style={iconStyle} src={sunrise} />*/}
                <h5 style={{fontSize: "18px"}}>{Number((volatility * 100).toFixed(2))} %</h5>
                </Col>
                <Col span={24}>
                    <span style={{fontSize: '13px'}}>Volatility </span>
                </Col>
            </Row>
        );
    }

    renderTrendingApprovedIcon = () => {
        const {isApproved} = this.props.advice;
        return (
            <Row type="flex" justify="center" style={{paddingRight:'40px'}}>
                {
                    isApproved === 'approved' &&
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

    renderMetricIcons = performanceSummary => {
        return (
            <Row>
                <Col span={6}>
                    {this.renderDiversityChart(_.get(performanceSummary, 'current.concentration', 0))}
                </Col>
                {
                    performanceSummary.current && 
                    <Col span={6}>
                        {this.renderBetaChart(_.get(performanceSummary,'current.beta', 0))}
                    </Col>
                }
                {
                    performanceSummary.current && 
                    <Col span={6}>
                        {this.renderVolatilityChart(performanceSummary.current.volatility)}
                    </Col>
                }
                {
                    performanceSummary.current && 
                    <Col span={6}>
                        {this.renderAnnualReturnIcon(performanceSummary.current.annualReturn)}
                    </Col>
                }
            </Row>
        );
    }

    renderNetValueChange = performanceSummary => {
        let netValue = 0, dailyChange = 0, dailyChangePct = 0, totalReturn;
        if (performanceSummary ) {
            netValue = _.get(performanceSummary, 'current.netValueEOD', NaN);
            dailyChange = _.get(performanceSummary, 'current.dailyNAVChangeEOD', NaN);
            dailyChangePct = _.get(performanceSummary, 'current.dailyNAVChangeEODPct', NaN);
        }
        var str1 = "Daily Chg (\u20B9)";
        var str2 = "| Daily Chg (%)";
      
        return (
            <Row type="flex"  style={{marginTop:'-10px'}}>
                <Col span={24}>
                    <h3 style={netValueStyle}>
                        {`\u20B9 ${Utils.formatMoneyValueMaxTwoDecimals(netValue)}`}
                    </h3>

                    <Row align="bottom" >
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
                    </Row>
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
            rebalancingFrequency
        } = this.props.advice;
        let sectors = _.get(performanceSummary, 'current.sectors', []);
        const cardBackgroundColor = '#fff' ; //isOwner ? '#E8EAF6' : (isSubscribed ? '#E0F2F1' : '#fff');
        const statusTagColor = isOwner ? '#3cb44b' : isSubscribed ? '#1890ff' : isFollowing ? '#03a7ad' : '#fff';
        const statusTagLabel = isOwner ? 'Owner' : isSubscribed ? 'Subscribed' : isFollowing ? 'Wishlist' : "";
        const advisorName = `${_.get(advisor, 'user.firstName')} ${_.get(advisor, 'user.lastName')}`;
        const advisorId = _.get(advisor, '_id', '');

        return (
            <Row 
                    type="flex"
                    className="advice-card" 
                    style={{backgroundColor: cardBackgroundColor}} 
                    align="top" 
                    onClick={e => this.handleClick(id)} 
            >
                <Col span={24} style={{paddingLeft:'10px', paddingRight:'10px'}}>
                    <Row>
                        <Col span={10}>
                            <Row>
                                <h3 style={{fontSize: '18px'}}>{name}</h3>
                            </Row>
                            <Row>
                                <h3 style={{fontSize: '14px'}}>
                                    By
                                    <span id ="advisorName" style={{color: primaryColor}}
                                        onClick={e => {
                                        e.stopPropagation();
                                        this.props.history.push(`/advisordashboard/advisorprofile/${advisorId}`)}}>{` ${advisorName}`}
                                    </span>
                                </h3>
                            </Row>
                            {
                                sectors.length > 0 && sectors &&
                                <Row style={{margin: '5px 0'}}>
                                    {this.renderSectors(sectors)}
                                </Row>
                            }
                            <Row style={{fontSize: '15px'}} >
                                <Col span={7}>
                                    <Tag color='#f58231' style={{color:'#fff', border:'none', width:'85px', paddingTop:'1px'}}>
                                        <Icon type="clock-circle-o" style={{fontWeight: '400'}}/>
                                        <span style={{marginLeft: '5px'}}>{rebalancingFrequency}</span>
                                    </Tag>
                                </Col>
                                {statusTagLabel!="" &&
                                    <Col span={11}>
                                        <Tag color={statusTagColor} style={{color:'#fff'}}>
                                            <span style={{marginLeft: '5px'}}>{statusTagLabel}</span>
                                        </Tag>
                                    </Col>
                                 }
                            </Row>
                        </Col>

                        <Col span={14} offset={0}>
                            {this.renderMetricIcons(performanceSummary)}
                        </Col>
                    
                    </Row>
                
                    <Row style={{marginTop: '20px'}}>
                        <Col span={7} style={{marginTop: '5px'}}>
                            <Col span={8}>
                                <MetricItem 
                                        style={{border: 'none'}} 
                                        value={subscribers} 
                                        label="Subscribers"
                                        valueStyle={{fontSize: '20px', fontWeight: '400', color: '#3B3737'}}
                                        labelStyle={{fontSize: '14px', fontWeight: '400', color: '#716E6E'}}
                                />
                            </Col>
                            {
                                performanceSummary.current && 
                                <Col span={8}>
                                    <MetricItem 
                                            style={{border: 'none'}} 
                                            value={followers} 
                                            label="Wishlisters"
                                            valueStyle={{fontSize: '20px', fontWeight: '400', color: '#3B3737', paddingLeft: '10px'}}
                                            labelStyle={{fontSize: '14px', fontWeight: '400', color: '#716E6E', paddingLeft: '10px'}}
                                    />
                                </Col>
                            }
                        </Col>
                        
                        <Col span={17}>
                            <Row>
                                <Col span={12} style={{textAlign: 'center'}}>
                                    <AqRate value={Number(rating)}/>
                                    {this.renderTrendingApprovedIcon()}
                                </Col>
                                <Col span={10} offset={2}>
                                    {this.renderNetValueChange(performanceSummary)}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Col>
                <Row style={{marginTop: '10px'}}></Row>
            </Row>
        );
    }
}

export const AdviceListItemMod = withRouter(Radium(AdviceListItemImpl));

const IconItem = ({src, label, imageStyle={}, labelStyle={}}) => {
    return (
        <Row type="flex" justify="center" align="center">
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
    fontSize: '22px',
    fontWeight: 400,
    color: '#3B3737',
    textAlign: 'center',
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