import { Component } from '@angular/core'

import { UserService } from '@onecx/portal-integration-angular'
import { UserProfileAPIService, UserPerson } from 'src/app/shared/generated'
import { Observable, map } from 'rxjs'
import { SlotService } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-roles-permissions',
  templateUrl: './roles-permissions.component.html',
  styleUrls: ['./roles-permissions.component.scss']
})
export class RolesPermissionsComponent {
  public personalInfo$: Observable<UserPerson>
  public isUserRolesAndPermissionsComponentDefined$: Observable<boolean>
  public userRolesAndPermissionsSlotName = 'onecx-user-profile-permissions'
  public myPermissions = new Array<string>() // permissions of the user

  constructor(
    private userService: UserService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly slotService: SlotService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(map((profile) => profile.person || {}))
    if (userService.hasPermission('ROLES_PERMISSIONS#VIEW')) this.myPermissions.push('ROLES_PERMISSIONS#VIEW')
    this.isUserRolesAndPermissionsComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(
      this.userRolesAndPermissionsSlotName
    )
  }
}
