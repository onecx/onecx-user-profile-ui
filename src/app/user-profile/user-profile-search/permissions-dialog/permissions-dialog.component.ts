import { Component, Input } from '@angular/core'

@Component({
  selector: 'app-user-profile-permissions-dialog',
  templateUrl: './permissions-dialog.component.html'
})
export class PermissionsDialogComponent {
  @Input() userId: string = ''
  public adminViewPermissionsSlotName = 'onecx-user-profile-admin-view-permissions'
}
