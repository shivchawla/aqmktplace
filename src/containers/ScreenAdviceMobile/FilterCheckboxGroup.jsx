import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Checkbox} from 'antd';
import {horizontalBox} from '../../constants';

const CheckboxGroup = Checkbox.Group;

export class FilterChecboxGroup extends React.Component {
    handleCheckboxChange = checkedValues => {
        const firstItems = checkedValues.map(item => item[0]);
        const lastItems = checkedValues.map(item => item[1]);
        console.log([_.min(firstItems), _.max(lastItems)]);

        return ([_.min(firstItems), _.max(lastItems)]);
    }

    render() {
        const options = this.props.options;

        return (
            <CheckboxGroup onChange={this.handleCheckboxChange}>
                <Row>
                    {
                        options.map((item, index) => (
                            <Col 
                                    span={24} 
                                    key={index} 
                                    style={{
                                        ...horizontalBox, 
                                        justifyContent: 'space-between',
                                        marginBottom: '20px'
                                    }}
                            >
                                <h3>{item.label}</h3>
                                <Checkbox value={item.value}/>
                            </Col>
                        ))
                    }
                </Row>
            </CheckboxGroup>
        );
    }
}