import * as React from 'react';
import _ from 'lodash';
import windowSize from 'react-window-size';
import axios from 'axios';
import Loading from 'react-loading-bar';
import Promise from 'bluebird';
import moment from 'moment';
import {withRouter} from 'react-router';
import {Row, Col, Form, Button, message, Icon, Modal} from 'antd';
import {Steps, Button as MobileButton, LocaleProvider} from 'antd-mobile';
import {AqMobileLayout} from '../AqMobileLayout/Layout';
import {PostWarningModal} from './PostWarningModal';
import {AdviceDetailContentMobile} from '../AdviceDetailMobile/AdviceDetailContentMobile';
import {WarningIcon} from '../../components/WarningIcon';
import {handleCreateAjaxError, openNotification, Utils, getStockPerformance, fetchAjax, getFirstMonday} from '../../utils';
import {InvestmentObjective} from './InvestmentObjectiveMobile';
import {OtherSettings} from './OtherSettingsMobile';
import {PortfolioMobile} from './PortfolioMobile';
import {Protips} from './Protips';
import {checkForInvestmentObjectiveError, getOthersWarning, getPortfolioWarnings} from './utils';
import {goals, metricColor, benchmarkColor, horizontalBox, loadingColor, primaryColor} from '../../constants';
import {steps, getStepIndex} from './steps';
import enUS from 'antd-mobile/lib/locale-provider/en_US';

const {requestUrl} = require('../../localConfig');
const Step = Steps.Step;
const dateFormat = 'YYYY-MM-DD';

class AdviceFormMobileImpl extends React.Component {
    adviceUrl = `${requestUrl}/advice`;
    advicePerformanceUrl = `${requestUrl}/performance`;
    adviceNameStep = getStepIndex('adviceName');
    investmentObjectStep = getStepIndex('investmentObjective');
    otherSettingsStep = getStepIndex('otherSettings');
    portfolioStep = getStepIndex('portfolio');

    constructor(props) {
        super(props);
        this.mobileLayout = null;
        this.state = {
            adviceName: '',
            steps,
            isUpdate: false, // this state is only for testing purposes and should be removed
            adviceId: '5b14fb367b00b327d8447661',
            isPublic: false,
            positions: [],
            currentStep: 0,
            portfolioError: {
                show: false,
                detail: 'Please provide atleast one valid position'
            },
            loaders: {
                postToMarketplace: false,
                saveForLater: false,
                preview: false,
                page: false
            },
            modal: {
                marketPlaceWarning: false
            },
            highStockSeries: [],
            portfolioPerformanceMetrics: {},
            preview: false,
            investmentObjectiveApprovalStatus: {}, // Used to get the approval status for investment objective
            otherApprovalStatus: {}, // Used to get the approval status for name and portfolio
            validationStatus: false,
            approvalRequested: false,
            adviceError: {
                message: '',
                errorCode: '',
                detail: {}
            },
            showErrorDialog: false
        };
    }

    goToNextStep = () => {
        let {currentStep = 0} = this.state;
        if (currentStep == steps.length - 1) {
            currentStep = 0;
        } else {
            currentStep++;
        }
        this.setState({currentStep});
    }

    goToPreviousStep = () => {
        let {currentStep = 0} = this.state;
        if (currentStep === 0) {
            currentStep = steps.length - 1;
        } else {
            currentStep--;
        }
        this.setState({currentStep});
    }

    // Redirects to the page whose index is provided
    goToStep = stepIndex => {
        const stepDifference = stepIndex - this.state.currentStep;        
        if (stepDifference < 0) { // If we are going to a previous page
            this.setState({currentStep: stepIndex});
        } else if (stepDifference === 1) { // If we are going to the immediate next page
            this.validateForm(this.state.currentStep)
            .then(() => {
                this.setState({currentStep: stepIndex})
            });
        } else { // If we are going to a page that is not immediate and not previous pages
            this.validateIntermediateSteps(stepIndex);
        }
    }

    /*
        Validates all the pages in between the current page and the target page.
        If any pages in between is not validated, it will redirect to the immediate invalidated page.
    */
    validateIntermediateSteps = (stepIndex) => {
        const validationArray = [];
        for (let i = this.state.currentStep; i <= stepIndex; i++) {
            validationArray.push(this.validateForm(i));
        }
        Promise.mapSeries(validationArray, eachValidation => eachValidation)
        .then(() => {
            this.setState({currentStep: stepIndex});
        })
        .catch(invalidData => {
            this.setState({currentStep: invalidData.index});
        });
    }

    /*
        Validates the form based on the current page.
        If current step doesn't equal to the predefined steps then it will validate all the fields and portfolio.
    */
    validateForm = (currentStep = this.state.currentStep) => new Promise((resolve, reject) => {
        const adviceName = ['adviceName'];
        const investmentObjective = [
            'investorType',
            'investmentObjGoal',
            'investmentObjPortfolioValuation',
            'investmentObjSectors',
            'investmentObjCapitalization',
            'investmentObjUserText'
        ];
        const otherSettings = [
            'adviceName',
            'rebalancingFrequency',
            'startDate',
            'benchmark'
        ];
        switch(currentStep) {
            case this.investmentObjectStep:
                this.validateFields(investmentObjective)
                .then(valid => resolve(valid))
                .catch(inValid => reject({valid: false, index: currentStep}));
                break;
            case this.otherSettingsStep:
                console.log('Validating Other Settings');
                this.validateFields(otherSettings)
                .then(valid => resolve(valid))
                .catch(inValid => reject({valid: false, index: currentStep}));
                break;
            case this.portfolioStep:
                if (this.validatePortfolio(this.goToNextStep)) {
                    resolve(true);
                } else {
                    reject({valid: false, index: currentStep});
                }
                break;
            default:
                this.validateFields()
                .then(() => {
                    if (this.validatePortfolio(this.goToNextStep)) {
                        resolve(true)
                    } else {
                        reject({valid: false, index: currentStep});
                    }
                })
                .catch(inValid => reject({valid: false, index: currentStep}));
        }
    })

    /*
        Validates fields in the form. Based on the validity return a promise
    */
    validateFields = (fields = []) => new Promise((resolve, reject) => {
        this.props.form.validateFields(fields, err => {
            if (!err) {
                resolve(true);
            } else {
                reject(false);
            }
        });
    })

    /*
        Validates the portfolio table to check for valid positions
    */
    validatePortfolio = () =>{
        if (this.getVerifiedPositions().length > 0) {
            this.setState({portfolioError: {...this.state.portfolioError, show: false}});
            return true;
        } else {
            this.setState({portfolioError: {...this.state.portfolioError, show: true}});
            return false
        }
    }

    validateAndGoToNextStep = () => {
        this.validateForm()
        .then(() => this.goToNextStep())
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

    /*
        Changes the content of the portfolio array.
        Passed as a prop to AqStockTableMod
    */
    addPosition = position => {
        const positions = this.updateWeights([...this.state.positions, position]);
        this.setState({positions}, () => {
            this.validatePortfolio();
        })
    }

    deletePositions = toBeDeletedPositions => {
        const positions = [...this.state.positions];
        toBeDeletedPositions.map(toBeDeletedPosition => {
            const positionIndex = _.findIndex(positions, position => position.key === toBeDeletedPosition.key);
            if (positionIndex > -1) {
                positions.splice(positionIndex, 1);
            }
        });
        this.setState({positions: this.updateWeights(positions)});
    }

    updatePosition = modifiedPosition => {
        const positions = [...this.state.positions];
        let targetPosition = positions.filter(position => position.key === modifiedPosition.key)[0];
        if (targetPosition) {
            targetPosition.shares = modifiedPosition.shares;
            targetPosition.totalValue = modifiedPosition.totalValue;
        }
        this.setState({positions: this.updateWeights(positions)});
    }

    updateWeights = positions => {
        const totalPortfolioValuation = this.getTotalPortfolioValuation(positions);

        return positions.map(position => {
            const weight = Number(position.totalValue) / totalPortfolioValuation;
            return {
                ...position,
                weight
            };
        });
    }

    getTotalPortfolioValuation = positions => {
        let totalPortfolioValuation = 0;
        positions.map(position => {
            totalPortfolioValuation += Number(position.totalValue);
        });

        return totalPortfolioValuation;
    }

    updateStepStatus = (key, status) => {
        const steps = [...this.state.steps];
        const targetStep = steps.filter(step => step.key === key)[0];
        if (targetStep) {
            targetStep.description = status ? '' : '* Error';
            targetStep.valid = status;
        }
        this.setState({steps});
    }  

    getAppropriateStepIcon = (status, index) => {
        switch(status) {
            case "finish":
                return <Icon type="check" style={{color: '#fff'}}/>;
            case "process":
                return (
                    <span 
                            style={{
                                color: status === 'wait' ? '#e8e8e8' : '#fff',
                                fontSize: '14px'
                            }}
                    >
                        {index + 1}
                    </span>
                );
            case "wait":
                return <Icon type="ellipsis" style={{color: '#9B9B9B', fontWeight: 'bolder', fontSize: '30px'}}/>;
        }
    }

    getAppropriateStepWarning = step => {
        switch(step.key) {
            case "adviceName":
                return getOthersWarning(this.state.otherApprovalStatus, 'name').reason;
            case "investmentObjective":
                return "Error In Investment Objective"
            case "portfolio":
                return  getPortfolioWarnings(this.state.otherApprovalStatus).reasons.map((reason, index) => {
                    return <p key={index}>{reason}</p>
                });
        }
    }

    getAppropriateStepTitle = (step, index) => {
        const titleStyle = {
            fontWeight: this.state.currentStep === index ? 700 : 400,
            color: this.state.currentStep === index ? primaryColor : '#444',
            marginTop: '10px',
            display: 'block'
        };

        return (
            <div style={{...horizontalBox, alignItems: 'center'}}>
                <span style={titleStyle}>{step.title}</span>
                {
                    this.state.isPublic && this.props.isUpdate && !step.valid &&
                    <WarningIcon 
                            style={{marginTop: '10px'}}
                            content={this.getAppropriateStepWarning(step)}
                    />
                }
            </div>
        );
    }
   
    renderSteps = () => {
        const customDot = (dot, { status, index }) => {
            return (
                <div 
                        style={{
                            height: '30px', 
                            width: '30px', 
                            borderRadius: '50%', 
                            backgroundColor: status === 'wait' ? '#fff' : primaryColor,
                            border: status === 'wait' ? '1px solid #fff' : 'none',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                            alignItems: 'center',
                            marginLeft: '-5px',
                            marginTop: '-3px',
                        }}
                >
                    {this.getAppropriateStepIcon(status, index)}
                </div>
            );
        }

        return (
            <Steps 
                    style={{position: 'relative', marginTop: '5px'}} 
                    current={this.state.currentStep} 
                    size="medium" 
                    progressDot={customDot}
                    direction="horizontal"
            >
                {
                    this.state.steps.map((step, index) => {
                        return (
                            <Step
                                icon={null} 
                                key={index}
                                title={this.getAppropriateStepTitle(step, index)} 
                                onClick={() => this.goToStep(index)}
                                style={{cursor: 'pointer'}}
                            />
                        );
                    })
                }
            </Steps>
        );
    }

    getPageTitle = (index = this.state.currentStep) => {
        switch(index) {
            case 0:
                return 'Investment Objective';
            case 1:
                return 'Portfolio';
            case 2:
                return 'Other Settings';
            default:
                return 'Investment Objective';
        }
    }

    renderHeader = () => {
        return (
            <Row style={{marginTop: '5px'}}>
                <Col span={24} style={{...horizontalBox, justifyContent: 'center'}}>
                    <span style={{fontSize: '20px', color: primaryColor}}>
                        Step {this.state.currentStep + 1}: {this.getPageTitle()}
                    </span>
                </Col>
                
                <Col span={24} style={{textAlign: 'center', marginBottom: '10px'}}>
                    <span style={{fontSize: '14px'}}>Create Advice</span>
                </Col>
            </Row>
        );
    }

    renderSelectedStep = () => {
        const formProps = {
            form: this.props.form, 
            step: this.state.currentStep,
            investmentObjectiveApprovalStatus: this.state.investmentObjectiveApprovalStatus,
            updateStepStatus: this.updateStepStatus,
            isUpdate: this.props.isUpdate,
            isPublic: this.state.isPublic,
            disabled: !this.getDisabledStatus(),
            approvalRequested: this.state.approvalRequested
        };

        return (
            <React.Fragment>
                <div style={{display: this.state.currentStep === 0 ? 'block' : 'none'}}>
                    <InvestmentObjective 
                        {...formProps}
                        approvalStatusData={this.state.investmentObjectiveApprovalStatus}
                    />
                </div>
                <div style={{display: this.state.currentStep === 2 ? 'block' : 'none'}}>
                    <OtherSettings 
                        {...formProps} 
                        approvalStatusData={this.state.otherApprovalStatus}
                    />
                </div>
                <div style={{display: this.state.currentStep === 1 ? 'block' : 'none'}}>
                    <PortfolioMobile 
                        isUpdate={this.props.isUpdate}
                        isPublic={this.state.isPublic}
                        positions={this.state.positions}
                        step={this.state.currentStep} 
                        investmentObjectiveApprovalStatus={this.state.investmentObjectiveApprovalStatus}
                        getAdvicePerformance={this.getAdvicePortfolioPerformance}
                        addPosition={this.addPosition} 
                        deletePositions={this.deletePositions}
                        updatePosition={this.updatePosition}
                        error={this.state.portfolioError}
                        approvalStatusData={this.state.otherApprovalStatus}
                        updateStepStatus={this.updateStepStatus}
                        disabled={!this.getDisabledStatus()}
                        approvalRequested = {this.state.approvalRequested}
                        verifiedPositions={this.getVerifiedPositions()}
                    />
                </div>
            </React.Fragment>
        );   
        
    }

    /*
        Gets the suitability or investor type based on the goal selected by the user
    */
    getGoalDetail = type => {
        const goal = this.props.form.getFieldValue('investmentObjInvestorType');
        const goalItem = goals.filter(item => item.investorType === _.get(goal, '[0]', '') || null)[0];
        if (goalItem) {
            switch(type) {
                case "field":
                    return goalItem.field;
                case "suitability":
                    return goalItem.suitability;
            }
        }
        return null;
    }

    getFirstValidDate = () => {
        var offset = '1d';
        const rebalancingFrequency = this.props.form.getFieldValue('rebalancingFrequency') || "Daily";
        switch(rebalancingFrequency) {
            case "Daily": offset = '1d'; break;
            case "Weekly": offset = '1w'; break;
            case "Bi-Weekly": offset = '2w'; break;
            case "Monthly": offset = '1m'; break;
            case "Quartely": offset = '1q'; break;
        }

        return this.props.isUpdate && this.state.isPublic ? 
            moment(getFirstMonday(offset)) : moment().startOf('day');
     }

    submitAdvice = (e, publish = false) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err && this.validatePortfolio()) { // Portfolio Validated
                const requestObject = this.constructCreateAdviceRequestObject(values, publish);
                this.updateLoader(publish ? 'postToMarketplace' : 'saveForLater', true);
                axios({
                    url: this.props.isUpdate ? `${this.adviceUrl}/${this.props.adviceId}` : this.adviceUrl,
                    method: this.props.isUpdate ? 'PATCH' : 'POST',
                    data: requestObject,
                    headers: Utils.getAuthTokenHeader()
                })
                .then(response => {
                    const adviceId = _.get(response.data, '_id', '');
                    this.props.history.push(`/advice/${adviceId}`);
                    this.toggleMarketplaceWarningModal();
                    this.props.isUpdate
                    ? openNotification('success', 'Success', 'Successfully Updated Advice')
                    : openNotification('success', 'Success', 'Successfully Created Advice')
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
                            this.toggleMarketplaceWarningModal();
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
                    this.updateLoader(publish ? 'postToMarketplace' : 'saveForLater', false);
                })
            } else {
                message.error('Please provide all the details of the advice');
            }
        })
    }

    toggleAdviceErrorDialog = () => {
        this.setState({showErrorDialog: !this.state.showErrorDialog});
    }

    convertStringToReadable = value => {
        const errKvp = {
            MAX_SECTOR_EXPOSURE: 'Maximum Sector Exposure',
            MAX_STOCK_EXPOSURE: 'Maximum Stock Exposure',
            MIN_POS_COUNT: 'Minimum Position Count',
            MAX_NET_VALUE: 'Maximum Net Value'
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
                    visible={this.state.showErrorDialog}
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

    togglePreview = () => {
        this.validateForm()
        .then(() => {
            this.setState({preview: !this.state.preview}, () => {
                this.state.preview && this.getAdvicePortfolioPerformance();
            });
        })
    }

    toggleMarketplaceWarningModal = () => {
        this.setState({modal: {
            ...this.state.modal,
            marketPlaceWarning: !this.state.modal.marketPlaceWarning
        }});
    }

    getAdvicePortfolioPerformance = selectedBenchmark => new Promise((resolve, reject) => {
        let highStockSeries = [...this.state.highStockSeries];
        const benchmark = selectedBenchmark === undefined ? this.props.form.getFieldValue('benchmark')[0] || 'NIFTY_50' : selectedBenchmark;
        const requestObject = this.constructAdvicePerformanceRequestObject(benchmark);
        this.updateLoader('preview', true);
        Promise.all([
            axios({
                method: 'POST',
                url: this.advicePerformanceUrl,
                data: requestObject,
                headers: Utils.getAuthTokenHeader()
            }),
            getStockPerformance(benchmark)
        ])
        .then(([portfolioPerformanceResponse, benchmarkPerformanceResponseData]) => {
            const portfolioPerformanceData = this.processPortfolioPerformanceResponse(portfolioPerformanceResponse);
            const portfolioPerformanceMetrics = _.get(portfolioPerformanceResponse.data, 'portfolioPerformance.value.true', {});
            highStockSeries = [
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
            this.setState({highStockSeries, portfolioPerformanceMetrics});
            resolve({highStockSeries, portfolioPerformanceMetrics});
        })
        .catch(error => {
            handleCreateAjaxError(error, this.props.history, this.props.match.url);
            reject(error);
        })
        .finally(() => {
            this.updateLoader('preview', false);
        });
    })

    getAdvice = (adviceId) => {
        const adviceSummaryUrl = `${this.adviceUrl}/${adviceId}`;
        const advicePortfolioUrl = `${adviceSummaryUrl}/portfolio`;

        this.updateLoader('page', true);
        Promise.all([
            fetchAjax(advicePortfolioUrl, this.props.history, this.props.match.url),
            fetchAjax(adviceSummaryUrl, this.props.history, this.props.match.url)
        ])
        .then(([advicePortfolioResponse, adviceSummaryResponse]) => {
            const {name = '', investmentObjective = {}} = adviceSummaryResponse.data;
            const investmentObjGoal = _.get(investmentObjective, 'goal.field', '');
            const investorType = _.get(investmentObjective, 'goal.investorType', '');
            const investmentObjSectors = _.get(investmentObjective, 'sectors.detail', []);
            const investmentObjPortfolioValuation = _.get(investmentObjective, 'portfolioValuation.field', '');
            const investmentObjCapitalization = _.get(investmentObjective, 'capitalization.field', '');
            const investmentObjUserText = _.get(investmentObjective, 'userText.detail', '');
            const benchmark = _.get(adviceSummaryResponse.data, 'portfolio.benchmark.ticker', 'NIFTY_50');
            const rebalancingFrequency = _.get(adviceSummaryResponse.data, 'rebalance', 0);
            const positions = this.processPortfolioForTable(_.get(advicePortfolioResponse.data, 'detail.positions', []));
            const investmentObjectiveApprovalStatus = _.get(adviceSummaryResponse.data, 'investmentObjective', {});
            const otherApprovalStatus = _.get(adviceSummaryResponse.data, 'latestApproval', {status: false});
            const isPublic = _.get(adviceSummaryResponse.data, 'public', false);
            const validationStatus = _.get(adviceSummaryResponse.data, 'latestApproval.status', false);
            const approvalRequested = _.get(adviceSummaryResponse.data, 'approvalRequested', false);

            this.setState({
                adviceName: name,
                positions,
                investmentObjectiveApprovalStatus,
                otherApprovalStatus,
                isPublic,
                validationStatus,
                approvalRequested
            }, () => {
                this.checkForApprovalErrors();
                this.props.form.setFieldsValue({
                    adviceName: name,
                    investmentObjGoal,
                    investmentObjSectors,
                    investmentObjPortfolioValuation,
                    investmentObjCapitalization,
                    investmentObjUserText,
                    benchmark: [benchmark],
                    rebalancingFrequency: [rebalancingFrequency],
                    startDate: this.getFirstValidDate(),
                    investmentObjInvestorType: [investorType]
                });
            });
        })
        .catch(error => error)
        .finally(() => {
            this.updateLoader('page', false);
        })
    }

    checkForApprovalErrors = () => {
        this.updateStepStatus(
            'investmentObjective', 
            checkForInvestmentObjectiveError(this.state.investmentObjectiveApprovalStatus)
        );
        this.updateStepStatus(
            'adviceName',
            getOthersWarning(this.state.otherApprovalStatus, 'name').valid
        );
        this.updateStepStatus(
            'portfolio',
            getPortfolioWarnings(this.state.otherApprovalStatus).valid
        );
    }

    getDisabledStatus = () => {
        const isPublic = _.get(this.state, 'isPublic', false);
        const approvalRequested = _.get(this.state, 'approvalRequested', false);
        const validationStatus = _.get(this.state, 'validationStatus', false);
        return !isPublic || (isPublic && !approvalRequested && !validationStatus);
    }

    getPortfolioNetValue = (positions = this.state.positions) => {
        const verifiedPositions = this.getVerifiedPositions(positions);
        let netValue = 0.0;
        verifiedPositions.forEach(transaction => {
            netValue+=transaction.totalValue;
        });

        return netValue;
    }

    updateLoader = (loader, value) => {
        this.setState({
            loaders: {
                ...this.state.loaders,
                [loader]: value
            }
        });
    }

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
     *  Constructs the request payload for the create advice network call
     */
    constructCreateAdviceRequestObject = (values, publish = false) => {
        let {
            adviceName,
            investmentObjInvestorType,
            investmentObjPortfolioValuation,
            investmentObjSectors,
            investmentObjCapitalization,
            investmentObjUserText,
            rebalancingFrequency,
            startDate,
            benchmark
        } = values;
        startDate = moment(startDate).format(dateFormat);
        const endDate = moment(startDate).add(500, 'year').format(dateFormat); // Adding 500 years to the end date
        const goal = this.getGoalDetail('field');
        const suitability = this.getGoalDetail('suitability');
        const requestObject = {
            name: adviceName,
            portfolio: {
                name: adviceName,
                detail: {
                    startDate,
                    endDate,
                    positions: this.getPortfolioPositions(),
                    cash: 0
                },
                benchmark: {
                    ticker: benchmark[0],
                    securityType: 'EQ',
                    country: 'IN',
                    exchange: 'NSE'
                },
            },
            rebalance: rebalancingFrequency[0],
            maxNotional: 1000000,
            investmentObjective: {
                goal: {
                    field: goal,
                    investorType: investmentObjInvestorType[0],
                    suitability
                },
                sectors: {
                    detail: this.extractSectorsFromPositions(this.state.positions)
                },
                portfolioValuation: {
                    field: investmentObjPortfolioValuation
                },
                capitalization: {
                    field: investmentObjCapitalization
                },
                userText: {
                    detail: investmentObjUserText
                }
            },
            public: publish
        }

        return requestObject;
    }

    /**
     *  Constructs the positions in the required format for the advice performance network call
     */
    constructPreviewPositions = () => {
        return this.getVerifiedPositions().map((position, index) => {
            return {
                name: position.name,
                symbol: position.symbol,
                shares: Number(position.shares),
                price: position.lastPrice,
                sector: position.sector,
                weight: position.weight,
                key: index,
            }
        });
    }

    extractSectorsFromPositions = positions => {
        const sectors = [];
        positions.map(position => {
            // Check if sector is present in sectors array and sector is not null
            const sector = _.get(position, 'sector', null);
            if (sector) {
                const sectorIndex = sectors.indexOf(sector);
                if (sectorIndex === -1) {
                    sectors.push(sector);
                }
            }
        });

        return sectors;
    }

    /**
     *  Constructs the AdviceDetail prop that is required by AdviceDetailContent
     */
    constructPreviewAdviceDetail = () => {
        const {
            adviceName, 
            investmentObjInvestorType,
            investmentObjSectors,
            investmentObjPortfolioValuation,
            investmentObjUserText,
            investmentObjCapitalization,
            rebalancingFrequency,
        } = this.props.form.getFieldsValue();
        const adviceDetail = {
            isOwner: true,
            name: adviceName,
            rebalanceFrequency: rebalancingFrequency,
            advisor: {
                user: {
                    firstName: _.get(Utils.getUserInfo(), 'firstName', null),
                    lastName: _.get(Utils.getUserInfo(), 'lastName', null)
                },
                _id: _.get(Utils.getUserInfo(), 'advisor', null)
            },
            isPublic: false,
            investmentObjective: {
                goal: {
                    field: this.getGoalDetail('field'),
                    investorType: investmentObjInvestorType,
                    suitability: this.getGoalDetail('suitability'),
                    valid: true
                },
                sectors: {
                    detail: this.extractSectorsFromPositions(this.state.positions),
                    valid: true
                },
                portfolioValuation: {
                    field: investmentObjPortfolioValuation,
                    valid: true
                },
                capitalization: {
                    field: investmentObjCapitalization,
                    valid: true
                },
                userText: {
                    detail: investmentObjUserText,
                    valid: true
                }
            },
            approval: {
                detail: [
                    {
                        field: 'name',
                        valid: true
                    }
                ]
            }
        };

        return adviceDetail;
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
     *  Processes positions from Advice Portfolio N/W call into the required format for AqStockTableMod
     */
    processPortfolioForTable = (positions = []) => {
        let positionsMod = positions.map((position, index) => {
           return {
                key: index,
                name: _.get(position, 'security.detail.Nse_Name', ''),
                sector: _.get(position, 'security.detail.Sector'),
                lastPrice: position.lastPrice,
                shares: position.quantity,
                symbol: _.get(position, 'security.detail.NSE_ID','-') || _.get(position, 'security.ticker','-'),
                ticker: _.get(position, 'security.detail.NSE_ID','-') || _.get(position, 'security.ticker','-'),
                totalValue: position.quantity * position.lastPrice,
            };
        });

        return this.updatePositionsForWeight(positionsMod);
    }    

    /**
     *  Calculating weights for individual positions in the portfolio
     */
    updatePositionsForWeight = (positions = []) => {
        const netValue = Number(this.getPortfolioNetValue(positions).toFixed(2));
        return positions.map((item, index) => {
            item['weight'] = netValue > 0 ? Number((item['totalValue'] * 100 / netValue).toFixed(2)) : 0;
            return item;
        });
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

    /**
     *  Renders the actions buttons on the side of the screen
     */
    renderActionButtons = () => {
        return (
            <div style={{display: 'flex', flexDirection: 'column'}}>
                <Button 
                    onClick={this.togglePreview}
                    className='action-button'
                >
                    {!this.state.preview ? "PREVIEW" : "EDIT"}
                </Button>
                {
                    this.state.preview && !this.state.isPublic &&
                    <Button
                        onClick={e => this.submitAdvice(e)}
                        loading={this.state.loaders.saveForLater}
                        style={{marginTop: '20px'}}
                        className='action-button'
                    >
                        SAVE FOR LATER
                    </Button>
                }
                <Button
                    type="primary" 
                    onClick={this.toggleMarketplaceWarningModal}
                    loading={this.state.loaders.postToMarketplace}
                    style={{marginTop: '20px'}}
                    className='action-button'
                >
                    POST TO MARKETPLACE
                </Button>
            </div>
        );
    }

    /**
     *  Renders the navigation buttons on the bottom for next and previous page
     */
    renderNavigationButtons = () => {
        return (
            <Col 
                    span={24} 
                    style={{
                        position: 'relative', 
                        marginTop: '20px',
                        marginBottom: '10px',
                        padding: '0 20px'
                    }}
            >
                <Row gutter={24}>
                    <Col span={12}>
                        <MobileButton 
                                onClick={this.goToPreviousStep}
                                disabled={this.state.currentStep == 0}
                                size="small"
                        >
                            PREVIOUS
                        </MobileButton>
                    </Col>
                    <Col span={12}>
                        <MobileButton 
                                type="primary" 
                                onClick={
                                    this.state.currentStep === steps.length - 1
                                    ? this.togglePreview
                                    : this.validateAndGoToNextStep
                                }
                                size="small"
                        >
                            {
                                this.state.currentStep === steps.length - 1
                                ? "PREVIEW"
                                : "NEXT"
                            }
                        </MobileButton>
                    </Col>
                </Row>
            </Col>
        );
    }

    renderProtips = () => {
        return (
            <Protips selectedStep={this.state.currentStep} />
        );
    }

    renderForm = () => {
        return (
            <Form onSubmit={this.submitAdvice}>
                <Row>
                    <Col 
                            span={24}
                            style={{
                                display: this.state.preview ? 'none' : 'block', 
                                background: '#fff', 
                                height: this.props.windowHeight - 100,
                            }}
                            id="form-container"
                    >
                        
                            <Row
                                    type="flex"
                                    justify="start"
                                    style={{position: 'relative', padding: '0 px'}}
                            >
                                <Col 
                                        span={24} 
                                        style={{
                                            height: this.props.windowHeight - 160,
                                            overflow: 'hidden',
                                            overflowY: 'scroll',
                                            paddingTop: '10px'
                                        }}
                                >
                                    {this.renderSelectedStep()}
                                </Col>
                            </Row>
                    </Col>
                    {
                        !this.state.preview &&
                        <Col span={24} style={{marginTop: '-40px', height: '80px', background: '#fff'}}>
                            {this.renderNavigationButtons()}
                        </Col>
                    }
                </Row>
            </Form>
        )
    }

    renderMobileActionButtons = () => {
        return (
            <Col span={24} style={{backgroundColor: '#fff'}}>
                <Row gutter={24} style={{padding: '0 10px', margin: '20px 0'}}>
                    <Col span={12}>
                        <MobileButton 
                                size="small"
                                onClick={this.togglePreview}
                        >
                            EDIT
                        </MobileButton>
                    </Col>
                    <Col span={12}>
                        <MobileButton 
                                size="small" 
                                type="primary"
                                onClick={this.toggleMarketplaceWarningModal}
                        >
                            POST
                        </MobileButton>
                    </Col>
                </Row>
            </Col>
        );
    }

    renderPreview = () => {
        const {portfolioPerformanceMetrics} = this.state;
        const adviceDetail = this.constructPreviewAdviceDetail();
        const metrics = {
            annualReturn: _.get(portfolioPerformanceMetrics, 'returns.annualreturn', 0),
            volatility: _.get(portfolioPerformanceMetrics, 'deviation.annualstandarddeviation', 0),
            totalReturn: _.get(portfolioPerformanceMetrics, 'returns.totalreturn', 0),
            maxLoss: _.get(portfolioPerformanceMetrics, 'drawdown.maxdrawdown', 0),
            netValue: this.getPortfolioNetValue(),
            nstocks: this.getVerifiedPositions().length
        };
        if(this.state.preview) {
            return (
                <Row>
                    {this.renderMobileActionButtons()}
                    <Col 
                            span={24} 
                            style={{
                                height: this.props.windowHeight - 80,
                                overflow: 'hidden',
                                overflowY: 'scroll'
                            }}
                    >
                        <AdviceDetailContentMobile 
                            tickers={this.state.highStockSeries}
                            adviceDetail={adviceDetail}
                            metrics={metrics}
                            positions={this.processPositionsForPreview(this.state.positions)}
                            preview={true}
                            loading={this.state.loaders.preview}
                            style={{display: this.state.preview ? 'block' : 'none'}}
                            performanceType={"Simulated"}
                        />
                    </Col>
                    {/* {this.renderMobileActionButtons()} */}
                </Row>
            );
        } else {
            return null;
        }
    }

    processPositionsForPreview = positions => {
        return positions.map(position => {
            return {
                ...position,
                weightPct: Number(position.weight.toFixed(2))
            }
        })
    }

    componentDidMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            if (this.props.isUpdate) {
                this.getAdvice(this.props.adviceId);
            }
        }
    }

    renderPageContent() {
        return (
            <AqMobileLayout 
                noHeader={this.state.preview}
                customHeader={this.renderHeader()}
                navbarStyle={{height: '72px'}}
                menuIconStyle={{top: '20px', display: this.state.currentStep === 0 ? 'block' : 'none'}}
            >
                {this.renderAdviceErrorDialog()}
                <PostWarningModal 
                        visible={this.state.modal.marketPlaceWarning}
                        onOk={e => this.submitAdvice(e, true)}
                        onCancel={this.toggleMarketplaceWarningModal}
                        loading={this.state.loaders.postToMarketplace}
                />
                {this.renderForm()}
                {this.renderPreview()}
            </AqMobileLayout>
        );
    }

    render() {
        return (
            <Row>
                <Loading
                    show={this.state.loaders.page}
                    color={loadingColor}
                    className="main-loader"
                    showSpinner={false}
                />
                {
                    // !this.state.loaders.page && 
                    <div style={{display: this.state.loaders.page ? 'none' : 'block'}}>
                        <LocaleProvider locale={enUS}>
                            {this.renderPageContent()}
                        </LocaleProvider>
                    </div>
                }
            </Row>
        );
    }
}

export const AdviceFormMobile = Form.create()(withRouter(windowSize(AdviceFormMobileImpl)));