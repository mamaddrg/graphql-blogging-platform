import type { AppContextModel, PostModel, UserModel } from '../models/index.js';

export const Like = {
  post: async (parent, args, ctx: AppContextModel, info): Promise<PostModel> => {
    const postId = parent.postId;
    const post = await ctx.dbClient.post.findFirst({
      where: { id: postId }
    });
    return post;
  },
  user: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const authorId = parent.authorId;
    const user = await ctx.dbClient.user.findFirst({
      where: { id: authorId }
    });
    return user;
  }
}
