import * as React from 'react';
import moment from 'moment';
import {Row, Col, Checkbox, Icon} from 'antd';
import {MetricItem} from '../components';
import {primaryColor} from '../constants';
import '../css/chartTickerItem.css';

export class ChartTickerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focused: false
        };
    }

    //Fix required: On focus, instead of just rendering the delete icon, whole item is re-rendered
    focus = () => {
        this.setState({focused: true});
    }

    clearFocus = () => {
        this.setState({focused: false});
    }

    render() {
        const {
            name = 'HDFCBANK', 
            y = 1388, 
            checked = false, 
            change=0, 
            disabled = false, 
            color='#585858',
            hideCheckbox=false
        } = this.props.legend;
        const iconScale = this.state.focused ? 'scale(1,1)' : 'scale(0, 0)';
        const changeColor = change < 0 ? '#F44336' : '#00C853';
        const metricFontSize = this.props.watchlist ? '13px' : '13px';
        const nameSpan = this.props.watchlist ? 12 : 11;
        //const metricSpan = this.props.watchlist ? 9 : 11;
        // console.log(y);
        return(
            <Row 
                    className='ticker-row' 
                    type="flex"
                    gutter={0} 
                    align="middle" 
                    style={{borderRadius: '4px', padding: '5px 0px', margin: '3px 0px', cursor: 'pointer'}}
                    onMouseEnter={this.focus}
                    onMouseLeave={this.clearFocus}
                    onClick={() => {this.props.onClick && this.props.onClick(name)}}
            >
                {
                    !hideCheckbox &&
                    <Col span={2}>
                        <Checkbox disabled={disabled} checked={checked} onChange={this.props.onChange}/>
                    </Col>
                }
                <Col span={nameSpan}>
                    <h4 style={{fontSize: metricFontSize, color}}>{name}</h4>
                </Col>
                <Col span={10} style={{textAlign: 'left'}}>
                    <MetricItem 
                        label=""
                        //value={`${y} (${change} %)`}
                        value={y}
                        money
                        dailyChangePct={change}
                        isNetValue
                        labelStyle={{fontSize: '11px'}}
                        valueStyle={{fontSize: metricFontSize, fontWeight: 400}}/>
                </Col>
                {/*<Col span={6}>
                    <MetricItem 
                            value={`${change} %`}
                            label="Change"
                            labelStyle={{fontSize: '11px'}}
                            valueStyle={{fontSize: '16px', fontWeight: 400, color: changeColor}}
                    />
            </Col>*/}
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
                            onClick={() => {this.props.deleteItem && this.props.deleteItem(name)}}
                        />
                    }
                </Col>
            </Row>
        );
    }
}