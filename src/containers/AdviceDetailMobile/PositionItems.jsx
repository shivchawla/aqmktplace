import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Collapse, Icon} from 'antd';
import {Accordion} from 'antd-mobile';
import {Utils} from '../../utils';
import {MetricItem} from '../../components/MetricItem';
import {horizontalBox, primaryColor} from '../../constants';
import './positionItem.css';

const Panel = Accordion.Panel;

export class PositionItems extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            activePanelKeys: []
        };
    }
    processPositions = () => {
        const {positions} = this.props;

        return positions.map(position => {
            return {
                name: _.get(position, 'security.detail.Nse_Name', ''),
                symbol: _.get(position, 'security.ticker', ''),
                shares: _.get(position, 'quantity', 0),
                lastPrice: _.get(position, 'lastPrice', 0),
                sector: _.get(position, 'security.detail.Sector', ''),
                weightPct: (_.get(position, 'weightInPortfolio', 0) * 100).toFixed(2),
                weight: _.get(position, 'weightInPortfolio', 0)
            };
        })
    }

    onCollapseChange = activePanelKeys => {
        this.setState({activePanelKeys});
    }

    render() {
        return (
            <Collapse bordered={false} onChange={this.onCollapseChange}>
                {
                    this.processPositions().map((position, index) => {
                        const {activePanelKeys} = this.state;
                        const mode = activePanelKeys.indexOf(index.toString()) === -1 ? "horizontal" : "vertical";
                        return (
                            <Panel 
                                    key={index} 
                                    header={<PositionHeader position={position} mode={mode} />} 
                                    style={customPanelStyle}
                                    className='position-panel'
                                    showArrow={false}
                            >
                                <PositionItem position={position} />
                            </Panel>
                        );
                    })
                }
            </Collapse>
        );
    }
}

const PositionHeader = ({position, mode='horizontal'}) => {
    const {symbol = '', shares = 0, lastPrice = 0, sector = '', weight = 0, name = ''} = position;
    return (
        <Row type="flex">
            {
                mode === 'horizontal'
                ?   <React.Fragment>
                        <NewPositionHeader position={position} />
                    </React.Fragment>
                :   <React.Fragment>
                        <Col span={2}>
                            <Icon style={{fontSize: '18px', marginTop: '2px'}} type="minus-square-o" />
                        </Col>
                        <Col span={22} style={{marginBottom: '10px'}}>
                            <h3 style={{color: primaryColor}}>{position.name}</h3>
                        </Col>
                    </React.Fragment>
            }
        </Row>
    );
}

const NewPositionHeader = ({position}) => {
    const {symbol = '', lastPrice = 0, weight = 0} = position;
    return (
        <React.Fragment>
            <Col span={2}>
                <Icon style={{fontSize: '18px', marginTop: '2px'}} type="plus-square-o" />
            </Col>
            <Col span={8} style={{display: 'flex', flexDirection: 'row'}}>
                <MetricItem
                    valueStyle = {valueStyle} 
                    labelStyle={labelStyle} 
                    valueContainerStyle={valueAndLabelContainerStyle}
                    labelContainerStyle={valueAndLabelContainerStyle}
                    value={symbol} 
                    label='Symbol' 
                    noNumeric={true}
                    metricContainerStyle={metricContainerStyle}
                />
            </Col>
            <Col span={7}>
                <MetricItem
                    valueStyle = {valueStyle} 
                    labelStyle={labelStyle} 
                    valueContainerStyle={valueAndLabelContainerStyle}
                    labelContainerStyle={valueAndLabelContainerStyle}
                    value={Utils.formatMoneyValueMaxTwoDecimals(Number(lastPrice))} 
                    money={true}
                    label="Last Price" 
                    metricContainerStyle={metricContainerStyle}
                    style={containerStyle}
                />
            </Col>
            <Col span={7}>
                <MetricItem
                    valueStyle = {valueStyle} 
                    labelStyle={labelStyle} 
                    valueContainerStyle={valueAndLabelContainerStyle}
                    labelContainerStyle={valueAndLabelContainerStyle}
                    value={Number(weight)} 
                    label="Weight"
                    percentage
                    metricContainerStyle={metricContainerStyle}
                    style={containerStyle}
                />
            </Col>
        </React.Fragment>
    );
}

const PositionItem = ({position}) => {
    const {symbol = '', shares = 0, lastPrice = 0, sector = '', weightPct = 0} = position;

    return (
        <Row>
            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                <h3 style={positionTextlStyle}>Symbol:</h3>
                <h3 style={positionTextlStyle}>{symbol}</h3>
            </Col>
            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                <h3 style={positionTextlStyle}>Sector:</h3>
                <h3 style={positionTextlStyle}>{sector}</h3>
            </Col>
            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                <h3 style={positionTextlStyle}>Shares:</h3>
                <h3 style={positionTextlStyle}>{shares}</h3>
            </Col>
            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                <h3 style={positionTextlStyle}>Last Price:</h3>
                <h3 style={positionTextlStyle}>₹{Utils.formatMoneyValueMaxTwoDecimals(Number(lastPrice))}</h3>
            </Col>
            <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                <h3 style={positionTextlStyle}>Weight:</h3>
                <h3 style={positionTextlStyle}>{weightPct} %</h3>
            </Col>
        </Row>
    );
}

const positionTextlStyle = {
    fontSize: '16px',
    color: '#4A4A4A',
    marginBottom: '5px'
};

const customPanelStyleNew = {
    marginBottom: '10px'
};

const valueStyle = {
    color: '#4A4A4A',
    fontSize: '16px',
    fontWeight: 400,
    width: 'fit-content'
};

const labelStyle = {
    color: '#9B9B9B',
    fontSize: '14px',
    width: 'fit-content'
};

const valueAndLabelContainerStyle = {
    width: 'fit-content'
}

const customPanelStyle = {
    background: 'transparent',
    borderRadius: 4,
    border: 0,
    borderBottom: '1px solid #eaeaea',
    overflow: 'hidden',
    marginBottom: '10px'
};

const metricContainerStyle = {
    display: 'flex',
    flexDirection: 'column',
    width: 'fit-content'
};

const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
}