import bcrypt from 'bcrypt';

import type { 
  AppContextModel,
  UserModel,
  PostModel,
  CommentModel,
  LikeModel
} from '../models';

export const Mutation = {
  createUser: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const { data } = args;
    if (data.password.length < 8) {
      throw new Error('Password should be at least 8 characters');
    }
    const isEmailTaken = await ctx.dbClient.user.findFirst({ 
      where: { email: data.email }
    });
    if (isEmailTaken) {
      throw new Error("Email is already in use");
    }
    const salt = await bcrypt.genSalt();
    const hashedPass = await bcrypt.hash(data.password, salt);
    const userData = {
      ...data,
      password: hashedPass,
    }
    const result = await ctx.dbClient.user.create({ data: userData });
    return result;
  },
  createPost: async (parent, args, ctx: AppContextModel, info): Promise<PostModel> => {
    const { data } = args;
    const isUserAvailable = ctx.dbClient.user.findFirst({
      where: { id: data.authorId }
    });
    if (!isUserAvailable) {
      throw new Error('User is not defined');
    }
    const result = await ctx.dbClient.post.create({ data });
    return result;
  },
  createComment: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel> => {
    const { data } = args;
    const isUserAvailable = ctx.dbClient.user.findFirst({
      where: { id: data.authorId }
    });
    if (!isUserAvailable) {
      throw new Error('User is not defined');
    }
    const isPostAvailable = ctx.dbClient.post.findFirst({
      where: { id: data.postId }
    });
    if (!isPostAvailable) {
      throw new Error('Post is not defined');
    }
    const result = await ctx.dbClient.comment.create({ data });
    return result;
  },
  createLike: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel> => {
    const { data } = args;
    const isUserAvailable = ctx.dbClient.user.findFirst({
      where: { id: data.userId }
    });
    if (!isUserAvailable) {
      throw new Error('User is not defined');
    }
    const isPostAvailable = ctx.dbClient.post.findFirst({
      where: { id: data.postId }
    });
    if (!isPostAvailable) {
      throw new Error('Post is not defined');
    }
    const result = await ctx.dbClient.like.create({ data });
    return result;
  },
}
