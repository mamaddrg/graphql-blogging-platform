import { 
  generateJwtToken, 
  extractJwtAuth, 
  hashPassword, 
  comparePasses 
} from '../utils/index.js';
import type { 
  AppContextModel,
  UserModel,
  PostModel,
  CommentModel,
  LikeModel,
  AuthModel
} from '../models';

export const Mutation = {
  createUser: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const { data } = args;
    if (data.password.length < 8) {
      throw new Error('Password should be at least 8 characters');
    }
    const isEmailTaken = await ctx.dbClient.user.findUnique({ 
      where: { email: data.email }
    });
    if (isEmailTaken) {
      throw new Error("Email is already in use");
    }
    const hashedPass = await hashPassword(data.password);
    const userData = {
      ...data,
      password: hashedPass,
    }
    const result = await ctx.dbClient.user.create({ data: userData });
    return result;
  },
  createPost: async (parent, args, ctx: AppContextModel, info): Promise<PostModel> => {
    const authData = extractJwtAuth(ctx.request);
    const data = {
      ...args.data,
      authorId: authData.userId
    }
    const isUserAvailable = ctx.dbClient.user.findUnique({
      where: { id: authData.userId }
    });
    if (!isUserAvailable) {
      throw new Error('User is not defined');
    }
    const result = await ctx.dbClient.post.create({ data });
    return result;
  },
  createComment: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel> => {
    const authData = extractJwtAuth(ctx.request);
    const data = { 
      ...args.data,
      authorId: authData.userId
    };
    const isUserAvailable = ctx.dbClient.user.findUnique({
      where: { id: data.authorId }
    });
    if (!isUserAvailable) {
      throw new Error('User is not defined');
    }
    const isPostAvailable = ctx.dbClient.post.findUnique({
      where: { id: data.postId }
    });
    if (!isPostAvailable) {
      throw new Error('Post is not defined');
    }
    const result = await ctx.dbClient.comment.create({ data });
    return result;
  },
  createLike: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel> => {
    const authData = extractJwtAuth(ctx.request);
    const data = {
      ...args.data,
      userId: authData.userId
    };
    const isUserAvailable = ctx.dbClient.user.findUnique({
      where: { id: data.userId }
    });
    if (!isUserAvailable) {
      throw new Error('User is not defined');
    }
    const isPostAvailable = ctx.dbClient.post.findUnique({
      where: { id: data.postId }
    });
    if (!isPostAvailable) {
      throw new Error('Post is not defined');
    }
    const result = await ctx.dbClient.like.create({ data });
    return result;
  },
  login: async (parent, args, ctx: AppContextModel, info): Promise<AuthModel> => {
    const { data } = args;
    const userData = await ctx.dbClient.user.findUnique(
      { where: { email: data.email } }
    );
    if (!userData) {
      throw new Error('Incorrect login data');
    }
    await comparePasses(data.password, userData.password);
    const token = generateJwtToken({ userId: userData.id });
    return {
      token,
      user: userData
    }
  },
}
