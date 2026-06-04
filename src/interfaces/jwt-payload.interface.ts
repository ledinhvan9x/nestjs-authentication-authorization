export interface JwtPayload {
  sub: string;
  sessionId: string;
  username: string;
  roles: string[];
}
