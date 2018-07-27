import * as React from 'react';
import Media from 'react-media';
import {Row, Col, Button} from 'antd';
import {Carousel} from 'antd-mobile';
import {withRouter} from 'react-router';
import {primaryColor} from '../../constants';
import {AqMobileLayout} from '../AqMobileLayout/Layout';
import AppLayout from '../../containers/AppLayout';
import selectStocksSvg from '../../assets/SelectStocks1.svg';
import selectBenchmarkSvg from '../../assets/SelectBenchmark.svg';
import submitEntrySvg from '../../assets/SubmitEntry1.svg';
import {Utils} from '../../utils';

class HowToCreateAdvice extends React.Component {
    
    renderPageContent = () => {
        return (
            <Row style={{marginTop: '30px', fontSize: '16px'}}>
                <Col style={{textAlign:'center'}}>
                    <h1 style={{color: primaryColor}}>Creating a contest entry in 3 <i>simple</i> steps!!</h1>
                </Col>
 
                <Col>
                    <Row type="flex" justify="space-around" style={{marginTop: '-5px', fontSize: '16px'}}>
                        <StepDescription
                            title="Select a Benchmark"
                            image={{src: selectBenchmarkSvg, width: '85%'}}>
                        </StepDescription>
                        
                        <StepDescription
                            title="Add Stocks to Portfolio"
                            image={{src: selectStocksSvg}}>
                        </StepDescription>

                        <StepDescription
                            title="Adjust Weight and Submit"
                            image={{src:submitEntrySvg}}>
                        </StepDescription>

                    </Row>
                </Col>

                 <Col style={{textAlign:'center', marginTop: '-5px'}}>
                    <Button 
                            type="primary" 
                            style={{fontWeight: 300, width: '200px', fontSize: '18px'}}
                            onClick={() => this.props.history.push('/contest/createentry/edit')}
                    >
                        CREATE
                    </Button>
                </Col>
            </Row>
        );
    }

    renderPageContentMobile = () => {
        return (
            <Row style={{marginTop: '30px', fontSize: '16px'}}>
                <Col style={{textAlign:'center'}}>
                    <h1 
                            style={{color: primaryColor, fontSize: '18px'}}
                    >
                        Creating a contest entry in 3 <i>simple</i> steps!!
                    </h1>
                </Col>
                <Col style={{textAlign:'center', marginTop: '-5px'}}>
                    <Button 
                            type="primary" 
                            style={{fontWeight: 300, width: '200px', fontSize: '18px', marginTop: '20px'}}
                            onClick={() => this.props.history.push('/contest/createentry/edit')}
                    >
                        CREATE
                    </Button>
                </Col>
 
                <Col>
                    <Row type="flex" justify="space-around" style={{marginTop: '-5px', fontSize: '16px'}}>
                        <Carousel autoplay={true} infinite>
                            <StepDescription
                                title="Select a Benchmark"
                                image={{src: selectBenchmarkSvg, width: '85%'}}>
                            </StepDescription>
                            
                            <StepDescription
                                title="Add Stocks to Portfolio"
                                image={{src: selectStocksSvg}}>
                            </StepDescription>

                            <StepDescription
                                title="Adjust Weight and Submit"
                                image={{src:submitEntrySvg}}>
                            </StepDescription>
                        </Carousel>
                    </Row>
                </Col>
            </Row>
        );
    }

    componentDidMount() {
        if (!Utils.isLoggedIn()) {
            Utils.goToLoginPage(this.props.history, this.props.match.url, true);
        } else {
            if (this.props.isUpdate) {
                this.getAdvice(this.props.adviceId);
            }
        }
    }

    render() {
        return (
            <React.Fragment>
                <Media 
                    query="(max-width: 600px)"
                    render={() => (
                        <AqMobileLayout 
                                customHeader={<h3 style={{fontSize: '14px'}}>CREATE ENTRY STEPS</h3>}
                                previousPageUrl='/contest/createentry'
                        >
                            {this.renderPageContentMobile()}
                        </AqMobileLayout>
                    )}
                />
                <Media 
                    query="(min-width: 601px)"
                    render={() => (
                        <AppLayout content={this.renderPageContent()}/>
                    )}
                />
            </React.Fragment>
        );
    }
};

export default withRouter(HowToCreateAdvice);

const StepDescription = ({title, image}) => {
    const containerStyle = {
        //border: '1px solid #eaeaea',
        margin: '0 10px',
        //padding: '15px',
        //borderRadius: '4px',
        //height: '200px',
        textAlign:'center',
        boxShadow: '0 10px 10px rgba(0,0,0,0.2)',
        transform: 'scale(0.8, 0.8)',
        background: 'white'

    };

    const imgWdith = image.width ? image.width : '100%';
    return (
        <React.Fragment>
            <Media 
                query="(max-width: 600px)"
                render={() => (
                    <Col span={24} style={containerStyle}>
                        <h3 style={{margin: '10px 0px 20px 0px', fontSize: '19px', color: primaryColor}}>
                            <i>{title}</i>
                        </h3>
                        <object style={{width: image.width}} type="image/svg+xml" data={image.src}></object>
                    </Col>
                )}
            />
            <Media 
                query="(min-width: 600px)"
                render={() => (
                    <Col span={6} style={containerStyle}>
                        <h3 style={{margin: '10px 0px 20px 0px', fontSize: '19px', color: primaryColor}}><i>{title}</i></h3>
                        <object style={{width: image.width}} type="image/svg+xml" data={image.src}></object>
                    </Col>
                )}
            />
        </React.Fragment>
    );
};

const h3Style = {
    fontSize: '18px',
    color: primaryColor
};

const bulletStyle = {
    marginBottom: '8px',
    lineHeight: '20px'
};