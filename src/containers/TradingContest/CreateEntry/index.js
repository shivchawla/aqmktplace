import React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {Row, Col, Tabs, Button} from 'antd';
import {withRouter} from 'react-router';
import {Motion, spring} from 'react-motion';
import {SearchStocks} from '../../../containers/Contest/CreateAdvice/SearchStocks';
import StockEditListItem from './components/StockEditListItem';
import StockList from './components/StockList';
import TimerComponent from '../Misc/TimerComponent';
import {verticalBox, horizontalBox} from '../../../constants';
import {Utils} from '../../../utils';
import {constructTradingContestPositions} from '../utils';

const TabPane = Tabs.TabPane;

class CreateEntry extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            bottomSheetOpenStatus: false,
            positions: []
        };
    }

    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    conditionallyAddPosition = selectedPositions => new Promise((resolve, reject) => {
        this.setState({positions: selectedPositions});
    })

    onStockItemChange = (symbol, value) => {
        const clonedPositions = _.map(this.state.positions, _.cloneDeep);
        const requiredPositionIndex = _.findIndex(clonedPositions, position => position.symbol === symbol);
        if (requiredPositionIndex !== -1) {
            const requiredPosition = clonedPositions[requiredPositionIndex];
            clonedPositions[requiredPositionIndex] = {
                ...requiredPosition,
                points: value
            };
            this.setState({positions: clonedPositions});
        }
    }

    renderSearchStocksBottomSheet = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Motion style={{x: spring(this.state.bottomSheetOpenStatus ? 0 : -(global.screen.height))}}>
                            {
                                ({x}) => 
                                    <div 
                                        style={{
                                            transform: `translate3d(0, ${x}px, 0)`,
                                            position: 'absolute',
                                            zIndex: '20',
                                            backgroundColor: '#fff',
                                            zIndex: '20000'
                                        }}
                                    >
                                        <SearchStocks 
                                            toggleBottomSheet={this.toggleSearchStockBottomSheet}
                                            addPositions={this.conditionallyAddPosition}
                                            portfolioPositions={this.state.positions}
                                            filters={{}}
                                            ref={el => this.searchStockComponent = el}
                                            history={this.props.history}
                                            pageUrl={this.props.match.url}
                                            isUpdate={false}
                                            benchmark='NIFTY_50'
                                        />
                                    </div>
                            }
                        </Motion>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <SwipeableBottomSheet 
                                fullScreen 
                                style={{zIndex: '20000'}}
                                overlayStyle={{overflow: 'hidden'}}
                                open={this.state.bottomSheetOpenStatus}
                                onChange={this.toggleSearchStockBottomSheet}
                                swipeableViewsProps={{
                                    disabled: false
                                }}
                        >
                            <SearchStocks 
                                toggleBottomSheet={this.toggleSearchStockBottomSheet}
                                addPositions={this.conditionallyAddPosition}
                                portfolioPositions={this.state.positions}
                                filters={{}}
                                ref={el => this.searchStockComponent = el}
                                history={this.props.history}
                                pageUrl={this.props.match.url}
                                isUpdate={false}
                                benchmark='NIFTY_50'
                            />
                        </SwipeableBottomSheet>
                    )}
                />
            </React.Fragment>
        )
    }

    componentDidMount() {
        this.searchStockComponent.resetSearchFilters();
    }

    renderEmptySelections = () => {
        return (
            <Col span={24} style={{...verticalBox, marginTop: '-100px', top: '50%'}}>
                <TimerComponent endDate='2018-09-12'/>
                <h3 style={{textAlign: 'center', padding: '0 20px'}}>
                    Please add 5 stocks to participate in today’s contest
                </h3>
                <Button 
                        style={emptyPortfolioButtonStyle}
                        onClick={this.toggleSearchStockBottomSheet}
                >
                    ADD STOCKS
                </Button>
            </Col>
        );
    }

    renderStockList = () => {
        return <StockList positions={this.state.positions} onStockItemChange={this.onStockItemChange}/>;
    }

    submitPositions = () => {
        const positions = _.map(this.state.positions, _.cloneDeep);
        const tradeablePositions = constructTradingContestPositions(positions);
        console.log(tradeablePositions);
    }

    render() {
        return (
            <Row
                    className='create-entry-container' 
                    style={{width: '100%', height: global.screen.height - 45}}
            >
                {this.renderSearchStocksBottomSheet()}
                {
                    this.state.positions.length === 0
                    ? this.renderEmptySelections()
                    : this.renderStockList()
                }
                {
                    this.state.positions.length > 0 &&
                    <Col 
                            span={24} 
                            style={{
                                ...horizontalBox, 
                                ...fabContainerStyle, 
                                justifyContent: 'space-between',
                                padding: '0 20px'
                            }}
                    >
                        <Button 
                                style={{...submitButtonStyle, backgroundColor: '#155FC0'}}
                                onClick={this.toggleSearchStockBottomSheet}
                        >
                            ADD
                        </Button>
                        <Button 
                                style={submitButtonStyle}
                                onClick={this.submitPositions}
                        >
                            SUBMIT
                        </Button>
                    </Col>
                }
            </Row>
        );
    }
}

export default withRouter(CreateEntry);

const fabContainerStyle = {
    position: 'absolute',
    bottom: '40px',
    width: '100%',
};

const submitButtonStyle = {
    backgroundColor: '#15C08F',
    fontWeight: '400',
    color: '#fff',
    width: '100px',
    display: 'flex',
    fontSize: '14px',
    color: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 3px 8px #8D8A8A',
    zIndex: 100,
    border: 'none'
};

const emptyPortfolioButtonStyle = {
    backgroundColor: '#15C08F',
    color: '#fff',
    borderRadius: '4px',
    width: '80%',
    border: 'none',
    height: '50px',
    position: 'fixed',
    bottom: '25px'
}