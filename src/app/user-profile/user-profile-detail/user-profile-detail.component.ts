import { Component, EventEmitter, Input, Output } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import { Observable, map, tap } from 'rxjs'
import { UpdateUserPerson, UserProfileAPIService, UserPerson } from 'src/app/shared/generated'

@Component({
  selector: 'app-user-profile-detail',
  templateUrl: './user-profile-detail.component.html'
})
export class UserProfileDetailComponent {
  public personalInfo$!: Observable<UserPerson>
  public tenantId: string = ''
  public messages: { [key: string]: string } = {}
  @Input() public displayDetailDialog = false
  @Input() public userProfileId: any
  @Output() public hideDialog = new EventEmitter<boolean>()

  constructor(
    public readonly translate: TranslateService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly msgService: PortalMessageService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(
      tap((profile) => (this.tenantId = profile.tenantId!)),
      map((profile) => {
        return profile.person || {}
      })
    )
  }

  public onPersonalInfoUpdate(person: UserPerson): void {
    this.userProfileService.updateUserPerson({ updateUserPerson: person as UpdateUserPerson }).subscribe({
      next: () => {
        this.showMessage('success')
      },
      error: () => {
        this.showMessage('error')
      }
    })
  }

  public showMessage(severity: 'success' | 'error'): void {
    severity === 'success'
      ? this.msgService.success({ summaryKey: 'USER_PROFILE.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'USER_PROFILE.MSG.SAVE_ERROR' })
  }
}
