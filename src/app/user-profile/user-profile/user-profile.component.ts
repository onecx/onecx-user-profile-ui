import { Component, Inject } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'
import { AUTH_SERVICE, IAuthService, UserPerson, PortalMessageService } from '@onecx/portal-integration-angular'
import { UserProfileService } from '../user-profile.service'

@Component({
  selector: 'up-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {
  public personalInfo: UserPerson
  public userId: string
  public messages: { [key: string]: string } = {}

  constructor(
    @Inject(AUTH_SERVICE) public authService: IAuthService,
    public translate: TranslateService,
    private readonly userProfileService: UserProfileService,
    private msgService: PortalMessageService
  ) {
    this.personalInfo = this.authService.getCurrentUser()?.person || {}
    this.userId = this.authService.getCurrentUser()?.userId || ''
  }

  public onPersonalInfoUpdate(person: UserPerson): void {
    this.userProfileService.updatePersonalInfo(person).subscribe({
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
      ? this.msgService.success({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_ERROR' })
  }
}
