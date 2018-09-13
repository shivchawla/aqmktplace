import React from 'react';
import _ from 'lodash';
import moment from 'moment';
import Media from 'react-media';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {Row, Col} from 'antd';
import {Button} from 'antd-mobile';
import {withRouter} from 'react-router';
import {Motion, spring} from 'react-motion';
import {SearchStocks} from '../../../containers/Contest/CreateAdvice/SearchStocks';
import StockList from './components/StockList';
import StockPreviewList from './components/StockPreviewList';
import TimerComponent from '../Misc/TimerComponent';
import DateComponent from '../Misc/DateComponent';
import LoaderComponent from '../Misc/Loader';
import {verticalBox, horizontalBox} from '../../../constants';
import {contestEndHour} from '../constants';
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
            contestEndDate: moment().format(dateFormat),
            noEntryFound: false,
            loading: false
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
        console.log(symbol, value);
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
        // this.searchStockComponent.resetSearchFilters();
    }

    renderEmptySelections = () => {
        const contestStarted = moment().isSameOrAfter(moment(this.state.contestStartDate, dateFormat));
        const todayDate = moment().format(dateFormat);

        return (
            <Col span={24} style={{...verticalBox, marginTop: '-100px', top: '50%'}}>
                {
                    moment(this.state.selectedDate).isSame(todayDate) && this.state.contestActive
                    ?   contestStarted
                        ?   <TimerComponent date={this.state.endDate} contestStarted={true} />
                        :   <TimerComponent date={this.state.startDate} />
                    :   null
                }
                {
                    (this.state.positions.length === 0 || this.state.previousPositions.length === 0) 
                    && !moment(this.state.selectedDate).isSame(todayDate) && this.state.contestActive
                    && <h3 style={{textAlign: 'center', padding: '0 20px'}}>No entry found for selected date</h3>
                }
                {
                    moment(this.state.selectedDate).isSame(todayDate) && this.state.contestActive && 
                    <React.Fragment>
                        <h3 style={{textAlign: 'center', padding: '0 20px'}}>Please add 5 stocks to participate in today’s contest</h3>
                        <Button 
                                style={emptyPortfolioButtonStyle}
                                onClick={this.toggleSearchStockBottomSheet}
                        >
                            ADD STOCKS
                        </Button>
                    </React.Fragment>
                }
            </Col>
        );
    }

    renderStockList = () => {
        return (
            !this.state.showPreviousPositions
            ? <StockList positions={this.state.positions} onStockItemChange={this.onStockItemChange} />
            : <StockPreviewList positions={this.state.previousPositions} />
        )
    }

    getRecentContestEntry = (requiredDate = moment().format(dateFormat)) => new Promise((resolve, reject) => {
        this.setState({loading: true});
        const errorCallback = (err) => {
            const errorData = _.get(err, 'response.data', null);
            this.setState({noEntryFound: true, positions: [], previousPositions: []});

            reject(errorData);
        };

        getContestEntry(requiredDate, this.props.history, this.props.match.url, errorCallback)
        .then(async response => {
            const positions = _.get(response, 'data.positions', []);
            const processedPositions = await convertBackendPositions(positions);
            this.setState({noEntryFound: positions.length === 0});
            resolve({positions: processedPositions});
        })
        .finally(() => {
            this.setState({loading: false});
        })
    })

    getContestStatus = selectedDate => {
        const date = moment(selectedDate).format(dateFormat);
        this.setState({selectedDate: date});
        const errorCallback = err => {
            this.setState({contestActive: false});
        }
        return getContestSummary(date, this.props.history, this.props.match.url, errorCallback)
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

    handleContestDateChange = async selectedDate => {
        const requiredDate = selectedDate.format(dateFormat);
        this.setState({selectedDate: requiredDate});
        const contestData = await this.getRecentContestEntry(requiredDate);
        const {positions = []} = contestData;
        this.setState({
            positions,
            previousPositions: positions,
            showPreviousPositions: true,
        }) 
    }

    componentWillMount = () => {
        this.setState({loading: true});
        Promise.all([
            this.getRecentContestEntry(),
            this.getContestStatus(this.state.selectedDate)
        ])
        .then(([contestData]) => {
            const {positions = []} = contestData;
            this.setState({
                positions,
                previousPositions: positions,
                showPreviousPositions: true
            });
        })
        .finally(() => {
            this.setState({loading: false});
        })
    }

    renderPageContent() {
        let currentDate = moment();
        currentDate.hours(contestEndHour);
        currentDate.minutes(30);
        currentDate.seconds(0);
        const contestSubmissionOver = moment().isBefore(currentDate);
        const todayDate = moment().format(dateFormat);

        return (
            <Row
                    className='create-entry-container' 
                    style={{width: '100%', height: global.screen.height - 45}}
            >
                {this.renderSearchStocksBottomSheet()}
                <Col span={24}>
                    <DateComponent 
                        color='#737373'
                        onDateChange={this.handleContestDateChange}
                        style={{padding: '0 10px', position: 'relative'}}
                        date={moment(this.state.selectedDate).format('Do MMM YY')}
                    />
                </Col>
                {
                    (this.state.positions.length === 0 && this.state.previousPositions.length == 0)
                    ? this.renderEmptySelections()
                    : this.renderStockList()
                }
                {
                    contestSubmissionOver && 
                    moment(this.state.selectedDate).isSame(todayDate) && 
                    this.state.positions.length > 0 &&
                    <Col 
                            span={24} 
                            style={{
                                ...horizontalBox, 
                                ...fabContainerStyle, 
                                justifyContent: this.state.showPreviousPositions ? 'center' : 'space-between',
                                padding: '0 20px',
                                zIndex: 100
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

    render() {
        if (this.state.loading) {
            return <LoaderComponent />;
        } else {
            return this.renderPageContent();
        }
    }
}

export default withRouter(CreateEntry);

const fabContainerStyle = {
    position: 'fixed',
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
    zIndex: 2000,
    border: 'none'
};

const emptyPortfolioButtonStyle = {
    backgroundColor: '#15C08F',
    color: '#fff',
    borderRadius: '4px',
    width: '80%',
    border: 'none',
    // height: '50px',
    position: 'fixed',
    bottom: '25px'
}