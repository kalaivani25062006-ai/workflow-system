/**
 * Safely evaluates a rule condition against input data.
 * Supported operators: > < == != >= <= && ||
 * Supported functions: contains(), startsWith()
 */
const evaluateCondition = (condition, data) => {
    if (condition.toLowerCase() === 'default') return true;

    try {
        // Create context for functions
        const context = {
            ...data,
            contains: (str, substr) => String(str).includes(substr),
            startsWith: (str, prefix) => String(str).startsWith(prefix)
        };

        const keys = Object.keys(context);
        const values = Object.values(context);
        
        // Replace functions in condition string for eval compatibility if needed
        // For now, we assume users use them like: "contains(name, 'John')"
        // which works if 'contains' is in scope.
        
        const func = new Function(...keys, `return ${condition}`);
        return !!func(...values);
    } catch (error) {
        console.error(`Error evaluating condition "${condition}":`, error);
        return false;
    }
};

module.exports = { evaluateCondition };
