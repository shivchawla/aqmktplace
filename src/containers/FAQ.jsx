import * as React from 'react';
import {Row, Col, Collapse} from 'antd';
import {shadowBoxStyle} from '../constants';

const Panel = Collapse.Panel;

export default class FAQ extends React.Component {
    render() {
        const generalQAS = [
            {
                question: 'What is an advice?',
                answer: 'Advice is an investment portfolio comprising of stocks with a stated objective as decided by the advisor. The advice performance is measured against an appropriate benchmark chosen by the advisor.'
            },
            {
                question: 'Who is an advisor?',
                answer: 'Any body on the platform who creates and publishes an advice is called an Advisor.'
            },
            {
                question: 'Who is an investor?',
                answer: 'Any body on the platform who is primarily interested in screening advices and'
            },
            {
                question: 'Can I be both an investor and an advisor?',
                answer: 'Yes. The platform allows anybody to assume both roles. As an investor, you will have access to public advices on the platform. As advisor, you can create an advice and publish it to'
            },
            {
                question: 'Can I just be an advisor?',
                answer: 'By default, you have access to both investor and advisor functionalities. In case, you want to be purely an advisor, you can safely ignore the services for an investor'
            },
            {
                question: 'Can I just be an investor?',
                answer: 'By default, you have access to both investor and advisor functionalities. In case, you want to be purely an investor, you can safely ignore the services for an advisor. This mean that you will not create and publish an advice.'
            },
            {
                question: 'Can I create an advice as an Investor?',
                answer: 'You can create advice as an advisor. On the platform, you are allowed to assume both the roles simultaneously.'
            },
            {
                question: 'Do I need to be an advisor to create an advice?',
                answer: 'On the platform,'
            },
            {
                question: 'How do I become a registered investment advisor?',
                answer: 'SEBI (full form), the regulatory body that governs …... has laid down elaborate rules and requirements on how to be a registered investment advisor. You can read that here.'
            },
        ];

        const adviceQAS = [
            {
                question: 'How can I create an advice?',
                answer: 'Advice is an investment portfolio that an advisor publishes.  Every advice has a rebalance frequency which means advisor is expected to make changes to the portfolio to re-align to the stated objectives of the advice.'
            },
            {
                question: 'When can I update an advice?',
                answer: 'Depending on the rebalance frequency of the advice, an advisor can update the investment portfolio only at certain predefined dates and time'
            },
            {
                question: 'What is rebalance frequency',
                answer: 'The rebalance frequency is period after which advisor is expected to alter the investment portfolio to match the stated objectives. For ex: if rebalance frequency is Quarterly, then advisor will optionally update the investment portfolio as deemed necessary by the advisor'
            },
            {
                question: 'What is the meaning of initial cash?',
                answer: 'Every investment advice needs to start with a set predefined initial asset value. The advisor will have increased'
            }
        ];
        
        const advisorQAS = [
            {
                question: 'How many advices can I create on the platform?',
                // answer: 'An advisor can only create upto 3 free advices on the platform.',
                children: [
                    {text: 'An advisor can only create upto 3 free advices on the platform.'}
                ]
            },
            {
                question: 'How do I protect my advice from being copied?',
                answer: 'While rating the investment portfolio, portfolio composition is correlated with all existing advices. In case an advice is correlated with other advices, it is rated poorly in that category.',
                children: [
                    {
                        text: 'Your advice doesn’t match the requirement as stated in “How can I create an Advice”.',
                        children: [
                            {text: 'Your advice doesn’t match the requirement as stated in “How can I create an Advice”.'},
                            {text: 'Please check the approval messages on your advisor dashboard to learn more about the precise reason.'},
                            {text: 'Once you fix the advice to match requirements, you can request an approval. '}
                        ]
                    },
                    {text: 'Please check the approval messages on your advisor dashboard to learn more about the precise reason.'},
                    {text: 'Once you fix the advice to match requirements, you can request an approval.'}
                ]
            },
            {
                question: 'Why is my advice rejected/prohibited? What should I do to fix it?',
                answer: 'Your advice doesn’t match the requirement as stated in “How can I create an Advice.'
            },
            {
                question: 'Why is my advice not approved yet?',
                answer: 'We are going through your advice both via an automated and manual process to make sure it matches the requirements. This process can take upto 1 business day to finish.'
            }, 
            {
                question: 'Can I create an advice without being registered investment advisor?',
                answer: 'Yes. You can create an advice without a being a registered investment advisor. However, we will adequately mark the advice to display the nature of advisor.'
            }
        ];

        const investorQAS = [
            {
                question: '',
                answer: ''
            }
        ];

        return (
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
        );
    }
}

const FAQGroup = ({name, qas}) => { // Group name and question answers
    return (
        <Row style={{marginTop: '20px'}}>
            <Col span={24}>
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
                                                style={{fontSize: '16px', marginLeft: '40px', marginBottom: '5px', color: '#515151'}}
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