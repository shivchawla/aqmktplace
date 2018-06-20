import _ from 'lodash';

export const steps = [
    {key: 'adviceName', title: 'Advice Name', description: '', valid: true},
    {key: 'investmentObjective', title: 'Investment Objective', description: '', valid: true},
    {key: 'portfolio', title: 'Portfolio', description: '', valid: true},
    {key: 'otherSettings', title: 'Other Settings', description: '', valid: true}
];

export const getStepIndex = key => {
    return _.findIndex(steps, step => step.key === key);
}