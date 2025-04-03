import morgan from 'morgan';
import {Request} from "express";

// Custom Morgan tokens for request params, query, and body
morgan.token('params', (req: Request) => JSON.stringify(req.params));
morgan.token('query', (req: Request) => JSON.stringify(req.query));
morgan.token('body', (req:Request) => JSON.stringify(req.body));

const morganFormat = ':remote-addr :method :url :status :res[content-length] - :response-time ms params=:params query=:query body=:body';

export const morganLogger = morgan(morganFormat);