import { db } from '../db.ts';
import { UserProfile } from '../db/index.ts';
import type { UpdateUserProfileData } from '../types/types.js';

export const UpdateProfileService = {

    async updateProfile(accountId: UpdateUserProfileData['accountId'], profileData: UpdateUserProfileData) {

        
        if (!accountId) {
            throw new Error('Account ID is required for profile update');
        }

        const updatedProfile = await db

    }


}

