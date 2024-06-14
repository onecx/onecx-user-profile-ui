import { Component } from '@angular/core'

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

  constructor(private readonly userProfileService: UserProfileAPIService, private readonly slotService: SlotService) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(map((profile) => profile.person || {}))
    this.isUserRolesAndPermissionsComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(
      this.userRolesAndPermissionsSlotName
    )
  }
}
