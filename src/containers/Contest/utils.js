   import _ from 'lodash';

   /**
     * Usage: Gets the advice item from response and processes the advice
     * @param: advice
     * @returns: {adviceName, advisorName, metrics: {}}
     */
    export const processAdviceForLeaderboardListItem = advice => {
        const adviceId = _.get(advice, 'advice._id', null);
        const adviceName = _.get(advice, 'advice.name', null);
        const advisorFirstName = _.get(advice, 'advice.advisor.user.firstName', null);
        const advisorLastName = _.get(advice, 'advice.advisor.user.lastName', null);
        const advisorName = `${advisorFirstName} ${advisorLastName}`;
        const currentAdviceMetrics = _.get(advice, 'latestRank.rating.current.detail', []);
        const simulatedAdviceMetrics = _.get(advice, 'latestRank.rating.simulated.detail', []);
        const rank = _.get(advice, 'latestRank.value', null);
        const simulatedRank = _.get(advice, 'latestRank.rating.simulated.rank', null);

        return {
            adviceName,
            advisorName,
            adviceId,
            metrics: {
                current: {
                    totalReturn: {label: 'Total Return', ...getAdviceMetric(currentAdviceMetrics, 'totalReturn')},
                    volatility: {label: 'Volatility', ...getAdviceMetric(currentAdviceMetrics, 'volatility')},
                    annualReturn: {label: 'Annual Return', ...getAdviceMetric(currentAdviceMetrics, 'annualReturn')},
                    maxLoss: {label: 'Max Loss', ...getAdviceMetric(currentAdviceMetrics, 'maxLoss')},
                    sharpe: {label: 'Sharpe', ...getAdviceMetric(currentAdviceMetrics, 'sharpe')},
                    score: Number((_.get(advice, 'latestRank.rating.current.value') || 0).toFixed(2)),
                    alpha: {label: 'Alpha', ...getAdviceMetric(currentAdviceMetrics, 'alpha')},
                },
                simulated: {
                    totalReturn: {label: 'Total Return', ...getAdviceMetric(simulatedAdviceMetrics, 'totalReturn')},
                    volatility: {label: 'Volatility', ...getAdviceMetric(simulatedAdviceMetrics, 'volatility')},
                    annualReturn: {label: 'Annual Return', ...getAdviceMetric(simulatedAdviceMetrics, 'annualReturn')},
                    maxLoss: {label: 'Max Loss', ...getAdviceMetric(simulatedAdviceMetrics, 'maxLoss')},
                    sharpe: {label: 'Sharpe', ...getAdviceMetric(simulatedAdviceMetrics, 'sharpe')},
                    score: Number((_.get(advice, 'latestRank.rating.simulated.value') || 0).toFixed(2)),
                    alpha: {label: 'Alpha', ...getAdviceMetric(simulatedAdviceMetrics, 'alpha')}
                }
            },
            rank,
            simulatedRank
        };
    }

    /**
     * Usage: Gets the advice metric based on the key provided
     * @param: metrics - advice metrics obtained from the N/W response of each individual advice
     * @param: metricKey - name of the metric that we want the value of eg: volatility, totalReturn or annualReturn
     */
    export const getAdviceMetric = (metrics, metricKey) => {
        return metrics.filter(metric => metric.field === metricKey) !== undefined 
                ? metrics.filter(metric => metric.field === metricKey)[0]
                : null;
    }