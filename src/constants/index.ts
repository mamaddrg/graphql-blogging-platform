export const subscriptionConsts = {
  post: {
    triggerName: 'POST_SUBSCRIPTION',
    mutation: {
      created: 'CREATED',
      updated: 'UPDATED',
      deleted: 'DELETED'
    }
  },
  comment: {
    triggerName: 'COMMENT_SUBSCRIPTION',
    mutation: {
      created: 'CREATED',
      deleted: 'DELETED'
    }
  },
  like: {
    triggerName: 'LIKE_SUBSCRIPTION',
    mutation: {
      created: 'CREATED',
      deleted: 'DELETED'
    }
  }
}