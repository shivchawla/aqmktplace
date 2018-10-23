/*
* @Author: Shiv Chawla
* @Date:   2018-09-11 20:06:27
* @Last Modified by:   Shiv Chawla
* @Last Modified time: 2018-09-11 20:40:00
*/

import React, {Fragment} from 'react'

import createPortfolio from '../../assets/CreatePortfolio.svg';
import updateEntry from '../../assets/UpdateEntry.svg';
import winPrize from '../../assets/WinPrizes.svg';

export const scoringText = 'The theme of the Best Stock Picks Contest is to award best stock pickers with most profitable ideas. For this purpose, our scoring function will only depend on net profit everyday.';


export const faqs = [
    {
        header: 'How do I enter the contest?', 
        content: 'Click “Submit Entry", Add up to 10 stocks to buy and up to 10 stocks to sell. Then click “Enter Contest".'
    },
    {
        header: 'What stocks/universe is allowed?',
        content: 'We only allow stocks that are included in NIFTY-500 index. For selling, stocks with available future contracts are allowed.'
    },
    {
        header: 'Will you see my Stock Picks?',
        content: 'We will look at your stock picks ONLY for evaluation purposes. We will NOT use your stock picks without explicit consent.'
    },
    {
        header: 'Can I withdraw my entry from the contest?',
        content: 'No. Your entry will automatically expire the following trading day. You must re-enter the contest everyday with fresh stock picks to be eligible for the next contest.'
    },
    {
        header: 'Is there any submission deadline?',
        content: 'The contest refreshes everyday and entries can be submitted between Market Open (9:30 AM) to Market Close (3:30PM). Each trading day is a new contest and participant must re-enter.'
    },
    {
        header: 'Can I submit multiple entries in the contest?',
        content: 'No, you can only submit one entry.'
    },
    {
        header: 'Is there any entry fee for contest?',
        content: 'No'
    },
    {
        header: 'How long are the entries evaluated?',
        content: 'The entries are evaluated for just 1 trading day. The profit over one trading period is used to select the winners.'
    },
    {
        header: 'Do I have to re-enter in new daily contests?',
        content: 'Yes. Your entry are NOT rolled into next contest.'
    },
    {
        header: 'When are winners declared?',
        content: 'Each contest runs for just 1 trading day. The winners are decided at the end of the 1 trading day.'
    },
    {
        header: 'What’s the fine print?',
        content: (<Fragment>Please check out <a href="https://www.adviceqube.com/dailycontest/rules"><span>Contest Rules</span></a> for complete details and legal policies</Fragment>)

    }
    
];

export const howItWorksContents = [
    {image: createPortfolio, header: 'Submit Stock Picks', content: 'Select upto 10 stocks to Buy and Sell, and submit it to the contest. Entries are evaluated at the end of next trading day at market close.'},
    {image: winPrize, header: 'Win Daily Prizes', content: 'The top 5 participants are awarded  10 Free trades worth brokerage coupon every day.'},
    {image: updateEntry, header: 'New Contest Everyday', content: 'A new contest start every market open. Comeback and submit your stock picks.'}
];

export const prizeText = "The top 5 contest participants are awarded 10 Free Trades (brokerage coupon worth Rs. 200) on a daily basis wth our preferred brokerage. The prizes are disbursed at the end of each week.";

export const requirements = [
    {header: 'Profitability', content: 'Your Contest entry must be profitable.'},
    {header: 'Stock Universe', content: 'You can only buy stocks that are valid NIFTY 500 constituents.'},
    {header: 'Shortable Universe', content: 'You can only sell stocks that have valid futue contracts associated with it.'},
    {header: 'Minimum Stocks', content: 'You must buy and sell at-least one stock. Maximum is 10 stocks.'},
    
];

