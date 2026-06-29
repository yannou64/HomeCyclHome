import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            // On précise ou se trouve le token: ici cookie
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request): string | null => {
                    const cookies = req.cookies as Record<
                        string,
                        string | undefined
                    >;
                    return cookies?.access_token ?? null;
                },
            ]),
            // On précise ou se trouve le secret du token
            secretOrKey: process.env.JWT_ACCESS_SECRET as string,
        });
    }
    // On précise ce qu'on injecte dans req.user
    validate(payload: { sub: string; role: string }) {
        return { userId: payload.sub, role: payload.role };
    }
}
