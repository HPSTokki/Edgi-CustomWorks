import { db } from '../db.ts';
import { UserAccount, UserProfile } from '../db/index.ts';
import type { AccountSignUpData, UserProfileData, AccountLoginData } from '../types/types.js';
import { and, eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';
import 'dotenv/config';

const jwtSecret = process.env.JWT_SECRET

export const AuthService = {

    async signUp(accountData: AccountSignUpData) {

        const newAccount = await db
        .insert(UserAccount)
        .values(accountData)
        .returning();

        if (newAccount[0] === undefined) {
            throw new Error('Account creation failed');
        }

        const accountId = newAccount[0].id;

        await db
        .insert(UserProfile)
        .values({
            accountID: accountId,
        })
        .returning();

        return newAccount;
    },

    async logIn(accountLogin: AccountLoginData) {

        const { email, password } = accountLogin;

        const loginData = await db
        .select({
            id: UserAccount.id,
            email: UserAccount.email,
            password: UserAccount.password,
            role: UserAccount.role
        })
        .from(UserAccount)
        .where(and(
            eq(UserAccount.email, email),
            eq(UserAccount.password, password)
        ))
        .limit(1)
        .then(results => results[0]);

        if (!loginData) {
            throw new Error('Invalid email or password');
        }

        const payload = {
            id: loginData?.id,
            role: loginData?.role,
            email: loginData?.email
        }

        const token = jwt.sign(payload, jwtSecret as string, { expiresIn: '1min' });

        return { token, loginData};
    }

}

