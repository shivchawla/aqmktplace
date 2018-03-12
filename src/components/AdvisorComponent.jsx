import * as React from 'react';
import {Row, Col, Rate, Avatar} from 'antd';
import {withRouter} from 'react-router';
import {MetricItem} from './MetricItem';
import {layoutStyle} from '../constants';

class AdvisorComponentImpl extends React.Component {
    renderMetrics = () => {
        const {name, numAdvices, numFollowers, rating} = this.props.metrics;
        return (
            <Row>
                <Col span={4}>
                    <MetricItem key="1" label="Advices" value={numAdvices} />
                </Col>
                <Col span={4}>
                    <MetricItem key="3" label="Followers" value={numFollowers} />
                </Col>
                <Col span={4}>
                    <MetricItem key="3" label="Followers" value={numAdvices} />
                </Col>
            </Row>
        );
    }

    handleClick = () => {
        this.props.history.push(`/advisorprofile/${this.props.advisorId}`);
    }

    render() {
        const {picUrl = ''} = this.props;
        const {name, rating} = this.props.metrics;

        return (
            <Col span={24} style={layoutStyle} onClick={this.handleClick}>
                <Row>
                    <Col span={2}>
                        <Avatar
                                size="large" icon="user" 
                                style={{transform: 'scale(1.5, 1.5)'}}
                                src={picUrl}
                        />
                    </Col>
                    <Col span={6}>
                        <h3>{name}</h3>
                        <Rate disabled allowHalf value={rating} />
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