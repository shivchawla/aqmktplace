export * from './styles';
// export const graphColors = ["#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"];
export const graphColors = ["#1DE9B6", "#607D8B", "#00B0FF", "#009688", "#FFEA00", "#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"];
export const adviceLimit = 10;
export const portfolioLimit = 1000000;
export const sectors = [
    "Metals",
    "Technology",
    "Financial",
    "Engineering",
    "Textiles",
    "Healthcare",
    "Energy",
    "Services",
    "FMCG",
    "Construction",
    "Communication",
    "Chemicals",
    "Consumer Durable",
    "Automobile",
    "Diversified"
];

export const goals = [
	{
		investorType: 'Mix of Value and Growth Investors',
		field: "To invest in a diversified portfolio with a blend of value and growth stocks",
		suitability: "Suitable for investors looking for diversification among value and growth investments in a single portfolio"
	},
	{	
		investorType: 'Growth Investors',
		field: "To achieve high rates of growth and capital appreciation",
		suitability: "Suitable for investors willing to achieve high rates of growth and capital appreciation along with high tolerance to risk. The portfolio can undergo sudden downward swings and significant loses"
	},
	{
		investorType: "Capital Appreciation Investors",
		field: "To achieve capital appreciation over a long term",
		suitability: "Suitable for long term investors who seek capital appreciation over an extended period of time"
	},
	{
		investorType: "Value Investors",
		field: "To invest in underpriced stocks with sound underlying business assets",
		suitability: "Suitable for long term investors who seek underpriced stocks (with sound underlying business assets) and growth potential over an extended period of time"	
	},
	{
		investorType: "Growth at Reasonable Price(GARP) Investors",
		field: "To seek high potential for growth with reasonable value characteristics",
		suitability: "Suitable for investors who seek high growth rates (with reasonable value characteristics) but lower than typical growth stocks. The portfolio can still undego large downward swings"	
	},
	{
		investorType: "Capital Preservation and Income Investors",
		field: "To invest in high dividend yield stocks and portfolio with high dividend yield",
		suitability: "Suitable for investors looking for dividend yielding portfolios"	
	},
	{
		investorType: "Sector Investors",
		field: "To invest in stocks with exposure to single sector",
		suitability: "Suitable for investors looking to achieve exposure to a particular sector. Sectors trackers are not diversified portfolios and can undergo sudden losses"	
	}
];
export const portfolioValuation = [
    "Growth",
    "Value",
    "Blend"
];

export const capitalization = [
    "Small Cap",
    "Mid Cap",
    "Large Cap"
];

export const adviceApprovalPending = 'Approval is pending for this advice';
export const adviceRejected = 'Advice is rejected. Please fix the advice for suggestions and resubmit for approval';
export const adviceApproved = 'Advice is approved and open for sale in the marketplace';
export const advicePublic = 'Public Advice: Advice is visbile and open for sale in the marketplace* (*subject to approval)';
export const advicePrivate = 'Private Advice: Advice is private and not open for sale';
export const adviceWishlisted = 'You have wishlisted this advice';
export const adviceSubscribed = 'You have subscribed this advice';
export const defaultPortfolioTooltip = 'This your Default Portfolio';