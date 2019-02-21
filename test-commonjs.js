const compareColourContrastRatio = require('./index');

const result = compareColourContrastRatio('#ffffff', '#2660a1');
const expected = 6.421617658233243;
console.log(`CommonJS (Node.js) : compareColourContrastRatio('#ffffff', '#2660a1')
Result   : ${result}
Expected : ${expected}
Test     : ${result === expected ? 'OK' : 'NG'}`);
