import db from '@/lib/db';
import { Strategy as JwtStrategy, ExtractJwt, VerifyCallback } from 'passport-jwt';
import appConfig from '@/config/app';
import { TokenType } from '@prisma/client';

const jwtOptions = {
    secretOrKey: appConfig.jwt.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
};

const jwtVerify: VerifyCallback = async (payload, done) => {
    try {
        if (payload.type !== TokenType.ACCESS) {
            throw new Error('Invalid token type');
        }

        const user = await db.user.findUnique({
            select: {
                id: true,
                email: true,
                userName: true,
                userRole: true,
            },
            where: { id: payload.sub }
        });

        if (!user) {
            return done(null, false);
        }
        done(null, user);
    } catch (error) {
        done(error, false);
    }
};

export const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);