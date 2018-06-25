import * as React from 'react';
import Loading from 'react-loading-bar';
import windowSize from 'react-window-size';
import _ from 'lodash';
import {slide as HamburgerMenu} from 'react-burger-menu';
import {Row, Col, Icon, Button, Select, Tabs, Modal, Radio} from 'antd';
import {SearchBar, List, Pagination} from 'antd-mobile';
import {FilterMobileComponent} from './Filter';
import {AdviceListItemMobile} from './AdviceListItem';
import {AqMobileLayout} from '../AqMobileLayout/Layout';
import {loadingColor, horizontalBox} from '../../constants';
import {ScreenAdviceMeta} from '../../metas';
import {Utils, fetchAjax, generateRandomString} from '../../utils';
import {adviceFilters as filters} from '../../constants/filters';
import '../../css/screenAdvices.css';
import '../../css/adviceDetail.css';

const {requestUrl} = require('../../localConfig');
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
class ScreenAdviceMobileImpl extends React.PureComponent {
    mounted = false;
    constructor(props) {
        super(props);
        this.state = {
            spinning: false,
            adviceUrl: `${requestUrl}/advice?all=true&trending=false&subscribed=false&following=false&order=-1`,
            advices: [],
            selectedFilters: {...filters, ...Utils.getObjectFromLocalStorage('adviceFilter')},
            selectedTab: Utils.getFromLocalStorage('selectedTab') || 'all',
            searchValue: '',
            sortBy: Utils.getFromLocalStorage('sortBy') || 'rating',
            activeFilterPanel: [],
            filterModalVisible: false,
            loading: true,
            selectedPage: Utils.getFromLocalStorage('selectedPage') || 1,
            limit: 10,
            totalCount: 3,
            initialCall: true,
            show: false,
            questionnaireModalVisible: false,
            questionnaireFilters: {},
            isAdmin: false,
            openFilterMenu: false
        }
    }

    componentWillMount() {
        this.mounted = true;
        this.getQustionnaireModal();
        if (!Utils.isLoggedIn()) {
            this.getAdvices();
        } else {
            this.getUserDetailAndAdvices()
            this.toggleFilter();
        }
    }

    getUserDetailAndAdvices = () => {
        const url = `${requestUrl}/me`;
        this.setState({show: true});
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            this.setState({isAdmin: _.get(response.data, 'isAdmin', false)});
            this.getAdvices();
        })
        .catch(error => {
            return error
        });
    }

    getQustionnaireModal = () => {
        const isFirstTime = Utils.getFromLocalStorage('isFirstTime') === 'false' ? false : true || true;
        if (isFirstTime) {
            this.setState({questionnaireModalVisible: isFirstTime});
        }
    }

    toggleQuestionnaireModal = () => {
        this.setState({questionnaireModalVisible: !this.state.questionnaireModalVisible});
        Utils.localStorageSave('isFirstTime', false);
    }

    handleQuestionnaireRadioChange = (e, type) => {
        switch(type) {
            case "netValue":
                this.getNetValueFilterData(e.target.value);
                break;
            case "return":
                this.getReturnFilterData(e.target.value);
            default:
                break;
        }
    }

    getNetValueFilterData = value => {
        let absoluteValue = '';
        switch(value) {
            case "min":
                absoluteValue = '0,20000';
                break;
            case "middle":
                absoluteValue = '20001,50000';
                break;
            case "max":
                absoluteValue = '50001,1000000';
                break;
            default:
                break;
        }
        this.setState({questionnaireFilters: {
            ...this.state.questionnaireFilters,
            netValue: absoluteValue
        }});
    } 
    
    getReturnFilterData = value => {
        let absoluteValue = '';
        switch(value) {
            case "min":
                absoluteValue = '5,15';
                break;
            case "middle":
                absoluteValue = '15,25';
                break;
            case "max":
                absoluteValue = '25,100';
                break;
            default:
                break;
        }
        this.setState({questionnaireFilters: {
            ...this.state.questionnaireFilters,
            return: absoluteValue
        }});
    }

    handleQuestionnaireFilterChange = () => {
        this.setState({
            selectedFilters: {
                ...this.state.selectedFilters,
                ...this.state.questionnaireFilters
            }
        }, () => {
            this.getAdvices();
            Utils.localStorageSaveObject('adviceFilter', this.state.selectedFilters);
            this.toggleQuestionnaireModal();
        });
    }

    renderQuestionnaireDialog = () => {
        return (
            <Modal 
                    title="Select Preferences"
                    visible={this.state.questionnaireModalVisible}
                    onCancel={this.toggleQuestionnaireModal}
                    footer={[
                        <Button key="skip" onClick={this.toggleQuestionnaireModal}>Skip</Button>,
                        <Button key="submit" type="primary" onClick={this.handleQuestionnaireFilterChange}>Done</Button>
                    ]}
            >
                <Row>
                    <Col span={24}>
                        <h3>How much would you like to invest ?</h3>
                        <Row style={{marginTop: '10px'}}>
                            <RadioGroup 
                                    onChange={(e) => this.handleQuestionnaireRadioChange(e, 'netValue')}
                            >
                                <RadioButton 
                                        style={{marginRight: '20px', borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px'}} 
                                        value="min"
                                >
                                    <h4>0 - 20k</h4>
                                </RadioButton>
                                <RadioButton style={{marginRight: '20px'}} value="middle"><h4>20k - 50k</h4></RadioButton>
                                <RadioButton 
                                        value="max"
                                        style={{borderTopRightRadius: '0px', borderBottomRightRadius: '0px'}}
                                >
                                    <h4>50k and above</h4>
                                </RadioButton>
                            </RadioGroup>
                        </Row>
                    </Col>
                    <Col span={24} style={{marginTop: '30px'}}>
                        <h3>What is your return expectation ?</h3>
                        <Row style={{marginTop: '10px'}}>
                            <RadioGroup 
                                    onChange={(e) => this.handleQuestionnaireRadioChange(e, 'return')}
                            >
                                <RadioButton 
                                        style={{marginRight: '20px', borderTopLeftRadius: '0px', borderBottomLeftRadius: '0px'}} 
                                        value="min"
                                >
                                    <h4>5% - 25%</h4>
                                </RadioButton>
                                <RadioButton style={{marginRight: '20px'}} value="middle"><h4>15% - 25%</h4></RadioButton>
                                <RadioButton 
                                        value="max"
                                        style={{borderTopRightRadius: '0px', borderBottomRightRadius: '0px'}}
                                >
                                    <h4>25% and above</h4>
                                </RadioButton>
                            </RadioGroup>
                        </Row>
                    </Col>
                </Row>            
            </Modal>
        );
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getDefaultAdvices = () => {
        const url = `${requestUrl}/advice_default`;
        this.setState({show: true});
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            this.setState({
                advices: this.processAdvices(response.data.advices),
                totalCount: 1
            });
            this.setState({show: false, loading: false});
        })
        .catch(error => error)
        // .finally(() => {
        //     this.setState({show: false, loading: false});
        // });
    }

    getAdvices = adviceUrl => {
        this.setState({
            loading: true,
            show: this.state.initialCall,
            initialCall: false
        });
        const url = adviceUrl === undefined ? this.processUrl(this.state.selectedTab) : adviceUrl;
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            if (this.mounted) {
                this.setState({
                    advices: this.processAdvices(response.data.advices),
                    totalCount: _.get(response.data, 'count', 10)
                });
            }
            if (this.mounted) {
                this.setState({loading: false, show: false});
            }
        })
        .catch(error => {
            return error;
        })
        // .finally(() => {
        //     if (this.mounted) {
        //         this.setState({loading: false, show: false});
        //     }
        // });
    }

    processUrl = (type, orderParam = this.state.sortBy) => {
        const {selectedFilters} = this.state;
        let approved = selectedFilters.approved.map(item => item === 'Approved' ? '1' : '0');
        let personal = selectedFilters.owner.map(item => item === 'Personal' ? '1' : '0');
        const limit = this.state.limit;
        const skip = limit * (this.state.selectedPage - 1);
        const rebalancingFrequency = selectedFilters.rebalancingFrequency.length > 0 ? _.join(selectedFilters.rebalancingFrequency, ',') : _.join(filters.rebalancingFrequency, ',');
        const {netValue, sharpe, volatility, rating} = selectedFilters;
        approved = _.join(approved, ',');
        personal = _.join(personal, ',');
        const search = this.state.searchValue || "";
        const adviceRequestType = Utils.isLoggedIn() ?  'advice' : 'advice_default';
        const url = `${requestUrl}/${adviceRequestType}?search=${search}&${type}=true&rebalance=${rebalancingFrequency}&return=${this.convertRangeToDecimal(selectedFilters.return)}&rating=${rating}&volatility=${this.convertRangeToDecimal(volatility)}&sharpe=${sharpe}&netValue=${netValue}&approved=${approved}&personal=${personal}&limit=${limit}&skip=${skip}&orderParam=${orderParam}&order=-1`;
        return url;
    }

    convertRangeToDecimal = range => {
        const rangeArray = range.split(',');
        const min = Number(rangeArray[0]) / 100;
        const max = Number(rangeArray[1]) / 100;
        const modifiedRange = _.join([min, max], ',');
        return modifiedRange;
    }

    processAdvices = (responseAdvices) => {
        const advices = [];
        responseAdvices.map((advice, index) => {
            advices.push({
                isFollowing: advice.isFollowing || false,
                id: advice._id || 0,
                name: advice.name || '',
                advisor: advice.advisor || {},
                createdDate: advice.createdDate || '',
                heading: advice.heading || '',
                subscribers: advice.numSubscribers || 0,
                followers: advice.numFollowers || 0,
                rating: Number(_.get(advice, 'rating.current', 0) || 0).toFixed(2),
                performanceSummary: advice.performanceSummary,
                rebalancingFrequency: _.get(advice, 'rebalance', 'N/A'),
                isApproved: _.get(advice, 'latestApproval.status', false),
                approvalStatus: _.get(advice, 'approvalRequested', false),
                isOwner: _.get(advice, 'isOwner', false),
                isAdmin: _.get(advice, 'isAdmin', false),
                isSubscribed: _.get(advice, 'isSubscribed', false),
                isTrending: false,
                public: _.get(advice, 'public', false),
                netValue: advice.netValue,
            })
        });

        return advices;
    }

    renderAdvicesMobile = (type = 'all') => {
        const {advices} = this.state;
        return (
            <div 
                    className="advice-list" 
                    style={{
                        position: 'relative', 
                        width: '100%', 
                        height: '100%', 
                        zoom: 1, 
                        padding: '0px 4px 1% 4px', 
                        overflowY: 'auto', 
                        minHeight: '300px'
                    }}
            >
                <Loading
                        show={this.state.loading}
                        color={loadingColor}
                        className="main-loader"
                        showSpinner={false}
                />
                <List>
                    
                </List>
                {
                    !this.state.loading &&
                    advices.map((advice, index) => {
                        if (type === 'following') {
                            if (advice.isFollowing && !advice.isSubscribed) {
                                return <AdviceListItemMobile key={generateRandomString()} advice={advice}/>;
                            } else {
                                return null;
                            }
                        } else {
                            return <AdviceListItemMobile key={generateRandomString()} advice={advice}/>;
                        }
                    })
                }
            </div>
        );
    }

    getFilterMobileComponent = () => {
        return (
            <FilterMobileComponent 
                    owner={false}
                    updateAdvices={this.updateAdvices}
                    updateAdviceUrl={this.updateAdviceUrl}
                    toggleModal = {this.toggleFilterModal}
                    orderParam={this.state.sortBy}
                    toggleFilter={this.toggleFilter}
                    selectedTab={this.state.selectedTab}
                    updateSelectedFilters={this.updateSelectedFilters}
                    isAdmin={this.state.isAdmin}
                    toggleFilterMenu={this.toggleFilterMenu}
            />
        );
    }

    toggleFilterMenu = () => {
        this.setState({openFilterMenu: !this.state.openFilterMenu});
    }

    renderFilter = () => {
        return (
            <Modal
                    title="Apply Filters"
                    visible={this.state.filterModalVisible}
                    onCancel={this.toggleFilterModal}
                    width={700}
                    style={{top: 20}}
                    bodyStyle={{padding: '10px'}}
            >
                {this.getFilterComponent(true)}
            </Modal>
        );
    }

    toggleFilterModal = () => {
        this.setState({filterModalVisible: !this.state.filterModalVisible});
    }

    updateAdvices = (advices) => {
        this.setState({advices: this.processAdvices(advices)});
    }

    updateAdviceUrl = (url) => {
        this.setState({adviceUrl: url});
    }

    handleTabChange = (key) => {
        this.setState({selectedTab: key, selectedPage: 1}, () => {
            Utils.localStorageSave('selectedTab', key);
            Utils.localStorageSave('selectedPage', 1);
            this.getAdvices();
        });
    }

    handleInputChange = value => {
        this.setState({searchValue: value}, () => {
            if (value.length === 0) {
                this.getAdvices();
            }
        });
    }

    handleSortChange = value => {
        this.setState({sortBy: value});
    }

    renderSortingMenu = () => {
        return (
            <Select 
                    defaultValue={this.state.sortBy} 
                    onChange={this.handleSortChange} 
                    style={{fontSize: '14px', width: '120px'}}
            >
                <Option value="rating">Rating</Option>
                <Option value="return">Annual Return</Option>
                <Option value="name">Name</Option>
                <Option value="volatility">Volatility</Option>
                <Option value="sharpe">Sharpe</Option>
                <Option value="maxLoss">Max Loss</Option>
                <Option value="numFollowers">Wishlisters</Option>
                <Option value="numSubscribers">Subscribers</Option>
                <Option value="createdDate">Created Date</Option>
            </Select>
        );
    }

    toggleFilter = () => {
        let activeFilterPanel = [...this.state.activeFilterPanel];
        if (!activeFilterPanel.length) {
            activeFilterPanel.push("1");
        } else {
            activeFilterPanel = [];
        }
        this.setState({activeFilterPanel}, () => {
            this.state.activeFilterPanel;
        });
    }

    onPaginationChange = (page, pageSize) => {
        this.setState({selectedPage: page}, () => {
            window.scrollTo(0, 0);
            this.getAdvices();
            Utils.localStorageSave('selectedPage', page);
        })
    }   

    updateSelectedFilters = (filters, sortBy, type) => {
        console.log(sortBy);
        this.setState({
            selectedFilters: {
                ...this.state.selectedFilters,
                ...filters
            },
            selectedPage: 1,
            sortBy,
            selectedTab: type
        }, () => {
            this.getAdvices();
            Utils.localStorageSave('selectedPage', 1);
        });
    }

    renderRightSidebar = () => {
        return (
            <HamburgerMenu
                    customBurgerIcon={false}
                    customCrossIcon={false}
                    id={ "sidebar" }
                    right
                    width={this.props.windowWidth}
                    styles={{bmMenu: {backgroundColor: '#f9f9f9'}}}
                    isOpen={this.state.openFilterMenu}
            >
                {this.getFilterMobileComponent()}
            </HamburgerMenu>
        );
    }

    renderPagination = () => {
        const locale = {
            prevText: 'Prev',
            nextText: 'Next',
        };

        return (
            <Pagination 
                current={Number(this.state.selectedPage)} 
                total={this.state.totalCount}  
                locale={locale} 
                onChange={this.onPaginationChange}
            />
        );
    }

    renderPageContentNew = () => {
        return (
            <AqMobileLayout>
                <Row style={{backgroundColor: '#fff'}}>
                    <Col span={24} style={{marginTop: '10px'}}>
                        <SearchBar 
                                placeholder="Search Advices" 
                                cancelText="Cancel"
                                value={this.state.searchValue}
                                onChange={this.handleInputChange}
                                onSubmit={() => this.getAdvices()}
                        />
                    </Col>
                    <Col 
                            span={24} 
                            style={{
                                ...horizontalBox, 
                                alignItems: 'center', 
                                padding: '10px 15px',
                                justifyContent: 'space-between',
                            }}
                    >
                        <span style={{fontSize: '18px'}}>{this.state.advices.length} Advices</span>
                        <div style={{...horizontalBox}} onClick={this.toggleFilterMenu}>
                            <span style={{fontSize: '18px', marginRight: '5px'}}>Filter</span>
                            <Icon type="down" style={{marginTop: '2px', fontSize: '20px'}} />
                        </div>
                    </Col>
                    <Col span={24} style={{padding: '0 15px'}}>
                        {this.renderAdvicesMobile()}
                    </Col>
                    <Col span={24}>
                        {this.renderPagination()}
                    </Col>
                </Row>
            </AqMobileLayout>
        );
    }

    render() {
        return (
            <React.Fragment>
                <ScreenAdviceMeta />
                {this.renderRightSidebar()}
                <Loading
                        show={this.state.show}
                        color={loadingColor}
                        className="main-loader"
                        showSpinner={false}
                />
                {
                    !this.state.show &&
                    this.renderPageContentNew()
                }
            </React.Fragment>
        );
    }
}

export default windowSize(ScreenAdviceMobileImpl);

const filterSortContainerStyle = {
    marginTop: '20px',
};

const filterHeaderStyle = {
    fontSize: '14px'
};

const filterBtnStyle = {
    border: '1px solid #eaeaea',
    backgroundColor: '#23BEC3',
    fontSize: '12px',
    padding: '0 !important',
    height: '22px',
    marginTop: '8px',
    color: '#fff'
};

