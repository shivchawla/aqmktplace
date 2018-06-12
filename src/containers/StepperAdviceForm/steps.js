import _ from 'lodash';

export const steps = [
    {key: 'adviceName', title: 'Advice Name', description: ''},
    {key: 'investmentObjective', title: 'Investment Objective', description: ''},
    {key: 'portfolio', title: 'Portfolio', description: ''},
    {key: 'otherSettings', title: 'Other Settings', description: ''}
];

export const getStepIndex = key => {
    return _.findIndex(steps, step => step.key === key);
}