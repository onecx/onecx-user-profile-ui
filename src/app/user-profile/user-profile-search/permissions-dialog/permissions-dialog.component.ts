import { Component, Input } from '@angular/core'
import { SlotService } from '@onecx/angular-remote-components'
import { Observable } from 'rxjs'

@Component({
  selector: 'app-user-profile-permissions-dialog',
  templateUrl: './permissions-dialog.component.html'
})
export class PermissionsDialogComponent {
  @Input() userId: string = ''
  public adminViewPermissionsSlotName = 'onecx-user-profile-admin-view-permissions'
  public isUserRolesAndPermissionsComponentDefined$: Observable<boolean> | undefined

  constructor(private readonly slotService: SlotService) {
    this.isUserRolesAndPermissionsComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(
      this.adminViewPermissionsSlotName
    )
  }
}
