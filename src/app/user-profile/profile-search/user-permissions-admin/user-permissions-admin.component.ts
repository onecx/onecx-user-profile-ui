import { Component, Input } from '@angular/core'
import { Observable } from 'rxjs'

import { SlotService } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-user-permissions-admin',
  templateUrl: './user-permissions-admin.component.html'
})
export class UserPermissionsAdminComponent {
  @Input() userId: string | undefined = undefined
  @Input() displayName: string | undefined = undefined
  public adminViewPermissionsSlotName = 'onecx-user-profile-admin-view-permissions'
  public isUserRolesAndPermissionsComponentDefined$: Observable<boolean> | undefined

  constructor(private readonly slotService: SlotService) {
    this.isUserRolesAndPermissionsComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(
      this.adminViewPermissionsSlotName
    )
  }
}
