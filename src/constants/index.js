export * from './styles';
// export const graphColors = ["#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"];
export const graphColors = ['#e6194b', '#3cb44b', '#0082c8', '#f58231', '#911eb4', '#f032e6', '#008080', '#aa6e28', '#800000', '#808000', '#000080', "#1DE9B6", "#607D8B", "#00B0FF", "#009688", "#FFEA00", "#76DDFB", "#53A8E2", "#2C82BE", "#DBECF8", "#2C9BBE"];
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
		suitability: "Suitable for investors looking for diversification among value and growth investments in a single portfolio",
		suggestedName: ['Diversified Opportunities', "Diversified Portfolio"],
	},
	{	
		investorType: 'Growth Investors',
		field: "To achieve high rates of growth and capital appreciation",
		suitability: "Suitable for investors willing to achieve high rates of growth and capital appreciation along with high tolerance to risk. The portfolio can undergo sudden downward swings and significant loses",
		suggestedName: ['Growth Opportunities', "Growth Portfolio"],
	},
	{
		investorType: "Capital Appreciation Investors",
		field: "To achieve capital appreciation over a long term",
		suitability: "Suitable for long term investors who seek capital appreciation over an extended period of time",
		suggestedName: ['Capital Appreciation Opportunities', "Capital Apreciation Portfolio"],
	},
	{
		investorType: "Value Investors",
		field: "To invest in underpriced stocks with sound underlying business assets",
		suitability: "Suitable for long term investors who seek underpriced stocks (with sound underlying business assets) and growth potential over an extended period of time",
		suggestedName: ['Value Opportunities', "Value Portfolio"],	
	},
	{
		investorType: "Growth at Reasonable Price(GARP) Investors",
		field: "To seek high potential for growth with reasonable value characteristics",
		suitability: "Suitable for investors who seek high growth rates (with reasonable value characteristics) but lower than typical growth stocks. The portfolio can still undego large downward swings",
		suggestedName: ['GARP Opportunities', "GARP Portfolio"],
	},
	{
		investorType: "Capital Preservation and Income Investors",
		field: "To invest in high dividend yield stocks and portfolio with high dividend yield",
		suitability: "Suitable for investors looking for dividend yielding portfolios",
		suggestedName: ['Income Opportunities', "Income Portfolio"],
	},
	{
		investorType: "Sector Investors",
		field: "To invest in stocks with exposure to single sector",
		suitability: "Suitable for investors looking to achieve exposure to a particular sector. Sectors trackers are not diversified portfolios and can undergo sudden losses",
		suggestedName: ['Sector Tracker', "Sector Opportunities"],	
	},
	{
		investorType: "Contest Investors",
		field: "To invest in stocks with exposure to single sector",
		suitability: "Suitable for investors looking to achieve exposure to a particular sector. Sectors trackers are not diversified portfolios and can undergo sudden losses",
		suggestedName: ['Sector Tracker', "Sector Opportunities"],	
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

export const aboutUsText = {
	introduction: {
		header: "About Us",
		tagline: "Expert-sourced Investment Portfolio",
		main: "AdviceQube believes in the power of crowd intelligence and aims to bring forward the \
		best investment ideas driven purely by investment community. We want to create an ecosystem where \
		financial experts, expert investment advisors and investments enthusiasts come together \
		to create the best investment ideas.",
    },

    whatWeBuild: {
		header: "What are we building",
    	tagline: "Platform that beats the market",
    	main: "No single investment expert can beat the market all the times. With AdviceQube, we\
 			plan to bring in the human diversification quotient while creating \
	 		investment portfolios. We believe that a meritocratic investment process and a \
	 		collaboration of top investment ideas can consistenly beat the market. At Adviceqube, \
	 		anyone can build an investment idea, participate in our investment contest and contribute \
		 	to the best investment portfolios."
    },

    whoWeAre: {
		header: "Who We Are",
    	tagline: "Team",
    	main: "We are bunch of Quants and Technologists who enjoy financial markets \
		 	and making efficient technology. We aim to democratize investment arena where \
		 	everyone's investment idea is important"
    },

    careers: {
		header: "Careers",
    	tagline: "Make it happen",
    	main: "We are always looking for highly motivated individuals interested in \
    		technology and financial markets. If you like to solve problems and build \
    		efficient technology, we would love to be in touch."
    },

    connect :{
		header: "Connect With Us",
    	tagline: "Like what we are building?",
    	main: "We always welcome insightful thoughts, great mentors and helpful \
    		suggestions. If you are an industry expert or an investor, we are eager to learn your opinion."
    }
}

export const adviceApprovalPending = 'Approval is pending for this advice';
export const contestOnly = 'Advice active in Contest';
export const adviceRejected = 'Advice is rejected. Please fix the advice for suggestions and resubmit for approval';
export const adviceApproved = 'Advice is approved and open for sale in the marketplace';
export const advicePublic = 'Public Advice: Advice is visbile and open for sale in the marketplace* (*subject to approval)';
export const advicePrivate = 'Private Advice: Advice is private and not open for sale';
export const adviceWishlisted = 'You have wishlisted this advice';
export const adviceSubscribed = 'You have subscribed this advice';
export const defaultPortfolioTooltip = 'This your Default Portfolio';