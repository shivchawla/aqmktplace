import * as React from 'react';
import moment from 'moment';
import {Row, Col, Checkbox, Icon} from 'antd';
import {MetricItem} from '../components';
import '../css/chartTickerItem.css';

export class ChartTickerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false
        };
    }

    focus = () => {
        this.setState({focused: true});
    }

    clearFocus = () => {
        this.setState({focused: false});
    }

    render() {
        const {name = 'HDFCBANK', y = 1388, checked = false, change=0, disabled = false} = this.props.legend;
        const iconScale = this.state.focused ? 'scale(1,1)' : 'scale(0, 0)';
        const changeColor = change < 0 ? '#F44336' : '#00C853';

        return(
            <Row 
                    className='ticker-row' 
                    type="flex" 
                    align="middle" 
                    style={{borderRadius: '4px', padding: '5px 5px', margin: '3px'}}
                    onMouseEnter={this.focus}
                    onMouseLeave={this.clearFocus}
            >
                <Col span={2}>
                    <Checkbox disabled={disabled} checked={checked} onChange={this.props.onChange}/>
                </Col>
                <Col span={10}>
                    <h4 style={{fontSize: '12px'}}>{name}</h4>
                </Col>
                <Col span={5}>
                    <MetricItem 
                            label="Price"
                            value={y}
                            labelStyle={{fontSize: '11px'}}
                            valueStyle={{fontSize: '13px', fontWeight: 400}}
                    />
                </Col>
                <Col span={5}>
                    <MetricItem 
                            value={`${change} %`}
                            label="Change"
                            labelStyle={{fontSize: '11px'}}
                            valueStyle={{fontSize: '16px', fontWeight: 400, color: changeColor}}
                    />
                </Col>
                <Col span={1}>
                    {
                        !disabled &&
                        <Icon 
                            type="close-circle-o" 
                            style={{
                                fontSize: '18px', 
                                fontWeight: 700, 
                                color: '#FF6767', 
                                cursor: 'pointer', 
                                transform: iconScale,
                                transition: 'all 0.2s ease-in-out'
                            }} 
                            onClick={() => this.props.deleteItem(name)}
                        />
                    }
                </Col>
            </Row>
        );
    }
}