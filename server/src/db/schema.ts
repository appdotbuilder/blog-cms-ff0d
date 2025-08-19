import {
  serial,
  text,
  pgTable,
  timestamp,
  integer,
  boolean,
  pgEnum,
  varchar,
  uniqueIndex,
  index
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'editor', 'author', 'public_user']);
export const postStatusEnum = pgEnum('post_status', ['draft', 'published', 'scheduled', 'archived']);
export const mediaTypeEnum = pgEnum('media_type', ['image', 'video', 'document']);

// Users table
export const usersTable = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  password_hash: text('password_hash').notNull(),
  first_name: varchar('first_name', { length: 100 }).notNull(),
  last_name: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull().default('public_user'),
  bio: text('bio'),
  avatar_url: text('avatar_url'),
  is_active: boolean('is_active').notNull().default(true),
  email_verified: boolean('email_verified').notNull().default(false),
  email_verification_token: text('email_verification_token'),
  password_reset_token: text('password_reset_token'),
  password_reset_expires: timestamp('password_reset_expires'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  emailIdx: uniqueIndex('users_email_idx').on(table.email),
  usernameIdx: uniqueIndex('users_username_idx').on(table.username)
}));

// Categories table
export const categoriesTable = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  color: varchar('color', { length: 7 }), // Hex color code
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  slugIdx: uniqueIndex('categories_slug_idx').on(table.slug)
}));

// Tags table
export const tagsTable = pgTable('tags', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  slug: varchar('slug', { length: 50 }).notNull().unique(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  slugIdx: uniqueIndex('tags_slug_idx').on(table.slug)
}));

// Media table
export const mediaTable = pgTable('media', {
  id: serial('id').primaryKey(),
  filename: varchar('filename', { length: 255 }).notNull(),
  original_name: varchar('original_name', { length: 255 }).notNull(),
  file_path: text('file_path').notNull(),
  file_size: integer('file_size').notNull(),
  mime_type: varchar('mime_type', { length: 100 }).notNull(),
  media_type: mediaTypeEnum('media_type').notNull(),
  alt_text: text('alt_text'),
  uploaded_by: integer('uploaded_by').notNull().references(() => usersTable.id),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  uploadedByIdx: index('media_uploaded_by_idx').on(table.uploaded_by)
}));

// Posts table
export const postsTable = pgTable('posts', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  excerpt: text('excerpt'),
  content: text('content').notNull(),
  featured_image_id: integer('featured_image_id').references(() => mediaTable.id),
  author_id: integer('author_id').notNull().references(() => usersTable.id),
  category_id: integer('category_id').references(() => categoriesTable.id),
  status: postStatusEnum('status').notNull().default('draft'),
  is_featured: boolean('is_featured').notNull().default(false),
  view_count: integer('view_count').notNull().default(0),
  allow_comments: boolean('allow_comments').notNull().default(true),
  meta_title: varchar('meta_title', { length: 60 }),
  meta_description: varchar('meta_description', { length: 160 }),
  published_at: timestamp('published_at'),
  scheduled_at: timestamp('scheduled_at'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  slugIdx: uniqueIndex('posts_slug_idx').on(table.slug),
  authorIdx: index('posts_author_idx').on(table.author_id),
  categoryIdx: index('posts_category_idx').on(table.category_id),
  statusIdx: index('posts_status_idx').on(table.status),
  publishedIdx: index('posts_published_idx').on(table.published_at),
  featuredIdx: index('posts_featured_idx').on(table.is_featured)
}));

// Post tags junction table
export const postTagsTable = pgTable('post_tags', {
  id: serial('id').primaryKey(),
  post_id: integer('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  tag_id: integer('tag_id').notNull().references(() => tagsTable.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  postTagIdx: index('post_tags_post_tag_idx').on(table.post_id, table.tag_id)
}));

// Comments table (without self-reference initially to avoid circular dependency)
export const commentsTable = pgTable('comments', {
  id: serial('id').primaryKey(),
  post_id: integer('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  author_name: varchar('author_name', { length: 100 }).notNull(),
  author_email: varchar('author_email', { length: 255 }).notNull(),
  author_url: text('author_url'),
  content: text('content').notNull(),
  is_approved: boolean('is_approved').notNull().default(false),
  parent_id: integer('parent_id'), // Will be handled in relations
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  postIdx: index('comments_post_idx').on(table.post_id),
  parentIdx: index('comments_parent_idx').on(table.parent_id),
  approvedIdx: index('comments_approved_idx').on(table.is_approved)
}));

// Site settings table
export const siteSettingsTable = pgTable('site_settings', {
  id: serial('id').primaryKey(),
  site_title: varchar('site_title', { length: 100 }).notNull().default('My Blog'),
  site_description: text('site_description'),
  site_logo_url: text('site_logo_url'),
  theme: varchar('theme', { length: 50 }).notNull().default('light'),
  posts_per_page: integer('posts_per_page').notNull().default(10),
  allow_comments: boolean('allow_comments').notNull().default(true),
  require_comment_approval: boolean('require_comment_approval').notNull().default(true),
  google_analytics_id: varchar('google_analytics_id', { length: 20 }),
  meta_keywords: text('meta_keywords'),
  social_facebook: text('social_facebook'),
  social_twitter: text('social_twitter'),
  social_instagram: text('social_instagram'),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// User sessions table for authentication
export const userSessionsTable = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  user_id: integer('user_id').notNull().references(() => usersTable.id, { onDelete: 'cascade' }),
  session_token: text('session_token').notNull().unique(),
  expires_at: timestamp('expires_at').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  sessionTokenIdx: uniqueIndex('user_sessions_token_idx').on(table.session_token),
  userIdx: index('user_sessions_user_idx').on(table.user_id)
}));

// Post views table for analytics
export const postViewsTable = pgTable('post_views', {
  id: serial('id').primaryKey(),
  post_id: integer('post_id').notNull().references(() => postsTable.id, { onDelete: 'cascade' }),
  ip_address: varchar('ip_address', { length: 45 }).notNull(),
  user_agent: text('user_agent'),
  viewed_at: timestamp('viewed_at').defaultNow().notNull()
}, (table): Record<string, any> => ({
  postIdx: index('post_views_post_idx').on(table.post_id),
  dateIdx: index('post_views_date_idx').on(table.viewed_at)
}));

// Define relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  posts: many(postsTable),
  media: many(mediaTable),
  sessions: many(userSessionsTable)
}));

export const categoriesRelations = relations(categoriesTable, ({ many }) => ({
  posts: many(postsTable)
}));

export const tagsRelations = relations(tagsTable, ({ many }) => ({
  postTags: many(postTagsTable)
}));

export const mediaRelations = relations(mediaTable, ({ one, many }) => ({
  uploader: one(usersTable, {
    fields: [mediaTable.uploaded_by],
    references: [usersTable.id]
  }),
  featuredPosts: many(postsTable)
}));

export const postsRelations = relations(postsTable, ({ one, many }) => ({
  author: one(usersTable, {
    fields: [postsTable.author_id],
    references: [usersTable.id]
  }),
  category: one(categoriesTable, {
    fields: [postsTable.category_id],
    references: [categoriesTable.id]
  }),
  featuredImage: one(mediaTable, {
    fields: [postsTable.featured_image_id],
    references: [mediaTable.id]
  }),
  postTags: many(postTagsTable),
  comments: many(commentsTable),
  views: many(postViewsTable)
}));

export const postTagsRelations = relations(postTagsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postTagsTable.post_id],
    references: [postsTable.id]
  }),
  tag: one(tagsTable, {
    fields: [postTagsTable.tag_id],
    references: [tagsTable.id]
  })
}));

export const commentsRelations = relations(commentsTable, ({ one, many }) => ({
  post: one(postsTable, {
    fields: [commentsTable.post_id],
    references: [postsTable.id]
  }),
  parent: one(commentsTable, {
    fields: [commentsTable.parent_id],
    references: [commentsTable.id],
    relationName: 'comment_parent'
  }),
  replies: many(commentsTable, {
    relationName: 'comment_parent'
  })
}));

export const userSessionsRelations = relations(userSessionsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [userSessionsTable.user_id],
    references: [usersTable.id]
  })
}));

export const postViewsRelations = relations(postViewsTable, ({ one }) => ({
  post: one(postsTable, {
    fields: [postViewsTable.post_id],
    references: [postsTable.id]
  })
}));

// TypeScript types for the table schemas
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export type Category = typeof categoriesTable.$inferSelect;
export type NewCategory = typeof categoriesTable.$inferInsert;

export type Tag = typeof tagsTable.$inferSelect;
export type NewTag = typeof tagsTable.$inferInsert;

export type Media = typeof mediaTable.$inferSelect;
export type NewMedia = typeof mediaTable.$inferInsert;

export type Post = typeof postsTable.$inferSelect;
export type NewPost = typeof postsTable.$inferInsert;

export type PostTag = typeof postTagsTable.$inferSelect;
export type NewPostTag = typeof postTagsTable.$inferInsert;

export type Comment = typeof commentsTable.$inferSelect;
export type NewComment = typeof commentsTable.$inferInsert;

export type SiteSettings = typeof siteSettingsTable.$inferSelect;
export type NewSiteSettings = typeof siteSettingsTable.$inferInsert;

export type UserSession = typeof userSessionsTable.$inferSelect;
export type NewUserSession = typeof userSessionsTable.$inferInsert;

export type PostView = typeof postViewsTable.$inferSelect;
export type NewPostView = typeof postViewsTable.$inferInsert;

// Export all tables for relation queries
export const tables = {
  users: usersTable,
  categories: categoriesTable,
  tags: tagsTable,
  media: mediaTable,
  posts: postsTable,
  postTags: postTagsTable,
  comments: commentsTable,
  siteSettings: siteSettingsTable,
  userSessions: userSessionsTable,
  postViews: postViewsTable
};