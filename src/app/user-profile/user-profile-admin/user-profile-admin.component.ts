import { Component, EventEmitter, Input, Output, OnChanges } from '@angular/core'
import { TranslateService } from '@ngx-translate/core'

import { PortalMessageService } from '@onecx/portal-integration-angular'
import { map, Observable } from 'rxjs'
import {
  UpdateUserPerson,
  UserProfileAPIService,
  UserPerson,
  UserProfileAdminAPIService
} from 'src/app/shared/generated'

@Component({
  selector: 'app-user-profile-admin',
  templateUrl: './user-profile-admin.component.html'
})
export class UserProfileAdminComponent implements OnChanges {
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
    console.log('UP', this.userProfileId)
    this.personalInfo$ = this.userProfileAdminService.getUserProfile({ id: this.userProfileId?.toString() })
    this.personalInfo$
      .pipe(
        map((info) => {
          console.log('INFO', info)
        })
      )
      .subscribe()
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
