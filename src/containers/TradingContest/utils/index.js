import _ from 'lodash';

export const constructTradingContestPositions = positions => {
    const clonedPositions = _.map(positions, _.cloneDeep);

    return clonedPositions.map(position => {
        return {
            security: {
                ticker: _.get(position, 'symbol', null),
                securityType: 'EQ',
                country: 'IN',
                exchange: 'NSE'
            },
            investment: _.get(position, 'points', 10)
        }
    })
}