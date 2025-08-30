import type { AppContextModel } from '../models';

export const Query = {
  users: async (parent, args, ctx: AppContextModel, info) => {
    const users = await ctx.dbClient.user.findMany();
    return users;
  },
  posts: async (parent, args, ctx: AppContextModel, info) => {
    const posts = await ctx.dbClient.post.findMany();
    return posts;
  },
  comments: async (parent, args, ctx: AppContextModel, info) => {
    const comments = await ctx.dbClient.comment.findMany();
    return comments;
  },
  likes: async (parent, args, ctx: AppContextModel, info) => {
    const likes = await ctx.dbClient.like.findMany();
    return likes;
  }
}
