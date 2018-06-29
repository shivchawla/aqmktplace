export const portfolioConfig = [{
    header: "Portfolio",
    detail: {
        definition: "Portfolio is a collection of stocks investments",
        importance: "Portfolio must match it's stated investment objective and chosen valuation and capitalization style",
        suggestedData: []
    },
    requirements: [
        "Contains at-least 5 stocks",
        "Exposure to an individual stock should be less than 20%",
        "Portfolio Value should be less than 1 Lac",
        "In case of diversified portfolio, exposure to single sector should be less than 35%",
        "Performance over the last year should be within 10% of benchmark performance (downside)"
    ]
}];