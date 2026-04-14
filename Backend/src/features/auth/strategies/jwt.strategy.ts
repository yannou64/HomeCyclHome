import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req: Request): string | null => {
                    const cookies = req.cookies as Record<
                        string,
                        string | undefined
                    >;
                    return cookies?.access_token ?? null;
                },
            ]),
            secretOrKey: process.env.JWT_ACCESS_SECRET as string,
        });
    }

    validate(payload: { sub: string; role: string }) {
        return { userId: payload.sub, role: payload.role };
    }
}
