import { z } from 'zod';

// User role enum
export const userRoleSchema = z.enum(['admin', 'editor', 'author', 'public_user']);
export type UserRole = z.infer<typeof userRoleSchema>;

// Post status enum
export const postStatusSchema = z.enum(['draft', 'published', 'scheduled', 'archived']);
export type PostStatus = z.infer<typeof postStatusSchema>;

// Media type enum
export const mediaTypeSchema = z.enum(['image', 'video', 'document']);
export type MediaType = z.infer<typeof mediaTypeSchema>;

// User schemas
export const userSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  username: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  role: userRoleSchema,
  bio: z.string().nullable(),
  avatar_url: z.string().nullable(),
  is_active: z.boolean(),
  email_verified: z.boolean(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type User = z.infer<typeof userSchema>;

export const createUserInputSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(50),
  password: z.string().min(8),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  role: userRoleSchema.default('public_user'),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional()
});

export type CreateUserInput = z.infer<typeof createUserInputSchema>;

export const updateUserInputSchema = z.object({
  id: z.number(),
  email: z.string().email().optional(),
  username: z.string().min(3).max(50).optional(),
  first_name: z.string().min(1).optional(),
  last_name: z.string().min(1).optional(),
  role: userRoleSchema.optional(),
  bio: z.string().nullable().optional(),
  avatar_url: z.string().url().nullable().optional(),
  is_active: z.boolean().optional()
});

export type UpdateUserInput = z.infer<typeof updateUserInputSchema>;

export const loginInputSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export type LoginInput = z.infer<typeof loginInputSchema>;

// Category schemas
export const categorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  color: z.string().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Category = z.infer<typeof categorySchema>;

export const createCategoryInputSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional()
});

export type CreateCategoryInput = z.infer<typeof createCategoryInputSchema>;

export const updateCategoryInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).nullable().optional()
});

export type UpdateCategoryInput = z.infer<typeof updateCategoryInputSchema>;

// Tag schemas
export const tagSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Tag = z.infer<typeof tagSchema>;

export const createTagInputSchema = z.object({
  name: z.string().min(1).max(50)
});

export type CreateTagInput = z.infer<typeof createTagInputSchema>;

export const updateTagInputSchema = z.object({
  id: z.number(),
  name: z.string().min(1).max(50)
});

export type UpdateTagInput = z.infer<typeof updateTagInputSchema>;

// Media schemas
export const mediaSchema = z.object({
  id: z.number(),
  filename: z.string(),
  original_name: z.string(),
  file_path: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  media_type: mediaTypeSchema,
  alt_text: z.string().nullable(),
  uploaded_by: z.number(),
  created_at: z.coerce.date()
});

export type Media = z.infer<typeof mediaSchema>;

export const uploadMediaInputSchema = z.object({
  filename: z.string(),
  original_name: z.string(),
  file_path: z.string(),
  file_size: z.number().positive(),
  mime_type: z.string(),
  media_type: mediaTypeSchema,
  alt_text: z.string().nullable().optional()
});

export type UploadMediaInput = z.infer<typeof uploadMediaInputSchema>;

// Post schemas
export const postSchema = z.object({
  id: z.number(),
  title: z.string(),
  slug: z.string(),
  excerpt: z.string().nullable(),
  content: z.string(),
  featured_image_id: z.number().nullable(),
  author_id: z.number(),
  category_id: z.number().nullable(),
  status: postStatusSchema,
  is_featured: z.boolean(),
  view_count: z.number(),
  allow_comments: z.boolean(),
  meta_title: z.string().nullable(),
  meta_description: z.string().nullable(),
  published_at: z.coerce.date().nullable(),
  scheduled_at: z.coerce.date().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Post = z.infer<typeof postSchema>;

export const createPostInputSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().max(500).nullable().optional(),
  featured_image_id: z.number().nullable().optional(),
  category_id: z.number().nullable().optional(),
  status: postStatusSchema.default('draft'),
  is_featured: z.boolean().default(false),
  allow_comments: z.boolean().default(true),
  meta_title: z.string().max(60).nullable().optional(),
  meta_description: z.string().max(160).nullable().optional(),
  scheduled_at: z.coerce.date().nullable().optional(),
  tag_ids: z.array(z.number()).optional()
});

export type CreatePostInput = z.infer<typeof createPostInputSchema>;

export const updatePostInputSchema = z.object({
  id: z.number(),
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(500).nullable().optional(),
  featured_image_id: z.number().nullable().optional(),
  category_id: z.number().nullable().optional(),
  status: postStatusSchema.optional(),
  is_featured: z.boolean().optional(),
  allow_comments: z.boolean().optional(),
  meta_title: z.string().max(60).nullable().optional(),
  meta_description: z.string().max(160).nullable().optional(),
  scheduled_at: z.coerce.date().nullable().optional(),
  tag_ids: z.array(z.number()).optional()
});

export type UpdatePostInput = z.infer<typeof updatePostInputSchema>;

// Comment schemas
export const commentSchema = z.object({
  id: z.number(),
  post_id: z.number(),
  author_name: z.string(),
  author_email: z.string().email(),
  author_url: z.string().nullable(),
  content: z.string(),
  is_approved: z.boolean(),
  parent_id: z.number().nullable(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date()
});

export type Comment = z.infer<typeof commentSchema>;

export const createCommentInputSchema = z.object({
  post_id: z.number(),
  author_name: z.string().min(1).max(100),
  author_email: z.string().email(),
  author_url: z.string().url().nullable().optional(),
  content: z.string().min(1).max(1000),
  parent_id: z.number().nullable().optional()
});

export type CreateCommentInput = z.infer<typeof createCommentInputSchema>;

export const updateCommentInputSchema = z.object({
  id: z.number(),
  content: z.string().min(1).max(1000).optional(),
  is_approved: z.boolean().optional()
});

export type UpdateCommentInput = z.infer<typeof updateCommentInputSchema>;

// Site settings schemas
export const siteSettingsSchema = z.object({
  id: z.number(),
  site_title: z.string(),
  site_description: z.string().nullable(),
  site_logo_url: z.string().nullable(),
  theme: z.string(),
  posts_per_page: z.number().int(),
  allow_comments: z.boolean(),
  require_comment_approval: z.boolean(),
  google_analytics_id: z.string().nullable(),
  meta_keywords: z.string().nullable(),
  social_facebook: z.string().nullable(),
  social_twitter: z.string().nullable(),
  social_instagram: z.string().nullable(),
  updated_at: z.coerce.date()
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const updateSiteSettingsInputSchema = z.object({
  site_title: z.string().min(1).max(100).optional(),
  site_description: z.string().max(500).nullable().optional(),
  site_logo_url: z.string().url().nullable().optional(),
  theme: z.string().optional(),
  posts_per_page: z.number().int().min(1).max(50).optional(),
  allow_comments: z.boolean().optional(),
  require_comment_approval: z.boolean().optional(),
  google_analytics_id: z.string().nullable().optional(),
  meta_keywords: z.string().nullable().optional(),
  social_facebook: z.string().url().nullable().optional(),
  social_twitter: z.string().url().nullable().optional(),
  social_instagram: z.string().url().nullable().optional()
});

export type UpdateSiteSettingsInput = z.infer<typeof updateSiteSettingsInputSchema>;

// Query schemas for filtering and pagination
export const postFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  category_id: z.number().optional(),
  tag_id: z.number().optional(),
  author_id: z.number().optional(),
  status: postStatusSchema.optional(),
  is_featured: z.boolean().optional()
});

export type PostFilters = z.infer<typeof postFiltersSchema>;

export const userFiltersSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: userRoleSchema.optional(),
  is_active: z.boolean().optional()
});

export type UserFilters = z.infer<typeof userFiltersSchema>;

// Response schemas with pagination
export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number(),
      limit: z.number(),
      total: z.number(),
      total_pages: z.number()
    })
  });

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
};

// Post with relations schema
export const postWithRelationsSchema = postSchema.extend({
  author: userSchema,
  category: categorySchema.nullable(),
  featured_image: mediaSchema.nullable(),
  tags: z.array(tagSchema),
  comments_count: z.number()
});

export type PostWithRelations = z.infer<typeof postWithRelationsSchema>;

// Comment with relations schema
export const commentWithRelationsSchema = commentSchema.extend({
  post: postSchema,
  replies: z.array(commentSchema)
});

export type CommentWithRelations = z.infer<typeof commentWithRelationsSchema>;