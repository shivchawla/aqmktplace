import {horizontalBox} from '../../constants';
export const stepHeaderStyle = {
    fontSize: '22px',
    color: 'teal',
    //color: '#4A4A4A'
};

export const headerContainerStyle = {
    ...horizontalBox,
    justifyContent: 'center',
    alignItems: 'center'
};

export const tooltips = {
    goal: 'This is the goal of the advice',
    investmentObjPortfolioValuation: 'This is the Portfolio Valuation of the advice',
    investmentObjCapitalization: 'This is the capitalization of your advice',
    sectors: 'These are the sectors of your advice',
    userText: 'This is the description of your advice',
    suitability: 'This is the suitability of your advice',
    startDate: 'This is the start date of your advice',
    rebalancingFrequency: 'This is the rebalancing frequency of your advice',
    benchmark: 'This is the benchmark of your advice',
    portfolio: 'This is the portfolio of your advice',
    adviceName: 'This will be the name of your advice'
}