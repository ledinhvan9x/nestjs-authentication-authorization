import { JwtService } from '@nestjs/jwt';

export class TokenUtil {
  constructor(private jwtService: JwtService) {}

  async generateAccessToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });
  }

  async generateRefreshToken(payload: any) {
    return this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });
  }

  async verifyAsyncToken(token: string) {
    return this.jwtService.verifyAsync(token);
  }
}
