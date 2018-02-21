import * as React from 'react';
import {Button} from 'antd';
import {AqLink} from '../components';
import {CreatePortfolioDialog} from '../containers';
import '../css/highstock.css';
const ReactHighstock = require('react-highcharts/ReactHighstock.src');

export class Dashboard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
    }

    createPortfolio = () => {
        this.setState({visible: !this.state.visible});
    }

    render() {
        return (
            <div>
                {/* <ReactHighstock config={config}/> */}
                <AqLink to='/dashboard/createadvice' pageTitle='Create Advice'/> <br></br>
                <Button onClick={this.createPortfolio}>Create Portfolio</Button>
                <CreatePortfolioDialog 
                        visible={this.state.visible} 
                        onCancel={this.createPortfolio}
                        toggleDialog={this.createPortfolio}
                />
            </div>
        );
    }
}