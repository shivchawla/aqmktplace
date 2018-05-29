import * as React from 'react';
import axios from 'axios';
import Loading from 'react-loading-bar';
import moment from 'moment';
import _ from 'lodash';
import {Row, Col, Input, Icon, Button, Spin, Select, Tabs, Collapse, Checkbox, Popover, Modal, Pagination, Radio} from 'antd';
import {AdviceListItemMod, AdviceFilterSideComponent, AqPageHeader} from '../components';
import {newLayoutStyle, pageTitleStyle, shadowBoxStyle, loadingColor} from '../constants';
import {Utils, getBreadCrumbArray, fetchAjax} from '../utils';
import {adviceFilters as filters} from '../constants/filters';
import '../css/screenAdvices.css';
import { Footer } from '../components/Footer';

const {aimsquantToken, requestUrl} = require('../localConfig');
const Option = Select.Option;
const CheckboxGroup = Checkbox.Group;
const TabPane = Tabs.TabPane;
const Panel = Collapse.Panel;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;
const antIcon = <Icon type="loading" style={{ fontSize: 18 }} spin />;

const sortValues = ['name', 'updatedAt desc', 'subscribers', 'followers', 'rating'];

export default class ScreenAdvices extends React.PureComponent {
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
            questionnaireFilters: {}
        }
    }

    handleSelectChange = value => {
    }
    
    renderMenu = () => {
        const options = ['name', 'rating', 'followers', 'subscribers'];

        return (
            <Select size="small" defaultValue={options[0]} style={{width: 120}} onChange={this.handleSelectChange}>
                {
                    options.map((item, index) => {
                        return (
                            <Option key={index} value={item}>{item}</Option>
                        );
                    })
                }
            </Select>
        );
    }

    componentWillMount() {
        this.mounted = true;
        // console.log(this.state.selectedFilters);
        this.getQustionnaireModal();
        if (!Utils.isLoggedIn()) {
            this.getAdvices();
            // Utils.goToLoginPage(this.props.history, this.props.match.url);
        } else {
            this.getAdvices();
            this.toggleFilter();
        }
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
        // console.log('Component Unmounted');
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
        })
        .catch(error => error)
        .finally(() => {
            this.setState({show: false, loading: false});
        });
    }

    getAdvices = adviceUrl => {
        this.setState({
            loading: true,
            show: this.state.initialCall,
            initialCall: false,
        });
        const url = adviceUrl === undefined ? this.processUrl(this.state.selectedTab) : adviceUrl;
        fetchAjax(url, this.props.history, this.props.match.url)
        .then(response => {
            // console.log('Mounted', this.mounted);
            if (this.mounted) {
                this.setState({
                    advices: this.processAdvices(response.data.advices),
                    totalCount: _.get(response.data, 'count', 10)
                });
            }
        })
        .catch(error => {
            console.log(error);
            return error;
        })
        .finally(() => {
            if (this.mounted) {
                this.setState({loading: false, show: false});
            }
        });
    }

    updateSelectedFilters = filters => {
        this.setState({selectedFilters: {
            ...this.state.selectedFilters,
            ...filters
        }});
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
                isApproved: _.get(advice, 'approvalStatus', 'N/A'),
                isOwner: _.get(advice, 'isOwner', false),
                isSubscribed: _.get(advice, 'isSubscribed', false),
                isTrending: false,
                public: _.get(advice, 'public', false),
                netValue: advice.netValue,
            })
        });

        return advices;
    }

    renderAdvices = (type = 'all') => {
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
                {
                    !this.state.loading &&
                    advices.map((advice, index) => {
                        if (type === 'following') {
                            if (advice.isFollowing && !advice.isSubscribed) {
                                return <AdviceListItemMod key={index} advice={advice}/>;
                            } else {
                                return null;
                            }
                        } else {
                            return <AdviceListItemMod key={index} advice={advice}/>;
                        }
                    })
                }
            </div>
        );
    }

    getFilterComponent = (modal = false) => {
        return (
            <AdviceFilterSideComponent 
                    owner={false}
                    updateAdvices={this.updateAdvices}
                    updateAdviceUrl={this.updateAdviceUrl}
                    toggleModal = {this.toggleFilterModal}
                    orderParam={this.state.sortBy}
                    toggleFilter={this.toggleFilter}
                    selectedTab={this.state.selectedTab}
                    updateSelectedFilters={this.updateSelectedFilters}
                    modal={modal}
            />
        );
    }

    renderFilter = () => {
        return (
            <Modal
                    title="Apply Filters"
                    visible={this.state.filterModalVisible}
                    onCancel={this.toggleFilterModal}
                    onOk={this.handleFilterChange}
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

    handleInputChange = (e) => {
        const value = e.target.value;
        this.setState({searchValue: value}, () => {
            if (value.length === 0) {
                this.getAdvices();
            }
        });
    }

    handleSortingMenuChange = value => {
        this.setState({sortBy: value}, () => {
            // const url = this.processUrl(this.state.selectedTab, value);
            Utils.localStorageSave('sortBy', value);
            this.getAdvices();
        });
    }

    renderSortingMenu = () => {
        return (
            <Select 
                    defaultValue={this.state.sortBy} 
                    onChange={this.handleSortingMenuChange} 
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

    handleFilterChange = () => {
        this.setState({selectedPage: 1}, () => {
            this.getAdvices();
            Utils.localStorageSave('selectedPage', 1);
            this.setState({filterModalVisible: false});
        });
    }

    renderPageContent = () => {
        const antIcon = <Icon type="loading" style={{ fontSize: 36 }} spin />;
        const breadCrumbs = getBreadCrumbArray([{name: 'Screen Advices'}]);
        const button = {route: '/advisordashboard/createadvice', title: 'Create Advice'};

        return (
            <React.Fragment>
                <Row className='aq-page-container'>
                    {this.renderQuestionnaireDialog()}
                    <AqPageHeader title="Screen Advices" breadCrumbs={breadCrumbs} />
                    <Row className="row-container" style={{...shadowBoxStyle, marginBottom:'20px'}}>
                        {this.renderFilter()}
                        
                        <Col xl={17} md={24} style={{paddingLeft:'20px'}}>
                            <Row style={{marginTop: '40px'}}>
                                
                                <Row style={{...shadowBoxStyle, border:'0', borderWidth:'0px'}}> 
                                    <Input 
                                        suffix={(
                                            <Icon 
                                                type="search" 
                                                style={{fontSize: '16px', marginRight: '10px', fontWeight: '600'}}
                                            />
                                        )}
                                        placeholder="Search Advice"
                                        value={this.state.searchValue}
                                        onChange={this.handleInputChange}
                                        onPressEnter={() => this.getAdvices()}/>
                                </Row>

                                <Row type="flex" align="middle" justify="end" >
                                    <Col span={10} style={{...filterSortContainerStyle, marginBottom: '-40px', zIndex:'4'}}>
                                        <Row type="flex" align="middle" justify="end">
                                            <Col xs={3} md={3} xl={0} style={{marginTop: '5px'}}>
                                                <Icon   
                                                    onClick={this.toggleFilterModal} 
                                                    style={{cursor: 'pointer'}}
                                                    type="bars" 
                                                    style={{ fontSize: 20, cursor: 'pointer'}}/>
                                            </Col>
                                            <Col span={4}>
                                                <h5 style={{fontSize: '14px', color: '#6C6C6C'}}>Sort By</h5>
                                            </Col>
                                            <Col span={9}>
                                                {this.renderSortingMenu()}
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            </Row>
                            
                            <Row>
                                <Col span={24} style={{minHeight: '600px'}}>
                                    <Tabs 
                                        animated={false} 
                                        defaultActiveKey={this.state.selectedTab} 
                                        onChange={this.handleTabChange}>
                                        
                                        <TabPane tab="All" key="all">
                                            {this.renderAdvices('all')}
                                        </TabPane>
                                        
                                        <TabPane tab="Trending" key="trending">
                                            {this.renderAdvices('trending')}
                                        </TabPane>
                                        
                                        <TabPane tab="Subscribed" key="subscribed">
                                            {this.renderAdvices('subscribed')}
                                        </TabPane>
                                        
                                        <TabPane tab="Wishlist" key="following">
                                            {this.renderAdvices('following')}
                                        </TabPane>
                                    </Tabs>
                                </Col>
                            </Row>
                            <Row style={{textAlign: 'center'}}>
                                <Pagination
                                    current={Number(this.state.selectedPage)} 
                                    total={this.state.totalCount} 
                                    pageSize={this.state.limit}
                                    onChange={this.onPaginationChange}/>
                            </Row>                  
                        </Col>
                        <Col xl={6} md={0} offset={1} style={{...newLayoutStyle, padding: '0'}}>
                            <Row>
                                <Col span={8}>
                                    <h3 style={{...filterHeaderStyle, margin: '10px 0 0 10px'}}>Apply Filters</h3>
                                </Col>
                                <Col span={6} offset={9}>
                                    <Button style={filterBtnStyle} onClick={this.handleFilterChange}>Update</Button>
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    {this.getFilterComponent()}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </Row>
                <Footer />
            </React.Fragment>
        );
    }

    render() {
        return (
            <React.Fragment>
                <Loading
                        show={this.state.show}
                        color={loadingColor}
                        className="main-loader"
                        showSpinner={false}
                />
                {
                    !this.state.show &&
                    this.renderPageContent()
                }
            </React.Fragment>
        );
    }
}

const IconHeader = ({icon, label, checked, filterType, onChange}) => {
    return (
        <Row>
            <Col span={4}>
                <Checkbox checked={checked} onChange={(e) => onChange(e, filterType)}/>
            </Col>
            <Col span={4}>
                <Icon type={icon} />
            </Col>
            <Col span={12}>
                <h5>{label}</h5>
            </Col>
        </Row>
    );
};

const filterSortContainerStyle = {
    marginTop: '20px',
};

const searchInputStyle = {
    borderRadius: '2px'
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
