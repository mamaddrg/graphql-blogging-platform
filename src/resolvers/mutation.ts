import bcrypt from 'bcrypt';

import type { AppContextModel } from '../models';

export const Mutation = {
  createUser: async (parent, args, ctx: AppContextModel, info) => {
    if (args.password.length < 8) {
      throw new Error('Password should be at least 8 characters');
    }
    const isEmailTaken = await ctx.dbClient.user.findFirst({ 
      where: { email: args.email }
    });
    if (isEmailTaken) {
      throw new Error("Email is already in use");
    }

    const salt = await bcrypt.genSalt();
    const hashedPass = bcrypt.hashSync(args.password, salt);
    const userData = {
      name: args.name,
      email: args.email,
      password: hashedPass,
      bio: args.bio ?? null
    }

    const result = await ctx.dbClient.user.create({ data: userData });
    return result;
  }
}
