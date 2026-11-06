export {
  postTagSchema,
  tagPublicSchema as postTagWithCountSchema,
  type PostTag,
  type TagPublic as PostTagWithCount,
  parseTagPublic as parsePostTag,
  parseTagPublic as parsePostTagWithCount,
  createTagSchema as createPostTagSchema,
  updateTagSchema as updatePostTagSchema,
  type CreateTagInput as CreatePostTagInput,
  type UpdateTagInput as UpdatePostTagInput,
  parseCreateTagInput as parseCreatePostTagInput,
  parseUpdateTagInput as parseUpdatePostTagInput,
} from '@src/models/Tag.model';
