import { Component, Input } from '@angular/core'
import { Observable } from 'rxjs'

import { SlotService } from '@onecx/angular-remote-components'

@Component({
  selector: 'app-user-permissions-admin',
  templateUrl: './user-permissions-admin.component.html'
})
export class UserPermissionsAdminComponent {
  @Input() id: string | undefined = 'undefined' // why ever this is required
  @Input() userId: string | undefined = undefined
  @Input() displayName: string | undefined = undefined

  public slotName = 'onecx-user-profile-admin-view-permissions'
  public isRemoteComponentDefined$: Observable<boolean> | undefined

  constructor(private readonly slotService: SlotService) {
    this.isRemoteComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
  }
}
