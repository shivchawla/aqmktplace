export const investorDashboard = [];
export const CreateAdviceCrumb = [
    {name: 'Advisor Dashboard', url: '/advisordashboard'}
];

export const CreatePortfolioCrumb = [
    {name: 'Investor Dashboard', url: '/investordashboard'}
];

export const AdviceDetailCrumb = [
    {name: 'Advices', url: '/advice'}
];

export const UpdateAdviceCrumb = [
    ...AdviceDetailCrumb
];

export const PortfolioDetailCrumb = [
    {name: 'Investor Dashboard', url: '/investordashboard'},
];

export const UpdatePortfolioCrumb = [
    ...PortfolioDetailCrumb
];

export const AdvisorProfileCrumb = [
    {name: 'Screen Advisors', url: '/advisordashboard/screenadvisors'}
]