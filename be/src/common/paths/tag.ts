const TagPaths = {
  _: '/api',
  Tag: {
    _: '/tags',
    List: '/',
    Create: '/',
    Reorder: '/reorder',
    Update: '/:tagId',
    Delete: '/:tagId',
  },
} as const;

export default TagPaths;
