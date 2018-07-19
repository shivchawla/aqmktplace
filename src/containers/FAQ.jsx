import * as React from 'react';
import Media from 'react-media';
import {Row, Col, Collapse} from 'antd';
import {shadowBoxStyle, primaryColor} from '../constants';
import {Footer} from '../components/Footer';
import AppLayout from './AppLayout';

const Panel = Collapse.Panel;

export default class FAQ extends React.Component {
    render() {
        const generalQAS = [
            {
                question: 'What is an Investment Idea?',
                answer: 'Investment Idea is an investment portfolio comprising of publicly traded stocks designed to beat a chosen benchmark. It is a building block to any public advice on the platform.'
            },
            {
                question: 'What is an Advice?',
                answer: 'Advice is a mix of top Investment Ideas carefully designed to achieve a stated Investment Objective. It is not a Personal Financial Advice and all users of the platform will have equal access to the same advice. '
            },
            {
                question: 'Who is an Expert?',
                answer: 'Any body on the platform who creates an Investment Idea, participates in the contest and is invited to publish/share his investment idea is called an Expert.'
            },
            {
                question: 'Who is an Investor?',
                answer: 'Any body on the platform who is primarily interested in screening advices and investing in stock markets.'
            },
            {
                question: 'Can I be both an Investor and an Expert?',
                answer: 'Yes. The platform allows anybody to assume both roles. As an Investor, you will have access to public advices on the platform. As an Expert, you can create, update and enter contest with your investment ideas. You can safely ignore other services provided by the platform, in case, you choose to be purely an Investor or an Expert.'
            },
            {
                question: 'Can I create an Investment Idea as an Investor?',
                answer: 'Yes. Anybody can create an Investment Idea. Only, if you are invited to share your Investment Idea, you become an expert.'
            },
            {
                question: 'Do I need to be an Registerd Investment Advisor to create an Investment Idea?',
                answer: 'No. According to SEBI (Securities and Exchange Board of India), only a personal invesment advice along with financial planning specific to an individual client requires one to be an Registered Investment Advisor. An investment idea open to general public does not require one to be Registered Investment Advisor.'
            },
            {
                question: 'How do I become a Registered Investment Advisor?',
                answer: 'SEBI (Securities and Exchange Board of India), has laid down elaborate rules and requirements on how to be a Registered Investment Advisor. You can find out more at their website: www.sebi.gov.in'
            },
        ];

        const investmentIdeaQAS = [
            {
                question: 'How can I create an Investment Idea?',
                answer: 'Creating an Investment Idea requires three step',
                children:[{text: "Select a Benchmark"}, {text: "Add stocks to your portfolio"}, {text: "Adjust weight and enter contest"}],
            },
            {
                question: 'Do I have to enter contest to submit an Investment Idea?',
                answer: 'Yes. Contest is a way to screen the best Investment Ideas. Top performers in contest will be invites to publish/share their investment ideas as advices',
            },
            {
                question: 'What is the significance of the Benchmark?',
                answer: 'Every Investment Idea requires a predefined Benchmark. Investment Idea performance is measured relative to this chosen Benchmark. It can chosen from a broad list of Market Indices like NIFTY_50, NIFTY_MIDCAP_150, NIFTY_BANK etc. Benchmark must be chosen appropriately. An Investment Idea with NIFTY_AUTO as the benchmark will only be allowed to choose from stocks in Automobile sector',
            },
            {
                question: 'When can I update an Investment Idea?',
                answer: 'After end of every trading day. This is optional but recommended to adhere to contest requirements.'
            },
            {
                question: 'What can I update in an Investment Idea?',
                answer: 'You can update the underlying Investment portfolio',
            },
            {
                question: 'Is it important to rebalance the Investment Idea?',
                answer: "Yes. Investment Idea must adhere to some rquirements. All investment ideas are governed by contest rules. Please read the contest rules to learn more.",
            },
            {
                question: 'How can I create an Advice?',
                answer: 'Advice is Invite-only feature. If you are among the top performers in our Investment Idea contest, you will be invited to publish you Investment Idea as an Advice.',
            },
            
        ];

        const investorQAS = [
            {
                question: '',
                answer: ''
            }
        ];

        const contestQAS = [
            {
                question: 'How do I enter the contest?', 
                answer: 'Visit www.adviceqube.come/contest, click “Submit Entry", follow 3 simple steps to create a valid Investment Idea. Then click “Enter Contest".'
            },
            {
                question: 'What kind of Investment Idea are you looking for?',
                content: 'We are looking for Diversified as well as concentrated Sectoral Investment Portfolios that consistently beat the market.'
            },
            {
                question: 'What is the rationale behind the scoring criteria?',
                answer: 'The scoring criteria is a cross-sectional measure that ranks multiple meetrics measuring return, risk and portfolio diversity. It is to make sure that Investment Portfolio are good quality investment ideas and not just random luck events.'
            },
            {
                question: 'Will you see my Investment Portfolio?',
                answer: 'We will look at your investment portfolio ONLY for evaluation purposes. We will NOT use your investment portfolio without explicit consent.'
            },
            {
                question: 'Can I withdraw my entry from the contest?',
                answer: 'Yes. You can click “Withdraw From Contest” on the Advice Detail page. You cannot re-enter the same contest once withdrawn. It’s recommended to NOT withdraw to prevent any entry limit issues.'
            },
            {
                question: 'Is there any submission deadline?',
                answer: 'The contest is a rolling contest on a weekly basis. This means a NEW contest is automatically created every week.'
            },
            {
                question: 'Can I submit multiple entries in the contest?',
                answer: 'Yes, you can submit up-to 3 entries in the contest.'
            },
            {
                question: 'Is there any entry fee for contest?',
                answer: 'No'
            },
            {
                question: 'How long are the entries evaluated?',
                answer: 'The contest are evaluated for at-least for 1 month. The entries are automatically rolled into the next contest and the overall performance is used for ranking purposes.'
            },
            {
                question: 'Do I have to re-enter in new weekly contests?',
                answer: 'No. Your entry is automatically rolled into next contest.'
            },
            {
                question: 'Why my Investment Idea is prohibited?',
                answer: "Your Investment Idea must meet some requirements. If you don't update your investment idea to reflect those requirements, we will prohibit it from the contest",
            },
            {
                question: 'My Investment Idea shows "Prohibited" flag. How can I fix it?',
                answer: 'Once prohibited, you can not use the same Investment Idea to participate in contest. Please create a new Investment Idea to particiapte.',
            },
            {
                question: 'What’s the fine print?',
                answer: 'Please check out contest rules for complete details and legal policies'
            }
            
        ];

        /*const expertQAS = [
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
                question: 'Why is my advice not approved yet?',
                answer: 'We are going through your advice both via an automated and manual process to make sure it matches the requirements. This process can take upto 3 business days to finish. We will send an email once the status of the advice changes.'
            }
        ];*/

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
                                                <h1 style={{color: primaryColor}}>FAQ</h1>
                                            </Col>
                                            <Col span={24} style={{marginTop: '-20px'}}>
                                                <FAQGroup name='General' qas={generalQAS}/>
                                                <FAQGroup name='Investment Idea' qas={investmentIdeaQAS}/>
                                                <FAQGroup name='Contest' qas={contestQAS}/>
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
                                                <h1 style={{color: primaryColor}}>FAQ</h1>
                                            </Col>
                                            <Col span={24}>
                                                <FAQGroup name='General' qas={generalQAS}/>
                                                <FAQGroup name='Investment Idea' qas={investmentIdeaQAS}/>
                                                <FAQGroup name='Contest' qas={contestQAS}/>
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
                <h3 style={{fontWeight: '700', color: primaryColor}}>{name}</h3>
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
                                                style={{fontSize: '16px', marginBottom: '5px', marginLeft: '10px', color: '#515151'}}
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