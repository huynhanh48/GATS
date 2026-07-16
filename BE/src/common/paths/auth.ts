import JetPaths from  "jet-paths";

const AuthPaths = {
  _:"/api",
  User:{
    _:"/user",
    Login: '/login',
    Register: '/register',
    Logout: '/logout',
    Me: '/me',
    VerifyEmail: '/verify-email',
  }
} as const;

export const JetAuthPaths = JetPaths(AuthPaths);
export default AuthPaths;