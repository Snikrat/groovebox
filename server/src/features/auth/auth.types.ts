export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface UserWithPassword extends AuthUser {
  passwordHash: string;
}
