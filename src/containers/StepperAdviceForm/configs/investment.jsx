export const investmentObjectiveConfig = [
    {
        header: "Goal",
        detail: {
            definition: "Investment Objective states the purpose of the undelying portfolio",
            importance: "Choosing a valid goal of your advice is mandatory for every advice",
            /*suggestedData: [
                "January Advice", "February Advice", "March Advice"
            ]*/
        }
    },
    {
        header: "Portfolio Valuation",
        detail: {
            definition: "Portfolio valuation states the value style of underlying portfolio",
            importance: "Choosing a valid valuation of your advice is mandatory for every advice",
            suggestedData: [
                "Value", "Growth", "Blend"
            ]
        }
    },
    {
        header: "Capitalization",
        detail: {
            definition: "Portfolio capitalization states the size style of underlying portfolio. If you choose only large cap stock in your portfolio, the capitalization of your portfolio is Large Cap",
            importance: "Choosing a valid capitalization of your advice is mandatory for every advice",
            suggestedData: [
                "Large Cap", "Small Cap", "Mid Cap"
            ]
        }
    },
    {
        header: "Sectors",
        detail: {
            definition: "Underlying Sectors in your portfolio",
            importance: "Please provide a list of all applicable sectors for your advice",
            suggestedData: [
                "Technology", "Financial", "FMCG"
            ]
        }
    },
    {
        header: "Description",
        detail: {
            definition: "Portfolio description is an optional user summary of the portfolio. It is not required!",
            importance: "This is optional",
            suggestedData: []
        }
    }
]