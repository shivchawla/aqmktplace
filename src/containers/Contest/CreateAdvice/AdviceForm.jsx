import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Row, Col, Select, Button, Modal, Tag, Icon} from 'antd';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {Portfolio} from './Portfolio';
import {PortfolioPieChart} from './PortfolioPieChart';
import {SearchStocks} from './SearchStocks';
import AppLayout from '../../../containers/AppLayout';
import {benchmarks} from '../../../constants/benchmarks';
import {shadowBoxStyle, horizontalBox, metricColor, benchmarkColor, verticalBox} from '../../../constants';
import {fetchAjax, openNotification, Utils, handleCreateAjaxError, getStockPerformance} from '../../../utils';
import { MetricItem } from '../../../components/MetricItem';

const {Option} = Select;
const textColor = '#595959';
const dateFormat = 'YYYY-MM-DD';
const {requestUrl} = require('../../../localConfig');
const defaultAdviceError = {
    message: '',
    errorCode: '',
    detail: {}
};
this.benchmark = 'NIFTY_50';

class ContestAdviceFormImpl extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            positions: [],
            benchmark: 'NIFTY_50',
            bottomSheetOpenStatus: false,
            stockSearchFilters: {
                industry: '',
                sector: '',
                universe: 'NIFTY_500'
            },
            adviceError: defaultAdviceError,
            showAdviceErrorDialog: false,
            adviceSubmissionLoading: false,
            highStockSeries: [],
            openBenchmarkChangeModal: false,
            loading: false
        };
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
                            disabled={this.props.isUpdate} 
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

    handleBenchmarkChange = benchmark => {
        this.benchmark = benchmark;
        this.toggleBenchmarkChangeModal();
    }

    handleEmptyPortfolioBenchmarkChange = benchmark => {
        this.setState({benchmark}, () => {
            this.fetchBenchmarkConfig(benchmark);
        });
    }

    fetchBenchmarkConfig = benchmark => {
        const confgUrl = `${requestUrl}/config?type=contest&benchmark=${benchmark}`;
        this.setState({loadingBenchmarkConfig: true});
        fetchAjax(confgUrl, this.props.history, this.props.match.url)
        .then(configResponse => {
            const configData = configResponse.data;
            const sector = _.get(configData, 'sector', '');
            const industry = _.get(configData, 'industry', '');
            const universe = _.get(configData, 'universe', 'NIFTY_500');
            this.setState({
                stockSearchFilters: {
                    industry,
                    sector,
                    universe
                },
                positions: []
            }, () => {
                this.searchStockComponent.resetSearchFilters()
                .then(() => {
                    this.toggleSearchStockBottomSheet();
                })
            });
        })
        .finally(() => {
            this.setState({loadingBenchmarkConfig: false});
            openNotification('info', 'Configurations Loaded', `New Configurations loaded for Benchmark: ${benchmark}`);
        });
    }

    resetPortfolioWithNewBenchmark = () => {
        const benchmark = this.benchmark;
        this.setState({benchmark, openBenchmarkChangeModal: false}, () => {
            this.fetchBenchmarkConfig(benchmark);
        });
    }

    handleSubmitAdvice = (type='validate') => new Promise((resolve, reject) => {
        const adviceUrl = `${requestUrl}/advice`;
        const requestObject = this.constructCreateAdviceRequestObject(type);
        const contestId = '5b49cbe8f464ce168007bb79';
        let adviceId = null;
        this.setState({adviceSubmissionLoading: true});
        axios({
            url: type === 'validate' 
                    ? adviceUrl 
                    : this.props.isUpdate 
                            ? `${adviceUrl}/${this.props.adviceId}` 
                            : adviceUrl,
            // url: adviceUrl,
            method: type === 'validate' 
                    ? 'POST' 
                    : this.props.isUpdate 
                            ? 'PATCH' 
                            : 'POST',
            // method: 'POST',
            data: type === 'validate' 
                    ? requestObject 
                    : this.props.isUpdate 
                            ? requestObject.advice 
                            : requestObject,
            headers: Utils.getAuthTokenHeader()
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

                return null;
            } else {
                this.setState({adviceError: defaultAdviceError});
                adviceId = _.get(response.data, '_id', null);
                const contestUrl = `${requestUrl}/contest/${contestId}/${adviceId}?type=enter`;
                if (type !== 'validate') {
                    const contestRequest =  type === 'validate' 
                        ?   Promise.resolve({update: false})
                        :   this.props.isUpdate
                            ?   Promise.resolve({update: true})
                            :   axios({
                                    url: contestUrl,
                                    method: 'POST',
                                    headers: Utils.getAuthTokenHeader()
                                });
                
                    return contestRequest;
                }  
                return null;              
            }
        })
        .then(response => {
            if (response != null) {
                const update = _.get(response, 'update', false);
                // if (update) {
                //     // openNotification('Success', 'Success', 'Advice Successfully Updated');
                //     this.props.history.push(`/advice/${adviceId}`);
                // } else {
                //     // openNotification('Success', 'Contest Participation Successful', 'Successfully participated in contest');
                //     this.props.history.push(`/advice/${adviceId}`);
                // }
                this.props.history.push(`/contest/entry/${contestId}/${adviceId}`);
            }
            // this.props.history.push(`/advice/${adviceId}`);
            // openNotification('Success', 'Success', 'Advice Successfully Updated');
        })
        .catch(error => {
            return handleCreateAjaxError(
                error, 
                this.props.history, 
                this.props.match.url, 
                _.get(error, 'response.data.errorCode', 0) === 1108
            )
        })
        .finally(() => {
            this.setState({adviceSubmissionLoading: false});
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
            MIN_SECTOR_COUNT: 'Minimum Sector Count',
            MAX_SECTOR_COUNT: 'Maximum Sector Count',
        };
        
        return errKvp[value];
    }

    renderAdviceErrorDialog = () => {
        const {errorCode = 0, message = '', detail = {}} = this.state.adviceError;
        return (
            <Modal
                    title={message}
                    onOk={this.toggleAdviceErrorDialog}
                    onCancel={this.toggleAdviceErrorDialog}
                    visible={this.state.showAdviceErrorDialog}
            >
                <Row>
                    <Col span={24}>
                        {
                            // Getting the keys of all the invalid error items from the response
                            Object.keys(detail).filter(item => detail[item].valid === false)
                                .map((invalidKey, index) => {
                                    return (
                                        <Row key={index} style={{marginBottom: '20px'}}>
                                            <Col span={24}>
                                                <h3 
                                                        style={{fontSize: '14px', color: metricColor.negative}}
                                                >
                                                    {this.convertStringToReadable(invalidKey)}
                                                </h3>
                                            </Col>
                                            <Col span={24}>
                                                <h3 
                                                        style={{fontSize: '16px', color: '#4a4a4a'}}
                                                >
                                                    {detail[invalidKey].message}
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

    renderPortfolioTable = () => {
        return (
            <Portfolio 
                toggleBottomSheet={this.toggleSearchStockBottomSheet}
                data={this.state.positions}
                onChange={this.onChange}
                benchmark={this.state.benchmark}
                getAdvicePerformance={this.getAdvicePortfolioPerformance}
                stockSearchFilters={this.state.stockSearchFilters}
                getValidationErrors={this.getPortfolioValidationErrors}
            />
        )
    }
    
    toggleSearchStockBottomSheet = () => {
        this.setState({bottomSheetOpenStatus: !this.state.bottomSheetOpenStatus});
    }

    renderSearchStocksBottomSheet = () => {
        return (
            <SwipeableBottomSheet 
                        fullScreen 
                        style={{zIndex: '20000'}}
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
                />
            </SwipeableBottomSheet>
        )
    }

    conditionallyAddPosition = selectedPositions => new Promise((resolve, reject) => {
        const positions = [...this.state.positions];
        this.setState({positions: this.updateAllWeights(selectedPositions)}, () => {
            this.handleSubmitAdvice('validate')
            .then(() => resolve(true));
        });
    })

    calculateTotalReturnFromTargetTotal = data => {
        return data.map(item => {
            // Check if the position was already present in the positions array
            const positionIndex = _.findIndex(this.state.positions, position => position.symbol === item.symbol);
            item.effTotal = positionIndex !== -1 ? this.state.positions[positionIndex].effTotal : undefined;
            const total = item.effTotal !== undefined
                    ? item.effTotal
                    : item.lastPrice > 10000 ? item.lastPrice : 10000
            item['effTotal'] = total;
            item['shares'] = this.calculateSharesFromTotalReturn(total, item.lastPrice);
            item['totalValue'] = item['lastPrice'] * this.calculateSharesFromTotalReturn(total, item.lastPrice);

            return item;
        })
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
                    name: 'Advice',
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
        const validatePortfolio = _.debounce(() => {
            this.validatePortfolio();
        }, 1000);

        this.setState({positions: _.cloneDeep(positions)}, () => {
            validatePortfolio();
        });
    }

    validatePortfolio = () => {
        this.handleSubmitAdvice('validate');
    }

    /**
     *  Constructs the request payload for the create advice network call
     */
    constructCreateAdviceRequestObject = (type='validate') => {
        const startDate = moment().format(dateFormat);
        const endDate = moment(startDate).add(500, 'year').format(dateFormat); // Adding 500 years to the end date
        const name = `${this.state.benchmark} ${this.state.stockSearchFilters.sector} ${this.state.stockSearchFilters.universe}`;
        
        const requestObject = {
            advice: {
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
            },
            action: type
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

    renderValidationErrors = () => {
        const errors = this.getPortfolioValidationErrors();
        return errors.length > 0
                ?   <Tag 
                        style={{marginTop: '20px'}} 
                        color={metricColor.negative}
                        onClick={this.toggleAdviceErrorDialog}
                    >
                        {errors.length} Portfolio Validation Wanings
                    </Tag>
                :   null;
    }

    toggleBenchmarkChangeModal = () => {
        this.setState({openBenchmarkChangeModal: !this.state.openBenchmarkChangeModal});
    }

    renderBenchmarkChangeWarningModal = () => {
        return (
            <Modal
                    visible={this.state.openBenchmarkChangeModal}
                    title="Warning"
                    onOk={this.resetPortfolioWithNewBenchmark}
                    onCancel={this.toggleBenchmarkChangeModal}
            >
                <Row>
                    <Col span={24}>
                        <h3>Changing the Benchmark will reset your portfolio to empty. Are you sure you want to change the benchmark ?</h3>
                    </Col>
                </Row>
            </Modal>
        );
    }

    renderNetValue = () => {
        return (
            <div style={{...horizontalBox, justifyContent: 'flex-end'}}>
                <MetricItem 
                    value={this.state.positions.length}
                    label="Number of positions"
                />
                <MetricItem 
                    value={this.getNetvalue()}
                    label="Net Value"
                    money
                />
            </div>
        );
    }

    renderPageContent = () => {
        return (
            <Row className='aq-page-container'>
                {this.renderAdviceErrorDialog()}
                {this.renderSearchStocksBottomSheet()}
                {this.renderBenchmarkChangeWarningModal()}
                <Col span={24} style={{height: '40px', marginTop: '10px'}}>
                    <h3 style={{fontSize: '22px'}}>
                        {this.props.isUpdate ? 'Update Contest Entry' : 'Create Contest Entry'}
                    </h3>
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
                        <Col span={24}>
                            {this.renderValidationErrors()}
                        </Col>
                    </Row>
                    <Row style={{margin: '0 20px', marginBottom: '20px'}}>
                        <Col span={24}>
                            {this.renderPortfolioTable()}
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
                                {this.props.isUpdate ? 'UPDATE ENTRY' : 'ENTER CONTEST'}
                            </Button>
                        </Col>
                        {
                            this.state.positions.length > 0 &&
                            <Col span={24} style={{...shadowBoxStyle, ...verticalBox, marginTop: '20px'}}>
                                <h3 style={{fontSize: '16px', marginTop: '10px'}}>Portfolio Composition</h3>
                                <PortfolioPieChart data={this.state.positions} />
                            </Col>
                        }
                    </Row>
                </Col>
            </Row>
        );
    } 

    getBenchmarkConfig = benchmark => new Promise((resolve, reject) => {
        const confgUrl = `${requestUrl}/config?type=contest&benchmark=${benchmark}`;
        fetchAjax(confgUrl, this.props.history, this.props.match.url)
        .then(configResponse => {
            const configData = configResponse.data;
            const sector = _.get(configData, 'sector', '');
            const industry = _.get(configData, 'industry', '');
            const universe = _.get(configData, 'universe', 'NIFTY_500');
            this.setState({
                stockSearchFilters: {
                    industry,
                    sector,
                    universe
                }
            }, () => {resolve(true)})
        })
        .catch(error => reject(error));
    }) 

    getAdviceSummaryAndPortfolio = adviceId => {
        let benchmark = null;
        this.setState({loading: true});
        Promise.all([
            this.getAdviceSummary(adviceId),
            this.getAdvicePortfolio(adviceId)
        ])
        .then(([adviceSummary, advicePortfolio]) => {
            benchmark = _.get(adviceSummary, 'portfolio.benchmark.ticker');
            const positions = _.get(advicePortfolio, 'detail.positions', []);
            this.setState({
                benchmark,
                positions: this.processPositions(positions)
            });
        })
        .then(() => {
            return this.getBenchmarkConfig(benchmark);
        })
        // .then(() => {
        //     this.searchStockComponent.fetchStocks('')
        // })
        .catch(err => err)
        .finally(() => {
            this.setState({loading: false});
        })        
    }

    processPositions = positions => {
        return positions.map(position => {
            const total = Number((_.get(position, 'quantity', 0) * _.get(position, 'lastPrice', 0)).toFixed(2))
            return {
                key: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                ticker: _.get(position, 'security.ticker', null),
                symbol: _.get(position, 'security.ticker', null),
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
        const advicePortfolioUrl = `${requestUrl}/advice/${adviceId}/portfolio`;
        fetchAjax(advicePortfolioUrl, this.props.history, this.props.match.url)
        .then(response => resolve(response.data))
        .catch(error => reject(error));
    })

    getNetvalue = () => {
        const {positions = []} = this.state;
        let totalValue = 0;
        positions.map(position => {
            totalValue += position.totalValue;
        });

        return totalValue;
    }

    componentWillMount() {
        if (this.props.isUpdate) {
            const adviceId = this.props.adviceId;
            this.getAdviceSummaryAndPortfolio(adviceId);
        }
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        return (
            <AppLayout 
                content={this.renderPageContent()} 
                loading={this.state.loading}
            />
        );
    }
}

export default withRouter(ContestAdviceFormImpl);

const leftContainerStyle = {
    padding: '20px'
};

const labelTextStyle = {fontSize: '14px', color: textColor};