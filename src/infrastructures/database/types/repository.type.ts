import type { Prisma } from '@prisma/client';

export type PrismaDelegate<T> = {
  findMany(args: Prisma.SelectSubset<unknown, never>): Promise<T[]>;
  findUnique(args: Prisma.SelectSubset<unknown, never>): Promise<T | null>;
  findFirst?(args: Prisma.SelectSubset<unknown, never>): Promise<T | null>;
  create(args: Prisma.SelectSubset<unknown, never>): Promise<T>;
  update(args: Prisma.SelectSubset<unknown, never>): Promise<T>;
  count?(args?: Prisma.SelectSubset<unknown, never>): Promise<number>;
};
