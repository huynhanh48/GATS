import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import logger from 'jet-logger';
import morgan from 'morgan';
import path from 'path';
import { ZodError } from 'zod';

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
import LeadApi from '@src/routes/lead/leadApi';
import NotificationApi from '@src/routes/notification/notificationApi';
import AdminUserApi from '@src/routes/admin-user/adminUserApi';
import ModerationApi from '@src/routes/moderation/moderationApi';
import BannedWordApi from '@src/routes/banned-word/bannedWordApi';
import AdminMetricsApi from '@src/routes/admin-metrics/adminMetricsApi';
import CouponApi from '@src/routes/coupon/couponApi';
import CertificateApi from '@src/routes/certificate/certificateApi';
import AnalyticsApi from '@src/routes/analytics/analyticsApi';
import LearnExtrasApi from '@src/routes/learn-extras/learnExtrasApi';
import CourseChatApi from '@src/routes/course-chat/courseChatApi';
import HealthApi from '@src/routes/health/healthApi';
import MobileApi from '@src/routes/mobile/mobileApi';
import FlashcardAdminApi from '@src/routes/flashcard/flashcardAdminApi';
import CourseChatPaths from '@src/common/paths/course-chat';
import AiCoachApi from '@src/routes/ai-coach/aiCoachApi';
import EnvVars, {
  assertProductionConfiguration,
  NodeEnvs,
} from './common/constants/env';
import cors from 'cors';
import originGuard from './middleware/originGuard';
import { errorHandle } from './middleware/errorHandle';
import { getAllowedOrigins, isOriginAllowed } from './common/utils/cors';
import requestContext from './middleware/requestContext';
import responseMeta from './middleware/responseMeta';
/******************************************************************************
                                Setup
******************************************************************************/

const app = express();
assertProductionConfiguration();

// Rich-text posts can legitimately exceed Express' 100 KB default once the
// editor serializes headings, links and formatting as HTML. Keep a finite
// application-level cap even though nginx allows larger media uploads.
const REQUEST_BODY_LIMIT = '2mb';

// **** Middleware **** //

// Exactly one trusted reverse-proxy hop (nginx) terminates TLS in production.
if (EnvVars.NodeEnv === NodeEnvs.PRODUCTION) {
  app.set('trust proxy', 1);
}

// Basic middleware
app.use(requestContext);
app.use(responseMeta);
app.use(express.json({ limit: REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: REQUEST_BODY_LIMIT }));
app.use(cookieParser());
app.use(
  cors({
    origin(origin, callback) {
      // Server-to-server/mobile clients do not send Origin.
      if (!origin || isOriginAllowed(origin)) {
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
app.use('/health', HealthApi);
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
app.use(Paths._, LeadApi);
app.use(Paths._, NotificationApi);
app.use(Paths._, AdminUserApi);
app.use(Paths._, ModerationApi);
app.use(Paths._, BannedWordApi);
app.use(Paths._, AdminMetricsApi);
app.use(Paths._, CouponApi);
app.use(Paths._, CertificateApi);
app.use(Paths._, AnalyticsApi);
app.use(Paths._, LearnExtrasApi);
app.use(Paths._, MobileApi);
app.use(Paths._, FlashcardAdminApi);
app.use(CourseChatPaths._, CourseChatApi);
app.use(Paths._ + '/ai-coach', AiCoachApi);

// Add error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (EnvVars.NodeEnv !== NodeEnvs.TEST.valueOf()) {
    if (EnvVars.NodeEnv === NodeEnvs.PRODUCTION) {
      console.error(
        JSON.stringify({
          level: 'error',
          event: 'unhandled_error',
          requestId: res.locals.requestId,
          message: err.message,
          stack: err.stack,
        }),
      );
    } else {
      logger.err(err, true);
    }
  }

  const retryAfter =
    res.statusCode === 429 || res.statusCode === 503 ? '5' : undefined;
  if (retryAfter) {
    res.setHeader('Retry-After', retryAfter);
  }

  const requestError = err as Error & { status?: number; type?: string };
  if (
    requestError.status === 413 ||
    requestError.type === 'entity.too.large'
  ) {
    const message =
      'Nội dung gửi lên quá lớn. Vui lòng giữ tổng dữ liệu dưới 2 MB.';
    return res.status(413).json({
      error: {
        code: 'PAYLOAD_TOO_LARGE',
        message,
        details: { maxSize: REQUEST_BODY_LIMIT },
        retryable: false,
      },
      message,
      meta: {
        requestId: res.locals.requestId,
        serverTime: new Date().toISOString(),
      },
    });
  }

  if (isHttpException(err)) {
    const retryable =
      err.retryable ||
      err.status === 429 ||
      err.status === 503 ||
      err.status >= 500;
    if (retryable && (err.status === 429 || err.status === 503)) {
      res.setHeader('Retry-After', '5');
    }
    return res.status(err.status).json({
      error: {
        code: err.code ?? `HTTP_${err.status}`,
        message: err.message,
        details: err.details ?? err.issues ?? {},
        retryable,
      },
      // Backward-compatible string field for older clients
      message: err.message,
      meta: {
        requestId: res.locals.requestId,
        serverTime: new Date().toISOString(),
      },
    });
  }

  if (err instanceof ZodError) {
    const issues = err.issues;
    const first = issues[0];
    const message = first
      ? `Validation Error (${(first.path ?? []).join('.')}): ${first.message ?? 'Invalid'}`
      : 'Unprocessable Entity';
    return res.status(422).json({
      error: {
        code: 'VALIDATION_ERROR',
        message,
        details: { issues },
        retryable: false,
      },
      message,
      meta: {
        requestId: res.locals.requestId,
        serverTime: new Date().toISOString(),
      },
    });
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
