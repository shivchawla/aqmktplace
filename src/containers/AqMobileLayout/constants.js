import Grade from 'rmdi/lib/Grade';
import Explore from 'rmdi/lib/Explore';
import HelpOutline from 'rmdi/lib/HelpOutline';

export const sidebarUrls = [
    {name: 'Contest', url: '/contest', Icon: Explore},
    {name: 'Create Contest Entry', url: '/contest/createentry', Icon: Grade},
    {name: 'Contest Leaderboard', url: '/contest/leaderboard', Icon: HelpOutline},
];

export const tradingContestSidebarUrls = [
    {name: 'Contest Home', url: '/dailycontest/home', Icon: Explore},
    {name: 'Top Picks', url: '/dailycontest/create', Icon: Grade},
];