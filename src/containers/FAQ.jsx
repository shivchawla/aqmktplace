import * as React from 'react';
import Media from 'react-media';
import {Row, Col, Collapse} from 'antd';
import {shadowBoxStyle} from '../constants';
import AppLayout from './AppLayout';

const Panel = Collapse.Panel;

export default class FAQ extends React.Component {
    render() {
        const generalQAS = [
            {
                question: 'What is an Advice?',
                answer: 'Advice is an investment portfolio comprising of publicly traded stocks with a stated objective as decided by the Advisor. It is not a Personal Financial Advice and others users of the platform will have equal access to the same advice.'
            },
            {
                question: 'Who is an Advisor?',
                answer: 'Any body on the platform who creates and publishes an advice is called an Advisor. This is not same as Registered Investment Advisor. If Advice is marked "Registered", only then it means that the advice is created by an Registered Investment Advisor. In all other cases, it can be any user of the platform.'
            },
            {
                question: 'Who is an Investor?',
                answer: 'Any body on the platform who is primarily interested in screening advices and investing in stock markets. '
            },
            {
                question: 'Can I be both an Investor and an Advisor?',
                answer: 'Yes. The platform allows anybody to assume both roles. As an Investor, you will have access to public advices on the platform. As an Advisor, you can create, update and publish an advice. You can safely ignore other services provided by the platform, in case, you choose to be purely an Investor or Advisor.'
            },
            {
                question: 'Can I create an Advice as an Investor?',
                answer: 'You can create an advice as an Advisor only. On the platform, you are allowed to assume both the roles simultaneously.'
            },
            {
                question: 'Do I need to be an Registerd Investment Advisor to create an advice?',
                answer: 'No. According to SEBI (Securities and Exchange Board of India), only a personal invesment advice along with financial planning specific to an individual client requires one to be an Registered Investment Advisor. An advice open to general public does not require one to be Registered Investment Advisor.'
            },
            {
                question: 'How do I become a Registered Investment Advisor?',
                answer: 'SEBI (Securities and Exchange Board of India), has laid down elaborate rules and requirements on how to be a Registered Investment Advisor. You can find out more at their website: www.sebi.gov.in'
            },
        ];

        const adviceQAS = [
            {
                question: 'How can I create an advice?',
                answer: 'Every advice on the platform has to satisfy certain requirements to be accepted on the platform. Every advice needs a',
                children: [
                    {text:  "Valid Name"},
                    {text: "Investment Objective"},
                    {text: "Rebalance frequency"},
                    {text: "Appropriate Benchmark"}],
            },
            {
                question: 'What is the meaning of Investment Objective?',
                answer: 'Every Advice requires a well defined Investment Objective. It defines the goal of an Investment Advice. Investment Objective/Goals can be to achieve high rate of return, achieve lower volatilty or wealth preservation.'
            },
            {
                question: 'What is the significance of the Benchmark?',
                answer: 'Every Advice requires a predefined Benchmark. Advice performance is measured relative to this chosen Benchmark. It can chosen from a broad list of Market Indices like NIFTY_50, NIFTY_100, NIFTY_BANK etc. Benchmark must be chosen appropriately. An Advice with mostly Technology stocks should have NIFTY_IT as the benchmark.'
            },
            {
                question: 'What is Rebalance Frequency',
                answer: 'Rebalance Frequency is the period after which advisor is expected to alter the investment portfolio to match the stated investment objective. For ex: if rebalance frequency is Quarterly, then advisor will optionally update the investment portfolio every 3 months as deemed necessary by the advisor'
            },
            {
                question: 'When can I update an Advice?',
                answer: 'Depending on the rebalance frequency of the advice, an advisor can update the investment portfolio only at certain predefined dates and time. For example, an Advice with Daily frequency can be updated on a daily basis and an Advice with Weekly frequency can only be updated first Monday of every week.'
            },
            {
                question: 'What can I update in an Advice?',
                answer: 'If your advice is already published, you can only update the Portfolio of the advice. However, if not published, you can change any part of the Advice. Also, if Advice is "Rejected", you can change only the specified fields as recommended by the company',
            },
            {
                question: 'Is it important to rebalance the Advice?',
                answer: "As an Advisor, you must update the Advice if you think it no longer matches it stated objective. However, there is no compulsion to update the advice everytime. Also, once you skip the rebalance date, you can only update the advice on next possible rebalancing date",
            },
            
        ];

        const investorQAS = [
            {
                question: '',
                answer: ''
            }
        ];

        const advisorQAS = [
            {
                question: 'How many advices can I create on the platform?',
                // answer: 'An advisor can only create upto 3 free advices on the platform.',
                answer: 'An advisor can only create upto 3 free advices on the platform as of now.'
                
            },
            {
                question: 'How do I protect my advice from being copied?',
                answer: 'Every Advice is rated on a collection of various metrics. While rating the Advice, as one of the inputs, portfolio composition is correlated with all existing advices. In case an advice is highly correlated with other existing advices, it is rated poorly in that category.',
            },

            {
                question: 'My advice shows "Rejected" flag. How can I fix it?',
                answer: 'Your advice doesn’t match the requirements as stated in “How can I create an Advice". Please check the approval messages on your advisor dashboard to learn more about the precise reason. Once you fix the advice to match requirements, you can request an approval using "Request Approval" button',
            },
            {
                question: 'My advice shows "Prohibited" flag. How can I fix it?',
                answer: 'Either the Advice Name or Investment Objective is in unappropriate language. Once you fix the advice to match requirements, you can request an approval using "Request Approval" button',
            },
            {
                question: 'Why is my advice not approved yet?',
                answer: 'We are going through your advice both via an automated and manual process to make sure it matches the requirements. This process can take upto 3 business days to finish. We will send an email once the status of the advice changes.'
            }
        ];

        return (
            <AppLayout content = {
                <React.Fragment>
                    <Media 
                        query="(max-width: 599px)"
                        render={() => {
                            return (
                                <Row>
                                    <Col span={24}>
                                        <Row style={{padding: '20px 0', paddingTop: '0'}}>
                                            <Col span={24} style={{padding: '0 10px'}}>
                                                <h1>FAQ</h1>
                                            </Col>
                                            <Col span={24} style={{marginTop: '-20px'}}>
                                                <FAQGroup name='General' qas={generalQAS}/>
                                                <FAQGroup name='Advice' qas={adviceQAS}/>
                                                <FAQGroup name='Advisor' qas={advisorQAS}/>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            );
                        }}
                    />          
                    <Media 
                        query="(min-width: 600px)"
                        render={() => {
                            return (
                                <Row className='aq-page-container'>
                                    <Col span={18} style={{...shadowBoxStyle, marginTop: '20px'}}>
                                        <Row style={{padding: '20px'}}>
                                            <Col span={24}>
                                                <h1>FAQ</h1>
                                            </Col>
                                            <Col span={24}>
                                                <FAQGroup name='General' qas={generalQAS}/>
                                                <FAQGroup name='Advice' qas={adviceQAS}/>
                                                <FAQGroup name='Advisor' qas={advisorQAS}/>
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>
                            );
                        }}
                    />                   
                </React.Fragment>
            }>
            </AppLayout>
        );
    }
}

const FAQGroup = ({name, qas}) => { // Group name and question answers
    return (
        <Row style={{marginTop: '20px'}}>
            <Col span={24} style={{padding: '0 10px'}}>
                <h3 style={{fontWeight: '700', color: '#323C5A'}}>{name}</h3>
            </Col>
            <Col span={24} style={{marginTop: '20px'}}>
                <Collapse bordered={false} >
                    {
                        qas.map((item, index) => {
                            return (
                                <Panel 
                                        header={<h3 style={{fontSize: '18px', fontWeight: '400'}}>{item.question}</h3>} 
                                        key={index} 
                                        style={customPanelStyle}
                                >
                                    {
                                        item.answer &&
                                        <h5 
                                                style={{fontSize: '16px', marginBottom: '5px', color: '#515151'}}
                                        >
                                            {item.answer}
                                        </h5>
                                    }
                                    <Col span={24} style={{paddingLeft: '40px'}}>
                                        {
                                            item.children && renderChildren(item.children, 'number')
                                        }
                                    </Col>
                                </Panel>
                            );
                        })
                    }
                </Collapse>
            </Col>
        </Row>
    );
}

const renderChildren = (children, type='alphabet') => {
    return (
        <ol type={type==='number' ? "1" : "a"} style={{marginTop: '10px', marginLeft: '20px', padding: 0}}>
            {
                children.map((item, index) => {
                    return (
                        <li style={{marginBottom: '10px'}} key={index}>
                            <h5 style={{fontSize: '16px'}}>{item.text}</h5>
                            {item.children && renderChildren(item.children)}
                        </li>
                    );
                })
            }
        </ol>
    );
}

const customPanelStyle = {
    borderRadius: 0,
    border: 'none',
    borderBottom: '1px solid #eaeaea',
    // marginBottom: 10,
    // border: 0,
    overflow: 'hidden',
    // background: '#F8FAFF'
  };