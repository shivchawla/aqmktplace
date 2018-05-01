import * as React from 'react';
import {Modal, Row, Col} from 'antd';
import StockResearch from '../containers/StockResearch';

export class StockResearchModal extends React.Component {
    shouldComponentUpdate(nextProps) {
        if (nextProps.ticker !== this.props.ticker) {
            // console.log(nextProps.ticker);
            return false;
        }
        return true;
    }

    render() {
        return(
            <Modal
                    onOk={this.props.toggleModal}
                    onCancel={this.props.toggleModal}
                    title={this.props.ticker.name}
                    visible={this.props.visible}
                    width='80%'
                    bodyStyle={{height: '650px', overflow: 'hidden', overflowY: 'scroll'}}
                    style={{top: 20}}
                    footer={null}
            >
                <StockResearch
                        style={{marginTop: '-50px',
                        boxShadow: 'none',
                        border: 'none'}} 
                        xl={24} 
                        openAsDialog={true} 
                        ticker={this.props.ticker.symbol}
                        // chartId is required so that we have the option to have multiple HighStock component in the same page with different Id
                        chartId="stockresearch-chart-container"
                />
            </Modal>
        );
    }
}