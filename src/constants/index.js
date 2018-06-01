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
		suitability: "Suitable for investors willing to tolerate high risk. The portfolio can undergo sudden downward swings and significant loses"
	},
	{
		investorType: "Capital Appreciation Investors",
		field: "To achieve capital appreciation over a long term",
		suitability: "Suitable for long term investors who seek growth over an extended period of time"
	},
	{
		investorType: "Value Investors",
		field: "To invest in underpriced stocks with sound underlying business assets",
		suitability: "Suitable for long term investors who seek underpriced stocks and growth potential over an extended period of time"	
	},
	{
		investorType: "Growth at Reasonable Price(GARP) Investors",
		field: "To seek high potential for growth with reasonable value characteristics",
		suitability: "Suitable for investors who seek high growth rates but lower than typical growth stocks. The portfolio can still undego large downward swings"	
	},
	{
		investorType: "Capital Preservation and Income Investors",
		field: "To invest in high dividend yield stocks and portfolio with high dividend yield",
		suitability: "Suitable for investors who seek high growth rates but lower than typical growth stocks. The portfolio can still undego large downward swings"	
	},
	{
		investorType: "Sector Exposure/Tracker",
		field: "To invest in stocks with exposure to single sector",
		suitability: "Suitable for investors looking to achieve exposure to a particular sector"	
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