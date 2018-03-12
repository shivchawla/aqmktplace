import * as React from 'react';
import {Row, Col} from 'antd';
import {AdviceFilterComponent} from './AdviceFilterComponent';
import {AdviceSortingMenu} from './AdviceSortingMenu';

const {requestUrl, aimsquantToken} = require('../localConfig');

export class FilterSortComponent extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            adviceUrl: `${requestUrl}/advice?all=true&trending=false&subscribed=false&following=false&order=-1&personal=1`,
        };
    }

    updateAdviceUrl = url => {
        this.setState({adviceUrl: url}, () => {
            this.props.getAdvices(this.state.adviceUrl);
        });
    }

    render() {
        return (
            <Row>
                <Col span={4}>
                    <AdviceFilterComponent updateAdviceUrl={this.updateAdviceUrl} />
                </Col>
                <Col span={4}>
                    <AdviceSortingMenu updateAdviceUrl={this.updateAdviceUrl} />
                </Col>
            </Row>
        );
    }
}