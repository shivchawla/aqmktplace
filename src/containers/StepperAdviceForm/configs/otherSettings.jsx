import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';

export const otherSettingsConfig = [
    {
        header: "Rebalancing Frequency",
        detail: {
            definition: "This is the frequency at which you will/should update your advice",
            importance: "Rebalancing frequency lets the user know when he/she can expect the portfolio of the advice to be updated",
            suggestedData: [
                "Weekly", "Monthly"
            ]
        }
    },
    {
        header: "Start Date",
        detail: {
            definition: "This indicates the start date of the advice",
            importance: "Choosing a Start Date is mandatory. Default is today.",
            suggestedData: [
                moment().format(dateFormat)
            ]
        }
    },
    {
        header: "Benchmark",
        detail: {
            definition: "The benchmark against which the portfolio performance of the advice is measured",
            importance: "A valid bencmark is mandatory for all advices. It helps in caculating the quality (performance) of the advice in relation to a passive portfolio (benchmark)",
            suggestedData: [
                "NIFTY_50", "NIFTY_IT", "NIFTY_200"
            ]
        }
    }
];