import type { AppContextModel } from '../models';

export const User = {
  posts: async (parent, args, ctx: AppContextModel, info) => {
    const userId = parent.id;
    const posts = await ctx.dbClient.post.findMany({
      where: { authorId: userId }
    });
    return posts;
  },
  comments: async (parent, args, ctx: AppContextModel, info) => {
    const userId = parent.id;
    const comments = await ctx.dbClient.comment.findMany({
      where: { authorId: userId }
    });
    return comments;
  },
  likes: async (parent, args, ctx: AppContextModel, info) => {
    const userId = parent.id;
    const likes = await ctx.dbClient.like.findMany({
      where: { userId: userId }
    });
    return likes;
  }
}
