import type { AppContextModel } from '../models';

export const Post = {
  author: async (parent, args, ctx: AppContextModel, info) => {
    const authorId = parent.authorId;
    const posts = await ctx.dbClient.post.findMany({
      where: { authorId: authorId }
    });
    return posts;
  },
  comments: async (parent, args, ctx: AppContextModel, info) => {
    const postId = parent.id;
    const comments = await ctx.dbClient.comment.findMany({
      where: { postId: postId }
    });
    return comments;
  },
  likes: async (parent, args, ctx: AppContextModel, info) => {
    const postId = parent.id
    const likes = await ctx.dbClient.like.findMany({
      where: { postId: postId }
    });
    return likes;
  }
}
