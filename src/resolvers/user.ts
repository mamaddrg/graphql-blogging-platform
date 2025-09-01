import type { AppContextModel, CommentModel, LikeModel, PostModel } from '../models/index.js';

export const User = {
  posts: async (parent, args, ctx: AppContextModel, info): Promise<PostModel[]> => {
    const userId = parent.id;
    const posts = await ctx.dbClient.post.findMany({
      where: { authorId: userId }
    });
    return posts;
  },
  comments: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel[]> => {
    const userId = parent.id;
    const comments = await ctx.dbClient.comment.findMany({
      where: { authorId: userId }
    });
    return comments;
  },
  likes: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel[]> => {
    const userId = parent.id;
    const likes = await ctx.dbClient.like.findMany({
      where: { userId: userId }
    });
    return likes;
  }
}
