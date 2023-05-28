#! /usr/bin/env node

const fs = require('fs-extra');
const build = require('../src/build');
const config = require(process.cwd() + '/xlsx-calc.config.js');

const SRC_DIR = `${process.cwd()}/src`;
const FILES_DIR = `${process.cwd()}/xlsx`;
const XLSX_FILE = `${FILES_DIR}/excel.xlsx`;
const OUTPUT_FILE = `${SRC_DIR}/model/model.js`;

const model = build(XLSX_FILE, config);

// Write sync to file

const outputContents = `const model = ${JSON.stringify(model, null, 4)};

export default model;
`

fs.outputFileSync(OUTPUT_FILE, outputContents, 'utf8');





