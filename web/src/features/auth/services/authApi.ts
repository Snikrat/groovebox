import { api } from '../../../shared/services/api';
import type { LoginInput, RegisterInput, User } from '../types/user';

/** Retorna null quando não há ninguém logado. */
export async function getCurrentUser(): Promise<User | null> {
  const { data } = await api.get<User | null>('/auth/me');
  return data;
}

export async function login(input: LoginInput): Promise<User> {
  const { data } = await api.post<User>('/auth/login', input);
  return data;
}

export async function register(input: RegisterInput): Promise<User> {
  const { data } = await api.post<User>('/auth/register', input);
  return data;
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout');
}

export async function updateUsername(username: string): Promise<User> {
  const { data } = await api.put<User>('/auth/username', { username });
  return data;
}
