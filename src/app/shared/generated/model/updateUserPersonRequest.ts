/**
 * onecx-user-profile-bff
 * OneCx user profile Bff
 *
 * The version of the OpenAPI document: 1.0
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
import { UserPersonPhone } from './userPersonPhone';
import { UserPersonAddress } from './userPersonAddress';


export interface UpdateUserPersonRequest { 
    modificationCount?: number;
    firstName?: string;
    lastName?: string;
    displayName?: string;
    email?: string;
    address?: UserPersonAddress;
    phone?: UserPersonPhone;
}

