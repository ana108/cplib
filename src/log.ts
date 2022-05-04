import * as winston from 'winston';
import path from 'path';
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.label({
            label: `cplib`
        }),
        winston.format.timestamp({
            format: 'MMM-DD-YYYY HH:mm:ss'
        }),
        winston.format.printf(info => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`),
    ),
    transports: [
        new winston.transports.File({
            filename: path.join(__dirname, 'logs/cplib.log')
        })
    ],
});
export { logger }