export type User = { id: number; name: string; email: string; role: 'ADMIN' | 'USER' }
export type AuthResponse = { token: string; user: User }
