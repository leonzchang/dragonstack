import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { NextFunction, Request, Response } from 'express';

import accountRounter from './api/account';
import dragonRouter from './api/dragon';
import generationRouter from './api/generation';
import GenerationEngine from './generation/engine';

interface Error {
  statusCode?: number;
  message?: string;
}

const app = express();
const engine = new GenerationEngine();

app.locals.engine = engine;

app.use(cors({ origin: 'http://localhost:1234', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use('/account', accountRounter);
app.use('/dragon', dragonRouter);
app.use('/generation', generationRouter);

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    type: 'error',
    message: error.message,
  });
});

engine.start();

export default app;
