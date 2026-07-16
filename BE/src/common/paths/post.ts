const PostPaths = {
  _: '/api',
  Post: {
    _: '/posts',
    List: '/',
    Create: '/',
    GetBySlug: '/slug/:slug',
    Get: '/:postId',
    Update: '/:postId',
    Delete: '/:postId',
    Restore: '/:postId/restore',
    Publish: '/:postId/publish',
    Unpublish: '/:postId/unpublish',
    Archive: '/:postId/archive',
    Like: '/:postId/like',
    Tags: {
      List: '/tags',
      Create: '/tags',
      Update: '/tags/:tagId',
      Delete: '/tags/:tagId',
    },
    Comments: {
      List: '/:postId/comments',
      Create: '/:postId/comments',
      Replies: '/:postId/comments/:commentId/replies',
      Update: '/:postId/comments/:commentId',
      Delete: '/:postId/comments/:commentId',
      Like: '/:postId/comments/:commentId/like',
    },
  },
} as const;

export default PostPaths;
