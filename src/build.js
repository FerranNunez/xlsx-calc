const XLSX = require('xlsx');
const { getTokens, toJavaScript } = require('excel-formula');

function build(path, config) {
    const { inputs, outputs } = config;

    // Load the Excel file

    const workbook = XLSX.readFile(path);

    // Get the first sheet of the workbook (assuming only one sheet)

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // Build the model working backwards from the output cells

    const model = {
        outputs: outputs,
        inputs: inputs,
        schema: {}
    };

    Object.keys(outputs).forEach(buildModel);

    function buildModel(cellAddress) {
        cellAddress = sanitizeCell(cellAddress);

        // Comprovar si ja l'hem processat

        if (model.schema[cellAddress]) return;

        // Comprovar si és una cel·la d'entrada

        if (inputs[cellAddress]) {
            model.schema[cellAddress] = {
                input: inputs[cellAddress],
            };

            return;
        }

        // Processar cel·la

        const cell = sheet[cellAddress];

        if (!cell.f) {
            if (!cell.v) {
                throw new Error(`Cell ${cellAddress} has no value or formula`);
            }

            // És un valor numèric

            model.schema[cellAddress] = cell.v
            return;
        }

        // Parsegem la fòrmula i processem els subcomponents

        const sanitizedFormula = sanitizeFormula(cell.f);
        const tokens = getTokens(sanitizedFormula);
        const jsFormula = toJavaScript(sanitizedFormula);

        model.schema[cellAddress] = {
            formula: sanitizedFormula,
            expression: jsFormula,
        }

        const ranges = tokens.filter((token) => token.type === 'operand' && token.subtype === 'range')

        ranges.forEach((range) => {
            const cells = parseCellRange(range.value);

            cells.forEach((cell) => {
                buildModel(cell);
            })
        })
    }

    return model;
}

function sanitizeFormula(f) {
    // Replace ',,' with ',0,'

    f = f.replace(/,,/g, ',0,');

    // Replace final ,) with ,0)

    f = f.replace(/,\)/g, ',0)');

    // Remove first '+'

    f = f.replace(/^\+/, '');

    // Remove all occurences of '$'

    f = f.replace(/\$/g, '');

    return f;
}

function sanitizeCell(c) {
    // Remove all occurences of '$'

    c = c.replace(/\$/g, '');

    return c;
}

function parseCellRange(range) {
    if (!range.includes(':')) return [range];

    const [startCell, endCell] = range.split(':');
    const start = XLSX.utils.decode_cell(startCell);
    const end = XLSX.utils.decode_cell(endCell);

    const cells = [];

    for (let row = start.r; row <= end.r; row++) {
        for (let col = start.c; col <= end.c; col++) {
            const cell = XLSX.utils.encode_cell({ r: row, c: col });
            cells.push(cell);
        }
    }

    return cells;
}

module.exports = build;