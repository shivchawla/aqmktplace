import _ from 'lodash';
import moment from 'moment';
import axios from 'axios';
import {Utils, fetchAjax} from '../../../utils';
import gold from '../../../assets/gold.svg';
import silver from '../../../assets/silver.svg';
import bronze from '../../../assets/bronze.svg';
import fourth from '../../../assets/fourth.svg';
import fifth from '../../../assets/fifth.svg';

const {requestUrl} = require('../../../localConfig');
const dateFormat = 'YYYY-MM-DD';
const currentDate = moment().format(dateFormat);

export const constructTradingContestPositions = positions => {
    const clonedPositions = _.map(positions, _.cloneDeep);
    return Promise.map(clonedPositions, position => {
        return {
            security: {
                ticker: _.get(position, 'symbol', null),
                securityType: 'EQ',
                country: 'IN',
                exchange: 'NSE'
            },
            investment: _.get(position, 'points', 10)
        }
    });
}

export const submitEntry = async (positions, isUpdate = false) => {
    const processedPositions = await constructTradingContestPositions(positions);
    const data = {positions: processedPositions};
    const createEntryUrl = `${requestUrl}/dailycontest/entry`;

    return axios({
        url: createEntryUrl,
        method: isUpdate ? 'PUT' : 'POST',
        data,
        headers: Utils.getAuthTokenHeader()
    });
}

export const getContestEntry = (date = null, history, currentUrl, errorCallback = undefined) => {
    const requiredDate = date === null ? moment().format(dateFormat) : date;
    const url = `${requestUrl}/dailycontest/entry?date=${requiredDate}`;

    return fetchAjax(url, history, currentUrl, undefined, errorCallback)
}

export const convertBackendPositions = positions => {
    const clonedPositions = _.map(positions, _.cloneDeep);

    return Promise.map(clonedPositions, position => {
        return {
            name: _.get(position, 'security.detail.Nse_Name', ''),
            industry: _.get(position, 'security.detail.Industry', ''),
            sector: _.get(position, 'security.detail.Sector', ''),
            points: Math.abs(_.get(position, 'investment', 10)),
            lastPrice: _.get(position, 'lastPrice', ''),
            symbol: _.get(position, 'security.ticker', '')
        }
    });
}

export const processSelectedPosition = (oldPositions = [], selectedPositions = []) => {
    const clonedOldPositions = _.map(oldPositions, _.cloneDeep);
    const clonedSelectedPositions = _.map(selectedPositions, _.cloneDeep);

    return Promise.map(clonedSelectedPositions, selectedPosition => {
        // Check if position was previously present, if present use the points from the previous position
        const oldPositionIndex = _.findIndex(clonedOldPositions, oldPosition => oldPosition.symbol === selectedPosition.symbol);
        if (oldPositionIndex > -1) {
            return {
                ...selectedPosition,
                points: Math.abs(_.get(clonedOldPositions[oldPositionIndex], 'points', 10))
            }
        } else {
            return {
                ...selectedPosition,
                points: Math.abs(_.get(selectedPosition, 'points', 10))
            };
        }
    });
}

export const getContestSummary = (date = currentDate, history, currentUrl, errorCallback = undefined) => {
    const url = `${requestUrl}/dailycontest?date=${date}`;

    return fetchAjax(url, history, currentUrl, undefined, errorCallback);
}

export const processParticipants = winnerParticipants => {
    return Promise.map(winnerParticipants, participant => {
        return {
            userName: `${_.get(participant, 'advisor.user.firstName', 'Saurav')} ${_.get(participant, 'advisor.user.lastName', 'Biswas')}`,
            totalPnl: _.get(participant, 'pnlStats.totalPnl', 0),
            cost: _.get(participant, 'pnlStats.cost', 0),
            rank: _.get(participant, 'rank', 5)
        }
    })
}

export const processWinnerStocks = winnerStocks => {
    return Promise.map(winnerStocks, (stock, index) => {
        return {
            symbol: _.get(stock, 'security.ticker', ''),
            numUsers: _.get(stock, 'numUsers', 0),
            name: _.get(stock, 'security.detail.NSE_name', ''),
            rank: index + 1
        }
    })
}

export const getRankMedal = rank => {
    const rankMedals = [
        {rank: 1, medal: gold},
        {rank: 2, medal: silver},
        {rank: 3, medal: bronze},
        {rank: 4, medal: fourth},
        {rank: 5, medal: fifth},
    ];
    const medalItem = rankMedals.filter(item => item.rank === rank)[0];
    const medal = medalItem !== undefined ? medalItem.medal : null;
    
    return medal;
}

export const setEndTimeToDate = (date, hourToAdd = 15) => {
    const dateFormat = 'YYYY-MM-DD';
    let endDate = moment(date, dateFormat);
    endDate.hours(hourToAdd);
    endDate.minutes(30);
    endDate.seconds(0);

    return endDate;
}