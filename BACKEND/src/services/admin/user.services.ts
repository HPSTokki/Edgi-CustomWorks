import { db } from "../../db.ts";
import { UserAccount, UserProfile, Order, OrderItems } from "../../db/index.ts";
import { and, eq } from "drizzle-orm";
import 'dotenv/config';


export const AdminUserService = {

    async getUsers() {

        try {

            const users = await db
            .select()
            .from(UserAccount)
            .where(eq(UserAccount.role, 0));

            if (users.length === 0) {
                throw new Error('No users found');
            }

            return users;

        } catch (error: any) {

            throw new Error(`Failed to retrieve users: ${error.message}`);

        }

    },

    async deleteUser(userId: number) {

        try {

            const deletedProfile = await db
            .delete(UserProfile)
            .where(eq(UserProfile.accountID, userId))
            .returning();

            if (deletedProfile.length === 0) {
                throw new Error('User profile deletion failed or not found');
            }

            const deletedAccount = await db
            .delete(UserAccount)
            .where(eq(UserAccount.id, userId))
            .returning();

            if (deletedAccount.length === 0) {
                throw new Error('User account deletion failed or not found');
            }

            return { deletedAccount, deletedProfile };

        } catch (error: any) {
            throw new Error(`Failed to delete user: ${error.message}`);
        }
    }

}