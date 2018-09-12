import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Media from 'react-media';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {Row, Col, Button} from 'antd';
import {withRouter} from 'react-router';
import {Motion, spring} from 'react-motion';
import {SearchStocks} from '../../../containers/Contest/CreateAdvice/SearchStocks';
import StockList from './components/StockList';
import StockPreviewList from './components/StockPreviewList';
import TimerComponent from '../Misc/TimerComponent';
import {verticalBox, horizontalBox} from '../../../constants';
import {handleCreateAjaxError} from '../../../utils';
import {submitEntry, getContestEntry, convertBackendPositions, processSelectedPosition, getContestSummary} from '../utils';

const dateFormat = 'YYYY-MM-DD';

class CreateEntry extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            bottomSheetOpenStatus: false,
            positions: [],
            previousPositions: [], // contains the positions for the previous entry in the current contest,
            showPreviousPositions: false, // Whether to show the previous positions for the current contest,
            contestActive: false, // Checks whether the contest is active,
            selectedDate: moment().format(dateFormat), // Date that's selected from the DatePicker
            contestStartDate: moment().format(dateFormat),
            contestEndDate: moment().format(dateFormat)
        };
    }

    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    conditionallyAddPosition = async selectedPositions => {
        const processedPositions = await processSelectedPosition(this.state.positions, selectedPositions);
        this.setState({positions: processedPositions, showPreviousPositions: false});
    }

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
                <TimerComponent endTime='15:30:00'/>
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
        return (
            !this.state.showPreviousPositions
            ? <StockList positions={this.state.positions} onStockItemChange={this.onStockItemChange} />
            : <StockPreviewList positions={this.state.positions} />
        )
    }

    getRecentContestEntry = () => new Promise((resolve, reject) => {
        const errorCallback = (err) => {
            const errorData = _.get(err, 'response.data', null);
            reject(errorData);
        };
        const requiredDate = moment().format(dateFormat);
        getContestEntry(requiredDate, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const positions = _.get(response, 'data.positions', []);
            const processedPositions = await convertBackendPositions(positions);
            this.setState({
                positions: processedPositions,
                previousPositions: processedPositions,
                showPreviousPositions: true
            });
        });
    })

    getContestStatus = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date});
        const errorCallback = err => {
            this.setState({contestActive: false});
        }
        getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const contestActive = _.get(response.data, 'active', false);
            const contestStartDate = moment(_.get(response.data, 'startDate', null)).format(dateFormat);
            const contestEndDate = moment(_.get(response.data, 'endDate', null)).format(dateFormat);
            this.setState({
                contestActive,
                contestStartDate, 
                contestEndDate
            });
        });
    }

    submitPositions = () => {
        submitEntry(this.state.positions, this.state.previousPositions.length > 0)
        .then(response => {
            console.log(response.data);
        })
        .catch(error => {
            console.log('Error Occured');
            return handleCreateAjaxError(error, this.props.history, this.props.match.url)
        })
        .finally(() => {
            console.log('Request Ended');
        });
    }

    componentWillMount = () => {
        this.getRecentContestEntry();
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
                            {
                                this.state.previousPositions.length > 0 ? 'EDIT' : 'ADD'
                            }
                        </Button>
                        {
                            !this.state.showPreviousPositions &&
                            <Button 
                                    style={submitButtonStyle}
                                    onClick={this.submitPositions}
                            >
                                {
                                    this.state.previousPositions.length > 0 ? 'UPDATE' : 'SUBMIT'
                                }
                            </Button>
                        }
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