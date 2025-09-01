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
    const isUserAvailable = await ctx.dbClient.user.findUnique({
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
    const isAlreadyLiked = await ctx.dbClient.like.findFirst(
      { where: { userId: authData.userId, postId: data.postId } }
    );
    if (isAlreadyLiked) {
      throw new Error("Post is already liked");
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
  updateUser: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const authData = extractJwtAuth(ctx.request);
    const { data } = args;

    if (data.email) {
      const isEmailTaken = await ctx.dbClient.user.findUnique({ 
        where: { email: data.email }
      });
      if (isEmailTaken) {
        throw new Error('Email is already in use');
      }
    }
    if (data.password) {
      if (data.password.length < 8) {
        throw new Error('Password should be at least 8 characters');
      }
      const hashedPass = await hashPassword(data.password);
      data.password = hashedPass;
    }

    const result = await ctx.dbClient.user.update({ 
      data, 
      where: { id: authData.userId } 
    });
    return result;
  },
  updatePost: async (parent, args, ctx: AppContextModel, info): Promise<PostModel> => {
    const authData = extractJwtAuth(ctx.request);
    const { id, data } = args;

    const postRecord = await ctx.dbClient.post.findUnique({ where: { id } });
    if (!postRecord) {
      throw new Error('Post not found');
    }
    if (postRecord.authorId !== authData.userId) {
      throw new Error("You're not authorized to perform this action");
    }

    let shouldDropDependencies = false;
    if (
      data.published != null &&
      data.published === false &&
      postRecord.published === true
    ) {
      // user want's to un-publish the post, so all the comments and likes should be dropped
      shouldDropDependencies = true;
    }

    let result: PostModel;
    if (shouldDropDependencies) {
      // TODO => is there a better way to handle this transaction?
      [result] = await ctx.dbClient.$transaction([
        ctx.dbClient.post.update({
          where: { id: postRecord.id },
          data
        }),
        ctx.dbClient.comment.deleteMany({
          where: { postId: postRecord.id }
        }),
        ctx.dbClient.like.deleteMany({
          where: { postId: postRecord.id }
        })
      ])
    } else {
      result = await ctx.dbClient.post.update({
        where: { id: postRecord.id },
        data
      });
    }

    return result;
  },
  updateComment: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel> => {
    const authData = extractJwtAuth(ctx.request);
    const { id, data } = args;
    const commentRecord = await ctx.dbClient.comment.findUnique({ where: { id } });
    if (!commentRecord) {
      throw new Error('Comment not found');
    }
    if (commentRecord.authorId !== authData.userId) {
      throw new Error("You're not authorized to perform this action");
    }
    const result = await ctx.dbClient.comment.update({
      where: { id },
      data 
    });
    return result;
  },
  deleteUser: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const authData = extractJwtAuth(ctx.request);
    let result: UserModel;
    // TODO => is there a better way to handle transactions?
    // TODO => should we just rely on delete user, and the dependency deletion based on primary key?
    await ctx.dbClient.$transaction(async (tx) => {
      await tx.like.deleteMany({ where: { userId: authData.userId } });
      await tx.comment.deleteMany({ where: { authorId: authData.userId } });
      await tx.post.deleteMany({ where: { authorId: authData.userId } });
      result = await tx.user.delete({ where: { id: authData.userId } });
    });
    return result;
  },
  deletePost: async (parent, args, ctx: AppContextModel, info): Promise<PostModel> => {
    const authData = extractJwtAuth(ctx.request);
    const { id } = args;

    const postRecord = await ctx.dbClient.post.findUnique({ where: { id } });
    if (!postRecord) {
      throw new Error('Post not found');
    }
    if (postRecord.authorId !== authData.userId) {
      throw new Error("You're not authorized to perform this action");
    }

    let result: PostModel;
    // TODO => is there a better way to handle transactions?
    // TODO => should we just rely on delete user, and the dependency deletion based on primary key?
    await ctx.dbClient.$transaction(async (tx) => {
      await tx.like.deleteMany({ where: { postId: id } });
      await tx.comment.deleteMany({ where: { postId: id } });
      result = await tx.post.delete({ where: { id } });
    });
    return result;
  },
  deleteComment: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel> => {
    const authData = extractJwtAuth(ctx.request);
    const { id } = args;
    const commentRecord = await ctx.dbClient.comment.findUnique({ where: { id } });
    if (!commentRecord) {
      throw new Error('Comment not found');
    }
    if (commentRecord.authorId !== authData.userId) {
      throw new Error("You're not authorized to perform this action");
    }
    const result = await ctx.dbClient.comment.delete({ where: { id } });
    return result;
  },
  deleteLike: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel> => {
    const authData = extractJwtAuth(ctx.request);
    const { id } = args;
    const likeRecord = await ctx.dbClient.like.findUnique({ where: { id } });
    if (!likeRecord) {
      throw new Error('Comment not found');
    }
    if (likeRecord.userId !== authData.userId) {
      throw new Error("You're not authorized to perform this action");
    }
    const result = await ctx.dbClient.like.delete({ where: { id } });
    return result;
  },
}
