import { Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthDto } from './dto/auth.dto';
import { PhysiciansService } from 'src/physicians/physicians.service';

@Injectable()
export class AuthService {
  constructor(
    private physiciansService: PhysiciansService,
    private jwtService: JwtService,
  ) {}

  // 1. Initial Login
  async signinLocal(dto: AuthDto) {
    const physician = await this.physiciansService.findByEmail(dto.email);
    if (!physician) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(
      dto.password,
      physician.password,
    );
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(physician.id, physician.email);
    await this.updateRefreshTokenHash(physician.id, tokens.refreshToken);

    return tokens;
  }

  // 2. Refresh Token Rotation
  async refreshTokens(userId: string, rt: string) {
    const physician = await this.physiciansService.findById(userId);
    if (!physician || !physician.hashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const rtMatches = await bcrypt.compare(rt, physician.hashedRefreshToken);
    if (!rtMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(physician.id, physician.email);
    // Rotate: Save new hash
    await this.updateRefreshTokenHash(physician.id, tokens.refreshToken);

    return tokens;
  }

  // Helper: Token Generation
  private async getTokens(userId: string, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: 'AT_SECRET', expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { secret: 'RT_SECRET', expiresIn: '7d' },
      ),
    ]);

    return {
      accessToken: at,
      refreshToken: rt,
    };
  }

  // Helper: Save Hashed RT
  private async updateRefreshTokenHash(userId: string, rt: string) {
    const hash = await bcrypt.hash(rt, 10);
    await this.physiciansService.update(userId, {
      hashedRefreshToken: hash,
      lastLoginAt: new Date(),
    });
  }
}
