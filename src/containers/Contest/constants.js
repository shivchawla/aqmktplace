import enterContestIcon from '../../assets/enter-contest.svg';

export const scoringText = 'The theme of the contest is to award experts with Investment Ideas that perform better than the market. For this purpose, our scoring function will largely depend on excess return over chosen benchmark.';

export const scoringMetrics = [
    {header: 'Excess Return', content: 'Annualized total return of portfolio in excess to the benchmark'},
    {header: 'Tracking Errror', content: 'Annualized standard deviation of daily returns of portfolio in excess to the benchmark'},
    {header: 'Maximum Loss', content: "Maximum Loss incurred by the portfolio in excess to the benchmark" },
    {header: 'Information Ratio', content: 'Ratio of Excess Return to Tracking Error. Metric to measure consistency of portfolio returns.'},
    {header: 'Calmar Ratio', content: 'Ratio of Excess Return to Max Loss. Metric to measure the ability to recover loss in portfolio'},
    {header: "Portfolio Concentration", content: "Metric to measure portfolio diversification"}
];

//Define them for excess return 
export const metricDefs = {
    annualReturn: 'Annualized total return of portfolio in excess to the benchmark',
    volatility: 'Annualized standard deviation of daily returns of portfolio in excess to the benchmark',
    maxLoss: "Maximum Loss incurred by the portfolio in excess to the benchmark" ,
    sharpe: 'Ratio of Excess Return to Tracking Error. Metric to measure consistency of portfolio returns.',
    calmar: 'Ratio of Excess Return to Max Loss. Metric to measure the ability to recover loss in portfolio',
    concentration: "Metric to measure portfolio diversification. It is computed as sum of square of portfolio weights"
};

export const faqs = [
    {
        header: 'How do I enter the contest?', 
        content: 'Click “Submit Entry", follow 3 simple steps to create a valid Investment Portfolio. Then click “Enter Contest".'
    },
    {
        header: 'What kind of Investment Idea are you looking for?',
        content: 'We are looking for Diversified as well as concentrated Sectoral Investment Portfolios that consistently beat the market.'
    },
    {
        header: 'What is the rationale behind the scoring criteria?',
        content: 'The scoring criteria is a cross-sectional measure that ranks multiple meetrics measuring return, risk and portfolio diversity. It is to make sure that Investment Portfolio are good quality investment ideas and not just random luck events.'
    },
    {
        header: 'Will you see my Investment Portfolio?',
        content: 'We will look at your investment portfolio ONLY for evaluation purposes. We will NOT use your investment portfolio without explicit consent.'
    },
    {
        header: 'Can I withdraw my entry from the contest?',
        content: 'Yes. You can click “Withdraw From Contest” on the Advice Detail page. You cannot re-enter the same contest once withdrawn. It’s recommended to NOT withdraw to prevent any entry limit issues.'
    },
    {
        header: 'Is there any submission deadline?',
        content: 'The contest is a rolling contest on a weekly basis. This means a NEW contest is automatically created every week.'
    },
    {
        header: 'Can I submit multiple entries in the contest?',
        content: 'Yes, you can submit up-to 3 entries in the contest.'
    },
    {
        header: 'Is there any entry fee for contest?',
        content: 'No'
    },
    {
        header: 'How long are the entries evaluated?',
        content: 'The contest are evaluated for at-least for 1 month. The entries are automatically rolled into the next contest and the overall performance is used for ranking purposes.'
    },
    {
        header: 'Do I have to re-enter in new weekly contests?',
        content: 'No. Your entry is automatically rolled into next contest.'
    },
    {
        header: 'What’s the fine print?',
        content: 'Please check out contest rules for complete details and legal policies'
    }
    
];

export const howItWorksContents = [
    {image: enterContestIcon, header: 'Enter Contest', content: 'Write an algorithm, and submit it to the contest. Submissions are entered into the contest starting at the next market open.'},
    {image: enterContestIcon, header: 'Enter Contest', content: 'Write an algorithm, and submit it to the contest. Submissions are entered into the contest starting at the next market open.'},
    {image: enterContestIcon, header: 'Enter Contest', content: 'Write an algorithm, and submit it to the contest. Submissions are entered into the contest starting at the next market open.'}
];

export const prizeText = "The top 5 contest participants are awarded cash prizes on a weekly basis. The following prizes are awarded after every week:";

export const prizes = [
    {key: 1, rank: '1st Place', reward: 'Rs 4000'},
    {key: 2, rank: '2nd Place', reward: 'Rs 2500'},
    {key: 3, rank: '3rd Place', reward: 'Rs 1500'},
    {key: 4, rank: '4th Place', reward: 'Rs 1000'},
    {key: 5, rank: '5th Place', reward: 'Rs 1000'},
];

export const criterias = [
    {header: 'Returns', content: 'Your Investment Idea must make money.'},
    {header: 'Portfolio Concentration', content: 'Your Investment Idea must not over-invest in single stock.'},
    {header: 'Sector Concentration', content: 'Your Investment Idea must not over-invest in single sector*.'},
    {header: 'Turnover', content: 'Your Invesment Idea must not change abruptly in a single day.'},
    {header: 'Beta', content: 'Your Investment Idea should not be very conservative or aggressive in comparison to chosen benchmark'},
    {header: 'Maximum Loss', content: 'Your Investment Idea should not lose more than 10% in comparison to chosen benchmark'},
];

