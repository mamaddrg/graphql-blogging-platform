// src/resolvers/subscription.ts
import type { AppContextModel } from '../models/index.js';

export const Subscription = {
  postCreated: {
    subscribe: (_: unknown, __: unknown, { pubsub }: AppContextModel) =>
      pubsub.asyncIterableIterator(['POST_CREATED']),
  },
  commentAdded: {
    subscribe: (_: unknown, args: { postId: number }, { pubsub }: AppContextModel) =>
      pubsub.asyncIterableIterator([`COMMENT_ADDED:${args.postId}`]),
  },
};
