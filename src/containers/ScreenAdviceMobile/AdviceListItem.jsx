import * as React from 'react';
import _ from 'lodash';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {AqRate} from '../../components/AqRate';
import {AqTag} from '../../components/AqTag';
import {primaryColor, metricColor} from '../../constants';
import {Utils} from '../../utils';

class AdviceListItemMobileImpl extends React.Component {
    handleClick = (id) => {
        this.props.history.push(`/advice/${id}`);
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
        let netValue = 0;
        if (performanceSummary ) {
            netValue = _.get(performanceSummary, 'netValue', 0) || _.get(performanceSummary, 'current.netValueEOD', 0);
        }
      
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

    render() {
        let {
            name, 
            advisor = {}, 
            performanceSummary = {}, 
            id,
            rebalancingFrequency,
            rating
        } = this.props.advice;
        const cardBackgroundColor = '#fff' ; //isOwner ? '#E8EAF6' : (isSubscribed ? '#E0F2F1' : '#fff');
        const advisorName = `${_.get(advisor, 'user.firstName')} ${_.get(advisor, 'user.lastName')}`;
        const advisorId = _.get(advisor, '_id', '');

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
