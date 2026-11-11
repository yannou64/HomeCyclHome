import { JwtSignOptions } from '@nestjs/jwt';

export const jwtAccessConfig: JwtSignOptions = {
    secret: process.env.JWT_ACCESS_SECRET,
    expiresIn: '15m',
};

export const jwtRefreshConfig: JwtSignOptions = {
    secret: process.env.JWT_REFRESH_SECRET,
    expiresIn: '7d',
};
