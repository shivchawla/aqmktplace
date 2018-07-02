import _ from 'lodash';

export const getOthersWarning = (approvalData, field) => {
    const {detail = []} = approvalData;
    const fieldItem = detail.filter(item => item.field === field)[0] || {field, reason: 'N/A', valid: false};
    return fieldItem;
}

export const getInvestmentObjectiveWarning = (approvalData, field) => {
    const item = _.get(approvalData, field, {valid: true, reason: 'N/A'});
    return item;
}

export const checkForInvestmentObjectiveError = approvalData => {
    const objectivesToCheck = ['capitalization', 'goal', 'portfolioValuation', 'sectors', 'userText'];
    let invalidCount = 0;
    objectivesToCheck.map(objective => {
        const objectiveItem = _.get(approvalData, objective, {valid: true, reason: 'N/A'});
        if (!objectiveItem.valid) {
            invalidCount++;
        }
    });
    
    return invalidCount === 0;
}

export const getPortfolioWarnings = approvalData => {
    const {detail = []} = approvalData;
    const lookupFields = ['sectorExposure', 'industryExposure', 'stockExposure'];
    let invalidCount = 0;
    const reasons = [];
    detail.map(item => {
        const lookUpItemIndex = lookupFields.indexOf(item.field);
        if (lookUpItemIndex !== -1 && !item.valid) {
            invalidCount++;
            reasons.push(item.reason);
        }
    });

    return {valid: invalidCount === 0, reasons};
}
