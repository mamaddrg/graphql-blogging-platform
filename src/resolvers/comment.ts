import type { AppContextModel, PostModel, UserModel, LikeModel } from '../models/index.js';

export const Comment = {
  post: async (parent, args, ctx: AppContextModel, info): Promise<PostModel> => {
    const postId = parent.postId;
    const post = await ctx.dbClient.post.findFirst({
      where: { id: postId }
    });
    return post;
  },
  author: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const authorId = parent.authorId;
    const author = await ctx.dbClient.user.findFirst({
      where: { id: authorId }
    });
    return author;
  },
  likes: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel[]> => {
    const postId = parent.id;
    const likes = await ctx.dbClient.like.findMany({
      where: { postId: postId }
    });
    return likes;
  }
}
