export const formatMetric = (metric, type) => {
    
    if (metric == null) {
        return "-";
    } else if (Number.isNaN(metric)) {
        return "-";
    } else if (metric && type == "pct") {
        return `${(metric*100).toFixed(2)}%`;
    } else {
        return metric.toFixed(2);
    }
}