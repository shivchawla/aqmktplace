import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';

export const otherSettingsConfig = [
    {
        header: "Rebalancing Frequency",
        detail: {
            definition: "This will be the frequency in which you will update your advice",
            importance: "Giving a rebalancing frequency lets the user know when he/she can expect the portfolio of the advice to be updated",
            suggestedData: [
                "Weekly", "Monthly"
            ]
        }
    },
    {
        header: "Start Date",
        detail: {
            definition: "This indicates the start date of the advice",
            importance: "A valid start date is very important",
            suggestedData: [
                moment().format(dateFormat)
            ]
        }
    },
    {
        header: "Benchmark",
        detail: {
            definition: "The benchmark against which the portfolio performance of the advice is calculated",
            importance: "Setting a valid benchmark is very important to calculate the performance of the advice portfolio",
            suggestedData: [
                "NIFTY_50", "NIFTY_IT"
            ]
        }
    }
];