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
            <title>AdviceQube: Advisor Dashboard | Track your Advices </title>
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
            <title>AdviceQube: Investor Dashboard | Track your Portfolio </title>
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
            <title>AdviceQube: Expert-Sourced Investment Portfolio | Best Investment Ideas</title>
            <meta name="description" content="Expert Sourced Investment Portfolio. Screen the best investment ideas from professional and investment enthusiasts"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, Stock market, Share Market, NSE stocks, Buy Advice, Sell Advice, returns, gain, Investment Advice, India"/>
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
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com"/>
        </Helmet>
    );
}

export const SignupMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <link rel="canonical" href="https://www.adviceqube.com"/>
        </Helmet>
    );
}

export const StockResearchMeta = props => {
    return (
        <Helmet>
            <meta charSet="utf-8" />
            <title>AdviceQube: Stock Research | Screen stocks from Indian Equity Markets</title>
            <meta name="description" content="Search and compare stocks from Indian Equity Markets. Visualize historical stock performance over various horizons"/>
            <meta name="keywords" content="www.adviceqube.com, Investments, Equity, Stock market, Share Market, NSE stocks, Stock Research, returns"/>
            <meta name="robots" content="index, follow" />
        </Helmet>
    );
}
