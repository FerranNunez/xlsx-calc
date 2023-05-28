# xlsx-calc
Builds, serializes and runs calculation models from an xlsx file.

## Installation
```
npm install --save @ferrannunez/xlsx-calc
```

## Usage
* xlsx file path must be xlsx/excel.xlsx
* xlsx-calc.config.js must be in the root folder, with the following structure:

```javascript
module.exports = {
    inputs: {
        'A1': 'inputLabel',
        ...
    },
    outputs: {
        'B1': 'outputLabel',
        ...
    },   
}
```

* Run the following command:

```
npx --package @ferrannunez/xlsx-calc generate
```

