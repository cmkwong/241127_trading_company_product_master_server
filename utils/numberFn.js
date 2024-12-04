// generate the number in comma (money format)
export function numberWithCommas(x, decimal = 1) {
  // if string change it into float
  if (typeof x == 'string') {
    x = parseFloat(x.replaceAll(',', ''));
  }
  return x?.toFixed(decimal).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
}

// generate integer number
export function getRandomInteger(digit) {
  return Math.floor(Math.random() * 0.9 * 10 ** digit) + 0.1 * 10 ** digit;
}

// exports.numberWithCommas = numberWithCommas;
// exports.getRandomInteger = getRandomInteger;
