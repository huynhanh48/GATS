const TagPaths = {
  _: '/api',
  Tag: {
    _: '/tags',
    List: '/',
    Create: '/',
    Update: '/:tagId',
    Delete: '/:tagId',
  },
} as const;

export default TagPaths;
