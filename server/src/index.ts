import { initTRPC } from '@trpc/server';
import { createHTTPServer } from '@trpc/server/adapters/standalone';
import 'dotenv/config';
import cors from 'cors';
import superjson from 'superjson';
import { z } from 'zod';

// Import all schemas
import {
  createUserInputSchema,
  updateUserInputSchema,
  loginInputSchema,
  userFiltersSchema,
  createPostInputSchema,
  updatePostInputSchema,
  postFiltersSchema,
  createCategoryInputSchema,
  updateCategoryInputSchema,
  createTagInputSchema,
  updateTagInputSchema,
  uploadMediaInputSchema,
  createCommentInputSchema,
  updateCommentInputSchema,
  updateSiteSettingsInputSchema
} from './schema';

// Import all handlers
import { registerUser, loginUser, logoutUser, verifyEmail, requestPasswordReset, resetPassword, getCurrentUser } from './handlers/auth';
import { getUsers, getUserById, createUser, updateUser, deleteUser, getUserProfile } from './handlers/users';
import { 
  getPosts, 
  getPublishedPosts, 
  getFeaturedPosts, 
  getRecentPosts, 
  getPostBySlug, 
  getPostById, 
  createPost, 
  updatePost, 
  deletePost, 
  incrementPostViews, 
  searchPosts, 
  getPostsByCategory, 
  getPostsByTag, 
  getPostsByAuthor,
  publishScheduledPosts
} from './handlers/posts';
import { 
  getCategories, 
  getCategoryBySlug, 
  getCategoryById, 
  createCategory, 
  updateCategory, 
  deleteCategory, 
  getCategoriesWithPostCounts
} from './handlers/categories';
import { 
  getTags, 
  getTagBySlug, 
  getTagById, 
  createTag, 
  updateTag, 
  deleteTag, 
  getTagsWithPostCounts, 
  getPopularTags, 
  searchTags
} from './handlers/tags';
import { 
  uploadMedia, 
  getMediaLibrary, 
  getMediaById, 
  updateMedia, 
  deleteMedia, 
  getMediaUsage, 
  searchMedia, 
  generateMediaThumbnail
} from './handlers/media';
import { 
  getCommentsByPost, 
  getComments, 
  getCommentById, 
  createComment, 
  updateComment, 
  deleteComment, 
  approveComment, 
  rejectComment, 
  markCommentAsSpam, 
  getPendingComments, 
  bulkApproveComments, 
  bulkDeleteComments
} from './handlers/comments';
import { 
  getSiteSettings, 
  updateSiteSettings, 
  getPublicSettings, 
  resetSettingsToDefault, 
  updateTheme, 
  validateGoogleAnalyticsId
} from './handlers/site-settings';
import { 
  getPostAnalytics, 
  getDashboardStats, 
  getPopularPosts, 
  getTrafficSources, 
  getUserEngagement, 
  getSearchKeywords, 
  recordPageView
} from './handlers/analytics';

const t = initTRPC.create({
  transformer: superjson,
});

const publicProcedure = t.procedure;
const router = t.router;

const appRouter = router({
  // Health check
  healthcheck: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }),

  // Authentication routes
  auth: router({
    register: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => registerUser(input)),
    
    login: publicProcedure
      .input(loginInputSchema)
      .mutation(({ input }) => loginUser(input)),
    
    logout: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(({ input }) => logoutUser(input.token)),
    
    verifyEmail: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(({ input }) => verifyEmail(input.token)),
    
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(({ input }) => requestPasswordReset(input.email)),
    
    resetPassword: publicProcedure
      .input(z.object({ token: z.string(), newPassword: z.string().min(8) }))
      .mutation(({ input }) => resetPassword(input.token, input.newPassword)),
    
    getCurrentUser: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(({ input }) => getCurrentUser(input.token))
  }),

  // User management routes
  users: router({
    getUsers: publicProcedure
      .input(userFiltersSchema)
      .query(({ input }) => getUsers(input)),
    
    getUserById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserById(input.id)),
    
    getUserProfile: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getUserProfile(input.id)),
    
    createUser: publicProcedure
      .input(createUserInputSchema)
      .mutation(({ input }) => createUser(input)),
    
    updateUser: publicProcedure
      .input(updateUserInputSchema)
      .mutation(({ input }) => updateUser(input)),
    
    deleteUser: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteUser(input.id))
  }),

  // Post management routes
  posts: router({
    getPosts: publicProcedure
      .input(postFiltersSchema)
      .query(({ input }) => getPosts(input)),
    
    getPublishedPosts: publicProcedure
      .input(postFiltersSchema)
      .query(({ input }) => getPublishedPosts(input)),
    
    getFeaturedPosts: publicProcedure
      .input(z.object({ limit: z.number().default(5) }))
      .query(({ input }) => getFeaturedPosts(input.limit)),
    
    getRecentPosts: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(({ input }) => getRecentPosts(input.limit)),
    
    getPostBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getPostBySlug(input.slug)),
    
    getPostById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getPostById(input.id)),
    
    createPost: publicProcedure
      .input(createPostInputSchema.extend({ authorId: z.number() }))
      .mutation(({ input }) => {
        const { authorId, ...postData } = input;
        return createPost(postData, authorId);
      }),
    
    updatePost: publicProcedure
      .input(updatePostInputSchema)
      .mutation(({ input }) => updatePost(input)),
    
    deletePost: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deletePost(input.id)),
    
    incrementViews: publicProcedure
      .input(z.object({ 
        slug: z.string(), 
        ipAddress: z.string(), 
        userAgent: z.string().optional() 
      }))
      .mutation(({ input }) => incrementPostViews(input.slug, input.ipAddress, input.userAgent)),
    
    searchPosts: publicProcedure
      .input(z.object({ 
        query: z.string(), 
        filters: postFiltersSchema.partial().optional() 
      }))
      .query(({ input }) => searchPosts(input.query, input.filters)),
    
    getPostsByCategory: publicProcedure
      .input(z.object({ categorySlug: z.string(), filters: postFiltersSchema }))
      .query(({ input }) => getPostsByCategory(input.categorySlug, input.filters)),
    
    getPostsByTag: publicProcedure
      .input(z.object({ tagSlug: z.string(), filters: postFiltersSchema }))
      .query(({ input }) => getPostsByTag(input.tagSlug, input.filters)),
    
    getPostsByAuthor: publicProcedure
      .input(z.object({ authorId: z.number(), filters: postFiltersSchema }))
      .query(({ input }) => getPostsByAuthor(input.authorId, input.filters)),
    
    publishScheduledPosts: publicProcedure
      .mutation(() => publishScheduledPosts())
  }),

  // Category management routes
  categories: router({
    getCategories: publicProcedure
      .query(() => getCategories()),
    
    getCategoriesWithCounts: publicProcedure
      .query(() => getCategoriesWithPostCounts()),
    
    getCategoryBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getCategoryBySlug(input.slug)),
    
    getCategoryById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCategoryById(input.id)),
    
    createCategory: publicProcedure
      .input(createCategoryInputSchema)
      .mutation(({ input }) => createCategory(input)),
    
    updateCategory: publicProcedure
      .input(updateCategoryInputSchema)
      .mutation(({ input }) => updateCategory(input)),
    
    deleteCategory: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteCategory(input.id))
  }),

  // Tag management routes
  tags: router({
    getTags: publicProcedure
      .query(() => getTags()),
    
    getTagsWithCounts: publicProcedure
      .query(() => getTagsWithPostCounts()),
    
    getPopularTags: publicProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(({ input }) => getPopularTags(input.limit)),
    
    getTagBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(({ input }) => getTagBySlug(input.slug)),
    
    getTagById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getTagById(input.id)),
    
    searchTags: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(({ input }) => searchTags(input.query)),
    
    createTag: publicProcedure
      .input(createTagInputSchema)
      .mutation(({ input }) => createTag(input)),
    
    updateTag: publicProcedure
      .input(updateTagInputSchema)
      .mutation(({ input }) => updateTag(input)),
    
    deleteTag: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteTag(input.id))
  }),

  // Media management routes
  media: router({
    uploadMedia: publicProcedure
      .input(uploadMediaInputSchema.extend({ uploaderId: z.number() }))
      .mutation(({ input }) => {
        const { uploaderId, ...mediaData } = input;
        return uploadMedia(mediaData, uploaderId);
      }),
    
    getMediaLibrary: publicProcedure
      .input(z.object({ 
        page: z.number().default(1), 
        limit: z.number().default(20), 
        type: z.string().optional() 
      }))
      .query(({ input }) => getMediaLibrary(input.page, input.limit, input.type)),
    
    getMediaById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMediaById(input.id)),
    
    updateMedia: publicProcedure
      .input(z.object({ id: z.number(), altText: z.string().optional() }))
      .mutation(({ input }) => updateMedia(input.id, input.altText)),
    
    deleteMedia: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteMedia(input.id)),
    
    getMediaUsage: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getMediaUsage(input.id)),
    
    searchMedia: publicProcedure
      .input(z.object({ query: z.string(), type: z.string().optional() }))
      .query(({ input }) => searchMedia(input.query, input.type)),
    
    generateThumbnail: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => generateMediaThumbnail(input.id))
  }),

  // Comment management routes
  comments: router({
    getCommentsByPost: publicProcedure
      .input(z.object({ postId: z.number(), approved: z.boolean().default(true) }))
      .query(({ input }) => getCommentsByPost(input.postId, input.approved)),
    
    getComments: publicProcedure
      .input(z.object({ 
        page: z.number().default(1), 
        limit: z.number().default(20), 
        approved: z.boolean().optional() 
      }))
      .query(({ input }) => getComments(input.page, input.limit, input.approved)),
    
    getPendingComments: publicProcedure
      .query(() => getPendingComments()),
    
    getCommentById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getCommentById(input.id)),
    
    createComment: publicProcedure
      .input(createCommentInputSchema)
      .mutation(({ input }) => createComment(input)),
    
    updateComment: publicProcedure
      .input(updateCommentInputSchema)
      .mutation(({ input }) => updateComment(input)),
    
    deleteComment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => deleteComment(input.id)),
    
    approveComment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => approveComment(input.id)),
    
    rejectComment: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => rejectComment(input.id)),
    
    markAsSpam: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => markCommentAsSpam(input.id)),
    
    bulkApprove: publicProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(({ input }) => bulkApproveComments(input.ids)),
    
    bulkDelete: publicProcedure
      .input(z.object({ ids: z.array(z.number()) }))
      .mutation(({ input }) => bulkDeleteComments(input.ids))
  }),

  // Site settings routes
  settings: router({
    getSiteSettings: publicProcedure
      .query(() => getSiteSettings()),
    
    getPublicSettings: publicProcedure
      .query(() => getPublicSettings()),
    
    updateSiteSettings: publicProcedure
      .input(updateSiteSettingsInputSchema)
      .mutation(({ input }) => updateSiteSettings(input)),
    
    resetToDefault: publicProcedure
      .mutation(() => resetSettingsToDefault()),
    
    updateTheme: publicProcedure
      .input(z.object({ theme: z.string() }))
      .mutation(({ input }) => updateTheme(input.theme)),
    
    validateGoogleAnalytics: publicProcedure
      .input(z.object({ gaId: z.string() }))
      .query(({ input }) => validateGoogleAnalyticsId(input.gaId))
  }),

  // Analytics and reporting routes
  analytics: router({
    getPostAnalytics: publicProcedure
      .input(z.object({ 
        postId: z.number().optional(), 
        days: z.number().default(30) 
      }))
      .query(({ input }) => getPostAnalytics(input.postId, input.days)),
    
    getDashboardStats: publicProcedure
      .query(() => getDashboardStats()),
    
    getPopularPosts: publicProcedure
      .input(z.object({ 
        limit: z.number().default(10), 
        days: z.number().default(30) 
      }))
      .query(({ input }) => getPopularPosts(input.limit, input.days)),
    
    getTrafficSources: publicProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(({ input }) => getTrafficSources(input.days)),
    
    getUserEngagement: publicProcedure
      .input(z.object({ days: z.number().default(30) }))
      .query(({ input }) => getUserEngagement(input.days)),
    
    getSearchKeywords: publicProcedure
      .input(z.object({ 
        limit: z.number().default(20), 
        days: z.number().default(30) 
      }))
      .query(({ input }) => getSearchKeywords(input.limit, input.days)),
    
    recordPageView: publicProcedure
      .input(z.object({ 
        path: z.string(), 
        ipAddress: z.string(), 
        userAgent: z.string().optional(), 
        referer: z.string().optional() 
      }))
      .mutation(({ input }) => recordPageView(input.path, input.ipAddress, input.userAgent, input.referer))
  })
});

export type AppRouter = typeof appRouter;

async function start() {
  const port = process.env['SERVER_PORT'] || 2022;
  const server = createHTTPServer({
    middleware: (req, res, next) => {
      cors({
        origin: process.env['CORS_ORIGIN'] || 'http://localhost:3000',
        credentials: true
      })(req, res, next);
    },
    router: appRouter,
    createContext() {
      return {};
    },
  });
  
  server.listen(port);
  console.log(`🚀 Blog CMS TRPC server listening at port: ${port}`);
  console.log(`📊 Analytics tracking enabled`);
  console.log(`🔐 Authentication & authorization ready`);
  console.log(`📝 Full blog management capabilities available`);
}

start();