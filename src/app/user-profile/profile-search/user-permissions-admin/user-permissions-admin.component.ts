import { Component, inject, Input } from '@angular/core'
import { AsyncPipe } from '@angular/common'
import { TranslateModule } from '@ngx-translate/core'

import { MessageModule } from 'primeng/message'

import { SlotService } from '@onecx/angular-remote-components'
import { AngularAcceleratorModule } from '@onecx/angular-accelerator'

@Component({
  selector: 'app-user-permissions-admin',
  templateUrl: './user-permissions-admin.component.html',
  standalone: true,
  imports: [AsyncPipe, AngularAcceleratorModule, MessageModule, TranslateModule]
})
export class UserPermissionsAdminComponent {
  private readonly slotService = inject(SlotService)
  // input
  @Input() id: string | undefined = 'undefined' // why ever this is required
  @Input() userId: string | undefined = undefined
  @Input() issuer: string | undefined = undefined
  @Input() displayName: string | undefined = undefined

  public slotName = 'onecx-user-profile-admin-view-permissions'
  public isRemoteComponentDefined$ = this.slotService.isSomeComponentDefinedForSlot(this.slotName)
}
