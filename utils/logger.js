import winston from 'winston';
import * as time from './time.js';

// const myCustomLevels = {
//   levels: {
//     debug: 0,
//     info: 1,
//     silly: 2,
//     warn: 3,
//     error: 4,
//   },
//   colors: {
//     debug: 'green',
//     info: 'cyan',
//     silly: 'magenta',
//     warn: 'yellow',
//     error: 'red',
//   },
// };

const logger = winston.createLogger({
  //   levels: myCustomLevels.levels,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf((info) => {
      let currentTime = new Date(info.timestamp).toLocaleString('en-US', {
        timeZone: 'Asia/Hong_Kong',
      });
      let [dateStr, timeStr] = time.getCurrentTimeStr(currentTime);
      return JSON.stringify({
        timestamp: `${dateStr} ${timeStr}`,
        level: info.level,
        message: info.message,
        // slat: info.splat !== undefined ? `${info.splat}` : '',
      });
    })
  ),
  transports: [
    new winston.transports.File({
      filename: './dev-data/websupervisor/log_node_server.log',
    }),
    new winston.transports.Console({
      level: 'info',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),
  ],
});
// winston.addColors(myCustomLevels.colors);

// color console logging
// logger.remove(winston.transports.Console);
// logger.add(winston.transports.Console, { level: 'debug', colorize: true });

// add logs file path
// logger.add(winston.transports.File, {
//   filename: './dev-data/websupervisor/mylogfile.log',
// });
export default logger;
// module.exports = logger;
