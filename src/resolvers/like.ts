import type { AppContextModel } from '../models';

export const Like = {
  post: async (parent, args, ctx: AppContextModel, info) => {
    const postId = parent.postId;
    const post = await ctx.dbClient.post.findFirst({
      where: { id: postId }
    });
    return post;
  },
  user: async (parent, args, ctx: AppContextModel, info) => {
    const authorId = parent.authorId;
    const user = await ctx.dbClient.user.findFirst({
      where: { id: authorId }
    });
    return user;
  }
}
