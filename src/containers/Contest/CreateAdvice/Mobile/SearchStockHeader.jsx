import * as React from 'react';
import _ from 'lodash';
import Media from 'react-media';
import {Row, Col, Icon, Tag, Badge, Button} from 'antd';
import {verticalBox, horizontalBox, primaryColor} from '../../../../constants';

const textColor = '#757575';

export default class SearchStockHeader extends React.Component {
    render() {

        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);
        const toggleIconColor = this.props.selectedStocks.length === 0 ? textColor : primaryColor;
        const stockPerformanceOpen = _.get(this.props, 'stockPerformanceOpen', false);

        return (
            <Col span={24} style={{...topHeaderContainer, borderBottom: '1px solid #DFDFDF'}}>
                <Row 
                        type="flex" 
                        align={global.screen.width > 600 ? 'middle' : 'start'} 
                        style={{padding: '10px 20px 5px 0px'}}
                >
                    <Icon 
                        style={{
                            fontSize: '24px', 
                            cursor: 'pointer', 
                            color: toggleIconColor, 
                            marginRight: '5px',
                            marginLeft: global.screen.width < 600 ? '-5px' : '0px'
                        }} 
                        type="close-circle"
                        onClick={this.props.toggleBottomSheet}
                    />
                    <div style={{...horizontalBox}}>
                        <h3 
                                style={{
                                    fontSize: this.props.selectedStocks.length === 0 ? '24px' : '14px', 
                                    marginRight: '10px',
                                    transition: 'all 0.4s ease-in-out'
                                }}
                        >
                            {
                                this.props.stockPerformanceOpen 
                                ? 'Stock Performance' 
                                : 'Add Stocks to your Portfolio'
                            }
                        </h3>
                        {
                            !this.props.stockPerformanceOpen &&
                            <React.Fragment>
                                <span style={{fontSize: '14px', marginRight: '5px'}}>Universe: </span>
                                {industry && 
                                    <Tag style={{fontSize: '14px'}}>{industry}</Tag>  
                                }

                                {sector && 
                                    <Tag style={{fontSize: '14px'}}>{sector}</Tag>
                                }
                                
                                {universe && 
                                    <Tag style={{fontSize: '14px', color: 'green'}}>{universe}</Tag>
                                }
                            </React.Fragment>
                        }
                    </div>
                </Row>
                {
                    this.props.selectedStocks.length > 0 &&
                    <Button 
                            onClick={this.props.addSelectedStocksToPortfolio} 
                            type="primary" 
                            loading={this.props.portfolioLoading}
                    >
                        SELECTED
                        <Badge 
                            style={{
                                backgroundColor: '#fff', 
                                color: primaryColor, 
                                fontSize: '14px', 
                                marginLeft: '5px'
                            }} 
                            count={this.props.selectedStocks.length}
                        />
                    </Button>
                }
            </Col>
        );
    }
}


const topHeaderContainer = {
    ...horizontalBox,
    justifyContent: 'space-between',
    borderBottom: '1px solid lightgrey',
    padding: '0 20px'
};