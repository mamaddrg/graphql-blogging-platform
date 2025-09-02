import { subscriptionConsts } from '../constants/index.js';
import type { AppContextModel } from '../models/index.js';

export const Subscription = {
  post: {
    subscribe: (parent, args, ctx: AppContextModel, info) => {
      const pubSub = ctx.pubsub;
      return pubSub.asyncIterableIterator([subscriptionConsts.post.triggerName]);
    }
  },
  comment: {
    subscribe: (parent, args, ctx: AppContextModel, info) => {
      const pubSub = ctx.pubsub;
      return pubSub.asyncIterableIterator([`${subscriptionConsts.comment.triggerName}:${args.postId}`]);
    }
  },
  like: {
    subscribe: (parent, args, ctx: AppContextModel, info) => {
      const pubSub = ctx.pubsub;
      return pubSub.asyncIterableIterator([`${subscriptionConsts.like.triggerName}:${args.postId}`]);
    }
  },
};
