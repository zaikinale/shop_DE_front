import type { User } from '../types';
import { getDataset, simulateRequest, type VariantKey } from './index';

export async function getUsers(variant?: VariantKey): Promise<User[]> {
  return simulateRequest(getDataset(variant).users);
}

export async function getUserById(
  id: number | string,
  variant?: VariantKey
): Promise<User | null> {
  const user =
    getDataset(variant).users.find((u) => u.id === Number(id)) ?? null;
  return simulateRequest(user);
}

export async function loginByLogin(
  login: string,
  variant?: VariantKey
): Promise<User> {
  const normalized = login.trim().toLowerCase();
  const user = getDataset(variant).users.find(
    (u) => u.login.toLowerCase() === normalized
  );

  if (!user) {
    throw new Error('Пользователь с таким логином не найден');
  }

  return simulateRequest(user);
}