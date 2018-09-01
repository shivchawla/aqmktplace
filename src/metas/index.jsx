import * as React from 'react';
import {Helmet} from 'react-helmet';

export const ScreenAdviceMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: Screen Investment Portfolios of Experts | Best Investment Ideas</title>
            <meta name="description" content="Best Investment Ideas. Screen the best investment advices from professional and investment enthusiasts"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, Stock market, Share Market, NSE stocks, returns, gain, India, Investment Advice"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const AdviceDetailMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: {props.name} | Expert Investment Portfolio</title>
            <meta name="description" content={`${props.name}: Invest in advices from investment experts`}/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, NSE stocks, Investment Advice, Advice, returns, gain"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const PortfolioDetailMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: {props.name}</title>
            <meta name="description" content={`${props.name}: Invest in advices from investment experts`}/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, NSE stocks, Investment Advice, Advice, returns, gain"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const AdvisorDashboardMeta = props => {
    return (
        <Helmet>
            {/* <title>Advisor Dashboard</title> */}
            <meta charSet="utf-8"/>
            <title>AdviceQube: Dashboard | Track your Investment Ideas </title>
            <meta name="description" content="Advisor Dashboard: Track your advices, subscribers, subscription activity and more"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, NSE stocks, Investment Advice, Advice"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const InvestorDashboardMeta = props => {
    return (
        <Helmet>
            {/* <title>Investor Dashboard</title> */}
            <meta charSet="utf-8" />
            <title>AdviceQube: Dashboard | Track your Portfolio </title>
            <meta name="description" content="Investor Dashboard: Track your portfolio, stock positions, subscribed advices and more"/>
            <meta name="keywords" content="www.adviceqube.com, Portfolio, Investments, Equity, NSE stocks, Investment Advice, Advice"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const HomeMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: Crowd-Sourced Investment Portfolio | Investing In Your Ideas</title>
            <meta name="description" content="Crowd Sourced Investment Portfolio. Powering Invesment fund with the best investment ideas from professional and investment enthusiasts"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, Stock market, Share Market, NSE stocks, Crowd, Crowd-sourced, returns, gain, Investment Advice, India"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const CreateAdviceMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com/advisordashboard"/>
        </Helmet>
    );
}

export const UpdateAdviceMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com/advisordashboard"/>
        </Helmet>
    );
}

export const CreatePortfolioMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com/investordashboard"/>
        </Helmet>
    );
}

export const UpdatePortfolioMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com/investordashboard"/>
        </Helmet>
    );
}

export const LoginMeta = props => {
    return (
        <Helmet>
            <title>Login | AdviceQube</title>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com"/>
        </Helmet>
    );
}

export const SignupMeta = props => {
    return (
        <Helmet>
            <title>Signup | AdviceQube</title>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com"/>
        </Helmet>
    );
}

export const StockResearchMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>Stock Research | Screen stocks from Indian Equity Markets | AdviceQube</title>
            <meta name="description" content="Search and compare stocks from Indian Equity Markets. Visualize historical stock performance over various horizons"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, Stock market, Share Market, NSE stocks, Stock Research, returns"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}

export const ContestHomeMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>Investment Idea Contest | AdviceQube</title>
            <meta name="description" content="Compete with your best Investment Ideas and win prizes"/>
            <meta name="keywords" content="www.adviceqube.com, Contest, Competition, Trading Challenge, Investments, Equity NSE stocks, Cash prize"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}


export const ContestCreateAdviceMeta = props => {
    return (
        <Helmet>
            <title>Create Investment Portfolio for Contest| AdviceQube</title>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com/contest"/>
        </Helmet>
    );
}

export const ContestUpdateAdviceMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>Update Investment Portfolio for Contest | AdviceQube</title>
            <link rel="canonical" href="https://www.adviceqube.com/contest"/>
        </Helmet>
    );
}

export const ContestAdviceDetailMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>Contest Entry Detail | AdviceQube</title>
            <meta name="keywords" content="www.adviceqube.com, Contest, Competition, Trading Challenge, Investments, Equity NSE stocks, Cash prize"/>
            <link rel="canonical" href="https://www.adviceqube.com/contest"/>
        </Helmet>
    );
}

export const ContestLeaderboardMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>Leaderboard | AdviceQube</title>
            <meta name="description" content="Leader for Investment Idea Contest"/>
            <meta name="keywords" content="www.adviceqube.com, Leaderboard, Contest, Competition, Trading Challenge, Investments, Equity NSE stocks, Cash prize"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}