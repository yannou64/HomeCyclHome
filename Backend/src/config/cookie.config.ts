import { CookieOptions } from 'express';

export const ACCESS_COOKIE: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 minutes en ms
};

export const REFRESH_COOKIE: CookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours en ms
    path: '/auth/refresh', // ce cookie n'est envoyé que sur cet endpoint
};
