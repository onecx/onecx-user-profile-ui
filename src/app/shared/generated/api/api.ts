export * from './userAvatar.service';
import { UserAvatarAPIService } from './userAvatar.service';
export * from './userAvatarAdmin.service';
import { UserAvatarAdminAPIService } from './userAvatarAdmin.service';
export * from './userProfile.service';
import { UserProfileAPIService } from './userProfile.service';
export * from './userProfileAdmin.service';
import { UserProfileAdminAPIService } from './userProfileAdmin.service';
export const APIS = [UserAvatarAPIService, UserAvatarAdminAPIService, UserProfileAPIService, UserProfileAdminAPIService];
