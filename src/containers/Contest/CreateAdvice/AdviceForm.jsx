import * as React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {StickyContainer, Sticky} from 'react-sticky';
import {Motion, spring} from 'react-motion';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Row, Col, Select, Button, Modal, Tag, Icon, Affix, Radio, Spin} from 'antd';
import {Button as MobileButton, Picker, List, LocaleProvider, SegmentedControl} from 'antd-mobile';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {Portfolio} from './Portfolio';
import {PortfolioPieChart} from './PortfolioPieChart';
import {SearchStocks} from './SearchStocks';
import LoginModal from '../../../containers/LoginModal';
import SliderInput from '../../../components/AqSliderInput';
import LoaderModal from '../../../components/LoaderModal';
import {AqPageHeader} from '../../../components/AqPageHeader';
import AppLayout from '../../../containers/AppLayout';
import {AqMobileLayout} from '../../AqMobileLayout/Layout';
import {benchmarks} from '../../../constants/benchmarks';
import {shadowBoxStyle, horizontalBox, metricColor, benchmarkColor, verticalBox, primaryColor} from '../../../constants';
import {CreateAdviceCrumb, UpdateAdviceCrumb} from '../../../constants/breadcrumbs';
import {getBreadCrumbArray, fetchAjax, openNotification, Utils, handleCreateAjaxError, getStockPerformance} from '../../../utils';
import {getNextWeekday} from '../../../utils/date';
import { MetricItem } from '../../../components/MetricItem';
import enUS from 'antd-mobile/lib/locale-provider/en_US';

const {Option} = Select;
const textColor = '#595959';
const dateFormat = 'YYYY-MM-DD';
const {requestUrl} = require('../../../localConfig');
const RadioGroup = Radio.Group;
const defaultAdviceError = {
    message: '',
    errorCode: '',
    detail: {
        MAX_NET_VALUE: {valid: true},
        MAX_SECTOR_COUNT: {valid: true},
        MAX_STOCK_EXPOSURE: {valid: true},
        MIN_POS_COUNT: {valid: true},
        MIN_SECTOR_COUNT: {valid: true},
        MAX_SECTOR_EXPOSURE: {valid: true}
    }
};

this.benchmark = 'NIFTY_50';

class ContestAdviceFormImpl extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.searchStocks = null;
        const savedPositions = Utils.getFromLocalStorage('positions');
        const savedBenchmark = Utils.getFromLocalStorage('benchmark');
        const benchmark = savedBenchmark === undefined ? 'NIFTY_50' : JSON.parse(Utils.getFromLocalStorage('benchmark')).benchmark;
        const positions = savedPositions === undefined 
                ?   []
                :   JSON.parse(Utils.getFromLocalStorage('positions')).data;
        this.state = {
            adviceActive: false,
            positions,
            benchmark,
            bottomSheetOpenStatus: false,
            stockSearchFilters: {
                industry: '',
                sector: '',
                universe: 'NIFTY_500'
            },
            adviceError: defaultAdviceError,
            showAdviceErrorDialog: false,
            adviceSubmissionLoading: false,
            adviceCreationLoading: false,
            highStockSeries: [],
            openBenchmarkChangeModal: false,
            loading: false,
            contestId: null,
            noActiveContests: false,
            notPresentInLatestContest: false,
            name: '',
            portfolioStockViewMobile: true,
            showPortfolioByStock: true,
            performanceMetrics: {},
            loginModalVisible: false,
            portfolioNetValue: 0,
            portfolioMaxNetValue: 1000000,
            maxStockTargetTotalHard: 0,
            maxSectorTargetTotalHard: 0,
            maxStockTargetTotalSoft: 0,
            maxSectorTargetTotalSoft: 0,
        };
    }

    updatePositions = (positions = [], callback = undefined) => {
        let sectorData = this.processPositionToSectors(positions);
        const maxNetValue = this.getMaxNetValueLimit(sectorData);
        this.setState({
            positions,
            portfolioNetValue: this.getNetvalue(positions),
            portfolioMaxNetValue: maxNetValue
        }, () => {
            callback && callback();
        });
    }

    toggleLoginModal = () => {
        this.setState({loginModalVisible: !this.state.loginModalVisible});
    }

    togglePortfolioStockViewMobile = () => {
        this.setState({portfolioStockViewMobile: !this.state.portfolioStockViewMobile});
    }

    renderBenchmarkDropdown = () => {
        const dropdownStyle = {width: '200px'};

        return (
            <Row>
                <Col span={24}>
                    <h3 style={labelTextStyle}>Portfolio Benchmark</h3>
                </Col>
                <Col span={24}>
                    <Select
                            disabled={this.props.isUpdate || !this.state.showPortfolioByStock} 
                            style={dropdownStyle} 
                            value={this.state.benchmark} 
                            onChange={value => this.state.positions.length > 0 
                                        ? this.handleBenchmarkChange(value) 
                                        : this.handleEmptyPortfolioBenchmarkChange(value)
                                    }
                    >
                        {
                            benchmarks.map((benchmark, index) => {
                                return <Option key={index} value={benchmark}>{benchmark}</Option>
                            })
                        }
                    </Select>
                </Col>
                <Col span={24}>
                    {
                        this.state.loadingBenchmarkConfig &&
                        <div style={{...horizontalBox, marginTop: '10px'}}>
                            <h3 style={{fontSize: '12px'}}>Loading Benchmark Config</h3>
                            <Icon style={{fontSize: '18px', marginLeft: '5px'}} type="loading" />
                        </div>
                    }
                </Col>
            </Row>
        );
    }

    onBenchmarkPickerChange = value => {
        // this.setState({benchmark: value[0]});
        this.benchmark = value[0];
        this.toggleBenchmarkChangeModal();
    }

    renderBenchmarkDropdownMobile = () => {
        return (
            <Col span={24}>
                <Picker
                        data={benchmarks.map(benchmark => {return {label: benchmark, value: benchmark}})}
                        title=""
                        cols={1}
                        okText="Select"
                        dismissText="Cancel"
                        onChange={value => this.state.positions.length > 0 
                                    ? this.onBenchmarkPickerChange(value)
                                    : this.handleEmptyPortfolioBenchmarkChange(value[0])
                                }
                        extra={this.state.benchmark}
                        disabled={this.props.isUpdate}
                >
                    <List.Item style={{paddingLeft: '0px', paddingRight: '0px'}} arrow="horizontal">
                        Benchmark
                    </List.Item>
                </Picker>
            </Col>
        );
    }

    handleBenchmarkChange = benchmark => {
        this.benchmark = benchmark;
        this.toggleBenchmarkChangeModal();
    }

    handleEmptyPortfolioBenchmarkChange = benchmark => {
        !this.props.isUpdate && Utils.localStorageSaveObject('benchmark', {benchmark});
        this.setState({benchmark}, () => {
            this.fetchBenchmarkConfig(benchmark);
        });
    }

    fetchBenchmarkConfig = benchmark => {
        this.setState({loadingBenchmarkConfig: true});
        const positions = [];
        this.getBenchmarkConfig(benchmark, positions)
        .then(() => {
            !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: []});
            this.searchStockComponent.resetFilterFromParent(this.state.stockSearchFilters.sector, this.state.stockSearchFilters.industry);
            this.setState({
                positions: []
            }, () => {
                this.searchStockComponent.resetSearchFilters()
                .then(() => {
                    this.toggleSearchStockBottomSheet();
                })
            });
        })
        .catch(err => console.log(err))
        .finally(() => {
            this.setState({loadingBenchmarkConfig: false});
            openNotification('info', 'Configurations Loaded', `New Configurations loaded for Benchmark: ${benchmark}`);
        });
    }

    resetPortfolioWithNewBenchmark = () => {
        const benchmark = this.benchmark;
        Utils.localStorageSaveObject('benchmark', {benchmark})
        this.setState({benchmark, openBenchmarkChangeModal: false}, () => {
            this.fetchBenchmarkConfig(benchmark);
        });
    }

    handleSubmitAdvice = (type='validate') => new Promise((resolve, reject) => {
        if (type !== 'validate' && !Utils.isLoggedIn()) {
            this.toggleLoginModal();
            return;
        }
        const adviceUrl = type === 'validate' ? `${requestUrl}/advice/validate` : `${requestUrl}/advice/create`;
        const requestObject = this.constructCreateAdviceRequestObject(type);
        let adviceId = null;
        this.setState({adviceSubmissionLoading: true, adviceCreationLoading: type !== 'validate'});
        axios({
            url: type === 'validate' 
                    ? adviceUrl 
                    : this.props.isUpdate 
                            ? `${requestUrl}/advice/${this.props.adviceId}` 
                            : adviceUrl,
            method: type === 'validate' 
                    ? 'POST' 
                    : this.props.isUpdate 
                            ? 'PATCH' 
                            : 'POST',
            data: requestObject,
            headers: type === 'validate' ? null : Utils.getAuthTokenHeader()
        })
        .then(response => {
            const {data} = response;
            const detail = _.get(data, 'detail', {});
            if (data.valid === false) {
                this.setState({
                    adviceError: {
                        errorCode: 1108,
                        message: 'Validation Error',
                        detail
                    }
                }, () => {
                    type === 'create' && this.toggleAdviceErrorDialog();
                });

                return this.state.positions.length === 0 ? 
                    null
                    : this.getAdvicePortfolioPerformance();   
            } else {
                this.setState({adviceError: defaultAdviceError});
                adviceId = _.get(response.data, '_id', null);
                const contestUrl = `${requestUrl}/contest/${adviceId}/action?type=enter`;
                if (type !== 'validate') {
                    const contestRequest =  type === 'validate' 
                        ?   Promise.resolve({update: false})
                        :   this.props.isUpdate && this.state.adviceActive
                            ?   Promise.resolve({update: true})
                            :   axios({
                                    url: contestUrl,
                                    method: 'POST',
                                    headers: Utils.getAuthTokenHeader()
                                });
                
                    return contestRequest;
                }  
                return this.state.positions.length === 0 ? 
                    null
                    : this.getAdvicePortfolioPerformance();             
            }
        })
        .then(response => {
            if (response !== null) {
                if (type != 'validate') {
                    const update = _.get(response, 'update', false);
                    this.props.history.push(`/contest/entry/${adviceId}`);
                } else {
                    const {portfolioPerformanceMetrics} = response;
                    this.setState({performanceMetrics: portfolioPerformanceMetrics});
                }    
            }
        })
        .catch(error => {
            //console.log(error);
            return handleCreateAjaxError(
                error, 
                this.props.history, 
                this.props.match.url, 
                _.get(error, 'response.data.errorCode', 0) === 1108
            )
        })
        .finally(() => {
            this.setState({adviceSubmissionLoading: false, adviceCreationLoading: false});
            resolve(true);
        })
    })

    toggleAdviceErrorDialog = () => {
        this.setState({showAdviceErrorDialog: !this.state.showAdviceErrorDialog});
    }

    convertStringToReadable = value => {
        const errKvp = {
            MAX_SECTOR_EXPOSURE: 'Maximum Sector Exposure',
            MAX_STOCK_EXPOSURE: 'Maximum Stock Exposure',
            MIN_POS_COUNT: 'Minimum Position Count',
            MAX_NET_VALUE: 'Maximum Net Value',
            MIN_NET_VALUE: 'Minimum Net Value',
            MIN_SECTOR_COUNT: 'Minimum Sector Count',
            MAX_SECTOR_COUNT: 'Maximum Sector Count',
        };
        
        return errKvp[value];
    }

    renderAdviceErrorDialog = () => {
        const {errorCode = 0, message = '', detail = {}} = this.state.adviceError;
        return (
            <Modal
                    style={{top: '10px'}}
                    title="Portfolio Validation Status"
                    onOk={this.toggleAdviceErrorDialog}
                    onCancel={this.toggleAdviceErrorDialog}
                    visible={this.state.showAdviceErrorDialog}
            >
                <Row>
                    <Col span={24}>
                        {
                            // Getting the keys of all the invalid error items from the response
                            Object.keys(detail)
                                .map((invalidKey, index) => {
                                    return (
                                        <Row key={index} style={{marginBottom: '20px'}}>
                                            <Col span={24} style={horizontalBox}>
                                                <Icon 
                                                    style={{
                                                        fontSize: '18px', 
                                                        marginRight: '10px',
                                                        color: detail[invalidKey].valid === false 
                                                            ? metricColor.negative 
                                                            : metricColor.positive
                                                    }}
                                                    type={
                                                        detail[invalidKey].valid === false 
                                                        ? "exclamation-circle"
                                                        : "check-circle"
                                                    }
                                                />
                                                <h3 style={{fontSize: '14px'}}>
                                                    {this.convertStringToReadable(invalidKey)}
                                                </h3>
                                            </Col>
                                            <Col span={24}>
                                                <h3 
                                                        style={{fontSize: '16px', color: '#4a4a4a', marginLeft: '28px'}}
                                                >
                                                    {
                                                        detail[invalidKey].message === undefined
                                                        ? 'Valid' 
                                                        : detail[invalidKey].message
                                                    }
                                                </h3>
                                            </Col>
                                        </Row>
                                    )
                                }
                            )
                        }
                    </Col>
                </Row>
            </Modal>
        );
    }

    renderPortfolio = () => {
        return (
            <Portfolio 
                toggleBottomSheet={this.toggleSearchStockBottomSheet}
                data={this.state.positions}
                onChange={this.onChange}
                benchmark={this.state.benchmark}
                getAdvicePerformance={this.getAdvicePortfolioPerformance}
                stockSearchFilters={this.state.stockSearchFilters}
                getValidationErrors={this.getPortfolioValidationErrors}
                updateIndividualPosition={this.updateIndividualPosition}
                deletePositions={this.deletePositions}
                renderPortfolioPieChart={this.renderPortfolioPieChart}
                portfolioStockViewMobile={this.state.portfolioStockViewMobile}
                showPortfolioByStock= {this.state.showPortfolioByStock}
                maxSectorTargetTotal={this.state.maxSectorTargetTotalSoft}
                maxStockTargetTotal={this.state.maxStockTargetTotalSoft}
                maxSectorTargetTotalHard={this.state.maxSectorTargetTotalHard}
                maxStockTargetTotalHard={this.state.maxStockTargetTotalHard}
                isUpdate={this.props.isUpdate}
            />
        )
    }

    togglePortfolioViewDesktop = () => {
        this.setState({showPortfolioByStock: !this.state.showPortfolioByStock});
    }

    renderPortfolioViewSelectorDesktop = () => {
        return (
            <RadioGroup 
                    style={{marginLeft: '5px'}}
                    onChange={this.togglePortfolioViewDesktop} 
                    value={this.state.showPortfolioByStock}
                    size="small"
            >
                <Radio.Button value={true}>Stock</Radio.Button>
                <Radio.Button value={false} disabled={this.state.positions.length === 0}>
                    Sector
                </Radio.Button>
            </RadioGroup>
        );
    }
    
    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    renderSearchStocksBottomSheet = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <Motion style={{x: spring(this.state.bottomSheetOpenStatus ? -44 : -(global.screen.height + 45))}}>
                            {
                                ({x}) => 
                                    <div 
                                        style={{
                                            transform: `translate3d(0, ${x}px, 0)`,
                                            position: 'absolute',
                                            zIndex: '20',
                                            backgroundColor: '#fff'
                                        }}
                                    >
                                        <SearchStocks 
                                            toggleBottomSheet={this.toggleSearchStockBottomSheet}
                                            addPositions={this.conditionallyAddPosition}
                                            portfolioPositions={this.state.positions}
                                            filters={this.state.stockSearchFilters}
                                            ref={el => this.searchStockComponent = el}
                                            history={this.props.history}
                                            pageUrl={this.props.match.url}
                                            isUpdate={this.props.isUpdate}
                                            benchmark={this.state.benchmark}
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
                                filters={this.state.stockSearchFilters}
                                ref={el => this.searchStockComponent = el}
                                history={this.props.history}
                                pageUrl={this.props.match.url}
                                isUpdate={this.props.isUpdate}
                                benchmark={this.state.benchmark}
                            />
                        </SwipeableBottomSheet>
                    )}
                />
            </React.Fragment>
        )
    }

    conditionallyAddPosition = selectedPositions => new Promise((resolve, reject) => {
        const positions = [...this.state.positions];
        this.updatePositions(this.updateAllWeights(selectedPositions), () => {
            !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
            this.handleSubmitAdvice('validate')
            .then(() => resolve(true));
        })
        // this.setState({positions: this.updateAllWeights(selectedPositions)}, () => {
        //     !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
        //     this.handleSubmitAdvice('validate')
        //     .then(() => resolve(true));
        // });
    })

    deletePositions = toBeDeletedPositions => {
        const positions = [...this.state.positions];
        toBeDeletedPositions.map(toBeDeletedPosition => {
            const positionIndex = _.findIndex(positions, position => position.key === toBeDeletedPosition.key);
            if (positionIndex > -1) {
                positions.splice(positionIndex, 1);
            }
        });
        this.updatePositions(this.updateAllWeights(positions), () => {
            !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
            this.handleSubmitAdvice('validate');
        })
        // this.setState({positions: this.updateAllWeights(positions)}, () => {
        //     !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
        //     this.handleSubmitAdvice('validate')
        // });
    }

    calculateTotalReturnFromTargetTotal = data => {
        return data.map(item => {
            // Check if the position was already present in the positions array
            const positionIndex = _.findIndex(this.state.positions, position => position.symbol === item.symbol);
            item.effTotal = positionIndex !== -1 ? this.state.positions[positionIndex].effTotal : undefined;
            const total = item.effTotal !== undefined
                    ? item.effTotal
                    : this.getEffTotal(item, data);
                    // : item.lastPrice > 30000 ? item.lastPrice : 30000
            item['effTotal'] = total;
            item['shares'] = this.calculateSharesFromTotalReturn(total, item.lastPrice);
            item['totalValue'] = item['lastPrice'] * this.calculateSharesFromTotalReturn(total, item.lastPrice);

            return item;
        })
    }

    getEffTotal = (stock, data) => {
        const newPositions = data.filter(item => item.sector === stock.sector).filter(item => item.effTotal === undefined);
        const newPositionsLength = newPositions.length;
        const positionsInSector = data.filter(item => item.sector === stock.sector).filter(item => item.effTotal);
        const nPositionsInSector = positionsInSector.length;
        const maxSectorExposure = _.max([0, _.min([this.state.maxSectorTargetTotalSoft, ((nPositionsInSector + newPositionsLength)* this.state.maxStockTargetTotalSoft)])]);
        const maxAllowance = maxSectorExposure - _.sum(positionsInSector.filter(item => item.effTotal != undefined).map(item => item.effTotal));
        return _.min([30000, (maxAllowance / _.max([newPositions.length, 1]))]);
    }

    updateIndividualPosition = position => {
        const positions = [...this.state.positions];
        const targetPosition = positions.filter(positionItem => positionItem.key === position.key)[0];
        if (targetPosition !== undefined) {
            targetPosition.shares = position.shares;
            targetPosition.effTotal = position.effTotal;
            targetPosition.totalValue = position.totalValue;
        }
        this.updatePositions(this.updateAllWeights(positions), () => {
            !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
            this.handleSubmitAdvice();
        })
        // this.setState({positions: this.updateAllWeights(positions)}, () => {
        //     !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
        //     this.handleSubmitAdvice();
        // });
    }
    
    updateAllWeights = data => {
        const nData = this.calculateTotalReturnFromTargetTotal(data);
        const totalSummation = Number(this.getTotalValueSummation(nData).toFixed(2));
        return nData.map(item => {
            const weight = totalSummation === 0 ? 0 : Number(((item['totalValue'] / totalSummation * 100)).toFixed(2));
            item['weight'] = weight;

            return item;
        });
    }

    calculateSharesFromTotalReturn = (effTotalReturn = 0, lastPrice = 0) => {
        return Math.floor(effTotalReturn / lastPrice);
    }

    getTotalValueSummation = data => {
        let totalValue = 0;
        data.map(item => {
            totalValue += item.totalValue;
        });
        
        return totalValue;
    }

    getAdvicePortfolioPerformance = selectedBenchmark => new Promise((resolve, reject) => {
        const performanceUrl = `${requestUrl}/performance`;
        const benchmark = this.state.benchmark;
        const requestObject = this.constructAdvicePerformanceRequestObject(benchmark);
        Promise.all([
            axios({
                method: 'POST',
                url: performanceUrl,
                data: requestObject,
                headers: Utils.getAuthTokenHeader()
            }),
            getStockPerformance(benchmark)
        ])
        .then(([portfolioPerformanceResponse, benchmarkPerformanceResponseData]) => {
            const portfolioPerformanceData = this.processPortfolioPerformanceResponse(portfolioPerformanceResponse);
            const portfolioPerformanceMetrics = _.get(portfolioPerformanceResponse.data, 'portfolioPerformance.value.true', {});
            let highStockSeries = [
                {
                    name: 'Contest Entry',
                    data: portfolioPerformanceData,
                    color: metricColor.neutral
                },
                {
                    name: benchmark,
                    data: benchmarkPerformanceResponseData,
                    color: benchmarkColor
                }
            ];
            resolve({highStockSeries, portfolioPerformanceMetrics});
        })
        .catch(error => {
            handleCreateAjaxError(error, this.props.history, this.props.match.url);
            reject(error);
        })
    })

    /*
        Constructs the request payload for the advice portfolio performance network call
    */
    constructAdvicePerformanceRequestObject = (benchmark = 'NIFTY_50') => {
        const startDate = moment().subtract(1, 'y').format(dateFormat);
        const endDate = moment().format(dateFormat);
        const requestObject = {
            name: '',
            detail: {
                startDate,
                endDate,
                positions: this.getPortfolioPositions(),
                cash: 0
            },
            benchmark: {
                ticker: benchmark,
                securityType: "EQ",
                country: "IN",
                exchange: "NSE"
            }
        };

        return requestObject;
    }

    /**
     *  Processes the response from the /advice/performance network call into HighStock series data format
     */
    processPortfolioPerformanceResponse = performanceResponse => {
        return _.get(performanceResponse.data, 'portfolioPerformance.portfolioValues', []).map(
            item => {
                return [moment(item.date, dateFormat).valueOf(), Number(item.netValue.toFixed(2))]
            }
        );
    }

    /*
        Changes the content of the portfolio array.
        Passed as a prop to AqStockTableMod
    */
    onChange = positions => {
        new Promise(resolve => {
            const validatePortfolio = _.debounce(() => {
                this.validatePortfolio();
            }, 1000);
            this.updatePositions(_.cloneDeep(positions), () => {
                !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
                validatePortfolio();
            })
        });
        // this.setState({positions: _.cloneDeep(positions)}, () => {
        //     !this.props.isUpdate && Utils.localStorageSaveObject('positions', {data: this.state.positions});
        //     validatePortfolio();
        // });
    }

    validatePortfolio = () => {
        this.handleSubmitAdvice('validate');
    }

    /**
     *  Constructs the request payload for the create advice network call
     */
    constructCreateAdviceRequestObject = () => {
        const startDate = moment().format(dateFormat);
        const endDate = moment(startDate).add(500, 'year').format(dateFormat); // Adding 500 years to the end date
        const name = `${this.state.benchmark} ${this.state.stockSearchFilters.sector} ${this.state.stockSearchFilters.universe}`;
        
        const requestObject = {
            name,
            portfolio: {
                name,
                detail: {
                    startDate,
                    endDate,
                    positions: this.getPortfolioPositions(),
                    cash: 0
                },
                benchmark: {
                    ticker: this.state.benchmark,
                    securityType: 'EQ',
                    country: 'IN',
                    exchange: 'NSE'
                },
            },
            rebalance: 'Daily',
            maxNotional: 1000000,
            investmentObjective: {
                goal: {
                    field: 'goalField',
                    investorType: 'Contest Investors',
                    suitability: 'Suitability'
                },
                sectors: {
                    detail: ['Tech']
                },
                portfolioValuation: {
                    field: 'Blend'
                },
                capitalization: {
                    field: 'Small Cap'
                },
                userText: {
                    detail: 'investmentObjUserText'
                }
            },
            public: true,
            contestOnly: true
        }

        return requestObject;
    }

    /*
        Gets the verified positions from the portfolio table.
        A position is validated if the symbol is valid and number of shares > 0
    */
    getVerifiedPositions = (positions = [...this.state.positions]) => {
        const verifiedTransactions = positions.filter(item => {
            return item.symbol.length > 1 && Number(item.shares) > 0 && item.shares.toString().length > 0;
        });

        return verifiedTransactions;
    }

    /**
     *  Gets the verified portfolio positions in the required format for the create advice network call
     */
    getPortfolioPositions = () => {
        const verifiedRawPositions = this.getVerifiedPositions();
        const positions = [];
        verifiedRawPositions.map((item, index) => {
            const position = {
                security: {
                    ticker: item.symbol.toUpperCase(),
                    securityType: 'EQ',
                    country: 'IN',
                    exchange: 'NSE'
                }, 
                quantity: parseInt(item.shares)
            };
            positions.push(position);
        });

        return positions;
    }

    /**
     * Returns all the portfolio errors occured while validating the portfolio
     */
    getPortfolioValidationErrors = () => {
        const {detail = {}} = this.state.adviceError;
        return Object.keys(detail).filter(item => detail[item].valid === false)
                .map(invalidKey => {
                    return {
                        field: this.convertStringToReadable(invalidKey),
                        message: detail[invalidKey].message
                    };
                });
    }

    renderValidationErrors = (marginTop = '0') => {
        const errors = this.getPortfolioValidationErrors();
        return (
            <Tag 
                    style={{
                        marginTop, 
                        boxShadow: '0 3px 8px rgba(0, 0, 0, 0.2)',
                        position: global.screen.width > 600 ? 'absolute' : 'relative',
                        left: '0'
                    }} 
                    color={errors.length > 0 ? metricColor.negative : metricColor.positive}
                    onClick={this.toggleAdviceErrorDialog}
            >
                {
                    errors.length > 0
                    ? `${errors.length} Portfolio Validation Warnings`
                    :  'Valid Portfolio'
                }
            </Tag>
        );
    }

    toggleBenchmarkChangeModal = () => {
        this.setState({openBenchmarkChangeModal: !this.state.openBenchmarkChangeModal});
    }

    renderBenchmarkChangeWarningModal = () => {
        return (
            <Modal 
                    style={{top: '20px'}}
                    visible={this.state.openBenchmarkChangeModal}
                    title="Warning"
                    onOk={this.resetPortfolioWithNewBenchmark}
                    onCancel={this.toggleBenchmarkChangeModal}
            >
                <Row>
                    <Col span={24}>
                        <h3>Changing the Benchmark will reset your portfolio. Are you sure you want to change the benchmark ?</h3>
                    </Col>
                </Row>
            </Modal>
        );
    }

    renderNetValue = () => {
        return (
            <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                <MetricItem 
                    value={this.state.positions.filter(item => item.shares > 0).length}
                    label="Number of positions"
                    style={{width: '50%'}}
                />
                <div style={{...verticalBox, alignItems: 'flex-start'}}>
                    <MetricItem 
                        value={this.state.portfolioNetValue}
                        label="Net Value"
                        money
                    />
                    {/*<SliderInput 
                        style={{width: '100%'}}
                        disabled={!this.state.showPortfolioByStock}
                        sliderSpan={24}
                        inputSpan={24}
                        value={this.state.portfolioNetValue}
                        hideValue={true}
                        onChange={this.handleNetValueChange}
                        min={0}
                        max={this.state.portfolioMaxNetValue}
                        inputWidth='100%'
                    />*/}
                </div>
            </div>
        );
    }

    handleNetValueChange = newNetValue => {
        let positions = [...this.state.positions];
        let sectorData = this.processPositionToSectors(positions);
        const maxNetValue = this.getMaxNetValueLimit(sectorData);
        let oldNav = this.state.portfolioNetValue;
        let newNav = Number(newNetValue);
        let count = 0;
        let cNav = newNav - oldNav;
        while(Math.abs(cNav) > 5) {
            // if (count > 10) { break; }
            if (cNav > 0) {
                const sectorsWithPositiveAllowance = this.getSectorsWithPositiveAllowance(sectorData);
                sectorsWithPositiveAllowance.map(sector => {
                    const sectorNavChange = Math.min((cNav / sectorsWithPositiveAllowance.length), this.getSectorAllowance(sector));
                    positions = this.updatePositionsWithNewNav(sector, positions, sectorNavChange, cNav);
                });
            } else {
                const sectorsWithPositiveExposure = this.getSectorsWithPositiveExposure(sectorData);
                sectorsWithPositiveExposure.map(sector => {
                    const sectorNavChange = Math.max((cNav / sectorsWithPositiveExposure.length), -1*this.getSectorExposure(sector));
                    positions = this.updatePositionsWithNewNav(sector, positions, sectorNavChange, cNav);
                });
            }

            const currentNav = this.getCurrentNav(positions);
            cNav = newNav - currentNav;
            count++;
        }
        positions = this.updateAllWeights(positions);
        this.setState({
            positions,
            portfolioMaxNetValue: maxNetValue,
            portfolioNetValue: Number(newNetValue)
        }, () => {
            this.handleSubmitAdvice()
        });
    }

    getCurrentNav = positions => {
        return _.sum(positions.map(position => position.effTotal));
    }

    updatePositionsWithNewNav = (sector, positions, sectorNavChange) => {
        //const sectorNav = _.min([allowedSectorNavChange, sector.positions.length * maxStockTargetTotal, maxSectorTargetTotal]);
        //let sNav = sectorNav / Math.max(sector.positions.length, 1);
        //console.log('sectorNavChange', sectorNavChange);
        let positionsToChange = sector.positions.filter(position => {
            if (sectorNavChange > 0) { return position.effTotal < 50000 }
            else { return position.effTotal > 0 }
        });
        let nStocks = positionsToChange.length;

        let sNav = sectorNavChange / Math.max(nStocks, 1);
        // let sNav = allowedSectorNavChange / Math.max(sector.positions.length, 1);
        return positions.map(position => {
            const shouldModifyPosition = position.sector === sector.sector;
            const currentStockExposure = position.effTotal;
            let updatedStockExposure = _.max([_.min([(currentStockExposure + sNav), this.state.maxStockTargetTotalSoft]), 0]);
            let lastPrice = position.lastPrice;
            let nShares = Math.floor(updatedStockExposure / lastPrice);
            let totalValue = Number((nShares * lastPrice).toFixed(2));
            if (shouldModifyPosition) {
                position.effTotal = Number(updatedStockExposure.toFixed(2));
                position.shares = nShares;
                position.totalValue = totalValue;
            }

            return position;
        })
    }

    getSectorsWithPositiveAllowance = sectors => {
        return sectors.filter(sector => this.getSectorAllowance(sector) > 0);
    }

    getSectorsWithPositiveExposure = sectors => {
        return sectors.filter(sector => this.getSectorExposure(sector) > 0);
    }

    getSectorExposure = sector => {
        return _.sum(sector.positions.map(position => position.effTotal));
    }

    getSectorAllowance = sector => {
        const currentSectorNav = _.sum(sector.positions.map(position => position.effTotal));
        const sectorAllowance = Math.min((sector.positions.length * this.state.maxStockTargetTotalSoft), this.state.maxSectorTargetTotalSoft) - currentSectorNav;

        return sectorAllowance;
    }

    processPositionToSectors = positions => {
        const uniqueSectors = _.uniqBy(positions, 'sector').map(position => position.sector);

        return uniqueSectors.map(sector => {
            const sectorPositions = positions.filter(position => position.sector === sector);

            return {sector, positions: sectorPositions};
        });
    }

    getMaxNetValueLimit = (sectors, maxStockTargetTotal = this.state.maxStockTargetTotalSoft, maxSectorTargetTotal = this.state.maxSectorTargetTotalSoft) => {
        let maxNetValue = 0;
        sectors.map(sector => {
            const nPositions = sector.positions.length;
            maxNetValue += Math.min(nPositions * maxStockTargetTotal, maxSectorTargetTotal);
        });

        return maxNetValue;
    }

    updatePositionsWithStockChange = (sectorChangeNav, currentPositions, positionsToChange) => {
        // console.log('Positons to change', positionsToChange);
        // console.log('Current Positons', currentPositions);


        return currentPositions.map(position => {
            const numStocksinSector = currentPositions.filter(item => item.sector === position.sector).length;
            const sNav = sectorChangeNav / numStocksinSector;
            const shouldModifyPosition = _.findIndex(positionsToChange, item => item.symbol === position.symbol) > -1;
            let currentStockExposure = _.get(position, 'effTotal', 0);
            const lastPrice = _.get(position, 'lastPrice', 0);
            let updatedStockExposure = _.max([_.min([(currentStockExposure + sNav), this.state.maxStockTargetTotalSoft]), 0]);
            const nShares = Math.floor(updatedStockExposure / lastPrice);
            const totalValue = Number((lastPrice * nShares).toFixed(2));

            if(shouldModifyPosition) {
                // const nPosition = position;
                // console.log('Positions will be modified', position);
                // console.log('Update Stock Exposure', updatedStockExposure);
                position.shares = nShares;
                position.totalValue = totalValue;
                position.effTotal = updatedStockExposure;
                return position;
            } else {
                return position;
            }
        });
    }

    getSectorCountFromPositions = (positions = this.state.positions) => {
        return _.uniqBy(positions, 'sector').length;
    }

    renderNoActiveContestsScreen = () => {
        return (
            <Row style={{height: '400px', marginTop: '100px'}}>
                <Col span={24} style={verticalBox}>
                    <h1 style={{fontSize: '16px'}}>There are currently no active Contests to participate</h1>
                </Col>
            </Row>
        );
    }

    renderPortfolioPieChart = (chartId = "chart-container-desktop") => {
        const getColor = value => {
            return value >= 0 ? metricColor.positive : metricColor.negative;
        };
        const metricLabelStyle = {textAlign: 'center', fontSize: '12px'};
        const metricValueStyle = {textAlign: 'center', fontSize: '14px'};
        const metricContainerStyle={textAlign: 'center'};
        const annualReturn = Number((_.get(this.state, 'performanceMetrics.returns.totalreturn') * 100).toFixed(2));
        const volatility = Number((_.get(this.state, 'performanceMetrics.deviation.annualstandarddeviation', 0) * 100).toFixed(2));
        const maxLoss = Number((_.get(this.state, 'performanceMetrics.drawdown.maxdrawdown', 0) * 100).toFixed(2));

        return (
            <Col 
                    span={24} 
                    style={{
                        ...shadowBoxStyle, 
                        ...verticalBox, 
                        marginTop: '20px',
                        borderTop: `2px solid ${primaryColor}`
                    }}
            >
                <Spin spinning={this.state.adviceSubmissionLoading}>
                    <div 
                            style={{
                                ...horizontalBox, 
                                justifyContent: 'space-between',
                                width: '100%',
                                marginTop: '10px'
                            }}
                    >
                        <MetricItem 
                            label="Annual Return"
                            value={`${annualReturn} %`}
                            noNumeric
                            labelStyle={metricLabelStyle}
                            valueStyle={{...metricValueStyle}}
                            containerStyle={metricContainerStyle}
                            color
                        />
                        <MetricItem 
                            label="Volatility"
                            value={`${volatility} %`}
                            noNumeric
                            labelStyle={metricLabelStyle}
                            valueStyle={{...metricValueStyle}}
                            containerStyle={metricContainerStyle}
                            color
                        />
                        <MetricItem 
                            label="Max Loss"
                            value={`${maxLoss} %`}
                            noNumeric
                            labelStyle={metricLabelStyle}
                            valueStyle={{...metricValueStyle}}
                            containerStyle={metricContainerStyle}
                            color
                        />
                    </div>
                </Spin>
                <h3 style={{fontSize: '16px', marginTop: '10px'}}>Portfolio Composition</h3>
                <PortfolioPieChart chartId={chartId} data={this.state.positions} />
            </Col>
        );
    }

    renderPageContestDesktop = () => {
        const breadCrumbs = this.props.isUpdate
                ? getBreadCrumbArray(UpdateAdviceCrumb, [
                    {name: this.state.name, url: `/contest/entry/${this.props.adviceId}`},
                    {name: 'Update Entry'}
                ])
                : getBreadCrumbArray(UpdateAdviceCrumb, [
                    {name: 'Create Entry'}
                ]);

        return (
            <Row className='aq-page-container'>
                {this.renderAdviceErrorDialog()}
                {this.renderSearchStocksBottomSheet()}
                {this.renderBenchmarkChangeWarningModal()}
                <Col span={24} style={{padding: 0}}>
                    <AqPageHeader 
                        title={this.props.isUpdate ? "Update Entry" : "Create Entry"}
                        showTitle={true}
                        breadCrumbs={breadCrumbs}
                    >
                        <Col xl={0} md={24} sm={24} xs={24}>
                            {
                                this.state.preview &&
                                this.renderActionButtons('small')
                            }
                        </Col>
                    </AqPageHeader>
                </Col>
                <Col span={18} style={{...shadowBoxStyle, minHeight: '600px'}}>
                    <Row style={leftContainerStyle} type="flex" align="start">
                        <Col span={24} style={{...horizontalBox, justifyContent: 'space-between'}}>
                            {this.renderBenchmarkDropdown()} 
                            {
                                this.state.positions.length > 0 &&
                                this.renderNetValue()
                            }
                        </Col>
                        <Col span={24} style={{...horizontalBox, justifyContent: 'center', position: 'relative'}}>
                            {this.renderValidationErrors()}
                            <div style={verticalBox}>
                                <h3 style={{fontSize: '16px', marginBottom: '5px'}}>Portfolio View</h3>
                                {this.renderPortfolioViewSelectorDesktop()}
                            </div>
                        </Col>
                    </Row>
                    {/* <Row>
                        <Col span={24} style={verticalBox}>
                            <h3 style={{fontSize: '16px', marginBottom: '5px'}}>Portfolio View</h3>
                            {this.renderPortfolioViewSelectorDesktop()}
                        </Col>
                    </Row> */}
                    <Row style={{margin: '0 20px', marginBottom: '20px'}}>
                        <Col span={24}>
                            {this.renderPortfolio()}
                        </Col>
                    </Row>
                </Col>
                <Col span={6} style={{paddingLeft: '15px'}}>
                    <Row>
                        <Col span={24}>
                            <Button 
                                    icon="rocket" 
                                    type="primary" 
                                    onClick={() => this.handleSubmitAdvice('create')} 
                                    htmlType="submit"
                                    style={{height: '45px', width: '100%'}}
                                    loading={this.state.adviceSubmissionLoading}
                                    disabled={this.getPortfolioValidationErrors().length || this.state.positions.length < 1}
                            >
                                {
                                    this.props.isUpdate 
                                        ? (this.state.notPresentInLatestContest || !this.state.adviceActive)
                                            ? "UDPDATE AND ENTER CONTEST"
                                            : "UPDATE ENTRY"
                                        : 'ENTER CONTEST'
                                }
                            </Button>
                        </Col>
                        {
                            this.state.positions.length > 0 &&
                            this.renderPortfolioPieChart()
                        }
                    </Row>
                </Col>
            </Row>
        );
    } 

    renderAddStocksButtonMobile = () => {
        const errors = this.getPortfolioValidationErrors();

        return (
            <div
                    style={{
                        ...horizontalBox, 
                        width: '100%',
                        position: 'fixed',
                        zIndex: '10',
                        bottom: '20px',
                        background: 'transparent',
                        justifyContent: 'space-between'
                    }}
            >
                <MobileButton 
                        size="small" 
                        style={{
                            width: '150px',
                            boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3)',
                            margin: '0 auto',
                            background: '#30B9AD',
                            color: '#fff'
                        }}
                        onClick={this.toggleSearchStockBottomSheet}
                        disabled={this.state.adviceSubmissionLoading}
                >
                    ADD STOCKS
                </MobileButton>
                {
                    errors.length === 0 &&
                    <MobileButton 
                            size="small" 
                            type="primary" 
                            style={{
                                width: '150px',
                                boxShadow: '0 6px 18px rgba(0, 0, 0, 0.3)',
                                margin: '0 auto'
                            }}
                            loading={this.state.adviceSubmissionLoading}
                            onClick={() => this.handleSubmitAdvice('create')} 
                    >
                        {this.props.isUpdate ? "UPDATE ENTRY" : "CREATE ENTRY"}
                    </MobileButton>
                }
            </div>
        );
    }

    renderPageContestMobile = () => {
        return (
            <Row>
                {this.renderAdviceErrorDialog()}
                {this.renderSearchStocksBottomSheet()}
                {this.renderBenchmarkChangeWarningModal()}
                {
                    this.renderAddStocksButtonMobile()
                }
                <div style={{display: !this.state.bottomSheetOpenStatus ? 'block' : 'none'}}>
                    <StickyContainer className='container'>
                        <Affix offsetTop={0}>
                            <Col 
                                    span={24} 
                                    style={{
                                        ...horizontalBox,
                                        height: '40px', 
                                        // marginTop: '10px',
                                        justifyContent: 'center'
                                    }}
                            >
                                {this.renderValidationErrors('0px')}
                            </Col>
                        </Affix>
                        <Col span={24} style={verticalBox}>
                            <SegmentedControl 
                                values={['Stock', 'Sector']} 
                                onValueChange={this.togglePortfolioStockViewMobile}
                                selectedIndex={this.state.portfolioStockViewMobile === true ? 0 : 1}
                            />
                        </Col>
                        <Col span={24}>
                            <Row 
                                    style={{padding: '0px', paddingLeft: '10px', paddingBottom: '5px'}} 
                                    type="flex" 
                                    align="start"
                            >
                                {this.renderBenchmarkDropdownMobile()}
                            </Row>
                            <Row>
                                <Col span={24}>
                                    {this.renderPortfolio()}
                                </Col>
                            </Row>
                        </Col>
                    </StickyContainer>
                </div>
            </Row>
        );
    }

    getBenchmarkConfig = (benchmark, positions = [...this.state.positions]) => new Promise((resolve, reject) => {
        let sectorData = this.processPositionToSectors(positions);
        const confgUrl = `${requestUrl}/config?type=contest&benchmark=${benchmark}`;
        fetchAjax(confgUrl, this.props.history, this.props.match.url)
        .then(configResponse => {
            const configData = configResponse.data;
            const sector = _.get(configData, 'sector', '');
            const industry = _.get(configData, 'industry', '');
            const universe = _.get(configData, 'universe', 'NIFTY_500');
            const maxStockExposureSoft = _.get(configData, 'portfolio.MAX_STOCK_EXPOSURE.SOFT', 50000);
            const maxStockExposureHard = _.get(configData, 'portfolio.MAX_STOCK_EXPOSURE.HARD', 60000);
            const maxSectorExposureSoft = _.get(configData, 'portfolio.MAX_SECTOR_EXPOSURE.SOFT', 18000000000);
            const maxSectorExposureHard = _.get(configData, 'portfolio.MAX_SECTOR_EXPOSURE.HARD', 21000000000);
            const maxNetValue = this.getMaxNetValueLimit(sectorData, maxStockExposureSoft, maxSectorExposureSoft);
            this.setState({
                stockSearchFilters: {
                    industry,
                    sector,
                    universe
                },
                maxStockTargetTotalHard: maxStockExposureHard,
                maxSectorTargetTotalHard: maxSectorExposureHard,
                maxStockTargetTotalSoft: maxStockExposureSoft,
                maxSectorTargetTotalSoft: maxSectorExposureSoft,
                portfolioMaxNetValue: maxNetValue
            }, () => {resolve(true)})
        })
        .catch(error => reject(error));
    }) 

    getAdviceSummaryAndPortfolio = adviceId => new Promise((resolve, reject) => {
        let benchmark = null;
        Promise.all([
            this.getAdviceSummary(adviceId),
            this.getAdvicePortfolio(adviceId),
            this.getAdviceSummaryInContest()
        ])
        .then(([adviceSummary, advicePortfolio]) => {
            benchmark = _.get(adviceSummary, 'portfolio.benchmark.ticker');
            const name = _.get(adviceSummary, 'name', '');
            const positions = this.processPositions(_.get(advicePortfolio, 'detail.positions', []));
            let sectorData = this.processPositionToSectors(positions);
            const maxNetValue = this.getMaxNetValueLimit(sectorData);
            this.setState({
                name,
                benchmark,
                positions,
                portfolioNetValue: this.getNetvalue(positions),
                portfolioMaxNetValue: maxNetValue
            });
        })
        .then(() => {
            return Promise.all([
                this.handleSubmitAdvice(),
                this.getBenchmarkConfig(benchmark)
            ])
        })
        .then(() => {
            resolve(true);
        })
        .catch(err => reject(err));
    })

    processPositions = positions => {
        return positions.map(position => {
            const total = Number((_.get(position, 'quantity', 0) * _.get(position, 'lastPrice', 0)).toFixed(2));
            const symbol = _.get(position, 'security.detail.NSE_ID', null) !== null
                    ? _.get(position, 'security.detail.NSE_ID', null) 
                    : _.get(position, 'security.ticker', null);

            return {
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                sector: _.get(position, 'security.detail.Sector', null),
                name: _.get(position, 'security.detail.Nse_Name', ''),
                ticker: symbol,
                symbol,
                effTotal: total,
                shares: Number(_.get(position, 'quantity', 0)),
                lastPrice: Number(_.get(position, 'lastPrice', 0)),
                totalValue: total,
                weight: Number((_.get(position, 'weightInPortfolio', 0) * 100).toFixed(2))
            };
        })
    }

    getAdviceSummary = adviceId => new Promise((resolve, reject) => {
        const adviceSumaryUrl = `${requestUrl}/advice/${adviceId}`;
        fetchAjax(adviceSumaryUrl, this.props.history, this.props.match.url)
        .then(response => resolve(response.data))
        .catch(error => reject(error));
    })

    getAdvicePortfolio = adviceId => new Promise((resolve, reject) => {
        const nextWeekday = moment(getNextWeekday()).format(dateFormat);
        const advicePortfolioUrl = `${requestUrl}/advice/${adviceId}/portfolio?date=${nextWeekday}`;
        fetchAjax(advicePortfolioUrl, this.props.history, this.props.match.url)
        .then(response => resolve(response.data))
        .catch(error => reject(error));
    })

    getAdviceSummaryInContest = adviceId => new Promise((resolve, reject) => {
        const contestAdviceUrl = `${requestUrl}/contest/entry/${this.props.match.params.id}`;
        const errorCallback = error => {
            const errorMessage = _.get(error, 'response.data.message', '');
            if (errorMessage === 'Advice is not present in this contest') {
                this.setState({notPresentInLatestContest: true});
            }
        };
        fetchAjax(contestAdviceUrl, this.props.history, this.props.match.url, undefined, errorCallback)
        .then(adviceResponse => {
            const adviceActive = _.get(adviceResponse.data, 'active', false);
            this.setState({adviceActive});
        })
        .finally(() => {
            resolve(true);
        })
    })

    getNetvalue = (positions, field = 'totalValue') => {
        let totalValue = 0;
        positions.map(position => {
            totalValue += position[field];
        });

        return Number(totalValue.toFixed(2));
    }

    getActiveContestToParticipate = () => new Promise((resolve, reject) => {
        const contestsUrl = `${requestUrl}/contest?current=true`;
        fetchAjax(contestsUrl, this.props.history, this.props.match.url)
        .then(contestResponse => {
            const contestData = contestResponse.data;
            const contests = _.get(contestData, 'contests', []);
            if (contests.length > 0) {
                const currentContestId = _.get(contests[0], '_id', null);
                resolve(currentContestId);
            } else {
                reject({message: 'No Contest Found'});
            }
        })
        .catch(err => reject(err));
    })

    // Initialze portfolioNetvalue
    initializeNetValue = () => {
        let sectorData = this.processPositionToSectors(this.state.positions);
        const maxNetValue = this.getMaxNetValueLimit(sectorData);

        this.setState({
            portfolioNetValue: this.getNetvalue(this.state.positions),
            portfolioMaxNetValue: maxNetValue
        });
    }

    componentWillMount() {
        this.setState({loading: true});
        openNotification('info', 'Info', 'Changes to the portfolio after 12pm will be reflected on the next trading day')
        if (this.props.isUpdate) {
            const adviceId = this.props.adviceId;
            this.getAdviceSummaryAndPortfolio(adviceId)
            .finally(() => {
                this.setState({loading: false});
            })
        } else {
            this.initializeNetValue();
            Promise.all([
                this.handleSubmitAdvice(),   
                this.getActiveContestToParticipate(),
                this.getBenchmarkConfig(this.state.benchmark)
            ])
            .catch(err => {
                this.setState({noActiveContests: true});
            })
            .finally(() => {
                this.setState({loading: false});
            })
        }
        
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    renderPageContent = () => {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => this.renderPageContestMobile()}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => this.renderPageContestDesktop()}
                />
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <LoginModal 
                    visible={this.state.loginModalVisible}
                    toggleModal={this.toggleLoginModal}
                    createEntry={() => this.handleSubmitAdvice('create')}
                />
                <LoaderModal 
                    text={
                        this.props.isUpdate ? 'Updating Entry' : 'Creating Entry'
                    }
                    visible={this.state.adviceCreationLoading}
                />
                <Media 
                    query="(max-width: 600px)"
                    render={() => 
                        <LocaleProvider locale={enUS}>
                            <AqMobileLayout 
                                    loading={this.state.loading}
                                    innerPage={true} 
                                    customHeader={
                                        <h3 style={{fontSize: '16px', marginLeft: '10px'}}>
                                            {
                                                this.props.isUpdate 
                                                ? 'Update Contest Entry' 
                                                : 'Edit Contest Entry'
                                            }
                                        </h3>
                                    }
                            >
                                {
                                    this.state.noActiveContests
                                    ? this.renderNoActiveContestsScreen()
                                    : this.renderPageContent()
                                }
                            </AqMobileLayout>
                        </LocaleProvider>
                    }
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => 
                        <LocaleProvider locale={enUS}>
                            <AppLayout 
                                content={
                                    this.state.noActiveContests
                                    ? this.renderNoActiveContestsScreen()
                                    : this.renderPageContent()
                                } 
                                loading={this.state.loading}
                                noFooter={this.state.noActiveContests || global.screen.width <= 600}
                            />
                        </LocaleProvider>
                    }
                />
            </React.Fragment>
        );
    }
}

export default withRouter(ContestAdviceFormImpl);

const leftContainerStyle = {
    padding: '20px',
    paddingBottom: '5px'
};

const labelTextStyle = {fontSize: '14px', color: textColor};