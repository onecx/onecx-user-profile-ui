import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'

import { ButtonModule } from 'primeng/button'
import { DialogModule } from 'primeng/dialog'
import { TooltipModule } from 'primeng/tooltip'

import { PortalMessageService } from '@onecx/angular-integration-interface'

import { UserProfileAdminAPIService } from 'src/app/shared/generated'

@Component({
  selector: 'app-profile-delete',
  standalone: true,
  imports: [ButtonModule, DialogModule, TooltipModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './profile-delete.component.html',
  styleUrls: ['./profile-delete.component.scss']
})
export class ProfileDeleteComponent {
  private readonly msgService = inject(PortalMessageService)
  private readonly userProfileAdminService = inject(UserProfileAdminAPIService)
  // input
  @Input() public displayDeleteDialog = false
  @Input() public userProfileId: string | undefined
  @Input() public displayName: string | undefined
  // output
  @Output() public hideDialog = new EventEmitter<void>()
  @Output() public deleteDone = new EventEmitter<void>()

  public onCloseDialog(): void {
    this.hideDialog.emit()
  }

  public onDeleteConfirmation(): void {
    if (this.userProfileId) {
      this.userProfileAdminService.deleteUserProfile({ id: this.userProfileId }).subscribe({
        next: () => {
          this.hideDialog.emit()
          this.msgService.success({ summaryKey: 'ACTIONS.DELETE.MESSAGE.OK' })
        },
        error: (err) => {
          console.error('deleteUserProfile', err)
          this.msgService.error({ summaryKey: 'ACTIONS.DELETE.MESSAGE.NOK' })
        }
      })
    }
    this.deleteDone.emit()
  }
}
