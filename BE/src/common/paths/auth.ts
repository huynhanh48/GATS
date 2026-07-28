import JetPaths from 'jet-paths';

const AuthPaths = {
  _: '/api',
  User: {
    _: '/user',
    Login: '/login',
    GoogleLogin: '/auth/google',
    AppleLogin: '/auth/apple',
    Register: '/register',
    Logout: '/logout',
    Me: '/me',
    VerifyEmail: '/verify-email',
    ChangePassword: '/change-password',
    ForgotPassword: '/forgot-password',
    ResetPassword: '/reset-password',
    Refresh: '/refresh',
    Sessions: '/sessions',
    SessionById: '/sessions/:sessionId',
    SessionsOthers: '/sessions/others',
    Devices: '/devices',
    DeviceById: '/devices/:deviceId',
    NotificationPreferences: '/notification-preferences',
    DailyCheckin: '/daily-checkin',
    Onboarding: '/onboarding',
  },
} as const;

export const JetAuthPaths = JetPaths(AuthPaths);
export default AuthPaths;
