import JWT from 'jsonwebtoken';
import bcrypt from 'bcrypt';

import type { IncomingMessage } from 'http';
import type { AuthDataModel } from '../models';

export const generateJwtToken = (data: any): string => {
  const token = JWT.sign(
    data,
    process.env.JWT_PRIVATE_KEY,
    { expiresIn: 60 * 60 }
  );
  return token;
}

export const extractJwtAuth = (request: IncomingMessage): AuthDataModel => {
  const header = request.headers.authorization as string;
  if (!header) {
    throw new Error("Authorization is not defined");
  }
  const token = header.split(' ')[1];
  const decoded = JWT.verify(token, process.env.JWT_PRIVATE_KEY) as AuthDataModel;
  return decoded;
}

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt();
  const hashedPass = await bcrypt.hash(password, salt);
  return hashedPass;
}

export const comparePasses = async (password: string, hashedPass: string): Promise<void> => {
  const isPasswordCorrect = await bcrypt.compare(password, hashedPass);
  if (!isPasswordCorrect) {
    throw new Error('Incorrect login data');
  }
}