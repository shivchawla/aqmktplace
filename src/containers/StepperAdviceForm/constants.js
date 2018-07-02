import {horizontalBox, primaryColor} from '../../constants';

export const stepHeaderStyle = {
    fontSize: '22px',
    color: 'teal',
    //color: '#4A4A4A'
};

export const labelStyle = {
    fontWeight: 300, 
    color: '#000000',
    fontSize: '16px'
};

export const valueStyle = {
    fontWeight: 400, 
    color: primaryColor,
    fontSize: '16px'
};

export const textStyle = {
    fontWeight: 400, 
    color: '#000000',
    fontSize: '16px'
};


export const headerContainerStyle = {
    ...horizontalBox,
    justifyContent: 'center',
    alignItems: 'center'
};

export const tooltips = {
    goal: 'Goal of the advice',
    investmentObjPortfolioValuation: 'Portfolio Valuation of the advice',
    investmentObjCapitalization: 'Capitalization of the advice',
    sectors: 'Relevant sectors in the advice investment portfolio',
    userText: 'Description of your advice',
    investorType: 'Investor type for the advice',
    suitability: 'Suitability of the advice',
    startDate: 'Start date of the advice',
    rebalancingFrequency: 'Rebalancing frequency of the advice',
    benchmark: 'Benchmark of the advice',
    portfolio: 'Portfolio of the advice',
    adviceName: 'Name of the advice'
}