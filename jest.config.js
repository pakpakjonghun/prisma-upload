const { readFileSync } = require("fs");
const { parse } = require("jsonc-parser");

const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfigContent = readFileSync("./tsconfig.json", "utf8");
const tsconfig = parse(tsconfigContent);

module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    globals: {
        "ts-jest": {
            tsconfig: "tsconfig.json"
        }
    },
    moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths || {}, {
        prefix: "<rootDir>/"
    })
};
