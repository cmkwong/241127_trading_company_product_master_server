// left join table
export const leftJoinArray = (leftArr, rightArr, leftKey, rightKey) => {
  let rightCols = Object.keys(rightArr[0]).filter((key) => key !== rightKey);
  let rightDefaultObj = {};
  for (let col of rightCols) {
    rightDefaultObj[col] = '';
  }
  for (let i in leftArr) {
    let leftValue = leftArr[i][leftKey];
    let matchedObj = rightArr.filter((row) => {
      return row[rightKey] === leftValue;
    })[0];
    if (!matchedObj) {
      leftArr[i] = {
        ...leftArr[i],
        ...rightDefaultObj,
      };
    } else {
      delete matchedObj[rightKey];
      leftArr[i] = {
        ...leftArr[i],
        ...matchedObj,
      };
    }
  }
  return leftArr;
};

// exports.leftJoinArray = leftJoinArray;
