import moment from 'moment';
const dateFormat = 'YYYY-MM-DD';

export const otherSettingsConfig = [
    {
        header: "Advice Name",
        detail: {
            //definition: "This will be the Name of your advice",
            importance: "A name is the first the thing that's visible in advice detail. A clear and descriptive name helps in understanding the underlying portfolio and investment objective",
            suggestedData: [
                "Technology Sector Tracker", "Large Cap Value Opportunities", "Mid Cap Growth Opportunities", "Industrial Sector Opportunities - Growth"
            ]
        }
    },
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