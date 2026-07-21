import JetPaths from  "jet-paths";

const AuthPaths = {
  _:"/api",
  User:{
    _:"/user",
    Login: '/login',
    GoogleLogin: '/auth/google',
    Register: '/register',
    Logout: '/logout',
    Me: '/me',
    VerifyEmail: '/verify-email',
    ChangePassword: '/change-password',
    ForgotPassword: '/forgot-password',
    ResetPassword: '/reset-password',
  }
} as const;

export const JetAuthPaths = JetPaths(AuthPaths);
export default AuthPaths;