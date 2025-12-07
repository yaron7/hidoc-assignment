import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class AtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Security: Reject expired tokens immediately
      secretOrKey: 'AT_SECRET', // Ideally process.env.AT_SECRET
    });
  }

  validate(payload: any) {
    // This object attaches to req.user
    return { userId: payload.sub, email: payload.email };
  }
}
