import { Application } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import express from 'express';
import { morganMiddleware } from './morgan';

export function applySecurity(app: Application) {
  app.use(helmet());
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(morganMiddleware);
}
