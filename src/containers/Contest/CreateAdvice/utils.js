import _ from 'lodash';

export const handleSectorTargetTotalChange = (sectorData, newNav, oldNav, sector, stocks) => {
    const newData = [...sectorData];
    let positions = [...stocks];
    let count = 0;
    let target = newData.filter(item => item.key === sector)[0];
    let stockData = [...stocks];
    let cNav = newNav - oldNav;
    while(Math.abs(cNav) > 5) {
        const positionsToChange = positions.filter(item => item.sector === sector).filter(position => {
            if (cNav > 0) { return  position.effTotal < 50000}
            else { return position.effTotal >= 0 }
        });
        if (count > 5) {return};
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
            position.effTotal = targetTotal;
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
