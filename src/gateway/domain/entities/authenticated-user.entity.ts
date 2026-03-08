export interface IAuthenticatedUser {
  id: number;
  email: string;
  role: string;
}

export class AuthenticatedUser implements IAuthenticatedUser {
  constructor(
    public readonly id: number,
    public readonly email: string,
    public readonly role: string,
  ) {}

  isAdmin(): boolean {
    return this.role === 'admin';
  }
}