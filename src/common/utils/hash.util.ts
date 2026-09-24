import * as bcrypt from 'bcryptjs';

const DEFAULT_SALT_ROUNDS = 10;

export async function hashData(
  data: string,
  saltRounds: number = DEFAULT_SALT_ROUNDS,
): Promise<string> {
  return bcrypt.hash(data, saltRounds);
}

export async function compareData(
  data: string,
  encrypted: string,
): Promise<boolean> {
  return bcrypt.compare(data, encrypted);
}

export const hashPassword = hashData;
export const comparePassword = compareData;
