import * as React from 'react';
import _ from 'lodash';
import {Row, Col, Icon, Tag, Badge, Button} from 'antd';
import {verticalBox, horizontalBox, primaryColor} from '../../../../constants';

const textColor = '#757575';

export default class SearchStockHeader extends React.Component {
    render() {

        const universe = _.get(this.props, 'filters.universe', null);
        const sector = _.get(this.props, 'filters.sector', null);
        const industry = _.get(this.props, 'filters.industry', null);
        const stockPerformanceOpen = _.get(this.props, 'stockPerformanceOpen', false);

        return (
            <Col span={24} style={{...topHeaderContainer, borderBottom: '1px solid #DFDFDF'}}>
                <Row 
                        type="flex" 
                        align="middle"
                        style={{width: '100%'}}
                >
                    <Col 
                            span={24} 
                            style={{...horizontalBox, padding: '8px', justifyContent: 'center'}}
                    >
                        <Icon 
                            style={{
                                fontSize: '24px', 
                                cursor: 'pointer', 
                                color: textColor, 
                                marginRight: '5px',
                                position: 'absolute',
                                left: '10px'
                            }} 
                            type={this.props.stockPerformanceOpen ? "left" : "close-circle"}
                            onClick={
                                () => stockPerformanceOpen
                                ? this.props.toggleStockPerformanceOpen()
                                : this.props.toggleBottomSheet()
                            }
                        />
                        <h3 
                                style={{
                                    fontSize: '16px', // Changing fontsize to 0 if selectedStocks > 1
                                    marginRight: '10px',
                                }}
                        >
                            {
                                this.props.stockPerformanceOpen 
                                ? 'Stock Performance' 
                                : 'Add Stocks'
                            }
                        </h3>
                        {
                            this.props.selectedStocks.length > 0 &&
                            !this.props.stockPerformanceOpen &&
                            <Button 
                                    style={{
                                        position: 'absolute', 
                                        right: '10px',
                                        fontSize: '12px',
                                        height: '30px',
                                        width: '75px',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                    }}
                                    onClick={this.props.addSelectedStocksToPortfolio} 
                                    type="primary" 
                                    loading={this.props.portfolioLoading}
                            >
                                ADD
                                <Badge 
                                    style={{
                                        backgroundColor: '#fff', 
                                        color: primaryColor, 
                                        fontSize: '14px', 
                                        marginLeft:'5px'
                                    }} 
                                    count={this.props.selectedStocks.length}
                                />
                            </Button>
                        }
                    </Col>
                    {this.props.renderSelectedStocks()}
                </Row>
            </Col>
        );
    }
}


const topHeaderContainer = {
    ...horizontalBox,
    justifyContent: 'space-between',
    borderBottom: '1px solid lightgrey',
    width: '100%',
    marginTop: '10px'
};