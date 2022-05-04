"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston = __importStar(require("winston"));
const path_1 = __importDefault(require("path"));
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(winston.format.label({
        label: `cplib`
    }), winston.format.timestamp({
        format: 'MMM-DD-YYYY HH:mm:ss'
    }), winston.format.printf(info => `${info.level}: ${info.label}: ${[info.timestamp]}: ${info.message}`)),
    transports: [
        new winston.transports.File({
            filename: path_1.default.join(__dirname, 'logs/cplib.log')
        })
    ],
});
exports.logger = logger;
