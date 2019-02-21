require(['index'], (compareColourContrastRatio) => {
  const exec = `AMD : compareColourContrastRatio('#ffffff', '#2660a1')`;
  const result = compareColourContrastRatio('#ffffff', '#2660a1');
  const expected = 6.421617658233243;
  document.getElementById('exec').innerHTML = exec;
  document.getElementById('result').innerHTML = result;
  document.getElementById('expected').innerHTML = expected;
  document.getElementById('test').innerHTML = result === expected ? 'OK' : 'NG';
});
