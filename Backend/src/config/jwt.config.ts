import { JwtSignOptions } from '@nestjs/jwt';

export const jwtAccessConfig: JwtSignOptions = {
    secret: process.env.JWT_ACCESS_SECRET as string,
    expiresIn: '15m' as JwtSignOptions['expiresIn'],
};

export const jwtRefreshConfig: JwtSignOptions = {
    secret: process.env.JWT_REFRESH_SECRET as string,
    expiresIn: '7d' as JwtSignOptions['expiresIn'],
};
