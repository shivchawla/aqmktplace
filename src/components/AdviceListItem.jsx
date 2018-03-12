import * as React from 'react';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {MetricItem} from './MetricItem';

const dateFormat = 'YYYY-MM-DD';

class AdviceListItemImpl extends React.Component {
    handleClick = (id) => {
        this.props.history.push(`/advice/${id}`);
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
            id
        } = this.props.advice;

        return (
            <Row style={cardStyle} onClick={() => this.handleClick(id)}>
                <Col span={24}>
                    <Row>
                        <Col span={24}>
                            <h3>{name}</h3>
                        </Col>
                    </Row>
                    {
                        advisor &&
                        <Row>
                            <Col span={6}>
                                <span>By {advisor.user.firstName} {advisor.user.lastName}</span>
                            </Col>
                            <Col span={6}>
                                <span>{moment(createdDate).format(dateFormat)}</span>
                            </Col>
                        </Row>
                    }
                    {
                        heading &&
                        <Row>
                            <Col span={24}>
                                <h5>{heading}</h5>
                            </Col>
                        </Row>
                    }
                    <Row>
                        <Col span={4}>
                            <MetricItem value={rating} label="Rating"/>
                        </Col>
                        <Col span={4}>
                            <MetricItem value={subscribers} label="Subscribers"/>
                        </Col>
                        <Col span={4}>
                            <MetricItem value={latestPerformance.return} label="Return"/>
                        </Col>
                    
                        <Col span={4}>
                            <MetricItem value={latestPerformance.maxloss} label="Max Loss"/>
                        </Col>
                    </Row>
                </Col>
            </Row>
        );
    }
}

export const AdviceListItem = withRouter(AdviceListItemImpl);

const cardStyle = {
    borderRadius: '4px',
    backgroundColor: '#FFF8F8',
    marginBottom: '20px',
    padding: '10px'
}