export const getCurrentTimeStr = (datetime = null) => {
  let today;
  if (!datetime) {
    // new Date() cannot get the correct timezone:
    // https://stackoverflow.com/questions/15141762/how-to-initialize-a-javascript-date-to-a-particular-time-zone
    let nz_date_string = new Date().toLocaleString('en-US', {
      timeZone: 'Asia/Hong_Kong',
    });
    today = new Date(nz_date_string);
  } else {
    today = new Date(datetime);
  }
  let year = today.getFullYear();
  let month = String(today.getMonth() + 1).padStart(2, '0');
  let day = String(today.getDate()).padStart(2, '0');
  let hr = String(today.getHours()).padStart(2, '0');
  let min = String(today.getMinutes()).padStart(2, '0');
  let second = String(today.getSeconds()).padStart(2, '0');
  return [`${year}-${month}-${day}`, `${hr}:${min}:${second}`];
};

export const modifyHour = (datetimeStr, hour) => {
  let date = new Date(datetimeStr);
  return date.setHours(date.getHours() + hour);
};

// month difference
export const getMonthDiff = (dateFrom, dateTo) => {
  let months;
  months = (dateTo.getFullYear() - dateFrom.getFullYear()) * 12;
  months -= dateFrom.getMonth();
  months += dateTo.getMonth();
  return months <= 0 ? 0 : months;
};

// get the monthly between period
export const getMonthList = (datefrom, dateto) => {
  // datefrom and dateto is datetime format (YYYY-M-D H:m:ss)
  if (dateto < datefrom) {
    return;
  }
  // console.log(new Date(datefrom), new Date(dateto));
  let monthPeriods = [];
  let startYear = datefrom.getFullYear();
  let startMonth = datefrom.getMonth();
  let startDay = datefrom.getDate();
  let startHour = datefrom.getHours();
  let startMin = datefrom.getMinutes();
  let startSec = datefrom.getSeconds();
  let endYear = dateto.getFullYear();
  let endMonth = dateto.getMonth();
  let endDay = dateto.getDate();
  let endHour = dateto.getHours();
  let endMin = dateto.getMinutes();
  let endSec = dateto.getSeconds();
  // loop for each UTC year
  for (let y = startYear; y <= endYear; y++) {
    let sm, em;
    // if several years range and y === endYear
    if (y === endYear && startYear !== endYear) {
      sm = 0; // year start month
      em = endMonth; // year end month
      // if several years range and y === startYear
    } else if (y === startYear && startYear !== endYear) {
      sm = startMonth; // year start month
      em = 11; // year end month
      // if just 1 year range
    } else if (startYear === endYear) {
      sm = startMonth; // year start month
      em = endMonth; // year end month
    } else {
      sm = 0; // year start month
      em = 11; // year end month
    }
    for (let m = sm; m <= em; m++) {
      // console.log(m);
      let sd = '01'; // month start date
      let sh = '00'; // month start hour
      let sM = '00'; // month start minute
      let ss = '00'; // month start second
      let ed = `${new Date(y, m + 1, 0).getDate()}`.padStart(2, '0'); // month end date
      let eh = '23'; // month end hour
      let eM = '59'; // month end minute
      let es = '59'; // month end second
      // re-assign the start day, hour, minute, second
      if (y === startYear && m === startMonth) {
        sd = `${startDay}`.padStart(2, '0');
        sh = `${startHour}`.padStart(2, '0');
        sM = `${startMin}`.padStart(2, '0');
        ss = `${startSec}`.padStart(2, '0');
      }
      // re-assign the start day, hour, minute, second
      if (y === endYear && m === endMonth) {
        ed = `${endDay}`.padStart(2, '0');
        eh = `${endHour}`.padStart(2, '0');
        eM = `${endMin}`.padStart(2, '0');
        es = `${endSec}`.padStart(2, '0');
      }
      let mm = `${m + 1}`.padStart(2, '0');
      let start = `${y}-${mm}-${sd} ${sh}:${sM}:${ss}`;
      let end = `${y}-${mm}-${ed} ${eh}:${eM}:${es}`;
      monthPeriods.push({ start, end });
    }
  }
  return monthPeriods;
};

// datefrom and dateto is hk local time
export const getPeriodList = (datefrom, dateto, timedelta = -8) => {
  // getting the convert to utc time, because unit values is stored in UTC+0 time
  let utcDateFrom = modifyHour(datefrom, timedelta);
  let utcDateTo = modifyHour(dateto, timedelta);
  // getting the period list
  let periodList = getMonthList(new Date(utcDateFrom), new Date(utcDateTo));
  return periodList;
};

// exports.getCurrentTimeStr = getCurrentTimeStr;
// exports.modifyHour = modifyHour;
// exports.getMonthDiff = getMonthDiff;
// exports.getMonthList = getMonthList;
// exports.getPeriodList = getPeriodList;
