const CategoryPaths = {
  _: '/api',
  Category: {
    _: '/categories',
    List: '/',
    Create: '/',
    Reorder: '/reorder',
    Update: '/:categoryId',
    Delete: '/:categoryId',
  },
} as const;

export default CategoryPaths;
