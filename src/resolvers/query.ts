import { extractJwtAuth } from '../utils/index.js';

import type { 
  AppContextModel, 
  CommentModel, 
  LikeModel, 
  PostModel, 
  UserModel,
  CommentPublicModel,
  UserPublicModel,
  PostPublicModel,
  LikePublicModel
} from '../models';

export const Query = {
  users: async (parent, args, ctx: AppContextModel, info): Promise<UserPublicModel[]> => {
    const { limit, offset, contains } = args;
    const ops = {};
    const wheres = {};
    if (limit != null) ops['take'] = limit;
    if (offset != null) ops['skip'] = offset;
    if (contains) wheres['name'] = { contains: contains };

    const conditions = {
      ...(Object.keys(ops).length && ops),
      ...(Object.keys(wheres).length && { where: wheres })
    };
    const users = await ctx.dbClient.user.findMany(conditions);
    return users;
  },
  posts: async (parent, args, ctx: AppContextModel, info): Promise<PostPublicModel[]> => {
    const { limit, offset, contains, authorId } = args;
    const ops = {};
    const wheres = {
      // only published posts are available through public posts resolver
      published: true
    };
    if (limit != null) ops['take'] = limit;
    if (offset != null) ops['skip'] = offset;
    if (authorId) wheres['authorId'] = authorId;
    if (contains) {
      wheres['OR'] = [
        { content: { contains } },
        { title: { contains } }
      ]
    };

    const conditions = {
      ...(Object.keys(ops).length && ops),
      ...(Object.keys(wheres).length && { where: wheres })
    };
    const posts = await ctx.dbClient.post.findMany(conditions);
    return posts;
  },
  comments: async (parent, args, ctx: AppContextModel, info): Promise<CommentPublicModel[]> => {
    const { limit, offset, contains, authorId, postId } = args;
    const ops = {};
    const wheres = {
      // only published posts' comments are available through public comments resolver
      post: {
        published: true
      }
    };
    if (limit != null) ops['take'] = limit;
    if (offset != null) ops['skip'] = offset;
    if (authorId) wheres['authorId'] = authorId;
    if (postId) wheres['postId'] = postId;
    if (contains) wheres['content'] = { contains };

    const conditions = {
      ...(Object.keys(ops).length && ops),
      ...(Object.keys(wheres).length && { where: wheres })
    };
    const comments = await ctx.dbClient.comment.findMany(conditions);
    return comments;
  },
  likes: async (parent, args, ctx: AppContextModel, info): Promise<LikePublicModel[]> => {
    const { limit, offset, postId, userId } = args;
    const ops = {};
    const wheres = {
      // only published posts' likes are available through public likes resolver
      post: {
        published: true
      }
    };
    if (limit != null) ops['take'] = limit;
    if (offset != null) ops['skip'] = offset;
    if (userId) wheres['userId'] = userId;
    if (postId) wheres['postId'] = postId;

    const conditions = {
      ...(Object.keys(ops).length && ops),
      ...(Object.keys(wheres).length && { where: wheres })
    };
    const likes = await ctx.dbClient.like.findMany(conditions);
    return likes;
  },
  me: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const authData = extractJwtAuth(ctx.request);
    const user = await ctx.dbClient.user.findUnique({ where: { id: authData.userId } });
    return user;
  },
  myPosts: async (parent, args, ctx: AppContextModel, info): Promise<PostModel[]> => {
    const { limit, offset, published } = args;
    const authData = extractJwtAuth(ctx.request);
    const ops = {};
    const wheres = {
      authorId: authData.userId
    };
    if (limit != null) ops['take'] = limit;
    if (offset != null) ops['skip'] = offset;
    if (published != null) wheres['published'] = published;

    const conditions = {
      ...(Object.keys(ops).length && ops),
      ...(Object.keys(wheres).length && { where: wheres })
    };
    const posts = await ctx.dbClient.post.findMany(conditions);
    return posts;
  },
  myComments: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel[]> => {
    const { limit, offset } = args;
    const authData = extractJwtAuth(ctx.request);
    const ops = {};
    const wheres = {
      authorId: authData.userId
    };
    if (limit != null) ops['take'] = limit;
    if (offset != null) ops['skip'] = offset;

    const conditions = {
      ...(Object.keys(ops).length && ops),
      ...(Object.keys(wheres).length && { where: wheres })
    };
    const comments = await ctx.dbClient.comment.findMany(conditions);
    return comments;
  },
  myLikes: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel[]> => {
    const { limit, offset } = args;
    const authData = extractJwtAuth(ctx.request);
    const ops = {};
    const wheres = {
      userId: authData.userId
    };
    if (limit != null) ops['take'] = limit;
    if (offset != null) ops['skip'] = offset;

    const conditions = {
      ...(Object.keys(ops).length && ops),
      ...(Object.keys(wheres).length && { where: wheres })
    };
    const likes = await ctx.dbClient.like.findMany(conditions);
    return likes;
  }
}
