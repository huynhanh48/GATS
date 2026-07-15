const CartPaths = {
  _: '/api',
  Cart: {
    _: '/cart',
    List: '/',
    Add: '/',
    Clear: '/',
    Items: {
      Update: '/items/:itemId',
      Delete: '/items/:itemId',
    },
  },
} as const;

export default CartPaths;
