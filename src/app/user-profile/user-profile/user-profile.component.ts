import { Component } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import { Observable, map } from 'rxjs'
import { UpdateUserPerson, UserProfileAPIService, UserPerson } from 'src/app/shared/generated'

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html'
})
export class UserProfileComponent {
  public personalInfo$: Observable<UserPerson>
  public messages: { [key: string]: string } = {}

  constructor(
    public readonly translate: TranslateService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly msgService: PortalMessageService
  ) {
    this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(map((profile) => profile.person || {}))
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
      ? this.msgService.success({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_SUCCESS' })
      : this.msgService.error({ summaryKey: 'PERSONAL_INFO_FORM.MSG.SAVE_ERROR' })
  }
}
