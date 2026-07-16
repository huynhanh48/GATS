import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';
import path from 'path';

import Paths from '@src/common/paths/auth';
import { isHttpException } from '@src/exceptions/root';
import AuthApi from '@src/routes/user/authApi';
import BankAccountApi from '@src/routes/bank-account/bankAccountApi';
import CartApi from '@src/routes/cart/cartApi';
import CategoryApi from '@src/routes/category/categoryApi';
import CourseApi from '@src/routes/course/courseApi';
import TagApi from '@src/routes/tag/tagApi';
import EnrollmentApi from '@src/routes/enrollment/enrollmentApi';
import OrderApi from '@src/routes/order/orderApi';
import PaymentApi from '@src/routes/payment/paymentApi';
import PostApi from '@src/routes/post/postApi';
import ProgressApi from '@src/routes/progress/progressApi';
import QuizApi from '@src/routes/quiz/quizApi';
import AssignmentApi from '@src/routes/assignment/assignmentApi';
import VideoApi from '@src/routes/video/videoApi';
import MediaApi from '@src/routes/media/mediaApi';
import EnvVars, { NodeEnvs } from './common/constants/env';
import cors from 'cors';
import { getAllowedOrigins } from './common/utils/cors';
import originGuard from './middleware/originGuard';
import { errorHandle } from './middleware/errorHandle';
/******************************************************************************
                                Setup
******************************************************************************/

const app = express();

// **** Middleware **** //

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      // Non-browser clients (no Origin) — allow; originGuard handles CSRF.
      if (!origin) {
        return callback(null, true);
      }
      if (getAllowedOrigins().includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);
app.use(errorHandle(originGuard));

// Show routes called in console during development
if (EnvVars.NodeEnv === NodeEnvs.DEV) {
  app.use(morgan('dev'));
}

// Security
if (EnvVars.NodeEnv === NodeEnvs.PRODUCTION) {
  app.use(helmet());
}

// Add APIs, must be after middleware
app.use(Paths._, AuthApi);
app.use(Paths._, CategoryApi);
app.use(Paths._, TagApi);
app.use(Paths._, CourseApi);
app.use(Paths._, EnrollmentApi);
app.use(Paths._, CartApi);
app.use(Paths._, OrderApi);
app.use(Paths._, PaymentApi);
app.use(Paths._, BankAccountApi);
app.use(Paths._, ProgressApi);
app.use(Paths._, PostApi);
app.use(Paths._, QuizApi);
app.use(Paths._, AssignmentApi);
app.use(Paths._, VideoApi);
app.use(Paths._, MediaApi);

// Add error handler
app.use((err: Error, _: Request, res: Response, next: NextFunction) => {
  if (EnvVars.NodeEnv !== NodeEnvs.TEST.valueOf()) {
    logger.err(err, true);
  }

  if (isHttpException(err)) {
    const body: { error: string; issues?: unknown } = { error: err.message };
    if (err.issues !== undefined) {
      body.issues = err.issues;
    }
    return res.status(err.status).json(body);
  }

  return next(err);
});

// **** FrontEnd Content **** //

// Set views directory (html)
const viewsDir = path.join(__dirname, 'views');
app.set('views', viewsDir);

// Set static directory (js and css).
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

// Nav to users pg by default
app.get('/', (_: Request, res: Response) => {
  return res.redirect('/users');
});

// Redirect to login if not logged in.
app.get('/users', (_: Request, res: Response) => {
  return res.sendFile('users.html', { root: viewsDir });
});

/******************************************************************************
                                Export default
******************************************************************************/

export default app;
