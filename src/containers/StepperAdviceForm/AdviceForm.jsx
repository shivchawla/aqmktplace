import * as React from 'react';
import _ from 'lodash';
import axios from 'axios';
import Promise from 'bluebird';
import moment from 'moment';
import {Row, Col, Form, Steps, Button, message} from 'antd';
import {AqPageHeader} from '../../components/AqPageHeader';
import {PostWarningModal} from './PostWarningModal';
import {AdviceDetailContent} from '../../containers/AdviceDetailContent';
import {handleCreateAjaxError, openNotification, getBreadCrumbArray, Utils, getStockPerformance} from '../../utils';
import {UpdateAdviceCrumb} from '../../constants/breadcrumbs';
import {AdviceName} from './AdviceName';
import {InvestmentObjective} from './InvestmentObjective';
import {OtherSettings} from './OtherSettings';
import {Portfolio} from './Portfolio';
import {shadowBoxStyle, goals, metricColor, benchmarkColor, horizontalBox} from '../../constants';
import {steps, getStepIndex} from './steps';

const {requestUrl} = require('../../localConfig');
const Step = Steps.Step;
const dateFormat = 'YYYY-MM-DD';

class StepperAdviceFormImpl extends React.Component {
    createAdviceUrl = `${requestUrl}/advice`;
    advicePerformanceUrl = `${requestUrl}/performance`;
    adviceNameStep = getStepIndex('adviceName');
    investmentObjectStep = getStepIndex('investmentObjective');
    otherSettingsStep = getStepIndex('otherSettings');
    portfolioStep = getStepIndex('portfolio');

    constructor(props) {
        super(props);
        this.state = {
            data: [],
            currentStep: 0,
            portfolError: {
                show: false,
                detail: 'Please provide atleast one valid position'
            },
            loaders: {
                postToMarketplace: false,
                saveForLater: false,
                preview: false
            },
            modal: {
                marketPlaceWarning: false
            },
            highStockSeries: [],
            portfolioPerformanceMetrics: {},
            preview: false,
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
            'investmentObjGoal',
            'investmentObjPortfolioValuation',
            'investmentObjSectors',
            'investmentObjCapitalization',
            'investmentObjUserText'
        ];
        const otherSettings = [
            'rebalancingFrequency',
            'startDate',
            'benchmark'
        ];
        switch(currentStep) {
            case this.adviceNameStep:
                this.validateFields(adviceName)
                .then(valid => resolve(valid))
                .catch(inValid => reject({valid: false, index: currentStep}));
                break;
            case this.investmentObjectStep:
                this.validateFields(investmentObjective)
                .then(valid => resolve(valid))
                .catch(inValid => reject({valid: false, index: currentStep}));
                break;
            case this.otherSettingsStep:
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
            this.setState({portfolError: {...this.state.portfolError, show: false}});
            return true;
        } else {
            this.setState({portfolError: {...this.state.portfolError, show: true}});
            return false
        }
    }

    /*
        Gets the verified positions from the portfolio table.
        A position is validated if the symbol is valid and number of shares > 0
    */
    getVerifiedPositions = () => {
        const data = [...this.state.data];
        const verifiedTransactions = data.filter(item => {
            return item.symbol.length > 1 && Number(item.shares) > 0 && item.shares.toString().length > 0;
        });

        return verifiedTransactions;
    }

    /*
        Changes the content of the portfolio array.
        Passed as a prop to AqStockTableMod
    */
    onChange = data => {
        this.setState({data: _.cloneDeep(data)}, () => {
            this.validatePortfolio();
        });
    }


    renderSteps = () => {
        return (
            <Steps current={this.state.currentStep} size="small">
                {
                    steps.map((step, index) => {
                        return (
                            <Step 
                                    key={index} 
                                    step={this.state.currentStep} 
                                    title={step.title} 
                                    description={step.description} 
                                    onClick={() => this.goToStep(index)}
                                    style={{cursor: 'pointer'}}
                            />
                        );
                    })
                }
            </Steps>
        );
    }

    renderSelectedStep = () => {
        const formProps = {form: this.props.form, step: this.state.currentStep};
        return (
            <React.Fragment>
                 <AdviceName {...formProps} />
                <InvestmentObjective {...formProps} />
                <OtherSettings {...formProps} />
                <Portfolio 
                        step={this.state.currentStep} 
                        onChange={this.onChange} 
                        error={this.state.portfolError}
                />
            </React.Fragment>
        );   
        
    }

    /*
        Gets the suitability or investor type based on the goal selected by the user
    */
    getGoalDetail = type => {
        const goal = this.props.form.getFieldValue('investmentObjGoal');
        const goalItem = goals.filter(item => item.field === goal)[0];
        if (goalItem) {
            switch(type) {
                case "investorType":
                    return goalItem.investorType;
                case "suitability":
                    return goalItem.suitability;
            }
        }
        return null;
    }

    createAdvice = (e, publish = false) => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err && this.validatePortfolio()) { // Portfolio Validated
                const requestObject = this.constructCreateAdviceRequestObject(values, publish);
                this.updateLoader(publish ? 'postToMarketplace' : 'saveForLater', true);
                axios({
                    url: this.createAdviceUrl,
                    method: 'POST',
                    data: requestObject,
                    headers: Utils.getAuthTokenHeader()
                })
                .then(response => {
                    const adviceId = _.get(response.data, '_id', '');
                    this.props.history.push(`/advice/${adviceId}`);
                    this.toggleMarketplaceWarningModal();
                    openNotification('success', 'Success', 'Successfully Created Advice');
                })
                .catch(error => handleCreateAjaxError(error, this.props.history, this.props.match.url))
                .finally(() => {
                    this.updateLoader(publish ? 'postToMarketplace' : 'saveForLater', false);
                })
            } else {
                message.error('Please provide all the details of the advice');
            }
        })
    }

    togglePreview = () => {
        if (this.validatePortfolio()) {
            this.setState({preview: !this.state.preview}, () => {
                this.state.preview && this.getAdvicePortfolioPerformance();
            });
        }
    }

    toggleMarketplaceWarningModal = () => {
        this.setState({modal: {
            ...this.state.modal,
            marketPlaceWarning: !this.state.modal.marketPlaceWarning
        }});
    }

    getAdvicePortfolioPerformance = () => {
        let highStockSeries = [...this.state.highStockSeries];
        const benchmark = this.props.form.getFieldValue('benchmark') || 'NIFTY_50';
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
        })
        .catch(error => handleCreateAjaxError(error, this.props.history, this.props.match.url))
        .finally(() => {
            this.updateLoader('preview', false);
        });
    }

    getPortfolioNetValue = () => {
        const verifiedPositions = this.getVerifiedPositions();
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
            investmentObjGoal,
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
        const investorType = this.getGoalDetail('investorType');
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
                    ticker: benchmark,
                    securityType: 'EQ',
                    country: 'IN',
                    exchange: 'NSE'
                },
            },
            rebalance: rebalancingFrequency,
            maxNotional: 1000000,
            investmentObjective: {
                goal: {
                    field: investmentObjGoal,
                    investorType,
                    suitability
                },
                sectors: {
                    detail: investmentObjSectors
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

    /**
     *  Constructs the AdviceDetail prop that is required by AdviceDetailContent
     */
    constructPreviewAdviceDetail = () => {
        const {
            adviceName, 
            investmentObjGoal,
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
                    field: investmentObjGoal,
                    investorType: this.getGoalDetail('investorType'),
                    suitability: this.getGoalDetail('suitability'),
                    valid: true
                },
                sectors: {
                    detail: investmentObjSectors,
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
            this.state.currentStep === (steps.length - 1)
            ?   <div style={{display: 'flex', flexDirection: 'column'}}>
                    <Button 
                        onClick={this.togglePreview}
                        className='action-button'
                    >
                        {!this.state.preview ? "PREVIEW" : "EDIT"}
                    </Button>
                    {
                        this.state.preview &&
                        <Button
                            onClick={e => this.createAdvice(e)}
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
            : null
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
                        ...horizontalBox, 
                        justifyContent: 'space-between',
                        position: 'absolute', 
                        bottom: '10px',
                        width: 'calc(100% - 40px)',
                    }}
            >
                <Button 
                        type="primary" 
                        onClick={this.goToPreviousStep}
                        disabled={this.state.currentStep == 0}
                >
                    Previous
                </Button>
                <Button 
                        type="primary" 
                        onClick={() => {
                            this.validateForm()
                            .then(() => this.goToNextStep())
                        }}
                        disabled={this.state.currentStep == (steps.length - 1)}
                >
                    Next
                </Button>
            </Col>
        );
    }

    renderForm = () => {
        return (
            <Col 
                    span={18} 
                    style={{
                        ...shadowBoxStyle, 
                        display: this.state.preview ? 'none' : 'block'
                    }}
            >
                <Form onSubmit={this.createAdvice}>
                    <Row style={{position: 'relative', height: '600px', padding: '20px'}}>
                        <Col span={24}>{this.renderSteps()}</Col>
                        <Col span={24} style={{marginTop: '20px'}}>
                            {this.renderSelectedStep()}
                        </Col>
                        {this.renderNavigationButtons()}
                    </Row>
                </Form>
            </Col>
        )
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
        const positions = this.constructPreviewPositions();

        if(this.state.preview) {
            return (
                <AdviceDetailContent 
                    tickers={this.state.highStockSeries}
                    adviceDetail={adviceDetail}
                    metrics={metrics}
                    positions={positions}
                    preview={true}
                    loading={this.state.loaders.preview}
                    style={{display: this.state.preview ? 'block' : 'none'}}
                    performanceType={"Simulated"}
                />
            );
        } else {
            return null;
        }
    }

    render() {
        const breadCrumbs = getBreadCrumbArray(UpdateAdviceCrumb, [{name: 'Create Advice'}]);

        return (
            <Row className='aq-page-container' style={{height: '100%'}} gutter={24}>
                <PostWarningModal 
                        visible={this.state.modal.marketPlaceWarning}
                        onOk={e => this.createAdvice(e, true)}
                        onCancel={this.toggleMarketplaceWarningModal}
                        loading={this.state.loaders.postToMarketplace}
                />
                <Col span={24}>
                    <AqPageHeader 
                        title="Create Advice"
                        showTitle={true}
                        breadCrumbs={breadCrumbs}
                    />
                </Col>
                {this.renderForm()}
                {this.renderPreview()}
                <Col span={6}>
                    {this.renderActionButtons()}
                </Col>
            </Row>
        );
    }
}

export const StepperAdviceForm = Form.create()(StepperAdviceFormImpl);