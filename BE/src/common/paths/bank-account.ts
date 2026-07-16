const BankAccountPaths = {
  _: '/api',
  BankAccount: {
    _: '/bank-accounts',
    List: '/',
    Create: '/',
    Get: '/:bankAccountId',
    Update: '/:bankAccountId',
    Delete: '/:bankAccountId',
    SetDefault: '/:bankAccountId/default',
  },
} as const;

export default BankAccountPaths;
