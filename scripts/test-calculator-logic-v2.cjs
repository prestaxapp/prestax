const assert = require('node:assert/strict');
const test = require('node:test');
const fs = require('node:fs');
const ts = require('typescript');

require.extensions['.ts'] = (module, filename) => {
    const source = fs.readFileSync(filename, 'utf8');
    const { outputText } = ts.transpileModule(source, {
        compilerOptions: {
            module: ts.ModuleKind.CommonJS,
            target: ts.ScriptTarget.ES2020,
            esModuleInterop: true,
        },
        fileName: filename,
    });

    module._compile(outputText, filename);
};

const {
    CALCULATOR_CONFIG_V2,
    calculateLoanV2,
    formatCurrency,
} = require('../src/utils/calculatorLogicV2.ts');
const { sha256 } = require('../src/utils/sha256.ts');

test('calculator V2 exposes the current commercial boundaries', () => {
    assert.equal(CALCULATOR_CONFIG_V2.MIN_AMOUNT, 1_000_000);
    assert.equal(CALCULATOR_CONFIG_V2.MAX_AMOUNT, 5_000_000);
    assert.deepEqual(CALCULATOR_CONFIG_V2.ALLOWED_MONTHS, [3, 6, 12]);
});

test('calculator V2 returns stable values for the minimum 3-month loan', () => {
    const result = calculateLoanV2(1_000_000, 3);

    assert.equal(result.isValid, true);
    assert.equal(result.monthlyQuota, 404_800);
    assert.equal(result.totalToReturn, 1_214_400);
    assert.equal(result.totalLoanCost, 214_400);
    assert.equal(result.prestaxGain, 85_000);
    assert.equal(result.tin, '24.00%');
});

test('calculator V2 rejects unsupported amounts and terms', () => {
    assert.equal(calculateLoanV2(500_000, 3).isValid, false);
    assert.equal(calculateLoanV2(1_000_000, 9).isValid, false);
});

test('currency formatting stays aligned to Paraguay locale', () => {
    assert.equal(formatCurrency(1_000_000), '1.000.000');
});

test('sha256 helper matches the standard digest for known input', () => {
    assert.equal(
        sha256('abc'),
        'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
    );
});
