export const investorDashboard = [];
export const CreateAdviceCrumb = [
    {name: 'Contest', url: '/contest'}
];

export const CreatePortfolioCrumb = [
    {name: 'Dashboard', url: '/dashboard/investor/createdPortfolios'}
];

export const AdviceDetailCrumb = [
    {name: 'Screen Advices', url: '/advice'}
];

export const ContestAdviceDetailCrumb = [
    {name: 'Contest', url: '/contest'},
    {name: 'Leaderboard', url: '/contest/leaderboard'}
];

export const UpdateAdviceCrumb = [
    //...AdviceDetailCrumb
   ...CreateAdviceCrumb
];

export const PortfolioDetailCrumb = [
    {name: 'Dashboard', url: '/dashboard/investor/performanceSummary'},
];

export const UpdatePortfolioCrumb = [
    ...PortfolioDetailCrumb
];

export const AdvisorProfileCrumb = [
    {name: 'Screen Advices', url: '/advice'}
]