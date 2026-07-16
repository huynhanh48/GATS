const CategoryPaths = {
  _: '/api',
  Category: {
    _: '/categories',
    List: '/',
    Create: '/',
    Update: '/:categoryId',
    Delete: '/:categoryId',
  },
} as const;

export default CategoryPaths;
