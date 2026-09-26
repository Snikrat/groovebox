export interface AuthUser {
  id: number;
  name: string;
  username: string;
  email: string;
}

export interface UserWithPassword extends AuthUser {
  passwordHash: string;
}
