import _ from 'lodash';

export const handleSectorTargetTotalChange = (newNav, oldNav, sector, stocks) => {
    let positions = [...stocks];
    let count = 0;
    let stockData = [...stocks];
    let cNav = newNav - oldNav;
    while(Math.abs(cNav) > 5) {
        if (count > 100) {
            return;
        }
        const positionsToChange = positions.filter(item => item.sector === sector).filter(position => {
            if (cNav > 0) { return  position.effTotal < 50000}
            else { return position.effTotal >= 0 }
        });
        const nStocks = positionsToChange.length;
        const sNav = cNav / nStocks;
        stockData = updateSectorStockPositions(positions, positionsToChange, sNav);
        cNav = newNav - _.sum(stockData.filter(item => item.sector === sector).map(item => item.effTotal));
        count++;
    }

    return stockData;
}


export const updateSectorStockPositions = (positions, positionsToChange, sNav) => {
    let nPositions =  positions.map(position => {
        const shouldModifyPosition = _.findIndex(positionsToChange, item => item.symbol === position.symbol) > -1;
        const targetTotal = _.max([0, _.min([50000, (position.effTotal + sNav)])]);
        const lastPrice = _.get(position, 'lastPrice', 1);
        const nShares = Math.floor(targetTotal / lastPrice);
        const totalValue = Number((lastPrice * nShares).toFixed(2));
        if (shouldModifyPosition) {
            position.effTotal = Number(targetTotal.toFixed(2));
            position.shares = nShares;
            position.totalValue = totalValue;
        }

        return position;
    });
    return updateSectorStockWeights(nPositions);
}

export const updateSectorStockWeights = (data) =>  {
    const totalPortfolioValue = getSectorPortfolioTotalValue(data) === 0 ? 1 : getSectorPortfolioTotalValue(data);
    return data.map(item => {
        return {
            ...item,
            weight: Number(((item.totalValue / totalPortfolioValue * 100)).toFixed(2))
        }
    });
}


export const getSectorPortfolioTotalValue = data => {
    return _.sum(data.map(item => item.totalValue));
}


export const processSectorStockData = (data, defaultData, disableTargetTotalUpdate = false) => {
    const sectorData = disableTargetTotalUpdate ? [...defaultData] : [];
    const uniqueSectors = _.uniqBy(data, 'sector').map(item => item.sector);
    return uniqueSectors.map((sector, index) => {
        const numStocks = data.filter(item => item.sector === sector).length;
        const totalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.totalValue));            
        const targetTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => Number(item.effTotal)));
        const individualTotalValue = _.sum(data.filter(item => item.sector === sector).map(item => item.lastPrice))
        if (disableTargetTotalUpdate) {
            return {
                targetTotal: sectorData.filter(item => item.sector === sector)[0].targetTotal,
                sector,
                total: totalValue,
                weight: Number(((totalValue / getSectorPortfolioTotalValue(data)) * 100).toFixed(2)),
                key: sector,
                numStocks,
                individualTotalValue
            }
        } else {
            return {
                sector,
                targetTotal: Number(targetTotalValue.toFixed(2)),
                total: totalValue,
                weight: Number(((totalValue / getSectorPortfolioTotalValue(data)) * 100).toFixed(2)),
                key: sector,
                numStocks,
                individualTotalValue
            }
        }
    })
}

export const updateSectorWeights = data => new Promise((resolve, reject) => {
    let totalPortfolioValue = _.sum(data.map(item => item.total));
    totalPortfolioValue = totalPortfolioValue === 0 ? 1 : totalPortfolioValue;
    resolve (data.map(item => {
        return {
            ...item,
            weight: Number(((item.total / totalPortfolioValue) * 100).toFixed(2))
        }
    }));
})
