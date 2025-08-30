import type { AppContextModel, CommentModel, LikeModel, PostModel, UserModel } from '../models';

export const Query = {
  users: async (parent, args, ctx: AppContextModel, info): Promise<UserModel[]> => {
    const users = await ctx.dbClient.user.findMany();
    return users;
  },
  posts: async (parent, args, ctx: AppContextModel, info): Promise<PostModel[]> => {
    const posts = await ctx.dbClient.post.findMany();
    return posts;
  },
  comments: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel[]> => {
    const comments = await ctx.dbClient.comment.findMany();
    return comments;
  },
  likes: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel[]> => {
    const likes = await ctx.dbClient.like.findMany();
    return likes;
  }
}
