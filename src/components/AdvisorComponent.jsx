import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Rate, Avatar} from 'antd';
import {withRouter} from 'react-router';
import {MetricItem} from './MetricItem';
import {layoutStyle} from '../constants';

class AdvisorComponentImpl extends React.Component {
    renderMetrics = () => {
        const {numAdvices, numFollowers, rating} = this.props.metrics;
        const {advisor} = this.props;
        const name = `${_.get(advisor, 'user.firstName', '')} ${_.get(advisor, 'user.lastName', '')}`;
        return (
            <Row>
                <Col span={4}>
                    <MetricItem key="1" label="Advices" value={numAdvices} />
                </Col>
                <Col span={4}>
                    <MetricItem key="3" label="Followers" value={numFollowers} />
                </Col>
            </Row>
        );
    }

    handleClick = advisorId => {
        this.props.history.push(`/dashboard/advisorprofile/${advisorId}`);
    }

    render() {
        const {picUrl = ''} = this.props;
        const {advisor} = this.props;
        const rating = Number(_.get(advisor, 'latestAnalytics.rating.current', 0).toFixed(2));
        const name = `${_.get(advisor, 'user.firstName', '')} ${_.get(advisor, 'user.lastName', '')}`;
        const companyName = _.get(advisor, 'profile.companyName', '');
        const advisorId = _.get(advisor, '_id', '');

        return (
            <Col 
                    span={24} 
                    style={cardStyle}
                    className="advice-card" 
                    onClick={() => this.handleClick(advisorId)}
            >
                <Row>
                    <Col span={2}>
                        <Avatar
                                size="large" icon="user" 
                                style={{transform: 'scale(1.2, 1.2)'}}
                                src={picUrl}
                        />
                    </Col>
                    <Col span={24}>
                        <Row type="flex" justify="space-between">
                            <Col span={4}>
                                <h3>{name}</h3>
                                <Rate disabled allowHalf value={rating} />
                            </Col>
                            <Col span={4}>
                                <h3>{companyName}</h3>
                            </Col>
                        </Row>
                    </Col>
                    {/* <Col span={4} offset={12}>
                        {this.renderActionButtons()}
                    </Col> */}
                </Row>
                <Row style={{marginTop: 20}}>
                    <Col span={24}>
                        {this.renderMetrics()}
                    </Col>
                </Row>
            </Col>
        );
    }
}

export const AdvisorComponent = withRouter(AdvisorComponentImpl);

const cardStyle = {
    padding: '20px 20px',
    borderRadius: '4px'
}