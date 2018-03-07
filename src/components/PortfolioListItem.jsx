import * as React from 'react';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {MetricItem} from '../components';

const dateFormat = 'YYYY-MM-DD';

export class PortfolioListItemImpl extends React.Component {
    handleClick = (id) => {
        this.props.history.push(`/dashboard/portfolio/${id}`);
    }

    render() {
        const {name, createdDate, _id, performance} = this.props.portfolio;
        const {beta, maxloss, sharpe} = performance;

        return (
            <Row style={itemStyle} onClick={() => this.handleClick(_id)}>
                <Col span={24}>
                    <h4>{name}</h4>
                    <h5>Created at - {moment(createdDate).format(dateFormat)}</h5>
                </Col>
                <Row>
                    <Col span={6}>
                        <MetricItem value={beta} label="Beta"/>
                    </Col>
                    <Col span={6}>
                        <MetricItem value={maxloss} label="Max loss"/>
                    </Col>
                    <Col span={6}>
                        <MetricItem value={performance.return} label="Return"/>
                    </Col>
                    <Col span={6}>
                        <MetricItem value={sharpe} label="Sharpe"/>
                    </Col>
                </Row>
            </Row>
        );
    }
}

export const PortfolioListItem = withRouter(PortfolioListItemImpl);

const itemStyle = {
    borderRadius: '4px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
    marginBottom: '10px',
    padding: '10px'
}