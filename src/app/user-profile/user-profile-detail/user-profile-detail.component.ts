import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import { Observable, map } from 'rxjs'
import {
  UpdateUserPerson,
  UserProfileAPIService,
  UserPerson,
  UserProfileAdminAPIService
} from 'src/app/shared/generated'

@Component({
  selector: 'app-user-profile-detail',
  templateUrl: './user-profile-detail.component.html'
})
export class UserProfileDetailComponent implements OnChanges {
  public personalInfo$!: Observable<UserPerson>
  public messages: { [key: string]: string } = {}
  @Input() public displayDetailDialog = false
  @Input() public userProfileId: any
  @Output() public hideDialog = new EventEmitter<boolean>()

  constructor(
    public readonly translate: TranslateService,
    private readonly userProfileService: UserProfileAPIService,
    private readonly userProfileAdminService: UserProfileAdminAPIService,
    private readonly msgService: PortalMessageService
  ) {}

  ngOnChanges(): void {
    if (this.userProfileId) {
      console.log('UP', this.userProfileId)
      this.personalInfo$ = this.userProfileAdminService.getUserProfile({ id: this.userProfileId?.toString() })
    } else {
      this.personalInfo$ = this.userProfileService.getMyUserProfile().pipe(map((profile) => profile.person || {}))
    }
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
