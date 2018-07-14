import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import moment from 'moment';
import {Row, Col, Select, Button, Modal, Tag} from 'antd';
import SwipeableBottomSheet from 'react-swipeable-bottom-sheet';
import {Portfolio} from './Portfolio';
import {PortfolioPieChart} from './PortfolioPieChart';
import {SearchStocks} from './SearchStocks';
import AppLayout from '../../../containers/AppLayout';
import {benchmarks} from '../../../constants/benchmarks';
import {shadowBoxStyle, horizontalBox, metricColor, benchmarkColor} from '../../../constants';
import {fetchAjax, openNotification, Utils, handleCreateAjaxError, getStockPerformance} from '../../../utils';

const {Option} = Select;
const textColor = '#595959';
const dateFormat = 'YYYY-MM-DD';
const {requestUrl} = require('../../../localConfig');
const defaultAdviceError = {
    message: '',
    errorCode: '',
    detail: {}
};

export default class ContestAdviceForm extends React.Component {
    constructor(props) {
        super(props);
        this.searchStockComponent = null;
        this.state = {
            positions: [],
            benchmark: 'NIFTY_50',
            bottomSheetOpenStatus: true,
            stockSearchFilters: {
                industry: '',
                sector: '',
                universe: 'NIFTY_500'
            },
            adviceError: defaultAdviceError,
            showAdviceErrorDialog: false,
            adviceSubmissionLoading: false,
            highStockSeries: []
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
                            style={dropdownStyle} 
                            defaultValue={this.state.benchmark} 
                            onChange={this.handleBenchmarkChange}
                    >
                        {
                            benchmarks.map((benchmark, index) => {
                                return <Option key={index} value={benchmark}>{benchmark}</Option>
                            })
                        }
                    </Select>
                </Col>
            </Row>
        );
    }

    handleBenchmarkChange = benchmark => {
        this.setState({benchmark}, () => {
            this.fetchBenchmarkConfig(benchmark);
        });
    }

    fetchBenchmarkConfig = benchmark => {
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
                },
                positions: []
            }, () => {
                this.searchStockComponent.fetchStocks('')
                .then(() => {
                    this.toggleSearchStockBottomSheet();
                })
            });
        })
        .finally(() => {
            openNotification('info', 'Configurations Loaded', `New Configurations loaded for Benchmark: ${benchmark}`);
        });
    }

    handleSubmitAdvice = (type='validate') => {
        const adviceUrl = `${requestUrl}/advice`;
        const requestObject = this.constructCreateAdviceRequestObject(type);
        this.setState({adviceSubmissionLoading: true});
        axios({
            // url: this.props.isUpdate ? `${this.adviceUrl}/${this.props.adviceId}` : this.adviceUrl,
            url: adviceUrl,
            // method: this.props.isUpdate ? 'PATCH' : 'POST',
            method: 'POST',
            data: requestObject,
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
            } else {
                this.setState({adviceError: defaultAdviceError});
            }
        })
        .catch(error => {
            if (error.response) {
                const {response = {}} = error;
                const errorCode = _.get(response, 'data.errorCode', 0);
                const message = _.get(response, 'data.message', '');
                const detail = _.get(response, 'data.detail', {});
                this.setState({
                    adviceError: {
                        errorCode,
                        message,
                        detail
                    }
                }, () => {
                    errorCode === 1108 && this.toggleAdviceErrorDialog();
                    this.toggleAdviceErrorDialog();
                });
            }

            return handleCreateAjaxError(
                error, 
                this.props.history, 
                this.props.match.url, 
                _.get(error, 'response.data.errorCode', 0) === 1108
            )
        })
        .finally(() => {
            this.setState({adviceSubmissionLoading: false});
        })
    }

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
                    addPosition={this.conditionallyAddPosition}
                    portfolioPositions={this.state.positions}
                    filters={this.state.stockSearchFilters}
                    ref={el => this.searchStockComponent = el}
                    history={this.props.history}
                    pageUrl={this.props.match.url}
                />
            </SwipeableBottomSheet>
        )
    }

    conditionallyAddPosition = position => {
        const positions = [...this.state.positions];
        // Check if position is present if present delete from portfolio else add to portfolio
        const targetPosition = positions.filter(positionItem => positionItem.symbol === position.symbol)[0];
        if (targetPosition === undefined) { // Not present in portfolio, add
            positions.push(position);
        } else { // Present in the portfolio
            const toBeDeletedIndex = _.findIndex(positions, positionItem => positionItem.symbol === position.symbol);
            positions.splice(toBeDeletedIndex, 1);
        }
        this.setState({positions: this.updateAllWeights(positions)}, () => {
            this.validatePortfolio();
        });
    }

    updateAllWeights = data => {
        const totalSummation = Number(this.getTotalValueSummation(data).toFixed(2));
        return data.map((item, index) => {
            const weight = totalSummation === 0 ? 0 : Number(((item['totalValue'] / totalSummation * 100)).toFixed(2));
            item['weight'] = weight;
            return item;
        });
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
        this.setState({positions: _.cloneDeep(positions)}, () => {
            this.validatePortfolio();
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

    renderPageContent = () => {
        return (
            <Row className='aq-page-container'>
                {this.renderAdviceErrorDialog()}
                {this.renderSearchStocksBottomSheet()}
                <Col span={24} style={{height: '40px'}}></Col>
                <Col span={18} style={{...shadowBoxStyle}}>
                    <Row style={leftContainerStyle} type="flex" align="end">
                        <Col span={12}>
                            {this.renderBenchmarkDropdown()}
                            {this.renderValidationErrors()}
                        </Col>
                        <Col span={12} style={{...horizontalBox, justifyContent: 'flex-end'}}>
                            <Button 
                                    icon="rocket" 
                                    type="primary" 
                                    onClick={() => this.handleSubmitAdvice('create')} 
                                    htmlType="submit"
                                    style={{height: '45px'}}
                                    loading={this.state.adviceSubmissionLoading}
                                    disabled={this.getPortfolioValidationErrors().length}
                            >
                                SUBMIT ADVICE
                            </Button>
                        </Col>
                    </Row>
                    <Row style={{margin: '0 20px', marginBottom: '20px'}}>
                        <Col span={24}>
                            {this.renderPortfolioTable()}
                        </Col>
                    </Row>
                </Col>
                <Col span={5} offset={1} style={shadowBoxStyle}>
                    <PortfolioPieChart data={this.state.positions} />
                </Col>
            </Row>
        );
    } 

    shouldComponentUpdate(nextProps, nextState) {
        if (!_.isEqual(nextProps, this.props) || !_.isEqual(nextState, this.state)) {
            return true;
        }

        return false;
    }

    render() {
        console.log('Advice Form Rendered');
        
        return (
            <AppLayout content={this.renderPageContent()}/>
        );
    }
}


const leftContainerStyle = {
    padding: '20px'
};

const labelTextStyle = {fontSize: '14px', color: textColor};