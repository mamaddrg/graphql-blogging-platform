import type { AppContextModel, UserModel, CommentModel, LikeModel } from '../models';

export const Post = {
  author: async (parent, args, ctx: AppContextModel, info): Promise<UserModel> => {
    const authorId = parent.authorId;
    const user = await ctx.dbClient.user.findFirst({
      where: { id: authorId }
    });
    return user;
  },
  comments: async (parent, args, ctx: AppContextModel, info): Promise<CommentModel[]> => {
    const postId = parent.id;
    const comments = await ctx.dbClient.comment.findMany({
      where: { postId: postId }
    });
    return comments;
  },
  likes: async (parent, args, ctx: AppContextModel, info): Promise<LikeModel[]> => {
    const postId = parent.id
    const likes = await ctx.dbClient.like.findMany({
      where: { postId: postId }
    });
    return likes;
  }
}
