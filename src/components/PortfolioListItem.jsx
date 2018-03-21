import * as React from 'react';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Row, Col} from 'antd';
import {MetricItem} from '../components';

const dateFormat = 'Do MMMM YYYY';

export class PortfolioListItemImpl extends React.Component {
    handleClick = (id) => {
        this.props.history.push(`/dashboard/portfolio/${id}`);
    }

    render() {
        const {name, createdDate, _id, performance} = this.props.portfolio;
        const {beta, maxLoss, sharpe} = performance;

        return (
            <Row style={itemStyle} onClick={() => this.handleClick(_id)}>
                <Col span={24}>
                    <h4 style={portfolioTitleStyle}>{name}</h4>
                    <h5>{moment(createdDate).format(dateFormat)}</h5>
                </Col>
                <Row>
                    <Col span={6}>
                        <MetricItem value={beta} label="Beta"/>
                    </Col>
                    <Col span={6}>
                        <MetricItem value={maxLoss} label="Max loss"/>
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
    cursor: 'pointer',
    marginBottom: '10px',
    padding: '10px',
    paddingLeft: '15px',
    borderBottom: '1px solid #eaeaea'
};

const portfolioTitleStyle = {
    fontWeight: '700',
    fontSize: '16px',
    color: '#646464'
};