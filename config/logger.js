const _ = require('underscore')

const { createLogger, format, transports } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const logger = createLogger({})

const alignedWithColorsAndTime = combine(
  colorize(),
  timestamp(),
  printf((info) => {
    const { timestamp, level, message, ...args } = info;
    const ts = timestamp.slice(0, 19).replace('T', ' ');
    return `${ts} [${level}]: ${message} ${Object.keys(args).length ? JSON.stringify(args, null, 2) : ''}`;
  }),
);

logger
  .add(new transports.Console({
    level: 'info',
    colorize: true,
    handleExceptions: false,
    format: alignedWithColorsAndTime,
    exitOnError: false
  }))

if (process.env.NODE_ENV === 'production') {
  logger
    .add(new transports.File({
      level: 'info',
      filename: 'logfile.txt',
      format: combine(timestamp(), prettyPrint()),
      handleExceptions: false,
      maxsize: 5242880 // 5MB
    }))
}

logger.stream = {
  write: (message, encoding) => { if (process.env.NODE_ENV !== 'test') { OLOG.info(message) } }
}

global.OLOG = logger
