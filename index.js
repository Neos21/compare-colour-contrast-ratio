/*! Compare Colour Contrast Ratio */
((global, factory) => {
  if(typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS (Node.js)
    module.exports = factory();
  }
  else if(typeof define === 'function' && define.amd) {
    // AMD
    define([], factory);
  }
  else {
    // Browser Globals
    global.compareColourContrastRatio = factory();
  }
})(this, () => {
  /**
   * Compare Colour Contrast Ratio : 2つの色の彩度を比較する
   * 
   * @param {string} colourA 色文字列
   * @param {string} colourB 色文字列
   * @return {number} 彩度比
   */
  function compareColourContrastRatio(colourA, colourB) {
    // RGB の配列に変換する
    const rgbColourA = convertToRGB(colourA);
    const rgbColourB = convertToRGB(colourB);
    // 彩度を導く
    const luminanceA = detectLuminance(rgbColourA);
    const luminanceB = detectLuminance(rgbColourB);
    // 2つの彩度の比を導く
    const maxLuminance = Math.max(luminanceA, luminanceB);
    const minLuminance = Math.min(luminanceA, luminanceB);
    return (maxLuminance + .05) / (minLuminance + .05);
  }
  
  return compareColourContrastRatio;
  
  // ================================================================================
  
  /**
   * 引数を RGB の配列 [255, 255, 255] の形式に変換して保持する
   * 
   * @param {string} colour 色文字列
   *                        'hsl(120, 100%, 100%)'・'hsla(120, 100%, 100%, 1)'
   *                        'rgb(255, 255, 255)'・'rgba(255, 255, 255, 1)'
   *                        '#fff'・'#ffffff' の形式に対応
   * @throws 引数が string 型でない場合もしくは変換できなかった場合
   */
  function convertToRGB(colour) {
    if(typeof colour !== 'string') {
      throw new TypeError('The argument should be string.');
    }
    
    // 'hsl()' もしくは 'hsla()'
    if(colour.startsWith('hsl')) {
      return convertHSLToRGB(colour);
    }
    // 'rgb()' もしくは 'rgba()'
    if(colour.match('rgb')) {
      return convertToPercentage(colour.match(/[0-9.%]+/g), [255, 255, 255]);
    }
    // '#fff' もしくは '#ffffff'
    if(colour.startsWith('#')) {
      return convertColourCodeToRGB(colour);
    }
    
    throw new TypeError(`The argument "${colour}" is incorrect format.`);
  }
  
  /**
   * hsl()・hsla() から始まる値を RGB の配列に変換する
   * 
   * @param {string} colour 色文字列
   * @return {number[]} RGB の配列
   */
  function convertHSLToRGB(colour) {
    // Alpha 値はあっても見ない
    const hsl = convertToPercentage(colour.match(/[0-9.%]+/g), [360, 1, 1]);
    
    let max;
    let min;
    if(hsl[2] < .5) {
      max = 255 * (hsl[2] + hsl[1] * hsl[2]);
      min = 255 * (hsl[2] - hsl[1] * hsl[2]);
    }
    else {
      max = 255 * (hsl[2] + hsl[1] * (1 - hsl[2]));
      min = 255 * (hsl[2] - hsl[1] * (1 - hsl[2]));
    }
    
    if(hsl[0] < 60) {
      return [max, hsl[0] / 60 * (max - min) + min, min];
    }
    else if(hsl[0] < 120) {
      return [(120 - hsl[0]) / 60 * (max - min) + min, max, min];
    }
    else if(hsl[0] < 180) {
      return [min, max, (hsl[0] - 120) / 60 * (max - min) + min];
    }
    else if(hsl[0] < 240) {
      return [min, (240 - hsl[0]) / 60 * (max - min) + min, max];
    }
    else if(hsl[0] < 300) {
      return [(hsl[0] - 240) / 60 * (max - min) + min, min, max];
    }
    return [max, min, (360 - hsl[0]) / 60 * (max - min) + min];
  }
  
  /**
   * パーセンテージに変換する
   * 
   * @param {string[]} numbers 変換対象の数値の配列
   * @param {number[]} limits numbers に対応する上限値の配列
   * @return {number[]} 変換した数値の配列
   * @throws パーセンテージに変換できなかった場合
   */
  function convertToPercentage(numbers, limits) {
    // RGB・HSL の3回繰り返す (limits の方が要素数が固定されるのでコチラを利用する)
    return limits.map((limit, index) => {
      const number = numbers[index];
      const matches = (number || '100%').match(/([0-9.]+)(%)?/);
      if(!matches) {
        throw new TypeError(`The number in argument "${number}" is incorrect format.`);
      }
      if(matches[2]) {
        return limit * matches[1] / 100;
      }
      return Number(matches[1]);
    });
  }
  
  /**
   * カラーコードを RGB の配列に変換する
   * 
   * @param {string} colour 色文字列
   * @return {number[]} RGB の配列
   */
  function convertColourCodeToRGB(colour) {
    const rgb = [];
    if(colour.length < 6) {
      // '#fff'
      const matches = colour.match(/[0-9A-F]/gi);
      for(let i = 0; i < 3; i++) {
        rgb.push(Number(`0x${matches[i] || 'F'}${matches[i] || 'F'}`));
      }
    }
    else {
      // '#ffffff'
      const matches = colour.match(/[0-9A-F]{2}/gi);
      for(let i = 0; i < 3; i++) {
        rgb.push(Number(`0x${matches[i] || 'FF'}`));
      }
    }
    return rgb;
  }
  
  /**
   * RGB 値から彩度を導く
   * 
   * @param {number[]} rgb RGB の配列
   * @return {number} 彩度
   */
  function detectLuminance(rgb) {
    const luminanceCoefficient = [.2126, .7152, .0722];
    return rgb
      .map((colour) => {
        return colour / 255;
      })
      .reduce((accumulator, colour, index) => {
        return accumulator + luminanceCoefficient[index] * (colour <= .03928 ? colour / 12.92 : Math.pow(((colour + .055) / 1.055), 2.4));
      }, 0);
  }
});
