function run(model, inputs) {
    const { outputs, schema } = model;

    const expressions = {}

    Object.keys(outputs).forEach((outputCell) => {
        expressions[outputCell] = buildExpression(outputCell);
    });

    const results = {}

    Object.keys((outputs)).forEach((outputCell) => {
        results[outputs[outputCell]] = expressions[outputCell];
    });

    function buildExpression(cell) {
        if (expressions[cell]) return expressions[cell];

        const modelData = schema[cell];

        // If it's a number, return it

        if (!isNaN(modelData)) {
            expressions[cell] = modelData;
            return modelData;
        }

        // Otherwise it has to be an object

        if (typeof modelData !== 'object' || !Object.keys(modelData).length) {
            throw new Error(`Invalid model data for cell ${cell}`);
        }

        // If it's an input, return its value

        if (modelData.input) {
            const formattedInput = typeof inputs[modelData.input] === 'string' ?
                `"${inputs[modelData.input]}"` :
                inputs[modelData.input];

            expressions[cell] = formattedInput;

            return formattedInput;
        }

        // Otherwise it has to be a formula and we have to evaluate it

        const { expression } = modelData;

        if (expressions[expression]) {
            expressions[cell] = expressions[expression];
            return expressions[expression];
        }

        // Replace all cell references with their values

        const expressionWithValues = expression.replace(/[A-Z]+[0-9]+/g, (cell) => {
            return buildExpression(cell);
        });

        const evaluatedExpression = parseFloat(evaluateExpression(expressionWithValues));

        expressions[expression] = evaluatedExpression;
        expressions[cell] = evaluatedExpression;

        return evaluatedExpression;
    }

    function evaluateExpression(expression) {
        if (!isNaN(expression)) return expression;

        // Handle special functions, not supported by
        // the excel-formula library

        // Replace all occurences of "LEN(value)" with
        // "String(value).length"

        const expressionWithLength = expression.replace(/LEN\((.+?)\)/g, (match, value) => {
            return String(value).length;
        })

        // Return evaluated expression

        return eval(expressionWithLength)
    }

    return results;
}

module.exports = run