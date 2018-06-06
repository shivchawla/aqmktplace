export const investorDashboard = [];
export const CreateAdviceCrumb = [
    {name: 'Dashboard', url: '/dashboard/advisor/myAdvices'}
];

export const CreatePortfolioCrumb = [
    {name: 'Dashboard', url: '/dashboard/investor/createdPortfolios'}
];

export const AdviceDetailCrumb = [
    {name: 'Screen Advices', url: '/advice'}
];

export const UpdateAdviceCrumb = [
    //...AdviceDetailCrumb
   ...CreateAdviceCrumb
];

export const PortfolioDetailCrumb = [
    {name: 'Dashboard', url: '/dashboard/investor/createdPortfolios'},
];

export const UpdatePortfolioCrumb = [
    ...PortfolioDetailCrumb
];

export const AdvisorProfileCrumb = [
    {name: 'Screen Advices', url: '/advice'}
]