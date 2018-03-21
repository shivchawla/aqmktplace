import * as React from 'react';
import moment from 'moment';
import Radium from 'radium';
import {withRouter} from 'react-router';
import {Row, Col, Icon, Tag, Rate} from 'antd';
import {MetricItem} from './MetricItem';
import medalIcon from '../assets/award.svg';

const dateFormat = 'Do MMMM YYYY';

class AdviceListItemImpl extends React.Component {
    handleClick = (id) => {
        this.props.history.push(`/advice/${id}`);
    }

    renderSectors = (sectors) => {
        return sectors.map((sector, index) => {
            return <Tag onClick={e => {e.stopPropagation()}} key={index}>{sector}</Tag>
        })
    }

    render() {
        const {
            name, 
            advisor = null, 
            createdDate = null, 
            heading = null, 
            subscribers, 
            rating, 
            latestPerformance, 
            id,
            isFollowing
        } = this.props.advice;
        const sectors = latestPerformance.industries;

        return (
            <Row type="flex" style={cardStyle} align="top" onClick={() => this.handleClick(id)}>
                <Col span={24}>
                    <Row type="flex" align="middle">
                        <Col span={6}>
                            <h3 style={adviceTitleStyle}>{name}</h3>
                        </Col>
                        <Col span={2} offset={12}>
                            <Icon style={{fontSize: '20px'}} type="team" />
                            <span>{subscribers}</span>
                        </Col>
                        <Col span={4} style={{display: 'flex', flexDirection: 'row', justifyContent:'flex-end'}}>
                            <Rate allowHalf disabled defaultValue={rating / 2} />
                        </Col>
                    </Row>
                    <Row>
                        {
                            advisor &&
                            <Col span={3} style={{width: 'fit-content'}}>
                                <span style={authorStyle}>By {advisor.user.firstName} {advisor.user.lastName}</span>
                            </Col>
                        }
                        <Col span={3} style={{width: 'fit-content', marginLeft: '5px'}}>
                            <span style={dateStyle}>{moment(createdDate).format(dateFormat)}</span>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '5px'}}>
                        <Col span={24}>
                            <span>Sectors: </span>{this.renderSectors(sectors)}
                        </Col>
                    </Row>
                    {
                        heading &&
                        <Row style={{marginBottom: '5px'}}>
                            <Col span={24}>
                                <h5 style={headingStyle}>{heading}</h5>
                            </Col>
                        </Row>
                    }
                    <Row>
                        <Col span={4}>
                            <MetricItem style={{border: 'none'}} value={`${(latestPerformance.return * 100).toFixed(2)} %`} label="Return"/>
                        </Col>
                        <Col span={4}>
                            <MetricItem style={{border: 'none'}} value={`${(latestPerformance.maxLoss * 100).toFixed(2)} %`} label="Max Loss"/>
                        </Col>
                        <Col span={4}>
                            <MetricItem style={{border: 'none'}} value={latestPerformance.netValue} label="Net Value"/>
                        </Col>
                        <Col span={4}>
                            <MetricItem style={{border: 'none'}} value={`${(latestPerformance.currentLoss * 100).toFixed(2)} %`} label="Current Loss"/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const AdviceListItem = withRouter(Radium(AdviceListItemImpl));

const cardStyle = {
    backgroundColor: '#fff',
    padding: '10px 5px 10px 15px',
    borderBottom: '1px solid #eaeaea',
    cursor: 'pointer',
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
}